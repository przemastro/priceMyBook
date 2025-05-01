import React, {useState} from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Modal
} from 'react-native';
import {FontAwesome, Ionicons, MaterialIcons, FontAwesome5} from '@expo/vector-icons';
import {colors, responsive, typography} from '@/styles/styles';
import {useTranslation} from 'react-i18next';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {useRouter} from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import Papa from 'papaparse';
import {useAppContext} from '@/context/AppContext';
import {FlashList} from '@shopify/flash-list';
import i18n from "i18next";


const {width: viewportWidth} = Dimensions.get('window');

interface BookDefect {
    selected: boolean;
    reduction: number;
    count: number;
}

interface BookUniqueness {
    isMassMarket: boolean;
    isFirstEdition: boolean;
    isCollectorsEdition: boolean;
    hasAuthorSignature: boolean;
    isLimitedEdition: boolean;
    isPublisherDefunct: boolean;
}

interface MarketFactors {
    demand: 'veryHigh' | 'high' | 'medium' | 'low' | 'veryLow';
    supply: 'veryLow' | 'low' | 'medium' | 'high' | 'flooded';
    publicationYear?: number;
}

interface BookAgeInfo {
    years: number;
}

interface ListingStatus {
    status: 'notListed' | 'listed' | 'sold';
    platforms: ('amazon' | 'allegro' | 'olx')[];
    listedDate?: string;
    soldDate?: string;
}

interface BookData {
    title: string;
    authors: string;
    isbn: string;
    price: string;
    displayPrice: string;
    foundInApi: boolean;
    originalPrice: string;
    defects: Record<string, BookDefect>;
    averagePrice: string;
    createdAt: string;
    rating: number;
    source?: 'google' | 'amazon' | 'manual';
    priceSource?: string;
    uniqueness: BookUniqueness;
    marketFactors: MarketFactors;
    ageInfo: BookAgeInfo;
    isExpanded?: boolean;
    listingStatus?: ListingStatus;
}

export default function TabFourScreen() {
    const router = useRouter();
    const {t} = useTranslation();
    const [collectionName, setCollectionName] = useState('');
    const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCollection, setEditingCollection] = useState<string | null>(null);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [validBooks, setValidBooks] = useState<Omit<BookData, 'createdAt'>[]>([]);
    const [importPreview, setImportPreview] = useState<{
        collectionName: string;
        books: Omit<BookData, 'createdAt'>[];
        showPreview: boolean;
    } | null>(null);
    const [editingCollectionName, setEditingCollectionName] = useState(false);
    const [newCollectionNameInput, setNewCollectionNameInput] = useState('');
    const [currentlyEditedCollection, setCurrentlyEditedCollection] = useState<string | null>(null);
    const [showListingModal, setShowListingModal] = useState(false);
    const [currentListingBook, setCurrentListingBook] = useState<{ collection: string; index: number } | null>(null);
    const [selectedPlatforms, setSelectedPlatforms] = useState<('amazon' | 'allegro' | 'olx')[]>([]);
    const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);

    const {
        collections,
        books,
        addCollection,
        removeCollection,
        addBooksToCollection,
        removeBookFromCollection,
        formatCurrency,
        renameCollection,
        updateBooksInCollection,
    } = useAppContext();

    const toggleBookExpansion = (collectionName: string, bookIndex: number) => {
        if (!books[collectionName]) return;

        const updatedBooks = [...books[collectionName]];
        updatedBooks[bookIndex] = {
            ...updatedBooks[bookIndex],
            isExpanded: !updatedBooks[bookIndex].isExpanded
        };

        updateBooksInCollection(collectionName, updatedBooks);
    };

    const getBookWord = (count: number, language: string) => {
        if (language === 'pl') {
            if (count === 1) return t('labels.book_one');
            if (count % 100 >= 12 && count % 100 <= 14) return t('labels.book_many');
            if ([2, 3, 4].includes(count % 10)) return t('labels.book_few');
            return t('labels.book_many');
        } else {
            return count === 1 ? t('labels.book_one') : t('labels.book_other');
        }
    };

    const defaultUniqueness: BookUniqueness = {
        isMassMarket: false,
        isFirstEdition: false,
        isCollectorsEdition: false,
        hasAuthorSignature: false,
        isLimitedEdition: false,
        isPublisherDefunct: false
    };

    const defaultMarketFactors: MarketFactors = {
        demand: 'medium',
        supply: 'medium'
    };

    const defaultAgeInfo: BookAgeInfo = {
        years: 0
    };

    const defaultListingStatus: ListingStatus = {
        status: 'notListed',
        platforms: []
    };

    const handleAddCollection = () => {
        if (!collectionName.trim()) return;
        addCollection(collectionName);
        setCollectionName('');
        setShowAddModal(false);
    };

    const handleRenameCollection = () => {
        if (!currentlyEditedCollection || !newCollectionNameInput.trim()) return;

        if (newCollectionNameInput.trim() === currentlyEditedCollection) {
            setEditingCollectionName(false);
            return;
        }

        renameCollection(currentlyEditedCollection, newCollectionNameInput.trim());

        if (selectedCollection === currentlyEditedCollection) {
            setSelectedCollection(newCollectionNameInput.trim());
        }

        setEditingCollectionName(false);
        setCurrentlyEditedCollection(null);
    };

    const handleEditCollectionName = (collectionName: string) => {
        setEditingCollectionName(true);
        setNewCollectionNameInput(collectionName);
        setCurrentlyEditedCollection(collectionName);
    };

    const handleImportCollection = async () => {
        try {
            setIsImporting(true);
            const result = await DocumentPicker.getDocumentAsync({
                type: 'text/csv',
                copyToCacheDirectory: true,
            });

            if (result.canceled || !result.assets?.[0]) {
                setIsImporting(false);
                return;
            }

            const file = result.assets[0];
            const csvContent = await FileSystem.readAsStringAsync(file.uri);

            const parseResult = await new Promise<any[]>((resolve) => {
                Papa.parse(csvContent, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => resolve(results.data)
                });
            });

            const importedBooks = parseResult
                .filter(book => book.Title && book.ISBN && book['Price (PLN)'])
                .map(book => {
                    let defects = {};
                    try {
                        if (book.Defects) defects = JSON.parse(book.Defects);
                    } catch (e) {
                        console.error('Error parsing defects:', e);
                    }

                    let uniqueness = defaultUniqueness;
                    try {
                        if (book.Uniqueness) uniqueness = JSON.parse(book.Uniqueness);
                    } catch (e) {
                        console.error('Error parsing uniqueness:', e);
                    }

                    let marketFactors = defaultMarketFactors;
                    try {
                        if (book['Market Factors']) marketFactors = JSON.parse(book['Market Factors']);
                    } catch (e) {
                        console.error('Error parsing market factors:', e);
                    }

                    let ageInfo = defaultAgeInfo;
                    try {
                        if (book['Age Info']) ageInfo = JSON.parse(book['Age Info']);
                    } catch (e) {
                        console.error('Error parsing age info:', e);
                    }

                    let listingStatus = defaultListingStatus;
                    try {
                        if (book['Listing Status']) listingStatus = JSON.parse(book['Listing Status']);
                    } catch (e) {
                        console.error('Error parsing listing status:', e);
                    }

                    return {
                        title: book.Title.trim(),
                        authors: (book.Authors || t('bookInfo.unknown')).toString().trim(),
                        isbn: book.ISBN.trim(),
                        price: book['Price (PLN)'].trim(),
                        displayPrice: `${book['Price (PLN)']} PLN`,
                        foundInApi: book['Found in API'] === 'Yes',
                        originalPrice: book['Original Price'] || book['Price (PLN)'].trim(),
                        defects,
                        rating: parseInt(book['Condition Rating'] || '10'),
                        averagePrice: book['Average Price'] || book['Price (PLN)'].trim(),
                        uniqueness,
                        marketFactors,
                        ageInfo,
                        listingStatus
                    };
                });

            setValidBooks(importedBooks);
            setImportPreview({
                collectionName: file.name.replace('.csv', '').slice(0, 30),
                books: importedBooks,
                showPreview: true
            });

        } catch (error) {
            Alert.alert(t('alerts.error'), t('alerts.importError'));
            console.error('Import failed:', error);
        } finally {
            setIsImporting(false);
        }
    };

    const confirmImport = async () => {
        if (!importPreview) return;

        try {
            addCollection(importPreview.collectionName);
            await addBooksToCollection(importPreview.collectionName, validBooks);

            Alert.alert(
                t('alerts.success'),
                t('status.importSuccess', {
                    count: importPreview.books.length,
                    name: importPreview.collectionName
                })
            );

            setImportPreview(null);
            setValidBooks([]);
        } catch (error) {
            Alert.alert(t('alerts.error'), t('alerts.importSaveError'));
            console.error('Failed to save import:', error);
        }
    };

    const cancelImport = () => {
        setImportPreview(null);
        setValidBooks([]);
    };

    const handleDeleteCollection = (collectionName: string) => {
        const bookCount = books[collectionName]?.length || 0;

        Alert.alert(
            t('alerts.confirmDeleteTitle'),
            bookCount > 0
                ? t('alerts.confirmDeleteMessage', {
                    collectionName: collectionName,
                    bookCount: bookCount
                })
                : t('alerts.confirmEmptyDeleteMessage', {collectionName: collectionName}),
            [
                {
                    text: t('buttons.cancel'),
                    style: 'cancel',
                },
                {
                    text: t('buttons.confirm'),
                    onPress: () => {
                        removeCollection(collectionName);
                        if (selectedCollection === collectionName) {
                            setSelectedCollection(null);
                        }
                    },
                    style: 'destructive',
                },
            ],
            {cancelable: true}
        );
    };

    const handleExportCSV = async (collectionName: string) => {
        const booksToExport = books[collectionName] || [];

        let csvContent = "Title,Authors,ISBN,Original Price,Price (PLN),Average Price,Condition Rating,Found in API,Defects,Uniqueness,Market Factors,Age Info,Listing Status\n";

        booksToExport.forEach(book => {
            const defectsString = JSON.stringify(book.defects || {});
            const uniquenessString = JSON.stringify(book.uniqueness || defaultUniqueness);
            const marketFactorsString = JSON.stringify(book.marketFactors || defaultMarketFactors);
            const ageInfoString = JSON.stringify(book.ageInfo || defaultAgeInfo);
            const listingStatusString = JSON.stringify(book.listingStatus || defaultListingStatus);

            csvContent += `"${book.title.replace(/"/g, '""')}",` +
                `"${book.authors.replace(/"/g, '""')}",` +
                `${book.isbn},` +
                `${book.originalPrice},` +
                `${book.price},` +
                `${book.rating},` +
                `${book.foundInApi ? 'Yes' : 'No'},` +
                `"${defectsString.replace(/"/g, '""')}",` +
                `"${uniquenessString.replace(/"/g, '""')}",` +
                `"${marketFactorsString.replace(/"/g, '""')}",` +
                `"${ageInfoString.replace(/"/g, '""')}",` +
                `"${listingStatusString.replace(/"/g, '""')}"\n`;
        });

        try {
            const fileUri = FileSystem.cacheDirectory + `${collectionName}.csv`;
            await FileSystem.writeAsStringAsync(fileUri, csvContent);

            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert(t('alerts.error'), t('alerts.sharingNotAvailable'));
                return;
            }

            await Sharing.shareAsync(fileUri, {
                mimeType: 'text/csv',
                dialogTitle: t('alerts.exportTitle', {collectionName}),
            });
        } catch (error) {
            Alert.alert(t('alerts.error'), t('alerts.exportError'));
        }
    };

    const carouselRef = React.useRef<FlashList<string>>(null);
    const [scrollEnabled, setScrollEnabled] = React.useState(true);

    const scrollToItem = (index: number) => {
        setScrollEnabled(false);
        carouselRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5
        });
        setTimeout(() => setScrollEnabled(true), 500);
    };

    const toggleCollection = (collection: string) => {
        const index = collections.indexOf(collection);
        if (index !== -1) {
            scrollToItem(index);
        }
        setSelectedCollection(prev => prev === collection ? null : collection);
    };

    const handleEditBook = (collectionName: string, bookIndex: number) => {
        const book = books[collectionName][bookIndex];
        router.push({
            pathname: '/tabThree',
            params: {
                isbn: book.isbn,
                title: book.title,
                authors: book.authors,
                originalPrice: book.originalPrice,
                fromHistory: 'false',
                editMode: 'true',
                collectionName,
                bookIndex: bookIndex.toString(),
                defects: JSON.stringify(book.defects || {}),
                uniqueness: JSON.stringify(book.uniqueness || defaultUniqueness),
                marketFactors: JSON.stringify(book.marketFactors || defaultMarketFactors),
                ageInfo: JSON.stringify(book.ageInfo || defaultAgeInfo),
                listingStatus: JSON.stringify(book.listingStatus || defaultListingStatus)
            }
        });
    };

    const calculateCollectionTotal = (collection: string) => {
        return (books[collection] || []).reduce(
            (sum, book) => sum + parseFloat(book.price || '0'),
            0
        );
    };

    const calculateTotalValue = () => {
        return collections.reduce(
            (total, collection) => total + calculateCollectionTotal(collection),
            0
        );
    };

    const formatDefectsSummary = (defects: Record<string, BookDefect> | undefined) => {
        if (!defects) return t('labels.noDefects');

        const defectList = Object.keys(defects)
            .filter(key => defects[key].selected)
            .map(key => `${t(`defects.${key}`)} (${defects[key].count}x)`);

        return defectList.length > 0
            ? defectList.join(', ')
            : t('labels.noDefects');
    };

    const formatUniquenessSummary = (uniqueness: BookUniqueness | undefined) => {
        if (!uniqueness) return t('labels.standardEdition');

        const uniqueFeatures = [];
        if (uniqueness.isFirstEdition) uniqueFeatures.push(t('labels.firstEdition'));
        if (uniqueness.isCollectorsEdition) uniqueFeatures.push(t('labels.collectorsEdition'));
        if (uniqueness.hasAuthorSignature) uniqueFeatures.push(t('labels.authorSignature'));
        if (uniqueness.isLimitedEdition) uniqueFeatures.push(t('labels.limitedEdition'));
        if (uniqueness.isPublisherDefunct) uniqueFeatures.push(t('labels.defunctPublisher'));

        return uniqueFeatures.length > 0
            ? uniqueFeatures.join(', ')
            : t('labels.standardEdition');
    };

    const formatMarketFactorsSummary = (marketFactors: MarketFactors | undefined) => {
        if (!marketFactors) return '';

        return `${t(`labels.${marketFactors.demand}`)} ${t('labels.demand')}, ${t(`labels.${marketFactors.supply}`)} ${t('labels.supply')}`;
    };

    const formatListingStatus = (status?: ListingStatus): string => {
        if (!status) return t('listingStatus.notListed');

        switch (status.status) {
            case 'listed':
                return t('listingStatus.listed', {
                    platforms: status.platforms?.map(p => t(`platforms.${p}`)).join(', ') ?? ''
                });
            case 'sold':
                return t('listingStatus.sold');
            default:
                return t('listingStatus.notListed');
        }
    };

    const handleListBook = (collection: string, index: number) => {
        const book = books[collection][index];
        setCurrentListingBook({collection, index});

        if (book.listingStatus?.status === 'notListed') {
            setSelectedPlatforms([]);
            setShowListingModal(true);
        } else if (book.listingStatus?.status === 'listed') {
            setShowStatusChangeModal(true);
        } else if (book.listingStatus?.status === 'sold') {
            setShowStatusChangeModal(true);
        }
    };

    const confirmListing = () => {
        if (!currentListingBook || selectedPlatforms.length === 0) return;

        const {collection, index} = currentListingBook;
        const updatedBooks = [...books[collection]];

        updatedBooks[index] = {
            ...updatedBooks[index],
            listingStatus: {
                status: 'listed',
                platforms: selectedPlatforms,
                listedDate: new Date().toISOString()
            }
        };

        updateBooksInCollection(collection, updatedBooks);
        setShowListingModal(false);
        setCurrentListingBook(null);
        setSelectedPlatforms([]);
    };

    const changeListingStatus = (newStatus: 'notListed' | 'listed' | 'sold') => {
        if (!currentListingBook) return;

        const {collection, index} = currentListingBook;
        const updatedBooks = [...books[collection]];
        const currentListingStatus = updatedBooks[index].listingStatus || defaultListingStatus;

        updatedBooks[index] = {
            ...updatedBooks[index],
            listingStatus: {
                ...currentListingStatus,
                status: newStatus,
                ...(newStatus === 'sold' ? {soldDate: new Date().toISOString()} : {})
            }
        };

        updateBooksInCollection(collection, updatedBooks);
        setShowStatusChangeModal(false);
        setCurrentListingBook(null);
    };

    const togglePlatform = (platform: 'amazon' | 'allegro' | 'olx') => {
        setSelectedPlatforms(prev =>
            prev.includes(platform)
                ? prev.filter(p => p !== platform)
                : [...prev, platform]
        );
    };

    const renderCarouselItem = ({item, index}: { item: string; index: number }) => {
        const bookCount = books[item]?.length || 0;
        const collectionTotal = calculateCollectionTotal(item);
        const isSelected = selectedCollection === item;

        return (
            <TouchableOpacity
                style={[
                    styles.carouselItem,
                    isSelected && styles.selectedCarouselItem,
                    !isSelected && styles.unselectedCarouselItem
                ]}
                onPress={() => toggleCollection(item)}
                activeOpacity={0.8}
                key={item}
            >
                <View style={styles.carouselContent}>
                    <Text style={[
                        styles.carouselCollectionName,
                        isSelected && styles.selectedText
                    ]} numberOfLines={1}>
                        {item}
                    </Text>
                    <Text style={[
                        styles.carouselCollectionValue,
                        isSelected && styles.selectedText
                    ]}>
                        {formatCurrency(collectionTotal.toString())}
                    </Text>
                    <Text style={[
                        styles.carouselBookCount,
                        isSelected && styles.selectedBadge
                    ]}>
                        {bookCount} {getBookWord(bookCount, i18n.language)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    // W sekcji z innymi funkcjami pomocniczymi
    const calculateActiveValue = () => {
        return collections.reduce((total, collection) => {
            return total + (books[collection] || []).reduce((sum, book) => {
                const status = book.listingStatus?.status || 'notListed';
                return status !== 'sold' ? sum + parseFloat(book.price || '0') : sum;
            }, 0);
        }, 0);
    };

    const calculateSoldValue = () => {
        return collections.reduce((total, collection) => {
            return total + (books[collection] || []).reduce((sum, book) => {
                const status = book.listingStatus?.status || 'notListed';
                return status === 'sold' ? sum + parseFloat(book.price || '0') : sum;
            }, 0);
        }, 0);
    };

    React.useEffect(() => {
        if (collections.length > 0 && selectedCollection) {
            const index = collections.indexOf(selectedCollection);
            if (index !== -1) {
                setTimeout(() => scrollToItem(index), 100);
            }
        }
    }, [collections, selectedCollection]);

    const AddCollectionModal = () => {
        const [localCollectionName, setLocalCollectionName] = useState('');

        const handleConfirm = () => {
            if (!localCollectionName.trim()) return;
            addCollection(localCollectionName);
            setLocalCollectionName('');
            setShowAddModal(false);
        };

        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={showAddModal}
                onRequestClose={() => setShowAddModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{t('labels.addNewCollection')}</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder={t('placeholders.enterCollectionName')}
                            placeholderTextColor="#888"
                            value={localCollectionName}
                            onChangeText={setLocalCollectionName}
                            autoFocus
                            onSubmitEditing={handleConfirm}
                            returnKeyType="done"
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowAddModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>{t('buttons.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleConfirm}
                                disabled={!localCollectionName.trim()}
                            >
                                <Text style={styles.confirmButtonText}>{t('buttons.add')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    const EditCollectionModal = () => {
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={showEditModal}
                onRequestClose={() => setShowEditModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{t('labels.editCollectionName')}</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder={t('placeholders.enterNewCollectionName')}
                            placeholderTextColor="#888"
                            value={newCollectionName}
                            onChangeText={setNewCollectionName}
                            autoFocus
                            onSubmitEditing={handleRenameCollection}
                            returnKeyType="done"
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowEditModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>{t('buttons.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleRenameCollection}
                                disabled={!newCollectionName.trim() || newCollectionName.trim() === editingCollection}
                            >
                                <Text style={styles.confirmButtonText}>{t('buttons.save')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    const ImportPreviewModal = () => {
        if (!importPreview) return null;

        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={!!importPreview}
                onRequestClose={cancelImport}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {t('labels.importPreview')} ({importPreview.books.length} {t('labels.books')})
                        </Text>
                        <Text style={styles.modalText}>
                            {t('labels.collectionName')}: {importPreview.collectionName}
                        </Text>

                        <ScrollView style={styles.previewScroll}>
                            {importPreview.books.slice(0, 5).map((book, index) => (
                                <View key={index} style={styles.previewBook}>
                                    <Text style={styles.previewBookTitle}>{book.title}</Text>
                                    <Text style={styles.previewBookIsbn}>ISBN: {book.isbn}</Text>
                                    <Text style={styles.previewBookRating}>
                                        {t('labels.condition')}: {book.rating}/10
                                    </Text>
                                    <Text style={styles.previewBookDefects}>
                                        {t('labels.defects')}: {formatDefectsSummary(book.defects)}
                                    </Text>
                                    {book.uniqueness && (
                                        <Text style={styles.previewBookUniqueness}>
                                            {t('labels.uniqueness')}: {formatUniquenessSummary(book.uniqueness)}
                                        </Text>
                                    )}
                                    {book.marketFactors && (
                                        <Text style={styles.previewBookMarket}>
                                            {t('labels.marketFactors')}: {formatMarketFactorsSummary(book.marketFactors)}
                                        </Text>
                                    )}
                                    {book.ageInfo && (
                                        <Text style={styles.previewBookAge}>
                                            {t('labels.age')}: {book.ageInfo.years} {t('labels.years')}
                                        </Text>
                                    )}
                                    {book.listingStatus && (
                                        <Text style={styles.previewBookListing}>
                                            {t('labels.listingStatus')}: {formatListingStatus(book.listingStatus)}
                                        </Text>
                                    )}
                                </View>
                            ))}
                            {importPreview.books.length > 5 && (
                                <Text style={styles.previewMore}>
                                    + {importPreview.books.length - 5} {t('labels.moreBooks')}...
                                </Text>
                            )}
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={cancelImport}
                            >
                                <Text style={styles.cancelButtonText}>{t('buttons.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={confirmImport}
                            >
                                <Text style={styles.confirmButtonText}>{t('buttons.confirmImport')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    const ListingModal = () => {
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={showListingModal}
                onRequestClose={() => setShowListingModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{t('listingModal.title')}</Text>

                        {/* Amazon */}
                        <TouchableOpacity
                            style={[
                                styles.platformButton,
                                selectedPlatforms.includes('amazon') && styles.platformButtonSelected
                            ]}
                            onPress={() => togglePlatform('amazon')}
                        >
                            <FontAwesome5 name="amazon" size={20}
                                          color={selectedPlatforms.includes('amazon') ? colors.white : colors.primary}/>
                            <Text style={[
                                styles.platformButtonText,
                                selectedPlatforms.includes('amazon') && styles.platformButtonTextSelected
                            ]}>
                                {t('platforms.amazon')}
                            </Text>
                        </TouchableOpacity>

                        {/* Allegro */}
                        <TouchableOpacity
                            style={[
                                styles.platformButton,
                                selectedPlatforms.includes('allegro') && styles.platformButtonSelected
                            ]}
                            onPress={() => togglePlatform('allegro')}
                        >
                            <FontAwesome5 name="shopping-bag" size={20}
                                          color={selectedPlatforms.includes('allegro') ? colors.white : colors.primary}/>
                            <Text style={[
                                styles.platformButtonText,
                                selectedPlatforms.includes('allegro') && styles.platformButtonTextSelected
                            ]}>
                                {t('platforms.allegro')}
                            </Text>
                        </TouchableOpacity>

                        {/* OLX - nowy przycisk */}
                        <TouchableOpacity
                            style={[
                                styles.platformButton,
                                selectedPlatforms.includes('olx') && styles.platformButtonSelected
                            ]}
                            onPress={() => togglePlatform('olx')}
                        >
                            <Text style={{
                                color: selectedPlatforms.includes('olx') ? colors.white : colors.primary,
                                fontWeight: 'bold',
                                fontSize: 14
                            }}>
                                Olx
                            </Text>
                            <Text style={[
                                styles.platformButtonText,
                                selectedPlatforms.includes('olx') && styles.platformButtonTextSelected
                            ]}>
                                {t('platforms.olx')}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowListingModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>{t('buttons.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={confirmListing}
                                disabled={selectedPlatforms.length === 0}
                            >
                                <Text style={styles.confirmButtonText}>{t('buttons.listModal')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    const StatusChangeModal = () => {
        if (!currentListingBook) return null;

        const book = books[currentListingBook.collection][currentListingBook.index];
        const currentStatus = book.listingStatus?.status || 'notListed';

        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={showStatusChangeModal}
                onRequestClose={() => setShowStatusChangeModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{t('statusChangeModal.title')}</Text>

                        {currentStatus === 'listed' && (
                            <>
                                <TouchableOpacity
                                    style={styles.statusButton}
                                    onPress={() => changeListingStatus('sold')}
                                >
                                    <FontAwesome5 name="check-circle" size={20} color={colors.success}/>
                                    <Text style={styles.statusButtonText}>{t('statusChangeModal.markAsSold')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.statusButton}
                                    onPress={() => changeListingStatus('notListed')}
                                >
                                    <FontAwesome5 name="times-circle" size={20} color={colors.error}/>
                                    <Text style={styles.statusButtonText}>{t('statusChangeModal.cancelListing')}</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {currentStatus === 'sold' && (
                            <TouchableOpacity
                                style={styles.statusButton}
                                onPress={() => changeListingStatus('notListed')}
                            >
                                <FontAwesome5 name="undo" size={20} color={colors.primary}/>
                                <Text style={styles.statusButtonText}>{t('statusChangeModal.relist')}</Text>
                            </TouchableOpacity>
                        )}

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowStatusChangeModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>{t('buttons.cancel')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };


    const renderListingButton = (collection: string, index: number) => {
        const book = books[collection][index];
        const listingStatus = book.listingStatus || defaultListingStatus;

        const buttonConfig = {
            notListed: {
                icon: 'upload',
                color: colors.primary,
                text: t('buttons.list'),
                bgColor: 'rgba(74, 108, 247, 0.1)',
            },
            listed: {
                icon: 'check',
                color: colors.success,
                text: t('listingStatus.listed', {
                    platforms: listingStatus.platforms?.map(p => t(`platforms.${p}`)).join(', ') || ''
                }),
                bgColor: 'rgba(76, 175, 80, 0.1)',
            },
            sold: {
                icon: 'check-double',
                color: colors.grayDark,
                text: t('buttons.sold'),
                bgColor: 'rgba(158, 158, 158, 0.1)',
            }
        };

        const {icon, color, text, bgColor} = buttonConfig[listingStatus.status] || buttonConfig.notListed;

        return (
            <View style={styles.listingButtonContainer}>
                <TouchableOpacity
                    style={[
                        styles.iconContainer,
                        {
                            backgroundColor: bgColor,
                            borderColor: color,
                            marginLeft: 32
                        }
                    ]}
                    onPress={(e) => {
                        e.stopPropagation();
                        handleListBook(collection, index);
                    }}
                >
                    <FontAwesome5 name={icon} size={20} color={color}/>
                </TouchableOpacity>
                <Text
                    style={[styles.listingButtonText]}
                    numberOfLines={2} // Maksymalnie 2 linie
                    ellipsizeMode="tail" // Działa jako zabezpieczenie
                >
                    {text}
                </Text>
            </View>
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={[typography.h1, styles.header]}>
            </Text>

            <View style={styles.totalValueContainer}>
                <Text style={styles.totalValueLabel}>{t('labels.totalValue')}</Text>
                <View style={styles.valueRow}>
                    <TouchableOpacity
                        style={styles.coinIconContainer}
                        onPress={() => router.push({
                            pathname: '/settings',
                            params: {initialTab: 'algorithm'} as SettingsScreenParams
                        })}
                        activeOpacity={0.7}
                    >
                        <FontAwesome5
                            name="coins"
                            size={20}
                            color={colors.primary}
                        />
                    </TouchableOpacity>
                    <View style={styles.priceContainer}>
                        <Text style={styles.totalValueAmount}>
                            {formatCurrency(calculateTotalValue().toString())}
                        </Text>
                    </View>
                </View>

                {/* Dodane nowe wiersze z wartościami aktywnymi i sprzedanymi */}
                <View style={styles.valueBreakdownContainer}>
                    <View style={styles.valueBreakdownRow}>
                        <Text style={styles.valueBreakdownLabel}>{t('labels.activeValue')}:</Text>
                        <Text style={[styles.valueBreakdownAmount, styles.activeValue]}>
                            {formatCurrency(calculateActiveValue().toString())}
                        </Text>
                    </View>
                    <View style={styles.valueBreakdownRow}>
                        <Text style={styles.valueBreakdownLabel}>{t('labels.soldValue')}:</Text>
                        <Text style={[styles.valueBreakdownAmount, styles.soldValue]}>
                            {formatCurrency(calculateSoldValue().toString())}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.sectionContainer}>
                <View style={styles.topActionsContainer}>
                    <TouchableOpacity
                        style={styles.addCollectionButton}
                        onPress={() => setShowAddModal(true)}
                        activeOpacity={0.6}
                    >
                        <Ionicons
                            name="add-circle"
                            size={24}
                            color={colors.primary}
                        />
                        <Text style={styles.addCollectionText}>
                            {t('buttons.addCollection')}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.divider}/>

                <TouchableOpacity
                    style={[
                        styles.importButton,
                        collections.length === 0 && {marginBottom: 0}
                    ]}
                    onPress={handleImportCollection}
                    disabled={isImporting}
                    activeOpacity={0.6}
                >
                    {isImporting ? (
                        <ActivityIndicator
                            size="small"
                            color={colors.primary}
                        />
                    ) : (
                        <Ionicons
                            name="cloud-upload"
                            size={18}
                            color={colors.primary}
                        />
                    )}
                    <Text style={styles.importButtonText}>
                        {t('buttons.importCollection')}
                    </Text>
                </TouchableOpacity>

                {collections.length > 0 && (
                    <>
                        <View style={styles.titleContainer}>
                            <Text style={styles.collectionsTitle}>{t('labels.yourCollections')}</Text>
                        </View>

                        <View style={styles.carouselContainer}>
                            <FlashList
                                ref={carouselRef}
                                data={collections}
                                renderItem={renderCarouselItem}
                                horizontal
                                estimatedItemSize={viewportWidth * 0.6}
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(item) => item}
                                contentContainerStyle={styles.carouselContentContainer}
                                extraData={[collections, selectedCollection]}
                                snapToAlignment="center"
                                snapToInterval={viewportWidth * 0.6 + 8}
                                decelerationRate="fast"
                                scrollEnabled={scrollEnabled}
                            />
                        </View>

                        {selectedCollection && (
                            <View style={styles.collectionDetails}>
                                <View style={styles.collectionHeader}>
                                    {editingCollectionName && currentlyEditedCollection === selectedCollection ? (
                                        <View style={styles.nameEditContainer}>
                                            <TextInput
                                                style={styles.nameInput}
                                                value={newCollectionNameInput}
                                                onChangeText={setNewCollectionNameInput}
                                                autoFocus
                                                onSubmitEditing={handleRenameCollection}
                                            />
                                            <TouchableOpacity
                                                style={styles.confirmEditButton}
                                                onPress={handleRenameCollection}
                                            >
                                                <Ionicons name="checkmark" size={20} color="white"/>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={() => handleEditCollectionName(selectedCollection)}
                                            style={styles.nameDisplayContainer}
                                        >
                                            <Text style={styles.collectionName} numberOfLines={1} ellipsizeMode="tail">
                                                {selectedCollection}
                                            </Text>
                                            <Ionicons
                                                name="create"
                                                size={16}
                                                color={colors.primary}
                                                style={styles.editIcon}
                                            />
                                        </TouchableOpacity>
                                    )}
                                    <View style={styles.collectionActions}>
                                        <TouchableOpacity
                                            onPress={() => handleExportCSV(selectedCollection)}
                                            style={styles.exportButton}
                                        >
                                            <FontAwesome name="file-excel-o" size={18} color={colors.primary}/>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleDeleteCollection(selectedCollection)}
                                            style={styles.deleteCollectionButton}
                                        >
                                            <FontAwesome name="trash" size={18} color={colors.error}/>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {books[selectedCollection]?.length === 0 ? (
                                    <View style={styles.emptyBookContainer}>
                                        <Text style={styles.emptyText}>{t('labels.noBooksInCollection')}</Text>
                                    </View>
                                ) : (
                                    books[selectedCollection]?.map((book, index) => (
                                        <View key={`${selectedCollection}-${index}`}>
                                            <TouchableOpacity
                                                style={styles.bookContainer}
                                                onPress={() => toggleBookExpansion(selectedCollection, index)}
                                            >
                                                <View style={styles.bookHeader}>
                                                    <View style={styles.bookTitleRow}>
                                                        <Ionicons
                                                            name={book.isExpanded ? "chevron-down" : "chevron-forward"}
                                                            size={16}
                                                            color={colors.primary}
                                                            style={styles.bookArrowIcon}
                                                        />
                                                        <Text style={styles.bookTitle} numberOfLines={1}>
                                                            {book.title}
                                                        </Text>
                                                    </View>

                                                    <View style={styles.topButtonsContainer}>
                                                        <TouchableOpacity
                                                            onPress={(e) => {
                                                                e.stopPropagation();
                                                                handleEditBook(selectedCollection, index);
                                                            }}
                                                            style={styles.editButton}
                                                        >
                                                            <Ionicons name="create" size={18} color={colors.primary}/>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            onPress={(e) => {
                                                                e.stopPropagation();
                                                                removeBookFromCollection(selectedCollection, index);
                                                            }}
                                                            style={styles.deleteButton}
                                                        >
                                                            <FontAwesome name="trash" size={18} color={colors.error}/>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>

                                                <View style={styles.bookContentWrapper}>
                                                    <View style={styles.bookDetails}>
                                                        <Text style={styles.bookAuthors} numberOfLines={1}>
                                                            {book.authors}
                                                        </Text>
                                                        <Text style={styles.bookIsbn}>ISBN: {book.isbn}</Text>
                                                        <Text style={styles.bookPrice}>
                                                            {t('bookInfo.finalPrice')}: {book.displayPrice}
                                                        </Text>
                                                        <Text style={styles.bookCondition}>
                                                            {t('labels.condition')}: {book.rating}/10
                                                        </Text>
                                                    </View>

                                                    <View style={styles.listingButtonFixedContainer}>
                                                        {renderListingButton(selectedCollection, index)}
                                                    </View>
                                                </View>

                                                {book.isExpanded && (
                                                    <View style={styles.bookAdditionalDetails}>
                                                        <Text style={styles.bookDefects}>
                                                            {t('labels.defects')}: {formatDefectsSummary(book.defects)}
                                                        </Text>
                                                        {book.uniqueness && (
                                                            <Text style={styles.bookUniqueness}>
                                                                {t('labels.uniqueness')}: {formatUniquenessSummary(book.uniqueness)}
                                                            </Text>
                                                        )}
                                                        {book.marketFactors && (
                                                            <Text style={styles.bookMarket}>
                                                                {t('labels.marketFactors')}: {formatMarketFactorsSummary(book.marketFactors)}
                                                            </Text>
                                                        )}
                                                        {book.ageInfo && (
                                                            <Text style={styles.bookAge}>
                                                                {t('labels.age')}: {book.ageInfo.years} {t('labels.years')}
                                                            </Text>
                                                        )}
                                                        <Text style={[
                                                            styles.bookStatus,
                                                            {color: book.foundInApi ? colors.success : colors.error}
                                                        ]}>
                                                            {book.foundInApi ? t('status.found') : t('status.notFound')}
                                                        </Text>
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    ))
                                )}
                            </View>
                        )}
                    </>
                )}

                {collections.length === 0 && (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>{t('labels.noCollections')}</Text>
                    </View>
                )}
            </View>

            <AddCollectionModal/>
            <EditCollectionModal/>
            <ImportPreviewModal/>
            <ListingModal/>
            <StatusChangeModal/>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        paddingTop: 6,
        backgroundColor: '#f8f9fa',
    },
    header: {
        marginBottom: 4,
        textAlign: 'left',
        color: colors.black,
        marginTop: responsive.largeMargin,
    },
    totalValueContainer: {
        backgroundColor: colors.white,
        borderRadius: 2,
        padding: 20,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    totalValueLabel: {
        ...typography.body,
        color: colors.black,
        marginBottom: 4,
    },
    totalValueAmount: {
        fontSize: 18,
        color: colors.primary,
        fontWeight: 'bold',
    },
    sectionContainer: {
        backgroundColor: colors.white,
        borderRadius: 2,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    collectionsTitle: {
        ...typography.body,
        color: colors.black,
        marginTop: 10,
        marginBottom: 16,
    },
    carouselContentContainer: {
        paddingLeft: 16,
        paddingRight: 8,
    },
    collectionDetails: {
        marginTop: 10,
    },
    bookInfo: {
        flex: 1,
        marginRight: 12,
    },
    bookArrowIcon: {
        marginRight: 8,
    },
    bookTitle: {
        ...typography.body,
        fontWeight: '500',
        marginBottom: 4,
    },
    bookAuthors: {
        ...typography.caption,
        marginBottom: 4,
        color: colors.grayDark,
    },
    bookIsbn: {
        ...typography.caption,
        color: colors.grayDark,
        marginBottom: 4,
    },
    bookPrice: {
        ...typography.caption,
        color: colors.primary,
        fontWeight: '500',
        marginBottom: 4,
    },
    bookCondition: {
        ...typography.caption,
        color: colors.primary,
        marginBottom: 4,
    },
    bookListingStatus: {
        ...typography.caption,
        color: colors.grayDark,
        marginBottom: 4,
        fontStyle: 'italic',
        justifyContent: 'center'
    },
    bookDefects: {
        ...typography.caption,
        color: colors.grayDark,
        marginBottom: 4,
        fontStyle: 'italic',
        fontSize: 12,
    },
    bookUniqueness: {
        fontSize: 12,
        color: colors.grayDark,
        marginBottom: 4,
        fontStyle: 'italic',
    },
    bookMarket: {
        fontSize: 12,
        color: colors.grayDark,
        marginBottom: 4,
        fontStyle: 'italic',
    },
    bookAge: {
        fontSize: 12,
        color: colors.grayDark,
        marginBottom: 4,
        fontStyle: 'italic',
    },
    bookStatus: {
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 4,
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: colors.white,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        marginTop: 20
    },
    emptyBookContainer: {
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    emptyText: {
        ...typography.body,
        textAlign: 'center',
        color: colors.grayDark,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 2,
        padding: 20,
    },
    modalTitle: {
        ...typography.h3,
        color: colors.black,
        marginBottom: 15,
    },
    modalInput: {
        height: 50,
        borderColor: 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        borderRadius: 2,
        paddingHorizontal: 16,
        backgroundColor: colors.white,
        marginBottom: 15,
        color: colors.black,
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    modalText: {
        marginBottom: 10,
        color: colors.black,
    },
    previewScroll: {
        maxHeight: 200,
        marginVertical: 10,
    },
    previewBook: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray,
    },
    previewBookTitle: {
        fontWeight: '500',
        color: colors.black,
    },
    previewBookIsbn: {
        fontSize: 12,
        color: colors.grayDark,
    },
    previewBookRating: {
        fontSize: 12,
        color: colors.primary,
        marginTop: 4,
    },
    previewBookDefects: {
        fontSize: 12,
        color: colors.grayDark,
        marginTop: 4,
        fontStyle: 'italic',
    },
    previewBookUniqueness: {
        fontSize: 12,
        color: colors.grayDark,
        marginTop: 4,
        fontStyle: 'italic',
    },
    previewBookMarket: {
        fontSize: 12,
        color: colors.grayDark,
        marginTop: 4,
        fontStyle: 'italic',
    },
    previewBookAge: {
        fontSize: 12,
        color: colors.grayDark,
        marginTop: 4,
        fontStyle: 'italic',
    },
    previewBookListing: {
        fontSize: 12,
        color: colors.grayDark,
        marginTop: 4,
        fontStyle: 'italic',
    },
    previewMore: {
        textAlign: 'center',
        marginTop: 5,
        color: colors.gray,
        fontStyle: 'italic',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 2,
        marginLeft: 10,
    },
    cancelButton: {
        backgroundColor: colors.white,
    },
    confirmButton: {
        backgroundColor: colors.white,
    },
    cancelButtonText: {
        color: colors.primary,
    },
    confirmButtonText: {
        color: colors.primary,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    coinIconContainer: {
        marginTop: 13,
        backgroundColor: colors.white,
        borderRadius: 20,
        width: 45,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.primary,
        zIndex: 1,
        marginRight: -5,
    },
    priceContainer: {
        marginTop: 13,
        backgroundColor: colors.background,
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 16,
        paddingLeft: 10,
        borderWidth: 1,
        borderColor: colors.background,
        zIndex: 2,
    },
    topActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    addCollectionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    addCollectionText: {
        marginLeft: 8,
        color: colors.primary,
        fontSize: 16,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: colors.gray,
        marginBottom: 12,
    },
    importButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        marginBottom: 16,
    },
    importButtonText: {
        marginLeft: 8,
        color: colors.primary,
        fontSize: 16,
    },
    titleContainer: {
        height: 50,
        marginBottom: 10,
        alignItems: 'center'
    },
    carouselContainer: {
        height: 140,
        marginBottom: 10,
    },
    collectionCounterContainer: {
        alignItems: 'center',
    },
    collectionCounter: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginBottom: 4,
    },
    collectionCounterText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '500',
        color: colors.primary,
    },
    collectionNameWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    collectionNameInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    collectionNameInput: {
        flex: 1,
        height: 40,
        borderColor: colors.primary,
        borderWidth: 1,
        borderRadius: 2,
        paddingHorizontal: 12,
        marginRight: 8,
        ...typography.h2,
    },
    saveCollectionNameButton: {
        backgroundColor: colors.primary,
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    collectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    nameEditContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    nameInput: {
        flex: 1,
        height: 30,
        width: 80,
        borderColor: colors.primary,
        borderWidth: 1,
        borderRadius: 2,
        paddingHorizontal: 12,
        ...typography.h2,
        fontSize: 18,
    },
    confirmEditButton: {
        backgroundColor: colors.primary,
        borderRadius: 20,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    nameDisplayContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    collectionName: {
        ...typography.h2,
        fontSize: 18,
        flexShrink: 1,
    },
    editIcon: {
        marginLeft: 8,
    },
    collectionActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    exportButton: {
        padding: 8,
    },
    deleteCollectionButton: {
        marginLeft: 12,
        padding: 8,
    },
    bookBasicDetails: {
        marginLeft: 24,
    },
    bookActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    listingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: colors.primary,
        width: '60%',
    },
    listedButton: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderColor: colors.success,
    },
    soldButton: {
        backgroundColor: 'rgba(56, 142, 60, 0.1)',
        borderColor: colors.grayDark,
    },
    editButton: {
        padding: 8,
        marginRight: 4,
    },
    deleteButton: {
        padding: 8,
    },
    carouselItem: {
        width: viewportWidth * 0.4 - 16,
        backgroundColor: colors.white,
        borderRadius: 8,
        padding: 10,
        height: 120,
        marginRight: 8,
        borderWidth: 1,
    },
    selectedCarouselItem: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(74,108,247,0.05)',
    },
    unselectedCarouselItem: {
        borderColor: colors.gray,
    },
    carouselContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    carouselCollectionName: {
        ...typography.body,
        textAlign: 'center',
        marginBottom: 5,
        color: colors.black,
    },
    carouselCollectionValue: {
        ...typography.body,
        textAlign: 'center',
        marginBottom: 0,
        color: colors.black,
    },
    selectedText: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    carouselBookCount: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: colors.grayDark,
        color: colors.white,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        textAlign: 'center',
        fontSize: 12,
        overflow: 'hidden',
        minWidth: 24,
    },
    selectedBadge: {
        backgroundColor: colors.primary,
    },
    platformButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginVertical: 5,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    platformButtonSelected: {
        backgroundColor: colors.primary,
    },
    platformButtonText: {
        marginLeft: 10,
        color: colors.primary,
    },
    platformButtonTextSelected: {
        color: colors.white,
    },
    statusButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginVertical: 5,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.gray,
    },
    statusButtonText: {
        marginLeft: 10,
        color: colors.black,
    },
    topButtonsContainer: {
        flexDirection: 'row',
        marginLeft: 'auto',
    },
    bookMainInfo: {
        flex: 1,
    },
    bookHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    bookTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    listingButtonTallContainer: {
        justifyContent: 'center',
        height: '80%',
        marginLeft: 10,
    },
    iconContainer: {
        width: 40, // Stała szerokość
        height: 40, // Stała wysokość
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        marginBottom: 4,
    },
    bookContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },

    bookContentWrapper: {
        flexDirection: 'row',
        minHeight: 80, // Stała wysokość niezależnie od zawartości
    },

    bookDetails: {
        flex: 1,
        justifyContent: 'center', // Wyśrodkowanie zawartości w pionie
    },

    listingButtonFixedContainer: {
        width: 100, // Stała szerokość
        justifyContent: 'center', // Wyśrodkowanie przycisku
        alignItems: 'center',
    },

    bookAdditionalDetails: {
        paddingTop: 12, // Mniejszy odstęp od góry
        marginTop: 8, // Mniejszy margines
        borderTopWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    listingButtonContainer: {
        width: 100, // Stała szerokość
        minHeight: 80, // Minimalna wysokość
        alignItems: 'center',
        justifyContent: 'center',
    },
    listingButtonText: {
        fontSize: 12,
        textAlign: 'center',
        width: '100%', // Zajmuje całą szerokość kontenera
        paddingHorizontal: 2, // Mały padding po bokach
        lineHeight: 16, // Lepsz czytelność wielolinijkowego tekstu
        flexWrap: 'wrap', // Zawijanie tekstu
        marginLeft: 32,
        color: colors.primary
    },
    valueBreakdownContainer: {
        width: '100%',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    valueBreakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    valueBreakdownLabel: {
        ...typography.caption,
        color: colors.grayDark,
    },
    valueBreakdownAmount: {
        ...typography.caption,
        fontWeight: '500',
    },
    activeValue: {
        color: colors.primary,
    },
    soldValue: {
        color: colors.success,
    },
});

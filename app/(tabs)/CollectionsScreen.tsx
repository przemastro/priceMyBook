import React, {useState, useRef, useEffect, useMemo} from 'react';
import {
    View,
    Text,
    ScrollView,
    Alert,
    StyleSheet,
    Linking,
    TouchableOpacity,
    Dimensions,
    TextInput,
    Animated
} from 'react-native';
import {Feather, FontAwesome5, Ionicons, MaterialIcons} from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import Papa from 'papaparse';
import { useAppContext } from '@/context/AppContext';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import CollectionCarousel from '../components/collectionsScreen/sections/CollectionCarousel';
import BooksCarousel from '../components/collectionsScreen/sections/BooksCarousel';
import AddCollectionModal from '../components/commonScreen/modals/AddCollectionModal';
import EditCollectionModal from '../components/collectionsScreen/modals/EditCollectionModal';
import ImportPreviewModal from '../components/collectionsScreen/modals/ImportPreviewModal';
import ListingModal from '../components/collectionsScreen/modals/ListingModal';
import StatusChangeModal from '../components/collectionsScreen/modals/StatusChangeModal';
import CategoriesCarousel from '../components/collectionsScreen/sections/CategoriesCarousel';
import CustomAlertModal from "@/app/components/alerts/CustomAlertModal";

interface BookDefect {
    selected: boolean;
    reduction: number;
    count: number;
}

interface ListingStatus {
    status: 'notListed' | 'listed' | 'sold';
    platforms: ('amazon' | 'allegro' | 'olx')[];
    listedDate?: string;
    soldDate?: string;
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

interface BookData {
    title: string;
    authors: string;
    isbn: string;
    price: string;
    displayPrice: string;
    foundInApi: boolean;
    originalPrice: string;
    defects: Record<string, BookDefect>;
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

interface ImportPreviewData {
    collectionName: string;
    books: BookData[];
    categories: string[];
    showPreview: boolean;
}

interface Collection {
    name: string;
    icon: string;
}

const CollectionsScreen = () => {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const [isImporting, setIsImporting] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showListingModal, setShowListingModal] = useState(false);
    const [currentListingBook, setCurrentListingBook] = useState<{ collection: string; index: number } | null>(null);
    const [selectedPlatforms, setSelectedPlatforms] = useState<('amazon' | 'allegro' | 'olx')[]>([]);
    const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
    const [editingCollection, setEditingCollection] = useState<string | null>(null);
    const [showAddCollectionModal, setShowAddCollectionModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'info' | 'success' | 'error' | 'warning'>('info');
    const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
    const [searchQuery, setSearchQuery] = React.useState('');
    const [importPreview, setImportPreview] = useState<ImportPreviewData | null>(null);

    const [currentStep, setCurrentStep] = useState(0);
    const totalSteps = 2;
    const slideAnim = useRef(new Animated.Value(0)).current;

    const {
        collections,
        books,
        collectionCategories,
        addCollection,
        removeCollection,
        addBooksToCollection,
        removeBookFromCollection,
        renameCollection,
        updateBooksInCollection,
        addCategoryToCollection,
        removeCategoryFromCollection,
        selectedCollection,
        setSelectedCollection
    } = useAppContext();

    const defaultUniqueness: BookUniqueness = {
        isMassMarket: false,
        isFirstEdition: false,
        isCollectorsEdition: false,
        hasAuthorSignature: false,
        isLimitedEdition: false,
        isPublisherDefunct: false
    };

    const defaultMarketFactors: MarketFactors = { demand: 'medium', supply: 'medium' };
    const defaultAgeInfo: BookAgeInfo = { years: 0 };
    const defaultListingStatus: ListingStatus = { status: 'notListed', platforms: [] };

    const getCollectionNames = (): string[] => collections.map(c => c.name);

    const animateSlide = (direction: 'forward' | 'backward') => {
        slideAnim.setValue(direction === 'forward' ? 50 : -50);
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    };

    const goToNextStep = () => {
        if (currentStep < totalSteps - 1) {
            animateSlide('forward');
            setCurrentStep(prev => prev + 1);
        }
    };

    const goToPrevStep = () => {
        if (currentStep > 0) {
            animateSlide('backward');
            AsyncStorage.setItem('@selectedCollection', selectedCollection || '');
            setCurrentStep(prev => prev - 1);
        }
    };

    const showAlert = (
        title: string,
        message: string,
        type: 'info' | 'success' | 'error' | 'warning' = 'info',
        onConfirm?: () => void
    ) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertType(type);
        setConfirmAction(() => onConfirm || (() => {}));
        setAlertVisible(true);
    };

    useEffect(() => {
        const loadSelected = async () => {
            try {
                const saved = await AsyncStorage.getItem('@selectedCollection');
                if (saved && getCollectionNames().includes(saved)) {
                    setSelectedCollection(saved);
                }
            } catch (error) {
                console.error('Failed to load selected collection', error);
            }
        };
        loadSelected();
    }, [collections]);

    const handleAddCollection = (name: string, categories: string[] = [], icon: string = 'book') => {
        if (!name.trim()) return;
        addCollection(name, icon);
        categories.forEach(category => addCategoryToCollection(name, category));
        setShowAddModal(false);
    };

    const handleEditCollection = async (
        oldName: string,
        newName: string,
        categories: string[],
        icon: string
    ): Promise<void> => {
        if (newName.trim() && newName.trim() !== oldName) {
            try {
                await renameCollection(oldName, newName.trim(), categories, icon);
                if (selectedCollection === oldName) {
                    setSelectedCollection(newName.trim());
                }
                setShowEditModal(false);
            } catch (error) {
                showAlert(t('alerts.error'), t('alerts.renameError'), 'error');
            }
        }
    };

    const handleDeleteCollection = (collectionName: string) => {
        const bookCount = books[collectionName]?.length || 0;
        showAlert(
            t('alerts.confirmDeleteTitle'),
            bookCount > 0 ?
                t('alerts.confirmDeleteMessage', { collectionName, bookCount }) :
                t('alerts.confirmEmptyDeleteMessage', { collectionName }),
            'warning',
            () => {
                removeCollection(collectionName);
                if (selectedCollection === collectionName) setSelectedCollection(null);
            }
        );
    };

    const handleAddCategory = (collectionName: string, category: string) => {
        if (!collectionName || !category.trim()) return;

        if (collectionCategories[collectionName]?.includes(category.trim())) {
            Alert.alert(t('alerts.error'), t('alerts.categoryExists'));
            return;
        }

        addCategoryToCollection(collectionName, category.trim());
        setNewCategoryName('');
    };

    const handleRemoveCategory = (collectionName: string, category: string) => {
        showAlert(
            t('alerts.confirmDeleteTitle'),
            t('alerts.confirmDeleteCategory', { category }),
            'warning',
            () => removeCategoryFromCollection(collectionName, category)
        );
    };

    const handleEditBook = (collectionName: string, bookIndex: number) => {
        const book = books[collectionName][bookIndex];
        router.push({
            pathname: '/AnalysisScreen',
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

    const handleImportCollection = async () => {
        try {
            setIsImporting(true);
            const result = await DocumentPicker.getDocumentAsync({
                type: 'text/csv',
                copyToCacheDirectory: true
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

            const importedBooks: BookData[] = parseResult
                .filter(book => book.Title && book.ISBN && book['Price (PLN)'])
                .map(book => ({
                    title: book.Title.trim(),
                    authors: (book.Authors || t('bookInfo.unknown')).toString().trim(),
                    isbn: book.ISBN.trim(),
                    price: book['Price (PLN)'].trim(),
                    displayPrice: `${book['Price (PLN)']} PLN`,
                    foundInApi: book['Found in API'] === 'Yes',
                    originalPrice: book['Original Price'] || book['Price (PLN)'].trim(),
                    defects: book.Defects ? JSON.parse(book.Defects) : {},
                    rating: parseInt(book['Condition Rating'] || '10'),
                    uniqueness: book.Uniqueness ? JSON.parse(book.Uniqueness) : defaultUniqueness,
                    marketFactors: book['Market Factors'] ? JSON.parse(book['Market Factors']) : defaultMarketFactors,
                    ageInfo: book['Age Info'] ? JSON.parse(book['Age Info']) : defaultAgeInfo,
                    listingStatus: book['Listing Status'] ? JSON.parse(book['Listing Status']) : defaultListingStatus,
                    imageUri: book['Image URI'] || undefined,
                    createdAt: new Date().toISOString()
                }));

            const categories = parseResult[0]?.Categories
                ? parseResult[0].Categories.split(';').map((c: string) => c.trim()).filter((c: string) => c)
                : [];

            setImportPreview({
                collectionName: file.name.replace('.csv', '').slice(0, 30),
                books: importedBooks,
                categories,
                showPreview: true
            });
        } catch (error) {
            showAlert(t('alerts.error'), t('alerts.importError'), 'error');
            console.error('Import failed:', error);
        } finally {
            setIsImporting(false);
        }
    };

    const confirmImport = async () => {
        if (!importPreview) return;
        try {
            addCollection(importPreview.collectionName);
            await addBooksToCollection(importPreview.collectionName, importPreview.books);

            if (importPreview.categories && importPreview.categories.length > 0) {
                importPreview.categories.forEach(category => {
                    addCategoryToCollection(importPreview.collectionName, category);
                });
            }

            showAlert(t('alerts.success'), t('status.importSuccess', {
                count: importPreview.books.length,
                name: importPreview.collectionName
            }), 'success');

            setImportPreview(null);
        } catch (error) {
            showAlert(t('alerts.error'), t('alerts.importSaveError'), 'error');
            console.error('Failed to save import:', error);
        }
    };

    const cancelImport = () => {
        setImportPreview(null);
    };

    const handleExportCollectionToCSV = async (collectionName: string) => {
        try {
            const collectionBooks = books[collectionName] || [];
            const categories = collectionCategories[collectionName] || [];

            if (collectionBooks.length === 0) {
                Alert.alert(t('alerts.info'), t('alerts.emptyCollectionExport'));
                return;
            }

            const headers = [
                'Title', 'Authors', 'ISBN', 'Original Price',
                'Price (PLN)', 'Condition Rating', 'Found in API',
                'Defects', 'Uniqueness', 'Market Factors',
                'Age Info', 'Listing Status', 'Image URI',
                'Categories'
            ].join(',');

            const rows = collectionBooks.map(book => {
                const bookCategories = categories.join('; ');

                return [
                    `"${book.title.replace(/"/g, '""')}"`,
                    `"${book.authors.replace(/"/g, '""')}"`,
                    book.isbn,
                    book.originalPrice,
                    book.price,
                    book.rating,
                    book.foundInApi ? 'Yes' : 'No',
                    `"${JSON.stringify(book.defects || {}).replace(/"/g, '""')}"`,
                    `"${JSON.stringify(book.uniqueness || {}).replace(/"/g, '""')}"`,
                    `"${JSON.stringify(book.marketFactors || {}).replace(/"/g, '""')}"`,
                    `"${JSON.stringify(book.ageInfo || {}).replace(/"/g, '""')}"`,
                    `"${JSON.stringify(book.listingStatus || {}).replace(/"/g, '""')}"`,
                    `"${bookCategories}"`
                ].join(',');
            });

            const csvContent = `${headers}\n${rows.join('\n')}`;
            const fileUri = FileSystem.cacheDirectory + `${collectionName}_export.csv`;
            await FileSystem.writeAsStringAsync(fileUri, csvContent);

            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert(t('alerts.error'), t('alerts.sharingNotAvailable'));
                return;
            }

            await Sharing.shareAsync(fileUri, {
                mimeType: 'text/csv',
                dialogTitle: t('alerts.exportTitle', { collectionName })
            });

        } catch (error) {
            Alert.alert(t('alerts.error'), t('alerts.exportError'));
            console.error('Export failed:', error);
        }
    };

    const handleListBook = (collection: string, index: number) => {
        const book = books[collection][index];
        setCurrentListingBook({ collection, index });
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
        const { collection, index } = currentListingBook;
        const book = books[collection][index];

        selectedPlatforms.forEach(platform => {
            let url = '';
            switch (platform) {
                case 'amazon': url = `https://sellercentral.amazon.com/listing/create?title=${encodeURIComponent(book.title)}`; break;
                case 'allegro': url = `https://allegro.pl/myaccount/offer/new?title=${encodeURIComponent(book.title)}`; break;
                case 'olx': url = `https://www.olx.pl/dodaj-ogloszenie/?query=${encodeURIComponent(book.title)}`; break;
            }
            Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
        });

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
        showAlert(t('alerts.success'), t('status.listedRedirect'), 'success');
    };

    const changeListingStatus = (newStatus: 'notListed' | 'listed' | 'sold') => {
        if (!currentListingBook) return;
        const { collection, index } = currentListingBook;
        const updatedBooks = [...books[collection]];
        const currentListingStatus = updatedBooks[index].listingStatus || defaultListingStatus;
        updatedBooks[index] = {
            ...updatedBooks[index],
            listingStatus: {
                ...currentListingStatus,
                status: newStatus,
                ...(newStatus === 'sold' ? { soldDate: new Date().toISOString() } : {})
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

    const formatCurrency = (value: string): string => {
        try {
            const number = parseFloat(value);
            if (isNaN(number)) return value;

            return new Intl.NumberFormat('pl-PL', {
                style: 'currency',
                currency: 'PLN',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(number);
        } catch (error) {
            console.error('Error formatting currency:', error);
            return value;
        }
    };

    const getBookWord = (count: number) => {
        const language = i18n.language;
        if (language === 'pl') {
            if (count === 1) return t('labels.book_one');
            if (count % 100 >= 12 && count % 100 <= 14) return t('labels.book_many');
            if ([2, 3, 4].includes(count % 10)) return t('labels.book_few');
            return t('labels.book_many');
        } else {
            return count === 1 ? t('labels.book_one') : t('labels.book_other');
        }
    };

    const calculateCollectionTotal = (collectionName: string): number => {
        return (books[collectionName] || []).reduce((sum: number, book: BookData) => sum + parseFloat(book.price || '0'), 0);
    };

    const calculateTotalValue = (): number => {
        return collections.reduce((total: number, collection: {name: string; icon: string}) =>
            total + calculateCollectionTotal(collection.name), 0);
    };

    const calculateActiveValue = (): number => {
        return collections.reduce((total: number, collection: {name: string; icon: string}) => {
            return total + (books[collection.name] || []).reduce((sum: number, book: BookData) => {
                const status = book.listingStatus?.status || 'notListed';
                return status !== 'sold' ? sum + parseFloat(book.price || '0') : sum;
            }, 0);
        }, 0);
    };

    const calculateSoldValue = (): number => {
        return collections.reduce((total: number, collection: {name: string; icon: string}) => {
            return total + (books[collection.name] || []).reduce((sum: number, book: BookData) => {
                const status = book.listingStatus?.status || 'notListed';
                return status === 'sold' ? sum + parseFloat(book.price || '0') : sum;
            }, 0);
        }, 0);
    };

    const formatDefectsSummary = (defects: Record<string, BookDefect> | undefined): string => {
        if (!defects) return t('labels.noDefects');
        const defectList = Object.keys(defects).filter(key => defects[key].selected).map(key => `${t(`defects.${key}`)} (${defects[key].count}x)`);
        return defectList.length > 0 ? defectList.join(', ') : t('labels.noDefects');
    };

    const formatUniquenessSummary = (uniqueness: BookUniqueness | undefined): string => {
        if (!uniqueness) return t('labels.standardEdition');
        const uniqueFeatures = [];
        if (uniqueness.isFirstEdition) uniqueFeatures.push(t('labels.firstEdition'));
        if (uniqueness.isCollectorsEdition) uniqueFeatures.push(t('labels.collectorsEdition'));
        if (uniqueness.hasAuthorSignature) uniqueFeatures.push(t('labels.authorSignature'));
        if (uniqueness.isLimitedEdition) uniqueFeatures.push(t('labels.limitedEdition'));
        if (uniqueness.isPublisherDefunct) uniqueFeatures.push(t('labels.defunctPublisher'));
        return uniqueFeatures.length > 0 ? uniqueFeatures.join(', ') : t('labels.standardEdition');
    };

    const formatMarketFactorsSummary = (marketFactors: MarketFactors | undefined): string => {
        if (!marketFactors) return '';
        return `${t(`labels.${marketFactors.demand}`)} ${t('labels.demand')}, ${t(`labels.${marketFactors.supply}`)} ${t('labels.supply')}`;
    };

    const formatListingStatus = (status?: ListingStatus): string => {
        if (!status) return t('listingStatus.notListed', 'Not listed');
        switch (status.status) {
            case 'listed':
                return t('listingStatus.listed', 'Listed on {{platforms}}', {
                    platforms: (status.platforms || []).map(p => t(`platforms.${p}`, p)).join(', ')
                });
            case 'sold':
                return t('listingStatus.sold', 'Sold');
            default:
                return t('listingStatus.notListed', 'Not listed');
        }
    };

    const handleCollectionPress = (collectionName: string) => {
        if (collectionName === 'new') {
            setShowAddModal(true);
        } else {
            setSelectedCollection(collectionName);
        }
    };

    const filteredCollections = useMemo(() => {
        if (!searchQuery) return collections;
        return collections.filter(collection =>
            collection.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }, [collections, searchQuery]);

    const renderStep = () => {
        const stepTitles = [
            t('labels.yourCollections'),
            t('labels.yourBooks')
        ];

        switch (currentStep) {
            case 0:
                return (
                    <Animated.View style={{ transform: [{ translateX: slideAnim }], flex: 1, width: '120%' }}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.slideTitle}>{stepTitles[0]}</Text>
                        </View>

                        <View style={styles.searchHeader}>
                            <View style={styles.searchContainer}>
                                <Feather name="search" size={20} color={colors.secondary} style={styles.searchIcon} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder={t('placeholders.searchCollections')}
                                    placeholderTextColor={colors.grayDark}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                            </View>

                            <View style={styles.headerButtons}>
                                <TouchableOpacity
                                    onPress={() => setShowAddCollectionModal(true)}
                                    style={styles.headerButton}
                                    activeOpacity={0.7}
                                >
                                    <LinearGradient
                                        colors={[colors.buttonSelected1, colors.buttonSelected2]}
                                        style={styles.headerButtonGradient}
                                    >
                                        <Ionicons name="add" size={20} color={colors.primary} />
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleImportCollection}
                                    style={[styles.headerButton, { marginLeft: 8 }]}
                                    activeOpacity={0.7}
                                >
                                    <LinearGradient
                                        colors={[colors.buttonSelected1, colors.buttonSelected2]}
                                        style={styles.headerButtonGradient}
                                    >
                                        <Ionicons name="download" size={20} color={colors.primary} />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {selectedCollection && (
                            <CategoriesCarousel
                                collectionName={selectedCollection}
                                collectionCategories={collectionCategories}
                                onAddCategory={handleAddCategory}
                                onRemoveCategory={handleRemoveCategory}
                            />
                        )}

                        {filteredCollections.length > 0 ? (
                            <CollectionCarousel
                                collections={filteredCollections}
                                books={books}
                                selectedCollection={selectedCollection}
                                onSelectCollection={setSelectedCollection}
                                calculateCollectionTotal={calculateCollectionTotal}
                                onEditCollection={(collectionName) => {
                                    setEditingCollection(collectionName);
                                    setShowEditModal(true);
                                }}
                                onDeleteCollection={handleDeleteCollection}
                                onExportCollection={handleExportCollectionToCSV}
                                getBookWord={getBookWord}
                                formatCurrency={formatCurrency}
                                onNavigateToBooks={goToNextStep}
                            />
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>
                                    {searchQuery
                                        ? t('labels.noCollectionsFound')
                                        : t('labels.noCollections')}
                                </Text>
                                {!searchQuery && (
                                    <View style={styles.emptyActions}>
                                        <TouchableOpacity
                                            style={styles.emptyActionButton}
                                            onPress={() => setShowAddCollectionModal(true)}
                                        >
                                            <Ionicons name="add" size={20} color={colors.primary} />
                                            <Text style={styles.emptyActionText}>{t('buttons.addCollection')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}
                    </Animated.View>
                );
            case 1:
                return (
                    <Animated.View style={{
                        transform: [{ translateX: slideAnim }],
                        flex: 1,
                        width: '120%',
                        minHeight: Dimensions.get('window').height * 0.7,
                    }}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.slideTitle}>{stepTitles[1]}</Text>
                        </View>
                        {selectedCollection && (
                            <View style={styles.collectionDetails}>
                                {books[selectedCollection]?.length === 0 ? (
                                    <View style={styles.emptyBookContainer}>
                                        <Text style={styles.emptyText}>{t('labels.noBooksInCollection')}</Text>
                                    </View>
                                ) : (
                                    <BooksCarousel
                                        books={books[selectedCollection]}
                                        collectionName={selectedCollection}
                                        onEditBook={(index) => handleEditBook(selectedCollection, index)}
                                        onDeleteBook={(index) => removeBookFromCollection(selectedCollection, index)}
                                        onListBook={(index) => handleListBook(selectedCollection, index)}
                                        formatDefectsSummary={formatDefectsSummary}
                                        formatUniquenessSummary={formatUniquenessSummary}
                                        formatMarketFactorsSummary={formatMarketFactorsSummary}
                                        formatListingStatus={formatListingStatus}
                                    />
                                )}
                            </View>
                        )}
                    </Animated.View>
                );
            default:
                return null;
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                contentContainerStyle={[styles.scrollContainer, { paddingBottom: 20 }]}
                showsVerticalScrollIndicator={false}
            >
                <LinearGradient
                    colors={[colors.buttonSelected1, colors.buttonSelected2]}
                    start={[0, 0]}
                    end={[1, 1]}
                    style={styles.ratingOuterContainer}
                >
                    <View style={styles.ratingContainer}>
                        <View style={styles.ratingHeader}>
                            <Text style={styles.ratingTitle}>Wartość kolekcji</Text>
                        </View>

                        <View style={styles.priceSummarySection}>
                            <LinearGradient
                                colors={[colors.white, colors.whiteBlue]}
                                style={[styles.priceSummaryGradient, styles.withShadow]}
                            >
                                <View style={styles.priceRow}>
                                    <View style={styles.priceLabelContainer}>
                                        <FontAwesome5 name="coins" size={22} color={colors.primary} />
                                        <Text style={styles.priceLabelTotal}>Wartość całkowita:</Text>
                                    </View>
                                    <Text style={styles.priceValueTotal}>
                                        {formatCurrency(calculateTotalValue().toString())}
                                    </Text>
                                </View>

                                <View style={styles.separator} />

                                <View style={styles.priceRow}>
                                    <View style={styles.priceLabelContainer}>
                                        <Ionicons name="book-outline" size={14} color={colors.secondary} />
                                        <Text style={styles.priceLabel}>Wartość aktywna:</Text>
                                    </View>
                                    <Text style={[styles.priceValue, {color: colors.grayDark}]}>
                                        {formatCurrency(calculateActiveValue().toString())}
                                    </Text>
                                </View>

                                <View style={styles.priceRow}>
                                    <View style={styles.priceLabelContainer}>
                                        <Ionicons name="cash-outline" size={14} color={colors.primary} />
                                        <Text style={styles.priceLabelSold}>Wartość sprzedana:</Text>
                                    </View>
                                    <Text style={[styles.priceValue, {color: colors.primary}]}>
                                        {formatCurrency(calculateSoldValue().toString())}
                                    </Text>
                                </View>
                            </LinearGradient>
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.stepContainer}>
                    <View style={styles.navArrowContainer}>
                        {currentStep > 0 ? (
                            <TouchableOpacity onPress={goToPrevStep} activeOpacity={0.7}>
                                <Ionicons name="chevron-back" size={32} color={colors.primary}/>
                            </TouchableOpacity>
                        ) : (
                            <Ionicons name="chevron-back" size={32} color={colors.white}/>
                        )}
                    </View>

                    <View style={styles.stepContent}>
                        {renderStep()}
                    </View>

                    <View style={styles.navArrowContainer}>
                        {currentStep < totalSteps - 1 && selectedCollection ? (
                            <TouchableOpacity onPress={goToNextStep} activeOpacity={0.7}>
                                <Ionicons name="chevron-forward" size={32} color={colors.primary}/>
                            </TouchableOpacity>
                        ) : (
                            <Ionicons name="chevron-forward" size={32} color={colors.white}/>
                        )}
                    </View>
                </View>
            </ScrollView>

            <CustomAlertModal
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                type={alertType}
                onConfirm={() => {
                    confirmAction();
                    setAlertVisible(false);
                }}
                confirmText={t('buttons.confirm')}
                closeButtonStyle={styles.closeButton}
                closeButtonTextStyle={styles.closeButtonText}
                buttonFullWidth={true}
            />

            <AddCollectionModal
                visible={showAddCollectionModal}
                onClose={() => setShowAddCollectionModal(false)}
                onConfirm={(name, categories, icon) => handleAddCollection(name, categories, icon)}
            />
            <EditCollectionModal
                visible={showEditModal}
                currentName={editingCollection || ''}
                onClose={() => setShowEditModal(false)}
                onConfirm={(newName, categories, icon) => {
                    if (editingCollection) {
                        handleEditCollection(editingCollection, newName, categories, icon);
                    }
                }}
                collectionCategories={collectionCategories}
            />
            <ImportPreviewModal
                importPreview={importPreview}
                onCancel={cancelImport}
                onConfirm={confirmImport}
                formatDefectsSummary={formatDefectsSummary}
                formatUniquenessSummary={formatUniquenessSummary}
                formatMarketFactorsSummary={formatMarketFactorsSummary}
                formatListingStatus={formatListingStatus}
            />
            <ListingModal
                visible={showListingModal}
                onClose={() => setShowListingModal(false)}
                selectedPlatforms={selectedPlatforms}
                onTogglePlatform={togglePlatform}
                onConfirm={confirmListing}
            />
            <StatusChangeModal
                visible={showStatusChangeModal}
                onClose={() => setShowStatusChangeModal(false)}
                currentStatus={currentListingBook ? books[currentListingBook.collection][currentListingBook.index].listingStatus?.status || 'notListed' : 'notListed'}
                onChangeStatus={changeListingStatus}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        paddingTop: 6,
        backgroundColor: colors.background,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
    },
    navArrow: {
        marginHorizontal: 10,
        marginTop: 10
    },
    emptyBookContainer: {
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    collectionDetails: {
        marginTop: 0,
    },
    totalValueContent: {
        alignItems: 'center',
    },
    coinIconContainer: {
        borderRadius: 20,
        width: 45,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        marginRight: 10,
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    coinIconGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(74,108,247,0.1)',
    },
    priceContainer: {
        backgroundColor: colors.background,
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: 'rgba(74,108,247,0.1)',
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    valueBreakdownContainer: {
        width: '100%',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    valueBreakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        alignItems: 'center',
    },
    valueBreakdownLabel: {
        fontSize: 14,
        color: colors.white,
    },
    valueBreakdownAmount: {
        fontSize: 14,
        fontWeight: '600',
    },
    activeValue: {
        color: colors.white,
    },
    soldValue: {
        color: colors.white,
    },
    totalValueContainer: {
        padding: 24,
        paddingTop: 60,
        marginTop: -20,
        marginBottom: 20,
        marginHorizontal: -16,
        borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22,
    },
    mainValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    valueTextContainer: {
        marginLeft: 12,
    },
    totalValueLabel: {
        fontSize: 14,
        color: colors.white,
        opacity: 0.9,
    },
    totalValueAmount: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.white,
    },
    breakdownRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    breakdownItem: {
        flex: 1,
    },
    breakdownLabel: {
        fontSize: 13,
        color: colors.white,
        opacity: 0.8,
        marginBottom: 4,
    },
    breakdownValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    ratingOuterContainer: {
        padding: 20,
        marginBottom: 20,
        marginHorizontal: -16,
        paddingTop: 60,
        marginTop: -20,
        borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22,
    },
    ratingContainer: {
        gap: 10,
    },
    ratingHeader: {
        marginTop: 20,
        gap: 6,
    },
    ratingTitle: {
        color: colors.primary,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    priceLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    priceLabel: {
        fontSize: 14,
        color: colors.grayDark,
    },
    priceLabelTotal: {
        fontSize: 18,
        color: colors.primary,
        marginLeft: 5
    },
    priceLabelSold: {
        fontSize: 14,
        color: colors.primary,
    },
    priceValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.black,
    },
    priceValueTotal: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
    },
    separator: {
        height: 1,
        backgroundColor: colors.gray,
        marginVertical: 12,
    },
    withShadow: {
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    priceSummarySection: {
        borderRadius: 12,
        overflow: 'hidden',
        marginHorizontal: 4,
        shadowColor: colors.lightPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    priceSummaryGradient: {
        padding: 16,
        backgroundColor: colors.background,
        borderRadius: 12,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1,
    },
    closeButtonText: {
        fontSize: 20,
        color: colors.primary,
        lineHeight: 24,
    },
    stepContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        minHeight: 400,
        width: '100%',
        marginTop: 0,
    },
    navArrowContainer: {
        width: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
    },
    stepContent: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        minHeight: 480,
        maxHeight: 480,
        width: Dimensions.get('window').width - 80,
        paddingHorizontal: 10,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 16,
        paddingTop: 6,
        backgroundColor: colors.background,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        marginTop: 10
    },
    slideTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
        marginRight: 30,
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: colors.background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        marginTop: 20,
        width: '90%',
        marginLeft: 20,
        marginRight: 20
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        color: colors.grayDark,
    },
    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: colors.buttonSelected1,
        marginRight: 5,
        marginLeft: 5
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: colors.black,
    },
    headerButtons: {
        flexDirection: 'row',
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    headerButtonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    emptyActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    emptyActionText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 5,
    },
});

export default CollectionsScreen;
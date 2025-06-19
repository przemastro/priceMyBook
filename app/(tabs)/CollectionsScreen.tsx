import React, {useState, useRef, useEffect, useMemo} from 'react';
import {
    View,
    Text,
    ScrollView,
    Alert,
    StyleSheet,
    Linking,
    TouchableOpacity,
    TextInput,
    Animated
} from 'react-native';
import {Feather, FontAwesome5, Ionicons} from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {useRouter} from 'expo-router';
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
import { styles } from './styles'

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
    collectionCreatedAt?: string;
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
    const [selectedPlatform, setSelectedPlatform] = useState<'amazon' | 'allegro' | 'olx' | null>(null);
    const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
    const [editingCollection, setEditingCollection] = useState<string | null>(null);
    const [showAddCollectionModal, setShowAddCollectionModal] = useState(false);
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
            AsyncStorage.setItem('@selectedCollection', selectedCollection ?? '');
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
        categories.forEach(category => addCategoryToCollection(name, category.trim()));
        setShowAddCollectionModal(false);
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
                console.error('Failed to rename collection:', error);
                showAlert(t('alerts.error'), t('alerts.renameError'), 'error');
                throw error;
            }
        }
    };

    const handleDeleteCollection = (collectionName: string) => {
        removeCollection(collectionName);
        if (selectedCollection === collectionName) setSelectedCollection(null);
    };

    const handleAddCategory = (collectionName: string, category: string) => {
        if (!collectionName || !category.trim()) return;

        if (collectionCategories[collectionName]?.includes(category.trim())) {
            Alert.alert(t('alerts.error'), t('alerts.categoryExists'));
            return;
        }
        addCategoryToCollection(collectionName, category.trim());
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
                publisher: book.publisher ?? '',
                description: book.description ?? '',
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

            const parseResult = await new Promise<any[]>((resolve, reject) => {
                Papa.parse(csvContent, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        if (results.errors.length > 0) {
                            console.error('CSV parsing errors:', results.errors);
                            reject(new Error('Error parsing CSV'));
                        } else {
                            resolve(results.data);
                        }
                    },
                    error: (error: any) => reject(new Error(error))
                });
            });

            if (!parseResult || parseResult.length === 0) {
                showAlert(t('alerts.error'), t('alerts.emptyCsv'), 'error');
                setIsImporting(false);
                return;
            }

            const importedBooks: BookData[] = parseResult
                .filter(book => book.Title && book.ISBN)
                .map(book => {
                    const price = book['Price (PLN)'] ?? book['Original Price'] ?? '0';
                    const rating = parseInt(book['Condition Rating'] ?? '10');

                    let defects = {};
                    try {
                        defects = book.Defects ? JSON.parse(book.Defects) : {};
                    } catch (e) {
                        console.warn('Failed to parse defects', e);
                    }

                    let uniqueness = defaultUniqueness;
                    try {
                        uniqueness = book.Uniqueness ? JSON.parse(book.Uniqueness) : defaultUniqueness;
                    } catch (e) {
                        console.warn('Failed to parse uniqueness', e);
                    }

                    let marketFactors = defaultMarketFactors;
                    try {
                        marketFactors = book['Market Factors'] ? JSON.parse(book['Market Factors']) : defaultMarketFactors;
                    } catch (e) {
                        console.warn('Failed to parse market factors', e);
                    }

                    let ageInfo = defaultAgeInfo;
                    try {
                        ageInfo = book['Age Info'] ? JSON.parse(book['Age Info']) : defaultAgeInfo;
                    } catch (e) {
                        console.warn('Failed to parse age info', e);
                    }

                    let listingStatus = defaultListingStatus;
                    try {
                        listingStatus = book['Listing Status'] ? JSON.parse(book['Listing Status']) : defaultListingStatus;
                    } catch (e) {
                        console.warn('Failed to parse listing status', e);
                    }

                    return {
                        title: book.Title.trim(),
                        authors: (book.Authors ?? t('bookInfo.unknown')).toString().trim(),
                        isbn: book.ISBN.trim(),
                        price: price,
                        displayPrice: `${price} PLN`,
                        foundInApi: book['Found in API'] === 'Yes',
                        originalPrice: book['Original Price'] ?? price,
                        defects: defects,
                        rating: rating,
                        source: book.Source ?? 'manual',
                        priceSource: book['Price Source'] ?? undefined,
                        uniqueness: uniqueness,
                        marketFactors: marketFactors,
                        ageInfo: ageInfo,
                        listingStatus: {
                            ...listingStatus,
                            listedDate: book['Listed Date'] ?? listingStatus.listedDate,
                            soldDate: book['Sold Date'] ?? listingStatus.soldDate
                        },
                        imageUri: book['Image URI'] ?? undefined,
                        createdAt: book['Book Added At'] ?? new Date().toISOString()
                    };
                });

            if (importedBooks.length === 0) {
                showAlert(t('alerts.error'), t('alerts.noValidBooks'), 'error');
                setIsImporting(false);
                return;
            }

            const categories = parseResult[0]?.Categories
                ? parseResult[0].Categories.split(';').map((c: string) => c.trim()).filter((c: string) => c)
                : [];

            setImportPreview({
                collectionName: file.name.replace('.csv', '').slice(0, 30),
                books: importedBooks,
                categories,
                showPreview: true,
                collectionCreatedAt: parseResult[0]?.['Collection Created At'] ?? new Date().toISOString()
            });
        } catch (error) {
            console.error('Import failed:', error);
            showAlert(t('alerts.error'), t('alerts.importError'), 'error');
        } finally {
            setIsImporting(false);
        }
    };

    const confirmImport = async () => {
        if (!importPreview) return;
        try {
            addCollection(
                importPreview.collectionName,
                'book',
                importPreview.categories,
                { createdAt: importPreview.collectionCreatedAt }
            );

            await addBooksToCollection(importPreview.collectionName, importPreview.books);

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
            const collectionData = collections.find(c => c.name === collectionName);
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
                'Categories', 'Collection Created At',
                'Book Added At', 'Listed Date', 'Sold Date'
            ].join(',');

            const rows = collectionBooks.map(book => {
                const bookCategories = categories.join('; ');
                const listingStatus = book.listingStatus || defaultListingStatus;

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
                    `"${JSON.stringify(listingStatus).replace(/"/g, '""')}"`,
                    book.imageUri ?? '',
                    `"${bookCategories}"`,
                    collectionData?.createdAt ?? '',
                    book.createdAt ?? '',
                    listingStatus.listedDate ?? '',
                    listingStatus.soldDate ?? ''
                ].join(',');
            });

            const csvContent = `${headers}\n${rows.join('\n')}`;
            const fileUri = FileSystem.cacheDirectory + `${collectionName}_export_${new Date().toISOString().slice(0,10)}.csv`;
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
            setSelectedPlatform(null);
            setShowListingModal(true);
        } else if (book.listingStatus?.status === 'listed') {
            setShowStatusChangeModal(true);
        } else if (book.listingStatus?.status === 'sold') {
            setShowStatusChangeModal(true);
        }
    };

    const confirmListing = () => {
        if (!currentListingBook || !selectedPlatform) return;
        const { collection, index } = currentListingBook;
        const book = books[collection][index];

        let url = '';
        switch (selectedPlatform) {
            case 'amazon':
                url = `https://sellercentral.amazon.com/listing/create?title=${encodeURIComponent(book.title)}`;
                break;
            case 'allegro':
                url = `https://allegro.pl/myaccount/offer/new?title=${encodeURIComponent(book.title)}`;
                break;
            case 'olx':
                url = `https://www.olx.pl/dodaj-ogloszenie/?query=${encodeURIComponent(book.title)}`;
                break;
        }

        Linking.openURL(url).catch(err => console.error('Error opening URL:', err));

        const updatedBooks = [...books[collection]];
        updatedBooks[index] = {
            ...updatedBooks[index],
            listingStatus: {
                status: 'listed',
                platforms: [selectedPlatform],
                listedDate: new Date().toISOString()
            }
        };

        updateBooksInCollection(collection, updatedBooks);
        setShowListingModal(false);
        setCurrentListingBook(null);
        setSelectedPlatform(null);
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
                listedDate: newStatus === 'listed' ? new Date().toISOString() : currentListingStatus.listedDate,
                soldDate: newStatus === 'sold' ? new Date().toISOString() : currentListingStatus.soldDate
            }
        };

        updateBooksInCollection(collection, updatedBooks);
        setShowStatusChangeModal(false);
        setCurrentListingBook(null);
    };

    const selectPlatform = (platform: 'amazon' | 'allegro' | 'olx') => {
        setSelectedPlatform(platform);
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
            return total + (books[collection.name] ?? []).reduce((sum: number, book: BookData) => {
                const status = book.listingStatus?.status ?? 'notListed';
                return status !== 'sold' ? sum + parseFloat(book.price ?? '0') : sum;
            }, 0);
        }, 0);
    };

    const calculateSoldValue = (): number => {
        return collections.reduce((total: number, collection: {name: string; icon: string}) => {
            return total + (books[collection.name] || []).reduce((sum: number, book: BookData) => {
                const status = book.listingStatus?.status ?? 'notListed';
                return status === 'sold' ? sum + parseFloat(book.price || '0') : sum;
            }, 0);
        }, 0);
    };

    const formatDefectsSummary = (defects: Record<string, BookDefect> | undefined): string => {
        if (!defects) return t('labels.noDefects');
        const defectList = Object.keys(defects)
            .filter(key => defects[key].selected)
            .map(key => {
                const defectName = t(`defects.${key}`);
                return `${defectName} (${defects[key].count}x)`;
            });
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
        const demandText = t(`labels.${marketFactors.demand}`);
        const supplyText = t(`labels.${marketFactors.supply}`);
        const demandLabel = t('labels.demand');
        const supplyLabel = t('labels.supply');
        return `${demandText} ${demandLabel}, ${supplyText} ${supplyLabel}`;
    };

    const getPath = (screen: string, isTab?: boolean, customPath?: string) => {
        if (customPath) return customPath;
        return isTab ? `/(tabs)/${screen}` : `/${screen}`;
    };

    const navigateToScreen = (screen: string, isTab?: boolean, customPath?: string) => {
        const path = getPath(screen, isTab, customPath);
        router.push(path as any);
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

        return (
            <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                    <Text style={styles.stepTitle} numberOfLines={1} ellipsizeMode="tail">
                        {stepTitles[currentStep]}
                    </Text>

                    <View style={styles.navigationContainer}>
                        {currentStep > 0 ? (
                            <TouchableOpacity onPress={goToPrevStep} activeOpacity={0.7}>
                                <Ionicons name="chevron-back" size={24} color={colors.primary}/>
                            </TouchableOpacity>
                        ) : (
                            <View style={{width: 24}} />
                        )}

                        <View style={styles.progressDots}>
                            {Array.from({length: totalSteps}).map((_, i) => {
                                const key = `step-${i}-${currentStep}`;
                                return (
                                    <View
                                        key={key}
                                        style={[
                                            styles.dot,
                                            i === currentStep ? styles.activeDot : styles.inactiveDot
                                        ]}
                                    />
                                );
                            })}
                        </View>

                        {currentStep < totalSteps - 1 ? (
                            <TouchableOpacity onPress={goToNextStep} activeOpacity={0.7}>
                                <Ionicons name="chevron-forward" size={24} color={colors.primary}/>
                            </TouchableOpacity>
                        ) : (
                            <View style={{width: 24}} />
                        )}
                    </View>
                </View>

                <Animated.View style={{transform: [{translateX: slideAnim}], flex: 1}}>
                    {(() => {
                        switch (currentStep) {
                            case 0:
                                return (
                                    <View style={localStyles.stepContent}>
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
                                    </View>
                                );
                            case 1:
                                return (
                                    <View style={localStyles.stepContent}>
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
                                    </View>
                                );
                            default:
                                return null;
                        }
                    })()}
                </Animated.View>
            </View>
        );
    };

    return (
        <LinearGradient
            colors={[colors.buttonSelected1, colors.buttonSelected2]}
            style={{flex: 1}}
        >
            <View style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={[styles.container, { paddingBottom: 0 }]}
                    style={styles.backgroundGradient}
                    showsVerticalScrollIndicator={false}
                >
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ marginLeft: 10, marginRight: 20, marginBottom: 0 }}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.blackDark} />
                    </TouchableOpacity>
                    <LinearGradient
                        colors={['transparent', 'transparent']}
                        start={[0, 0]}
                        end={[1, 1]}
                        style={styles.ratingOuterContainer}
                    >
                        <View style={styles.ratingContainer}>
                            <View style={styles.priceSummarySection}>
                                <LinearGradient
                                    colors={[colors.buttonSelected1, colors.buttonSelected2]}
                                    style={[styles.priceSummaryGradient, styles.withShadow]}
                                >
                                    <View style={styles.priceRow}>
                                        <View style={styles.priceLabelContainer}>
                                            <FontAwesome5 name="coins" size={22} color={colors.primary} />
                                            <Text style={styles.priceLabelTotal}>Wartość kolekcji:</Text>
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
                                    <TouchableOpacity
                                        onPress={() => navigateToScreen('Settings', false, '/components/financialReportScreen/FinancialReport')}
                                        style={styles.moreButton}
                                    >
                                        <Text style={styles.moreButtonText}>{t('home.more')}</Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            </View>
                        </View>
                    </LinearGradient>

                    {renderStep()}
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
                    closeButtonStyle={localStyles.closeButton}
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
                    currentName={editingCollection ?? ''}
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
                    selectedPlatform={selectedPlatform}
                    onSelectPlatform={selectPlatform}
                    onConfirm={confirmListing}
                />
                <StatusChangeModal
                    visible={showStatusChangeModal}
                    onClose={() => setShowStatusChangeModal(false)}
                    currentStatus={currentListingBook ? books[currentListingBook.collection][currentListingBook.index].listingStatus?.status ?? 'notListed' : 'notListed'}
                    onChangeStatus={changeListingStatus}
                />
            </View>
        </LinearGradient>
    );
};

const localStyles = StyleSheet.create({
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1,
    },
    stepContent: {
        flex: 1,
        paddingHorizontal: 10,
    },
});

export default CollectionsScreen;
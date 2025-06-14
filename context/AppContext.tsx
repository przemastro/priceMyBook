import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getExchangeRate, ExchangeRateResult } from '@/services/currencyService';
import i18n from '@/app/i18n/config';
import { t } from "i18next";
import { CustomAlertModal } from '@/app/components/alerts/CustomAlertModal';

export const LIMITS = {
    MAX_COLLECTIONS: 5,
    MAX_TOTAL_BOOKS: 5,
    MAX_BOOKS_PER_COLLECTION: 5,
};

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

interface Collection {
    name: string;
    icon: string;
    createdAt?: string;
}

interface BookData {
    title: string;
    authors: string;
    isbn: string;
    price: string;
    displayPrice: string;
    foundInApi: boolean;
    originalPrice: string;
    description?: string;
    publisher?: string;
    imageUri?: string;
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
    marketData?: {
        demand: MarketFactors['demand'];
        supply: MarketFactors['supply'];
        priceRange: [number, number];
        priceHistory: { date: string; price: number }[];
        lastUpdated: Date;
        source: 'google' | 'amazon' | 'openLibrary' | 'simulated';
    };
}

interface AppContextType {
    isbn: string | null;
    setISBN: (isbn: string | null) => void;
    collections: Collection[];
    addCollection: (
        name: string,
        icon?: string,
        categories?: string[],
        options?: { createdAt?: string }
    ) => void;
    removeCollection: (name: string) => void;
    books: { [key: string]: BookData[] };
    collectionCategories: { [key: string]: string[] };
    addCategoryToCollection: (collectionName: string, category: string) => void;
    removeCategoryFromCollection: (collectionName: string, category: string) => void;
    addBookToCollection: (collectionName: string, bookData: Omit<BookData, 'createdAt'>) => void;
    addBooksToCollection: (collectionName: string, booksData: Omit<BookData, 'createdAt'>[]) => Promise<void>;
    removeBookFromCollection: (collectionName: string, bookIndex: number) => void;
    updateBookInCollection: (collectionName: string, bookIndex: number, updatedData: Partial<BookData>) => void;
    updateBooksInCollection: (collectionName: string, updatedBooks: BookData[]) => void;
    exchangeRate: number;
    exchangeRateError: string | null;
    lastRateUpdate: Date | null;
    refreshExchangeRate: () => Promise<void>;
    scanHistory: BookData[];
    addToScanHistory: (bookData: Omit<BookData, 'createdAt'>) => void;
    clearScanHistory: () => void;
    formatCurrency: (price: string) => string;
    forceUpdateCollections: () => void;
    renameCollection: (
        oldName: string,
        newName: string,
        categories?: string[],
        icon?: string
    ) => Promise<void>;
    selectedCollection: string | null;
    setSelectedCollection: (collection: string | null) => void;
    checkGlobalLimits: () => {
        collectionLimitReached: boolean;
        booksLimitReached: boolean;
        canAddMoreCollections: boolean;
        canAddMoreBooks: boolean;
        totalBooks: number;
        totalCollections: number;
    };
    calculateTotalValue: () => number;
    calculateActiveValue: () => number;
    calculateSoldValue: () => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
    COLLECTIONS: '@collections',
    BOOKS: '@books',
    SCAN_HISTORY: '@scanHistory',
    EXCHANGE_RATE: '@exchangeRate',
    COLLECTION_CATEGORIES: '@collectionCategories',
    SELECTED_COLLECTION: '@selectedCollection'
} as const;

const defaultListingStatus: ListingStatus = {
    status: 'notListed',
    platforms: []
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isbn, setISBN] = useState<string | null>(null);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [books, setBooks] = useState<{ [key: string]: BookData[] }>({});
    const [collectionCategories, setCollectionCategories] = useState<{ [key: string]: string[] }>({});
    const [exchangeRate, setExchangeRate] = useState<number>(3.8);
    const [exchangeRateError, setExchangeRateError] = useState<string | null>(null);
    const [lastRateUpdate, setLastRateUpdate] = useState<Date | null>(null);
    const [scanHistory, setScanHistory] = useState<BookData[]>([]);
    const [updateTrigger, setUpdateTrigger] = useState(0);
    const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'error' as 'info' | 'success' | 'error' | 'warning'
    });

    const forceUpdateCollections = useCallback(() => {
        setUpdateTrigger(prev => prev + 1);
    }, []);

    const calculateTotalValue = useCallback((): number => {
        return collections.reduce((total, collection) =>
            total + (books[collection.name] || []).reduce((sum, book) =>
                sum + parseFloat(book.price || '0'), 0), 0);
    }, [books, collections]);

    const calculateActiveValue = useCallback((): number => {
        return collections.reduce((total, collection) => {
            return total + (books[collection.name] || []).reduce((sum, book) => {
                const status = book.listingStatus?.status || 'notListed';
                return status !== 'sold' ? sum + parseFloat(book.price || '0') : sum;
            }, 0);
        }, 0);
    }, [books, collections]);

    const calculateSoldValue = useCallback((): number => {
        return collections.reduce((total, collection) => {
            return total + (books[collection.name] || []).reduce((sum, book) => {
                const status = book.listingStatus?.status || 'notListed';
                return status === 'sold' ? sum + parseFloat(book.price || '0') : sum;
            }, 0);
        }, 0);
    }, [books, collections]);

    const checkGlobalLimits = useCallback(() => {
        const totalBooks = Object.values(books).reduce((sum, collection) => sum + collection.length, 0);
        const collectionLimitReached = collections.length >= LIMITS.MAX_COLLECTIONS;
        const booksLimitReached = totalBooks >= LIMITS.MAX_TOTAL_BOOKS;

        return {
            collectionLimitReached,
            booksLimitReached,
            canAddMoreCollections: !collectionLimitReached,
            canAddMoreBooks: !booksLimitReached,
            totalBooks,
            totalCollections: collections.length
        };
    }, [books, collections.length]);

    useEffect(() => {
        const loadPersistedData = async () => {
            try {
                const [history, collections, books, rate, categories, selected] = await Promise.all([
                    AsyncStorage.getItem(STORAGE_KEYS.SCAN_HISTORY),
                    AsyncStorage.getItem(STORAGE_KEYS.COLLECTIONS),
                    AsyncStorage.getItem(STORAGE_KEYS.BOOKS),
                    AsyncStorage.getItem(STORAGE_KEYS.EXCHANGE_RATE),
                    AsyncStorage.getItem(STORAGE_KEYS.COLLECTION_CATEGORIES),
                    AsyncStorage.getItem(STORAGE_KEYS.SELECTED_COLLECTION)
                ]);

                if (history) setScanHistory(JSON.parse(history));
                if (collections) setCollections(JSON.parse(collections));
                if (books) setBooks(JSON.parse(books));
                if (categories) setCollectionCategories(JSON.parse(categories));
                if (selected) setSelectedCollection(selected);
                if (rate) {
                    const { rate: savedRate, error, timestamp } = JSON.parse(rate);
                    setExchangeRate(savedRate);
                    setExchangeRateError(error);
                    setLastRateUpdate(new Date(timestamp));
                }

                await refreshExchangeRate();
            } catch (error) {
                console.error('Failed to load persisted data:', error);
            }
        };

        loadPersistedData();
    }, []);

    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEYS.SCAN_HISTORY, JSON.stringify(scanHistory));
    }, [scanHistory]);

    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
    }, [collections]);

    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
    }, [books]);

    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEYS.COLLECTION_CATEGORIES, JSON.stringify(collectionCategories));
    }, [collectionCategories]);

    useEffect(() => {
        if (selectedCollection) {
            AsyncStorage.setItem(STORAGE_KEYS.SELECTED_COLLECTION, selectedCollection);
        }
    }, [selectedCollection]);

    const refreshExchangeRate = async () => {
        try {
            const result = await getExchangeRate();
            const newRate = {
                rate: result.usd,
                error: result.error,
                timestamp: (result.lastUpdated || new Date()).toISOString()
            };

            setExchangeRate(newRate.rate);
            setExchangeRateError(newRate.error);
            setLastRateUpdate(new Date(newRate.timestamp));

            await AsyncStorage.setItem(
                STORAGE_KEYS.EXCHANGE_RATE,
                JSON.stringify(newRate)
            );
        } catch (error) {
            console.error('Failed to refresh exchange rate:', error);
        }
    };

    const formatCurrency = useCallback((price: string) => {
        const priceNumber = parseFloat(price) || 0;
        if (i18n.language === 'pl') {
            return `${priceNumber.toFixed(2)} PLN`;
        }
        const usdPrice = priceNumber / exchangeRate;
        return `$${usdPrice.toFixed(2)}`;
    }, [exchangeRate]);

    const addCollection = useCallback((
        name: string,
        icon: string = 'book',
        initialCategories: string[] = [],
        options?: { createdAt?: string }
    ) => {
        if (!name.trim()) return;

        const { collectionLimitReached } = checkGlobalLimits();
        if (collectionLimitReached) {
            setAlertConfig({
                visible: true,
                title: t('alerts.error'),
                message: t('alerts.collectionLimitReached', { limit: LIMITS.MAX_COLLECTIONS }),
                type: 'error'
            });
            return;
        }

        const newCollection = {
            name,
            icon,
            createdAt: options?.createdAt || new Date().toISOString()
        };

        setCollections(prev => [...prev, newCollection]);
        setBooks(prev => ({ ...prev, [name]: prev[name] || [] }));
        setCollectionCategories(prev => ({
            ...prev,
            [name]: initialCategories
        }));
    }, [checkGlobalLimits, t]);

    const renameCollection = useCallback(async (oldName: string, newName: string, categories: string[] = [], icon: string = 'book') => {
        if (!newName.trim() || oldName === newName) return;

        setCollections(prev => prev.map(collection =>
            collection.name === oldName ? { ...collection, name: newName, icon } : collection
        ));

        setBooks(prev => {
            const newBooks = { ...prev };
            if (newBooks[oldName]) {
                newBooks[newName] = newBooks[oldName];
                delete newBooks[oldName];
            }
            return newBooks;
        });

        setCollectionCategories(prev => {
            const newCategories = { ...prev };
            if (newCategories[oldName]) {
                newCategories[newName] = [...categories];
                delete newCategories[oldName];
            }
            return newCategories;
        });

        if (selectedCollection === oldName) {
            setSelectedCollection(newName);
        }

        forceUpdateCollections();
    }, [forceUpdateCollections, selectedCollection]);

    const removeCollection = useCallback((name: string) => {
        setCollections(prev => prev.filter(c => c.name !== name));
        setBooks(prev => {
            const newBooks = { ...prev };
            delete newBooks[name];
            return newBooks;
        });
        setCollectionCategories(prev => {
            const newCategories = { ...prev };
            delete newCategories[name];
            return newCategories;
        });
        if (selectedCollection === name) {
            setSelectedCollection(null);
        }
        forceUpdateCollections();
    }, [forceUpdateCollections, selectedCollection]);

    const addCategoryToCollection = useCallback((collectionName: string, category: string) => {
        if (!collectionName || !category.trim()) return;

        setCollectionCategories(prev => {
            const currentCategories = prev[collectionName] || [];
            if (currentCategories.includes(category.trim())) {
                return prev;
            }
            const updated = {
                ...prev,
                [collectionName]: [...currentCategories, category.trim()]
            };
            AsyncStorage.setItem(STORAGE_KEYS.COLLECTION_CATEGORIES, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const removeCategoryFromCollection = useCallback((collectionName: string, category: string) => {
        if (!collectionName) return;

        setCollectionCategories(prev => {
            const currentCategories = prev[collectionName] || [];
            const updated = {
                ...prev,
                [collectionName]: currentCategories.filter(c => c !== category)
            };
            AsyncStorage.setItem(STORAGE_KEYS.COLLECTION_CATEGORIES, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const addBookToCollection = useCallback((
        collectionName: string,
        bookData: Omit<BookData, 'createdAt'>
    ) => {
        const { booksLimitReached } = checkGlobalLimits();
        if (booksLimitReached) {
            setAlertConfig({
                visible: true,
                title: t('alerts.error'),
                message: t('alerts.bookLimitReached', { limit: LIMITS.MAX_TOTAL_BOOKS }),
                type: 'error'
            });
            return;
        }

        setBooks(prev => {
            const newBooks = { ...prev };
            if (!newBooks[collectionName]) {
                newBooks[collectionName] = [];
            }

            const bookWithDefaults: BookData = {
                ...bookData,
                createdAt: new Date().toISOString(),
                defects: bookData.defects || {},
                displayPrice: bookData.displayPrice || formatCurrency(bookData.price),
                rating: bookData.rating || 10,
                originalPrice: bookData.originalPrice || bookData.price,
                uniqueness: bookData.uniqueness || defaultUniqueness,
                marketFactors: bookData.marketFactors || defaultMarketFactors,
                ageInfo: bookData.ageInfo || defaultAgeInfo,
                isExpanded: false,
                listingStatus: bookData.listingStatus || defaultListingStatus,
            };

            return {
                ...newBooks,
                [collectionName]: [...newBooks[collectionName], bookWithDefaults]
            };
        });
    }, [checkGlobalLimits, formatCurrency, t]);

    const addBooksToCollection = useCallback(async (
        collectionName: string,
        booksData: Array<Omit<BookData, 'createdAt'>>
    ) => {
        const { booksLimitReached } = checkGlobalLimits();
        if (booksLimitReached) {
            setAlertConfig({
                visible: true,
                title: t('alerts.error'),
                message: t('alerts.bookLimitReached', { limit: LIMITS.MAX_TOTAL_BOOKS }),
                type: 'error'
            });
            return Promise.reject(new Error('Book limit reached'));
        }

        return new Promise<void>((resolve) => {
            setBooks(prev => {
                const newBooks = { ...prev };
                if (!newBooks[collectionName]) {
                    newBooks[collectionName] = [];
                }

                const booksWithDefaults = booksData.map(book => ({
                    ...book,
                    createdAt: new Date().toISOString(),
                    defects: book.defects || {},
                    rating: book.rating || 10,
                    originalPrice: book.originalPrice || book.price,
                    displayPrice: book.displayPrice || formatCurrency(book.price),
                    uniqueness: book.uniqueness || defaultUniqueness,
                    marketFactors: book.marketFactors || defaultMarketFactors,
                    ageInfo: book.ageInfo || defaultAgeInfo,
                    listingStatus: book.listingStatus || defaultListingStatus,
                    isExpanded: false,
                } as BookData));

                return {
                    ...newBooks,
                    [collectionName]: [...newBooks[collectionName], ...booksWithDefaults]
                };
            });
            resolve();
        });
    }, [checkGlobalLimits, formatCurrency, t]);

    const updateBookInCollection = useCallback((
        collectionName: string,
        bookIndex: number,
        updatedData: Partial<BookData>
    ) => {
        setBooks(prev => {
            const newBooks = { ...prev };
            if (newBooks[collectionName] && newBooks[collectionName][bookIndex]) {
                const updatedCollection = [...newBooks[collectionName]];
                updatedCollection[bookIndex] = {
                    ...updatedCollection[bookIndex],
                    ...updatedData,
                    displayPrice: updatedData.price ? formatCurrency(updatedData.price) :
                        updatedCollection[bookIndex].displayPrice,
                    defects: updatedData.defects || updatedCollection[bookIndex].defects,
                    rating: updatedData.rating || updatedCollection[bookIndex].rating,
                    uniqueness: updatedData.uniqueness || updatedCollection[bookIndex].uniqueness,
                    marketFactors: updatedData.marketFactors || updatedCollection[bookIndex].marketFactors,
                    ageInfo: updatedData.ageInfo || updatedCollection[bookIndex].ageInfo,
                    listingStatus: updatedData.listingStatus || updatedCollection[bookIndex].listingStatus || defaultListingStatus,
                    isExpanded: updatedData.isExpanded !== undefined ?
                        updatedData.isExpanded : updatedCollection[bookIndex].isExpanded
                };

                return {
                    ...newBooks,
                    [collectionName]: updatedCollection
                };
            }
            return newBooks;
        });
    }, [formatCurrency]);

    const updateBooksInCollection = useCallback((collectionName: string, updatedBooks: BookData[]) => {
        setBooks(prev => ({
            ...prev,
            [collectionName]: updatedBooks
        }));
    }, []);

    const removeBookFromCollection = useCallback((collectionName: string, bookIndex: number) => {
        setBooks(prev => ({
            ...prev,
            [collectionName]: prev[collectionName].filter((_, i) => i !== bookIndex)
        }));
        forceUpdateCollections();
    }, [forceUpdateCollections]);

    const addToScanHistory = useCallback((bookData: Omit<BookData, 'createdAt'>) => {
        setScanHistory(prev => {
            const newItem: BookData = {
                ...bookData,
                displayPrice: bookData.displayPrice || formatCurrency(bookData.price),
                originalPrice: bookData.originalPrice || bookData.price || '0',
                createdAt: new Date().toISOString(),
                foundInApi: bookData.foundInApi || false,
                defects: bookData.defects || {},
                rating: bookData.rating || 10,
                uniqueness: bookData.uniqueness || defaultUniqueness,
                marketFactors: bookData.marketFactors || defaultMarketFactors,
                ageInfo: bookData.ageInfo || defaultAgeInfo,
                listingStatus: bookData.listingStatus || defaultListingStatus,
                isExpanded: false,
                marketData: bookData.marketData
            };

            return [newItem, ...prev.filter(item => item.isbn !== bookData.isbn)];
        });
    }, [formatCurrency]);

    const clearScanHistory = useCallback(() => {
        setScanHistory([]);
    }, []);

    return (
        <AppContext.Provider
            value={{
                isbn,
                setISBN,
                collections,
                addCollection,
                removeCollection,
                renameCollection,
                books,
                collectionCategories,
                addCategoryToCollection,
                removeCategoryFromCollection,
                addBookToCollection,
                addBooksToCollection,
                updateBookInCollection,
                updateBooksInCollection,
                removeBookFromCollection,
                exchangeRate,
                exchangeRateError,
                lastRateUpdate,
                refreshExchangeRate,
                scanHistory,
                addToScanHistory,
                clearScanHistory,
                formatCurrency,
                forceUpdateCollections,
                selectedCollection,
                setSelectedCollection,
                checkGlobalLimits,
                calculateTotalValue,
                calculateActiveValue,
                calculateSoldValue
            }}
        >
            {children}
            <CustomAlertModal
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onConfirm={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
            />
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
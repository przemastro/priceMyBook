import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getExchangeRate, ExchangeRateResult } from '@/services/currencyService';
import i18n from '@/app/i18n/config';

interface BookDefect {
    selected: boolean;
    reduction: number;
    count: number;
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
    averagePrice?: string;
    createdAt?: string;
    rating: number;
}

interface AppContextType {
    isbn: string | null;
    setISBN: (isbn: string | null) => void;
    collections: string[];
    addCollection: (name: string) => void;
    removeCollection: (name: string) => void;
    books: { [key: string]: BookData[] };
    addBookToCollection: (collectionName: string, bookData: Omit<BookData, 'createdAt'>) => void;
    addBooksToCollection: (collectionName: string, booksData: BookData[]) => Promise<void>;
    removeBookFromCollection: (collectionName: string, bookIndex: number) => void;
    updateBookInCollection: (collectionName: string, bookIndex: number, updatedData: Partial<BookData>) => void;
    exchangeRate: number;
    exchangeRateError: string | null;
    lastRateUpdate: Date | null;
    refreshExchangeRate: () => Promise<void>;
    scanHistory: BookData[];
    addToScanHistory: (bookData: Omit<BookData, 'createdAt'>) => void;
    clearScanHistory: () => void;
    formatCurrency: (price: string) => string;
    forceUpdateCollections: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
    COLLECTIONS: '@collections',
    BOOKS: '@books',
    SCAN_HISTORY: '@scanHistory',
    EXCHANGE_RATE: '@exchangeRate'
} as const;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isbn, setISBN] = useState<string | null>(null);
    const [collections, setCollections] = useState<string[]>([]);
    const [books, setBooks] = useState<{ [key: string]: BookData[] }>({});
    const [exchangeRate, setExchangeRate] = useState<number>(3.8);
    const [exchangeRateError, setExchangeRateError] = useState<string | null>(null);
    const [lastRateUpdate, setLastRateUpdate] = useState<Date | null>(null);
    const [scanHistory, setScanHistory] = useState<BookData[]>([]);
    const [updateTrigger, setUpdateTrigger] = useState(0);

    const forceUpdateCollections = useCallback(() => {
        setUpdateTrigger(prev => prev + 1);
    }, []);

    // Load all persisted data on app start
    useEffect(() => {
        const loadPersistedData = async () => {
            try {
                const [history, collections, books, rate] = await Promise.all([
                    AsyncStorage.getItem(STORAGE_KEYS.SCAN_HISTORY),
                    AsyncStorage.getItem(STORAGE_KEYS.COLLECTIONS),
                    AsyncStorage.getItem(STORAGE_KEYS.BOOKS),
                    AsyncStorage.getItem(STORAGE_KEYS.EXCHANGE_RATE)
                ]);

                if (history) setScanHistory(JSON.parse(history));
                if (collections) setCollections(JSON.parse(collections));
                if (books) setBooks(JSON.parse(books));
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

    // Persist data changes
    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEYS.SCAN_HISTORY, JSON.stringify(scanHistory));
    }, [scanHistory]);

    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
    }, [collections]);

    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
    }, [books]);

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

    const addCollection = useCallback((name: string) => {
        if (!name.trim()) return;

        setCollections(prev => [...prev, name]);
        setBooks(prev => ({ ...prev, [name]: prev[name] || [] }));
    }, []);

    const removeCollection = useCallback((name: string) => {
        setCollections(prev => prev.filter(c => c !== name));
        setBooks(prev => {
            const newBooks = { ...prev };
            delete newBooks[name];
            return newBooks;
        });
        forceUpdateCollections();
    }, [forceUpdateCollections]);

    const addBookToCollection = useCallback((
        collectionName: string,
        bookData: Omit<BookData, 'createdAt'>
    ) => {
        setBooks(prev => {
            const newBooks = { ...prev };
            if (!newBooks[collectionName]) {
                newBooks[collectionName] = [];
            }

            const bookWithISBN = {
                ...bookData,
                isbn: bookData.isbn,
                createdAt: new Date().toISOString(),
                defects: bookData.defects || {},
                displayPrice: bookData.displayPrice || formatCurrency(bookData.price),
                rating: bookData.rating || 10,
                originalPrice: bookData.originalPrice || bookData.price,
                averagePrice: bookData.averagePrice || bookData.price
            };

            return {
                ...newBooks,
                [collectionName]: [...newBooks[collectionName], bookWithISBN]
            };
        });
    }, [formatCurrency]);

    const addBooksToCollection = useCallback(async (collectionName: string, booksData: BookData[]) => {
        return new Promise<void>((resolve) => {
            setBooks(prev => {
                if (!prev[collectionName]) {
                    console.error(`Collection ${collectionName} doesn't exist`);
                    return prev;
                }

                const booksWithDefaults = booksData.map(book => ({
                    ...book,
                    defects: book.defects || {},
                    rating: book.rating || 10,
                    originalPrice: book.originalPrice || book.price,
                    averagePrice: book.averagePrice || book.price,
                    displayPrice: book.displayPrice || formatCurrency(book.price),
                    createdAt: book.createdAt || new Date().toISOString()
                }));

                return {
                    ...prev,
                    [collectionName]: [...(prev[collectionName] || []), ...booksWithDefaults]
                };
            });
            resolve();
        });
    }, [formatCurrency]);

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
                    averagePrice: updatedData.averagePrice || updatedCollection[bookIndex].averagePrice
                };

                return {
                    ...newBooks,
                    [collectionName]: updatedCollection
                };
            }
            return newBooks;
        });
    }, [formatCurrency]);

    const removeBookFromCollection = useCallback((collectionName: string, bookIndex: number) => {
        setBooks(prev => ({
            ...prev,
            [collectionName]: prev[collectionName].filter((_, i) => i !== bookIndex)
        }));
        forceUpdateCollections();
    }, [forceUpdateCollections]);

    const addToScanHistory = useCallback((bookData: Omit<BookData, 'createdAt'>) => {
        setScanHistory(prev => {
            const newItem = {
                ...bookData,
                displayPrice: bookData.displayPrice || formatCurrency(bookData.price),
                originalPrice: bookData.originalPrice || bookData.price || '0',
                createdAt: new Date().toISOString(),
                foundInApi: bookData.foundInApi || false,
                defects: bookData.defects || {},
                rating: bookData.rating || 10,
                averagePrice: bookData.averagePrice || bookData.price
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
                books,
                addBookToCollection,
                addBooksToCollection,
                updateBookInCollection,
                removeBookFromCollection,
                exchangeRate,
                exchangeRateError,
                lastRateUpdate,
                refreshExchangeRate,
                scanHistory,
                addToScanHistory,
                clearScanHistory,
                formatCurrency,
                forceUpdateCollections
            }}
        >
            {children}
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
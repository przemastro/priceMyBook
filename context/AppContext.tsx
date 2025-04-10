import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getExchangeRate, ExchangeRateResult } from '@/services/currencyService';
import i18n from '@/app/i18n/config';

interface BookDefect {
    selected: boolean;
    reduction?: number;
}

interface BookData {
    isbn: string;
    title: string;
    authors: string;
    price: string;
    displayPrice: string;
    createdAt?: string;
    foundInApi: boolean;
    defects?: Record<string, BookDefect>;
    originalPrice: string;
}

interface AppContextType {
    isbn: string | null;
    setISBN: (isbn: string | null) => void;
    collections: string[];
    addCollection: (name: string) => void;
    removeCollection: (name: string) => void;
    books: { [key: string]: BookData[] };
    addBookToCollection: (collectionName: string, bookData: Omit<BookData, 'createdAt'>) => void;
    removeBookFromCollection: (collectionName: string, bookIndex: number) => void;
    exchangeRate: number;
    exchangeRateError: string | null;
    lastRateUpdate: Date | null;
    refreshExchangeRate: () => Promise<void>;
    scanHistory: BookData[];
    addToScanHistory: (bookData: Omit<BookData, 'createdAt'>) => void;
    clearScanHistory: () => void;
    formatCurrency: (price: string) => string;
    updateBookInCollection: (collectionName: string, bookIndex: number, updatedData: Partial<BookData>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
    COLLECTIONS: '@collections',
    BOOKS: '@books',
    SCAN_HISTORY: '@scanHistory',
    EXCHANGE_RATE: '@exchangeRate'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isbn, setISBN] = useState<string | null>(null);
    const [collections, setCollections] = useState<string[]>([]);
    const [books, setBooks] = useState<{ [key: string]: BookData[] }>({});
    const [exchangeRate, setExchangeRate] = useState<number>(3.8);
    const [exchangeRateError, setExchangeRateError] = useState<string | null>(null);
    const [lastRateUpdate, setLastRateUpdate] = useState<Date | null>(null);
    const [scanHistory, setScanHistory] = useState<BookData[]>([]);

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
            setExchangeRate(result.usd);
            setExchangeRateError(result.error);
            setLastRateUpdate(result.lastUpdated || new Date());
            await AsyncStorage.setItem(
                STORAGE_KEYS.EXCHANGE_RATE,
                JSON.stringify({
                    rate: result.usd,
                    error: result.error,
                    timestamp: (result.lastUpdated || new Date()).toISOString()
                })
            );
        } catch (error) {
            console.error('Failed to refresh exchange rate:', error);
        }
    };

    const formatCurrency = (price: string) => {
        const priceNumber = parseFloat(price) || 0;
        if (i18n.language === 'pl') {
            return `${priceNumber.toFixed(2)} PLN`;
        }
        const usdPrice = priceNumber / exchangeRate;
        return `$${usdPrice.toFixed(2)}`;
    };

    // Collections management
    const addCollection = (name: string) => {
        if (!name.trim() || collections.includes(name)) return;
        const newCollections = [...collections, name];
        setCollections(newCollections);
        setBooks(prev => ({ ...prev, [name]: [] }));
    };

    const removeCollection = (name: string) => {
        setCollections(collections.filter(c => c !== name));
        setBooks(prev => {
            const newBooks = { ...prev };
            delete newBooks[name];
            return newBooks;
        });
    };

    // Books management
    const addBookToCollection = (
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
                displayPrice: bookData.displayPrice || formatCurrency(bookData.price)
            };

            newBooks[collectionName].push(bookWithISBN);
            return newBooks;
        });
    };

    const updateBookInCollection = (
        collectionName: string,
        bookIndex: number,
        updatedData: Partial<BookData>
    ) => {
        setBooks(prev => {
            const newBooks = { ...prev };
            if (newBooks[collectionName] && newBooks[collectionName][bookIndex]) {
                newBooks[collectionName][bookIndex] = {
                    ...newBooks[collectionName][bookIndex],
                    ...updatedData,
                    displayPrice: updatedData.price ? formatCurrency(updatedData.price) :
                        newBooks[collectionName][bookIndex].displayPrice
                };
            }
            return newBooks;
        });
    };

    const removeBookFromCollection = (collectionName: string, bookIndex: number) => {
        setBooks(prev => ({
            ...prev,
            [collectionName]: prev[collectionName].filter((_, i) => i !== bookIndex)
        }));
    };

    // Scan history management
    const addToScanHistory = (bookData: Omit<BookData, 'createdAt'>) => {
        setScanHistory(prev => {
            const newItem = {
                ...bookData,
                displayPrice: bookData.displayPrice || formatCurrency(bookData.price),
                originalPrice: bookData.originalPrice || bookData.price || '0',
                createdAt: new Date().toISOString(),
                foundInApi: bookData.foundInApi || false
            };

            return [newItem, ...prev.filter(item => item.isbn !== bookData.isbn)];
        });
    };

    const clearScanHistory = () => {
        setScanHistory([]);
    };

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
                updateBookInCollection,
                removeBookFromCollection,
                exchangeRate,
                exchangeRateError,
                lastRateUpdate,
                refreshExchangeRate,
                scanHistory,
                addToScanHistory,
                clearScanHistory,
                formatCurrency
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
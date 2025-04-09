import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getExchangeRate, ExchangeRateResult } from '@/services/currencyService';

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
                const [history, collections, books] = await Promise.all([
                    AsyncStorage.getItem(STORAGE_KEYS.SCAN_HISTORY),
                    AsyncStorage.getItem(STORAGE_KEYS.COLLECTIONS),
                    AsyncStorage.getItem(STORAGE_KEYS.BOOKS)
                ]);

                if (history) setScanHistory(JSON.parse(history));
                if (collections) setCollections(JSON.parse(collections));
                if (books) setBooks(JSON.parse(books));

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

    // Collections management
    const addCollection = (name: string) => {
        if (!name || collections.includes(name)) return;
        setCollections([...collections, name]);
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

            // Dodajemy ISBN do danych książki
            const bookWithISBN = {
                ...bookData,
                isbn: bookData.isbn,
                createdAt: new Date().toISOString(),
                defects: bookData.defects || {}
            };

            newBooks[collectionName].push(bookWithISBN);
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
                displayPrice: bookData.displayPrice || `$${parseFloat(bookData.price || '0').toFixed(2)}`,
                originalPrice: bookData.originalPrice || bookData.price || '0',
                createdAt: new Date().toISOString(),
                foundInApi: bookData.foundInApi || false
            };

            console.log('Adding to history:', newItem); // Debug

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
                removeBookFromCollection,
                exchangeRate,
                exchangeRateError,
                lastRateUpdate,
                refreshExchangeRate,
                scanHistory,
                addToScanHistory,
                clearScanHistory
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
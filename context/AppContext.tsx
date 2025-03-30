import React, { createContext, useContext, useState, useEffect } from 'react';
import { getExchangeRate, ExchangeRateResult } from '@/services/currencyService';

interface BookData {
    isbn: string;
    title: string;
    authors: string;
    price: string; // Zawsze przechowujemy w PLN
    displayPrice: string;
    createdAt: string;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isbn, setISBN] = useState<string | null>(null);
    const [collections, setCollections] = useState<string[]>([]);
    const [books, setBooks] = useState<{ [key: string]: BookData[] }>({});
    const [exchangeRate, setExchangeRate] = useState<number>(3.8);
    const [exchangeRateError, setExchangeRateError] = useState<string | null>(null);
    const [lastRateUpdate, setLastRateUpdate] = useState<Date | null>(null);

    const refreshExchangeRate = async () => {
        const result = await getExchangeRate();
        setExchangeRate(result.usd);
        setExchangeRateError(result.error);
        if (result.lastUpdated) {
            setLastRateUpdate(result.lastUpdated);
        }
    };

    useEffect(() => {
        refreshExchangeRate();
        const interval = setInterval(refreshExchangeRate, 3600000); // Odśwież co godzinę
        return () => clearInterval(interval);
    }, []);

    const addCollection = (name: string) => {
        if (name && !collections.includes(name)) {
            setCollections([...collections, name]);
            setBooks(prevBooks => ({
                ...prevBooks,
                [name]: prevBooks[name] || []
            }));
        }
    };

    const removeCollection = (name: string) => {
        setCollections(prev => prev.filter(collection => collection !== name));
        setBooks(prev => {
            const newBooks = { ...prev };
            delete newBooks[name];
            return newBooks;
        });
    };

    const addBookToCollection = (collectionName: string, bookData: Omit<BookData, 'createdAt'>) => {
        setBooks(prevBooks => {
            const updatedBooks = { ...prevBooks };
            if (!updatedBooks[collectionName]) {
                updatedBooks[collectionName] = [];
            }
            updatedBooks[collectionName].push({
                ...bookData,
                createdAt: new Date().toISOString()
            });
            return updatedBooks;
        });
    };

    const removeBookFromCollection = (collectionName: string, bookIndex: number) => {
        setBooks(prevBooks => {
            const updatedBooks = { ...prevBooks };
            if (updatedBooks[collectionName]) {
                updatedBooks[collectionName] = updatedBooks[collectionName]
                    .filter((_, index) => index !== bookIndex);
            }
            return updatedBooks;
        });
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
                refreshExchangeRate
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
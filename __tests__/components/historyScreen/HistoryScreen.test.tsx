import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HistoryScreen from '@/app/(tabs)/HistoryScreen';
import { useAppContext } from '@/context/AppContext';
import { useTranslation } from 'react-i18next';

jest.mock('@/context/AppContext');
jest.mock('react-i18next');

const mockScanHistory = [
    {
        isbn: '1234567890',
        title: 'Test Book',
        authors: 'Test Author',
        price: '39.99',
        originalPrice: '49.99',
        createdAt: '2023-01-01'
    },
    {
        isbn: '0987654321',
        title: 'Another Book',
        authors: 'Another Author',
        price: '29.99',
        createdAt: '2023-01-02'
    }
];

describe('HistoryScreen', () => {
    beforeEach(() => {
        (useAppContext as jest.Mock).mockReturnValue({
            scanHistory: mockScanHistory,
            clearScanHistory: jest.fn(),
            exchangeRate: 4.0,
            exchangeRateError: false
        });

        (useTranslation as jest.Mock).mockReturnValue({
            t: (key: string) => key,
            i18n: { language: 'en' }
        });
    });

    it('renders correctly with history items', () => {
        const { getByText, getAllByText } = render(<HistoryScreen />);

        expect(getByText('Test Book')).toBeTruthy();
        expect(getByText('Another Book')).toBeTruthy();
        expect(getAllByText(/ISBN:/)).toHaveLength(2);
    });

    it('shows empty state when no history', () => {
        (useAppContext as jest.Mock).mockReturnValue({
            scanHistory: [],
            clearScanHistory: jest.fn()
        });

        const { getByText } = render(<HistoryScreen />);
        expect(getByText('labels.noScanHistory')).toBeTruthy();
    });

    it('filters history based on search query', () => {
        const { getByPlaceholderText, queryByText } = render(<HistoryScreen />);

        const searchInput = getByPlaceholderText('placeholders.searchHistory');
        fireEvent.changeText(searchInput, 'Another');

        expect(queryByText('Test Book')).toBeNull();
        expect(queryByText('Another Book')).toBeTruthy();
    });

    it('shows clear button only when there is history', () => {
        // Mock translation to return specific text
        (useTranslation as jest.Mock).mockReturnValue({
            t: (key: string) => key === 'buttons.clearHistory' ? 'Clear History' : key,
            i18n: { language: 'en' }
        });

        // First render with history
        const { queryByText, rerender } = render(<HistoryScreen />);
        expect(queryByText('Clear History')).toBeTruthy();

        // Re-render with empty history
        (useAppContext as jest.Mock).mockReturnValue({
            scanHistory: [],
            clearScanHistory: jest.fn(),
            exchangeRate: 4.0,
            exchangeRateError: false
        });
        rerender(<HistoryScreen />);
        expect(queryByText('Clear History')).toBeNull();
    });
});
import { ReactNode } from 'react';

// Główne interfejsy
export interface BookDefect {
    id: string;
    selected: boolean;
    priceReduction: number;
    count: number;
    confidence?: number;
    icon: string;
    color: string;
}

export interface MarketFactorToggle {
    id: 'includePublicationYear' | 'includeDemand' | 'includeSupply';
    icon: string;
    label: string;
    color: string;
}

export interface UniquenessType {
    id: string;
    icon: string;
    label: string;
    color: string;
}

// Pozostałe interfejsy pozostają bez zmian
export interface MarketData {
    demand: MarketFactors['demand'];
    supply: MarketFactors['supply'];
    priceRange?: [number, number];
    priceHistory?: { date: string; price: number }[];
    lastUpdated: Date;
    source: 'google' | 'amazon' | 'openLibrary' | 'simulated';
}

export interface ListingStatus {
    status: 'notListed' | 'listed' | 'sold';
    platforms: ('amazon' | 'allegro' | 'olx')[];
    listedDate?: string;
    soldDate?: string;
}

export interface BookAgeInfo {
    years: number;
}

export interface BookUniqueness {
    isMassMarket: boolean;
    isFirstEdition: boolean;
    isCollectorsEdition: boolean;
    hasAuthorSignature: boolean;
    isLimitedEdition: boolean;
    isPublisherDefunct: boolean;
    [key: string]: boolean;
}

export interface MarketFactors {
    demand: 'veryHigh' | 'high' | 'medium' | 'low' | 'veryLow';
    supply: 'veryLow' | 'low' | 'medium' | 'high' | 'flooded';
    publicationYear: number;
}

export interface PriceCalculation {
    basePrice: number;
    defectsReduction: number;
    uniquenessBonus: number;
    marketModifier: number;
    finalPrice: number;
}

// Stałe z kolorami
export const MARKET_FACTOR_TYPES = [
    {
        id: 'publicationYear',
        icon: 'calendar-outline',
        label: 'labels.publicationYear',
        color: '#3498db' // Niebieski
    },
    {
        id: 'demand',
        icon: 'trending-up-outline',
        label: 'labels.demand',
        color: '#2ecc71' // Zielony
    },
    {
        id: 'supply',
        icon: 'trending-down-outline',
        label: 'labels.supply',
        color: '#e74c3c' // Czerwony
    }
] as const;

export const MARKET_FACTOR_TOGGLES: MarketFactorToggle[] = [
    {
        id: 'includePublicationYear',
        icon: 'calendar-outline',
        label: 'labels.includePublicationYear',
        color: '#3498db'
    },
    {
        id: 'includeDemand',
        icon: 'trending-up-outline',
        label: 'labels.includeDemand',
        color: '#2ecc71'
    },
    {
        id: 'includeSupply',
        icon: 'trending-down-outline',
        label: 'labels.includeSupply',
        color: '#e74c3c'
    }
];

export const DEMAND_OPTIONS = [
    { id: 'veryHigh', label: 'labels.veryHigh', color: '#27ae60' },
    { id: 'high', label: 'labels.high', color: '#2ecc71' },
    { id: 'medium', label: 'labels.medium', color: '#f39c12' },
    { id: 'low', label: 'labels.low', color: '#e67e22' },
    { id: 'veryLow', label: 'labels.veryLow', color: '#e74c3c' }
];

export const SUPPLY_OPTIONS = [
    { id: 'veryLow', label: 'labels.veryLow', color: '#27ae60' },
    { id: 'low', label: 'labels.low', color: '#2ecc71' },
    { id: 'medium', label: 'labels.medium', color: '#f39c12' },
    { id: 'high', label: 'labels.high', color: '#e67e22' },
    { id: 'flooded', label: 'labels.flooded', color: '#e74c3c' }
];

export const DEFECT_TYPES = [
    {
        id: 'tornPages',
        icon: 'document-text-outline',
        color: '#e74c3c' // Czerwony
    },
    {
        id: 'brokenSpine',
        icon: 'book-outline',
        color: '#3498db' // Niebieski
    },
    {
        id: 'missingPages',
        icon: 'remove-outline',
        color: '#2980b9' // Ciemniejszy niebieski
    },
    {
        id: 'heavyWear',
        icon: 'alert-circle-outline',
        color: '#2c3e50' // Granatowy
    },
    {
        id: 'stainedPages',
        icon: 'color-filter-outline',
        color: '#e67e22' // Pomarańczowy
    },
    {
        id: 'looseBinding',
        icon: 'unlink-outline',
        color: '#16a085' // Turkusowy
    },
    {
        id: 'writingMarks',
        icon: 'pencil-outline',
        color: '#8e44ad' // Fioletowy
    },
    {
        id: 'foldedCorners',
        icon: 'copy-outline',
        color: '#1abc9c' // Morski
    },
    {
        id: 'fadedCover',
        icon: 'sunny-outline',
        color: '#27ae60' // Zielony
    }
] as const;

export const UNIQUENESS_TYPES: UniquenessType[] = [
    {
        id: 'isMassMarket',
        icon: 'copy-outline',
        label: 'labels.massMarket',
        color: '#95a5a6' // Szary
    },
    {
        id: 'isFirstEdition',
        icon: 'book-outline',
        label: 'labels.firstEdition',
        color: '#f1c40f' // Żółty
    },
    {
        id: 'isCollectorsEdition',
        icon: 'ribbon-outline',
        label: 'labels.collectorsEdition',
        color: '#e67e22' // Pomarańczowy
    },
    {
        id: 'hasAuthorSignature',
        icon: 'create-outline',
        label: 'labels.authorSignature',
        color: '#9b59b6' // Fioletowy
    },
    {
        id: 'isLimitedEdition',
        icon: 'diamond-outline',
        label: 'labels.limitedEdition',
        color: '#1abc9c' // Turkusowy
    },
    {
        id: 'isPublisherDefunct',
        icon: 'skull-outline',
        label: 'labels.defunctPublisher',
        color: '#e74c3c' // Czerwony
    }
];

// Pozostałe typy pozostają bez zmian
export interface TabItem {
    id: string;
    title: string;
    icon: string;
    content?: ReactNode;
}

export type MarketFactorUpdateHandler = (
    id: keyof MarketFactors,
    value: MarketFactors[keyof MarketFactors]
) => void;

export interface IncludedMarketFactors {
    includePublicationYear: boolean;
    includeDemand: boolean;
    includeSupply: boolean;
}

export interface BookCollection {
    name: string;
    icon: string;
    categories?: string[];
}
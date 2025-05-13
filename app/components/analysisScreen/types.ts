import { ReactNode } from 'react';

export interface BookDefect {
    id: string;
    selected: boolean;
    priceReduction: number;
    count: number;
    confidence?: number;
    icon: string;
}

export interface MarketData {
    demand: MarketFactors['demand'];
    supply: MarketFactors['supply'];
    priceRange?: [number, number];
    priceHistory?: { date: string; price: number }[];
    lastUpdated: Date;
    source: 'google' | 'amazon' | 'openLibrary' | 'simulated';
}

export interface MarketFactorToggle {
    id: 'includePublicationYear' | 'includeDemand' | 'includeSupply';
    icon: string;
    label: string;
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
}

export interface MarketFactors {
    demand: 'veryHigh' | 'high' | 'medium' | 'low' | 'veryLow';
    supply: 'veryLow' | 'low' | 'medium' | 'high' | 'flooded';
    publicationYear?: number;
}

export interface PriceCalculation {
    basePrice: number;
    defectsReduction: number;
    uniquenessBonus: number;
    marketModifier: number;
    finalPrice: number;
}

export const MARKET_FACTOR_TYPES = [
    { id: 'publicationYear', icon: 'calendar-outline', label: 'labels.publicationYear' },
    { id: 'demand', icon: 'trending-up-outline', label: 'labels.demand' },
    { id: 'supply', icon: 'trending-down-outline', label: 'labels.supply' }
] as const;

export const MARKET_FACTOR_TOGGLES: MarketFactorToggle[] = [
    { id: 'includePublicationYear', icon: 'calendar-outline', label: 'labels.includePublicationYear' },
    { id: 'includeDemand', icon: 'trending-up-outline', label: 'labels.includeDemand' },
    { id: 'includeSupply', icon: 'trending-down-outline', label: 'labels.includeSupply' }
];

export const DEMAND_OPTIONS = [
    { id: 'veryHigh', label: 'labels.veryHigh' },
    { id: 'high', label: 'labels.high' },
    { id: 'medium', label: 'labels.medium' },
    { id: 'low', label: 'labels.low' },
    { id: 'veryLow', label: 'labels.veryLow' }
];

export const SUPPLY_OPTIONS = [
    { id: 'veryLow', label: 'labels.veryLow' },
    { id: 'low', label: 'labels.low' },
    { id: 'medium', label: 'labels.medium' },
    { id: 'high', label: 'labels.high' },
    { id: 'flooded', label: 'labels.flooded' }
];

export const DEFECT_TYPES = [
    { id: 'tornPages', icon: 'document-text-outline' },
    { id: 'brokenSpine', icon: 'book-outline' },
    { id: 'missingPages', icon: 'remove-outline' },
    { id: 'heavyWear', icon: 'alert-circle-outline' },
    { id: 'stainedPages', icon: 'color-filter-outline' },
    { id: 'looseBinding', icon: 'unlink-outline' },
    { id: 'writtingMarks', icon: 'pencil-outline' },
    { id: 'foldedCorners', icon: 'copy-outline' },
    { id: 'fadedCover', icon: 'sunny-outline' }
] as const;

export const UNIQUENESS_TYPES = [
    { id: 'isMassMarket', icon: 'copy-outline', label: 'labels.massMarket' },
    { id: 'isFirstEdition', icon: 'book-outline', label: 'labels.firstEdition' },
    { id: 'isCollectorsEdition', icon: 'ribbon-outline', label: 'labels.collectorsEdition' },
    { id: 'hasAuthorSignature', icon: 'create-outline', label: 'labels.authorSignature' },
    { id: 'isLimitedEdition', icon: 'diamond-outline', label: 'labels.limitedEdition' },
    { id: 'isPublisherDefunct', icon: 'skull-outline', label: 'labels.defunctPublisher' }
] as const;

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
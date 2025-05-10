// app/types/bookTypes.ts
export interface BookDefect {
    selected: boolean;
    reduction: number;
    count: number;
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

export interface BookAgeInfo {
    years: number;
}

export interface ListingStatus {
    status: 'notListed' | 'listed' | 'sold';
    platforms: ('amazon' | 'allegro' | 'olx')[];
    listedDate?: string;
    soldDate?: string;
}

export interface BookData {
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

export interface CollectionCarouselProps {
    collections: string[];
    books: Record<string, BookData[]>;
    selectedCollection: string | null;
    onSelectCollection: (collection: string) => void;
    calculateCollectionTotal: (collection: string) => number;
    onEditCollection: (collection: string, newName: string) => Promise<void>;
    onDeleteCollection: (collection: string) => void;
    onExportCollection: (collection: string) => void;
    getBookWord: (count: number, language: string) => string;
    formatCurrency: (value: string) => string;
}
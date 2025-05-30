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
    foundInApi?: boolean;
    originalPrice: string;
    defects?: Record<string, BookDefect>;
    rating: number;
    uniqueness?: BookUniqueness;
    marketFactors?: MarketFactors;
    ageInfo?: BookAgeInfo;
    listingStatus?: ListingStatus;
    imageUri?: string;
    createdAt?: string;
}

export interface ImportPreviewData {
    collectionName: string;
    books: BookData[];
    categories: string[];
    showPreview: boolean;
}

export interface CollectionCarouselProps {
    collections: {name: string; icon: string}[];
    books: Record<string, BookData[]>;
    selectedCollection: string | null;
    onSelectCollection: (collectionName: string) => void;
    calculateCollectionTotal: (collectionName: string) => number;
    onEditCollection: (collectionName: string, newName: string) => Promise<void>;
    onDeleteCollection: (collectionName: string) => void;
    onExportCollection: (collectionName: string) => void;
    getBookWord: (count: number) => string;
    formatCurrency: (price: string) => string;
    onNavigateToBooks: () => void;
}
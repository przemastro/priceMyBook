export type BookSource = 'google' | 'amazon' | 'manual';

export interface BookUniqueness {
    isMassMarket: boolean;
    isFirstEdition: boolean;
    isCollectorsEdition: boolean;
    hasAuthorSignature: boolean;
    isLimitedEdition: boolean;
    isPublisherDefunct: boolean;
}

export interface MarketData {
    demand: 'veryHigh' | 'high' | 'medium' | 'low' | 'veryLow';
    supply: 'veryLow' | 'low' | 'medium' | 'high' | 'flooded';
    priceRange?: [number, number];
    lastUpdated: Date;
    source: 'google' | 'amazon' | 'openLibrary' | 'simulated';
    priceHistory?: { date: string; price: number }[];
}

export interface MarketFactors {
    demand: 'veryHigh' | 'high' | 'medium' | 'low' | 'veryLow';
    supply: 'veryLow' | 'low' | 'medium' | 'high' | 'flooded';
    publicationYear?: number;
}

export interface BookAgeInfo {
    years: number;
}

export interface AmazonPriceOffer {
    price: number;
    currency: string;
    condition: string;
    seller: string;
    delivery: string;
    deliveryTime: string;
    rawOffer: any;
}

export interface AmazonApiResponse {
    status: string;
    request_id: string;
    parameters: {
        asin: string;
        country: string;
        limit: number;
        page: number;
    };
    data: {
        asin: string;
        product_title: string;
        product_price: string;
        product_original_price: string | null;
        currency: string;
        country: string;
        product_byline: string;
        product_url: string;
        product_photo: string;
        product_num_offers: number;
        is_prime: boolean;
        product_information: {
            "ISBN-10"?: string;
            "ISBN-13"?: string;
            Wydawca?: string;
            Język?: string;
            "Miękka oprawa"?: string;
            Wymiary?: string;
            "Ranking najlepiej sprzedających się produktów"?: string;
        };
        product_offers: {
            product_price: string;
            product_original_price: string | null;
            product_condition: string;
            seller: string;
            seller_id: string | null;
            seller_link: string | null;
            seller_star_rating: string | null;
            currency: string;
            delivery_price: string;
            delivery_time: string;
        }[];
        marketFactors?: MarketFactors;
        priceRange?: [number, number];
        salesRank?: number;
        isBestSeller?: boolean;
        isAmazonChoice?: boolean;
        numRatings?: number;
        starRating?: string | null;
    };
    prices: AmazonPriceOffer[];
    productTitle: string;
    productImage: string;
    productUrl: string;
    isPrime: boolean;
    marketplace: string;
    rawResponse: any;
    error?: string;
}

export interface BookInfo {
    title: string;
    authors: string;
    publisher?: string;
    description?: string;
    price: number | null;
    image: string | null;
    asin: string;
    source: BookSource;
    amazonData?: AmazonApiResponse;
}
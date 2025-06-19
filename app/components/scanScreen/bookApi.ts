import { BookInfo, AmazonApiResponse, AmazonPriceOffer, MarketData, MarketFactors } from './types';
import { Config } from '../../config';
import { checkRateLimit } from "@/app/utils/rateLimiter";

// Helper functions
const getDemandLevel = (randomFactor: number) => {
    if (randomFactor > 80) return 'veryHigh';
    if (randomFactor > 60) return 'high';
    if (randomFactor > 40) return 'medium';
    if (randomFactor > 20) return 'low';
    return 'veryLow';
};

const getSupplyLevel = (randomFactor: number) => {
    if (randomFactor > 80) return 'veryLow';
    if (randomFactor > 60) return 'low';
    if (randomFactor > 40) return 'medium';
    if (randomFactor > 20) return 'high';
    return 'flooded';
};

const calculateDemand = (salesRank: number): MarketFactors['demand'] => {
    if (salesRank <= 10000) return 'veryHigh';
    if (salesRank <= 50000) return 'high';
    if (salesRank <= 200000) return 'medium';
    if (salesRank <= 500000) return 'low';
    return 'veryLow';
};

const calculateSupply = (numOffers: number, availability: string): MarketFactors['supply'] => {
    let supply: MarketFactors['supply'];

    if (numOffers <= 1) supply = 'veryLow';
    else if (numOffers <= 3) supply = 'low';
    else if (numOffers <= 10) supply = 'medium';
    else if (numOffers <= 20) supply = 'high';
    else supply = 'flooded';

    if (availability.includes('Zapasy zostaną niedługo uzupełnione')) {
        if (supply === 'medium') supply = 'low';
        else if (supply === 'high') supply = 'medium';
    }

    return supply;
};

const createRateLimitExceededResponse = (isbn: string, language: string): AmazonApiResponse => {
    const asin = convertIsbnToAsin(isbn);
    const country = language === 'pl' ? 'PL' : 'US';

    return {
        status: "RATE_LIMIT_EXCEEDED",
        request_id: "",
        parameters: { asin, country, limit: 100, page: 1 },
        data: {
            asin,
            product_title: "",
            product_price: "",
            product_original_price: null,
            currency: "",
            country,
            product_byline: "",
            product_url: "",
            product_photo: "",
            product_num_offers: 0,
            is_prime: false,
            product_information: {},
            product_offers: [],
            marketFactors: {
                demand: 'medium',
                supply: 'medium',
                publicationYear: undefined
            },
            priceRange: undefined,
            salesRank: 999999,
            isBestSeller: false,
            isAmazonChoice: false,
            numRatings: 0,
            starRating: null
        },
        prices: [],
        productTitle: "",
        productImage: "",
        productUrl: "",
        isPrime: false,
        marketplace: country,
        rawResponse: null,
        error: 'Weekly API rate limit exceeded'
    };
};

// Main functions
export const convertIsbnToAsin = (isbn: string): string => {
    const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');

    if (/^\d{9}[\dX]$/i.test(cleanIsbn)) {
        return cleanIsbn.toUpperCase();
    }

    if (/^978\d{10}$/.test(cleanIsbn)) {
        const isbnWithoutPrefix = cleanIsbn.substring(3, 12);
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(isbnWithoutPrefix.charAt(i)) * (10 - i);
        }

        const checkDigit = (11 - (sum % 11)) % 11;
        const checkChar = checkDigit === 10 ? 'X' : checkDigit.toString();

        return isbnWithoutPrefix + checkChar;
    }

    return isbn;
};

export const simulateMarketData = (isbn: string): MarketData => {
    const randomFactor = isbn.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 100;

    return {
        priceHistory: [],
        demand: getDemandLevel(randomFactor),
        supply: getSupplyLevel(randomFactor),
        priceRange: [randomFactor * 0.8, randomFactor * 1.2] as [number, number],
        lastUpdated: new Date(),
        source: 'simulated'
    };
};

const calculatePopularity = (ratingsCount: number, averageRating: number): number => {
    if (!ratingsCount || !averageRating) return 50;

    const normalizedCount = Math.min(ratingsCount / 1000, 1);
    const normalizedRating = (averageRating / 5) * 100;

    return (normalizedCount * 50) + (normalizedRating * 0.5);
};

export const fetchAllBookData = async (isbn: string, language: string) => {
    const [googleData, amazonData, openLibraryData] = await Promise.all([
        fetchGoogleBooksData(isbn),
        fetchBookPriceFromAmazonAPI(isbn, language),
        fetchOpenLibraryData(isbn)
    ]);

    return {
        google: googleData,
        amazon: amazonData,
        openLibrary: openLibraryData,
        simulated: simulateMarketData(isbn)
    };
};

export const fetchGoogleBooksData = async (isbn: string) => {
    const API_KEY = Config.GOOGLE_BOOKS_API_KEY;
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const book = data.items[0].volumeInfo;
            return {
                title: book.title,
                authors: book.authors?.join(', ') ?? 'Unknown',
                publisher: book.publisher,
                description: book.description,
                price: book.saleInfo?.listPrice?.amount,
                image: book.imageLinks?.thumbnail,
                ratingsCount: book.ratingsCount ?? 0,
                averageRating: book.averageRating ?? 0,
                popularity: calculatePopularity(book.ratingsCount ?? 0, book.averageRating ?? 0)
            };
        }
        return null;
    } catch (error) {
        console.error('Google Books API error:', error);
        return null;
    }
};

export const fetchOpenLibraryData = async (isbn: string) => {
    try {
        const bookResponse = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
        const bookData = await bookResponse.json();

        const holdingsResponse = await fetch(
            `https://archive.org/advancedsearch.php?q=isbn:${isbn}&output=json`
        );
        const holdingsData = await holdingsResponse.json();

        return {
            title: bookData.title,
            authors: bookData.authors?.map((a: any) => a.name).join(', ') ?? 'Unknown',
            holdingsCount: holdingsData.response?.numFound ?? 0,
            lastModified: bookData.last_modified
        };
    } catch (error) {
        console.error('OpenLibrary API error:', error);
        return null;
    }
};

export const fetchBookPriceFromAmazonAPI = async (isbn: string, language: string): Promise<AmazonApiResponse> => {
    const isAllowed = await checkRateLimit('AMAZON');
    if (!isAllowed) {
        return createRateLimitExceededResponse(isbn, language);
    }

    const asin = convertIsbnToAsin(isbn);
    const country = language === 'pl' ? 'PL' : 'US';
    const url = `https://real-time-amazon-data.p.rapidapi.com/product-offers?asin=${asin}&country=${country}&limit=100&page=1`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
                'x-rapidapi-key': Config.AMAZON_API_KEY,
            }
        });

        const data = await response.json();
        console.log('Amazon API raw response:', data);

        if (data.status === "OK" && data.data?.product_offers?.length > 0) {
            const newCondition = language === 'pl' ? 'Nowe' : 'New';
            const newOffers = data.data.product_offers
                .filter((offer: any) => offer.product_condition === newCondition)
                .map((offer: any) => ({
                    ...offer,
                    price: parseFloat(offer.product_price.replace(',', '.').replace(/[^\d.-]/g, ''))
                }));

            const otherOffers = data.data.product_offers
                .filter((offer: any) => offer.product_condition !== newCondition)
                .map((offer: any) => ({
                    ...offer,
                    price: parseFloat(offer.product_price.replace(',', '.').replace(/[^\d.-]/g, ''))
                }));

            const extremeNewPrices = getExtremeNewPrices(newOffers, language);
            const averageUsedPrice = getAverageUsedPrice(otherOffers, language);
            const allPrices = [...extremeNewPrices, ...(averageUsedPrice ? [averageUsedPrice] : [])];

            const publicationDateMatch = data.data.product_information?.Wydawca?.match(/\((\d{1,2} \w+ \d{4})\)/);
            const publicationDate = publicationDateMatch ? new Date(publicationDateMatch[1]) : null;
            const publicationYear = publicationDate ? publicationDate.getFullYear() : undefined;

            const salesRankText = data.data.product_information?.['Ranking najlepiej sprzedających się produktów'] ?? '';
            const salesRankMatch = salesRankText.match(/Pozycja (\d+)/);
            const salesRank = salesRankMatch ? parseInt(salesRankMatch[1]) : 999999;

            const allOfferPrices = data.data.product_offers.map((offer: any) =>
                parseFloat(offer.product_price.replace(',', '.').replace(/[^\d.-]/g, ''))
            );
            const priceRange = [
                Math.min(...allOfferPrices),
                Math.max(...allOfferPrices)
            ] as [number, number];

            const demand = calculateDemand(salesRank);
            const supply = calculateSupply(data.data.product_num_offers ?? 0, data.data.product_availability ?? '');

            return {
                status: "OK",
                request_id: data.request_id,
                parameters: data.parameters,
                data: {
                    ...data.data,
                    marketFactors: { demand, supply, publicationYear },
                    priceRange,
                    salesRank,
                    isBestSeller: data.data.is_best_seller,
                    isAmazonChoice: data.data.is_amazon_choice,
                    numRatings: data.data.product_num_ratings ?? 0,
                    starRating: data.data.product_star_rating ?? null
                },
                prices: allPrices,
                productTitle: data.data.product_title,
                productImage: data.data.product_photo,
                productUrl: data.data.product_url,
                isPrime: data.data.is_prime ?? false,
                marketplace: data.data.country,
                rawResponse: data
            };
        }

        return createDefaultAmazonResponse(data, asin, country);
    } catch (error: unknown) {
        console.error('[Amazon API] Error:', error);
        return createErrorAmazonResponse(isbn, language, error);
    }
};

const getExtremeNewPrices = (newOffers: any[], language: string): AmazonPriceOffer[] => {
    if (newOffers.length === 0) return [];

    newOffers.sort((a: any, b: any) => a.price - b.price);
    const lowestNew = newOffers[0];
    const highestNew = newOffers[newOffers.length - 1];

    return [lowestNew, highestNew]
        .filter((offer, index, self) =>
            index === self.findIndex(o => o.price === offer.price)
        )
        .map(offer => ({
            price: offer.price,
            currency: offer.currency ?? 'PLN',
            condition: offer.product_condition,
            seller: offer.seller,
            delivery: offer.delivery_price,
            deliveryTime: offer.delivery_time,
            rawOffer: offer
        }));
};

const getAverageUsedPrice = (otherOffers: any[], language: string): AmazonPriceOffer | null => {
    if (otherOffers.length === 0) return null;

    const sum = otherOffers.reduce((acc: number, offer: any) => acc + offer.price, 0);
    const avg = sum / otherOffers.length;

    return {
        price: parseFloat(avg.toFixed(2)),
        currency: otherOffers[0]?.currency ?? 'PLN',
        condition: language === 'pl' ? 'Używane (średnia)' : 'Used (average)',
        seller: `${otherOffers.length} ${language === 'pl' ? 'sprzedawców' : 'sellers'}`,
        delivery: '',
        deliveryTime: '',
        rawOffer: null
    };
};

const createDefaultAmazonResponse = (data: any, asin: string, country: string): AmazonApiResponse => {
    return {
        status: "OK",
        request_id: data.request_id ?? "",
        parameters: data.parameters ?? { asin, country, limit: 100, page: 1 },
        data: {
            ...(data.data ?? {
                asin,
                product_title: "",
                product_price: "",
                product_original_price: null,
                currency: "",
                country,
                product_byline: "",
                product_url: "",
                product_photo: "",
                product_num_offers: 0,
                is_prime: false,
                product_information: {},
                product_offers: []
            }),
            marketFactors: {
                demand: 'medium',
                supply: 'medium',
                publicationYear: undefined
            },
            priceRange: undefined,
            salesRank: 999999,
            isBestSeller: false,
            isAmazonChoice: false,
            numRatings: 0,
            starRating: null
        },
        prices: [],
        productTitle: data.data?.product_title ?? "",
        productImage: data.data?.product_photo ?? "",
        productUrl: data.data?.product_url ?? "",
        isPrime: data.data?.is_prime ?? false,
        marketplace: country,
        rawResponse: data,
        error: data.error ?? 'No offers found'
    };
};

const createErrorAmazonResponse = (isbn: string, language: string, error: unknown): AmazonApiResponse => {
    const asin = convertIsbnToAsin(isbn);
    const country = language === 'pl' ? 'PL' : 'US';

    return {
        status: "ERROR",
        request_id: "",
        parameters: { asin, country, limit: 100, page: 1 },
        data: {
            asin,
            product_title: "",
            product_price: "",
            product_original_price: null,
            currency: "",
            country,
            product_byline: "",
            product_url: "",
            product_photo: "",
            product_num_offers: 0,
            is_prime: false,
            product_information: {},
            product_offers: [],
            marketFactors: {
                demand: 'medium',
                supply: 'medium',
                publicationYear: undefined
            },
            priceRange: undefined,
            salesRank: 999999,
            isBestSeller: false,
            isAmazonChoice: false,
            numRatings: 0,
            starRating: null
        },
        prices: [],
        productTitle: "",
        productImage: "",
        productUrl: "",
        isPrime: false,
        marketplace: country,
        rawResponse: null,
        error: error instanceof Error ? error.message : 'Unknown error'
    };
};

export const fetchBookInfoFromGoogleAPI = async (isbn: string): Promise<BookInfo | null> => {
    const API_KEY = Config.GOOGLE_BOOKS_API_KEY;
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const book = data.items[0].volumeInfo;
            return {
                title: book.title,
                authors: book.authors ? book.authors.join(', ') : 'Unknown',
                publisher: book.publisher ?? 'Unknown',
                description: book.description ?? 'No description available',
                price: book.saleInfo?.listPrice?.amount ?? null,
                image: book.imageLinks?.thumbnail ?? null,
                asin: convertIsbnToAsin(isbn),
                source: 'google'
            };
        }
        return null;
    } catch (error: unknown) {
        console.error('Error fetching book info from Google:', error);
        return null;
    }
};

export const fetchBookInfoFromAmazon = async (isbn: string, language: string): Promise<BookInfo | null> => {
    const amazonData = await fetchBookPriceFromAmazonAPI(isbn, language);

    if (amazonData.prices.length > 0) {
        return {
            title: amazonData.productTitle || `Book (ISBN: ${isbn})`,
            authors: amazonData.data.product_byline || 'Unknown',
            publisher: amazonData.data.product_information?.Wydawca?.split('(')[0].trim() ?? 'Unknown',
            description: 'No description available',
            price: amazonData.prices[0].price,
            image: amazonData.productImage || null,
            amazonData,
            asin: convertIsbnToAsin(isbn),
            source: 'amazon'
        };
    }

    return null;
};
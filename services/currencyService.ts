import axios from 'axios';

interface NBPResponse {
    table: string;
    currency: string;
    code: string;
    rates: Array<{
        no: string;
        effectiveDate: string;
        mid: number;
    }>;
}

export interface ExchangeRateResult {
    usd: number;
    error: string | null;
    lastUpdated?: Date;
}

export const getExchangeRate = async (): Promise<ExchangeRateResult> => {
    try {
        const response = await axios.get<NBPResponse>(
            'https://api.nbp.pl/api/exchangerates/rates/a/usd/last/',
            {
                headers: {
                    'Accept': 'application/json'
                },
                timeout: 5000
            }
        );

        if (!response.data?.rates?.[0]?.mid) {
            throw new Error('Invalid response format from NBP API');
        }

        return {
            usd: response.data.rates[0].mid,
            error: null,
            lastUpdated: new Date()
        };
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        return {
            usd: 3.8, // Domyślny kurs
            error: error instanceof Error ? error.message : 'Failed to fetch exchange rate'
        };
    }
};
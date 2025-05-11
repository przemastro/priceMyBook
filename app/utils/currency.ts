import i18n from 'i18next';

interface FormatCurrencyParams {
    price: string;
    exchangeRate: number;
    currencySymbol?: string;
}

export const formatCurrency = ({
                                   price,
                                   exchangeRate,
                                   currencySymbol = 'PLN'
                               }: FormatCurrencyParams): string => {
    const priceNumber = parseFloat(price) || 0;

    if (i18n.language === 'pl') {
        return `${priceNumber.toFixed(2)} ${currencySymbol}`;
    }

    const convertedPrice = priceNumber / exchangeRate;
    return `$${convertedPrice.toFixed(2)}`;
};
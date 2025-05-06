import i18n from 'i18next';

export const formatCurrency = (price: string, exchangeRate: number) => {
    const priceNumber = parseFloat(price) || 0;
    if (i18n.language === 'pl') {
        return `${priceNumber.toFixed(2)} PLN`;
    }
    const usdPrice = priceNumber / exchangeRate;
    return `$${usdPrice.toFixed(2)}`;
};
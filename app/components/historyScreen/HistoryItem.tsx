import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '@/context/AppContext';
import { styles } from './styles';
import { formatCurrency } from './utils';
import { typography} from '@/styles/styles';


type HistoryItemProps = {
    item: {
        isbn: string;
        title?: string;
        authors?: string;
        price?: string;
        originalPrice?: string;
        createdAt?: string;
    };
};

const HistoryItem = ({ item }: HistoryItemProps) => {
    const router = useRouter();
    const { t } = useTranslation();
    const { exchangeRate, exchangeRateError } = useAppContext();

    return (
        <TouchableOpacity
            style={styles.item}
            onPress={() => router.push({
                pathname: '/AnalysisScreen',
                params: {
                    isbn: item.isbn,
                    title: item.title,
                    authors: item.authors,
                    averagePrice: item.price,
                    originalPrice: item.originalPrice || item.price,
                    fromHistory: 'true',
                    editMode: 'true'
                }
            })}
        >
            <Text style={typography.body}>{item.title || t('bookInfo.unknownTitle')}</Text>
            <Text style={typography.caption}>ISBN: {item.isbn}</Text>

            {item.price && item.price !== '0' ? (
                <>
                    <Text style={styles.price}>
                        {t('bookInfo.basePrice')}: {formatCurrency(item.price, exchangeRate)}
                    </Text>
                    {item.originalPrice && item.originalPrice !== item.price && (
                        <Text style={styles.originalPrice}>
                            {t('bookInfo.originalPrice')}: {formatCurrency(item.originalPrice, exchangeRate)}
                        </Text>
                    )}
                    {exchangeRateError && (
                        <Text style={styles.rateError}>
                            {t('alerts.exchangeRateError')} (1 USD = {exchangeRate.toFixed(2)} PLN)
                        </Text>
                    )}
                </>
            ) : (
                <Text style={styles.noPrice}>{t('bookInfo.priceNotAvailable')}</Text>
            )}
        </TouchableOpacity>
    );
};

export default HistoryItem;
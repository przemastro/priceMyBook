import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '@/context/AppContext';
import { colors } from '@/styles/styles';
import { LIMITS } from '../../utils/constants';
import { LinearGradient } from 'expo-linear-gradient';

interface RateLimitStatusProps {
    style?: any;
    amazonRequests?: {
        used: number;
        limit: number;
        remaining: number;
        resetDate: string;
    };
}

export const RateLimitStatus: React.FC<RateLimitStatusProps> = ({ style, amazonRequests }) => {
    const { t } = useTranslation();
    const { collections, books } = useAppContext();

    // Oblicz wykorzystanie limitów kolekcji
    const collectionsUsage = {
        used: collections.length,
        limit: LIMITS.MAX_COLLECTIONS,
        remaining: LIMITS.MAX_COLLECTIONS - collections.length,
        percent: Math.round((collections.length / LIMITS.MAX_COLLECTIONS) * 100)
    };

    // Oblicz wykorzystanie limitów książek
    const booksUsage = Object.values(books).reduce((acc, collection) => {
        const collectionBooks = collection.length;
        return {
            used: Math.max(acc.used, collectionBooks),
            limit: LIMITS.MAX_BOOKS_PER_COLLECTION,
            remaining: LIMITS.MAX_BOOKS_PER_COLLECTION - Math.max(acc.used, collectionBooks),
            percent: Math.round((Math.max(acc.used, collectionBooks) / LIMITS.MAX_BOOKS_PER_COLLECTION) * 100)
        };
    }, { used: 0, limit: LIMITS.MAX_BOOKS_PER_COLLECTION, remaining: LIMITS.MAX_BOOKS_PER_COLLECTION, percent: 0 });

    // Funkcja do określania koloru na podstawie procentowego wykorzystania
    const getColorForPercentage = (percent: number) => {
        if (percent < 70) return colors.success;
        if (percent < 90) return colors.warning;
        return colors.error;
    };

    // Funkcja renderująca pasek postępu
    const renderProgressBar = (percent: number) => {
        const color = getColorForPercentage(percent);
        return (
            <View style={styles.progressBarBackground}>
                <LinearGradient
                    colors={[color, color]}
                    style={[styles.progressBarFill, { width: `${Math.min(percent, 100)}%` }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                />
            </View>
        );
    };

    return (
        <View style={[styles.container, style]}>
            {/* Nagłówek */}
            <Text style={styles.header}>{t('rateLimit.statusHeader')}</Text>

            {/* Limity kolekcji */}
            <View style={styles.limitContainer}>
                <Text style={styles.limitLabel}>
                    {t('rateLimit.collections')}: {collectionsUsage.used}/{collectionsUsage.limit}
                </Text>
                {renderProgressBar(collectionsUsage.percent)}
                <Text style={styles.limitInfo}>
                    {collectionsUsage.remaining} {t('rateLimit.remaining')}
                </Text>
            </View>

            {/* Limity książek */}
            <View style={styles.limitContainer}>
                <Text style={styles.limitLabel}>
                    {t('rateLimit.books')}: {booksUsage.used}/{booksUsage.limit} {t('rateLimit.perCollection')}
                </Text>
                {renderProgressBar(booksUsage.percent)}
                <Text style={styles.limitInfo}>
                    {booksUsage.remaining} {t('rateLimit.remainingPerCollection')}
                </Text>
            </View>

            {/* Limity requestów Amazon (jeśli podano) */}
            {amazonRequests && (
                <View style={styles.limitContainer}>
                    <Text style={styles.limitLabel}>
                        {t('rateLimit.amazonRequests')}: {amazonRequests.used}/{amazonRequests.limit}
                    </Text>
                    {renderProgressBar(Math.round((amazonRequests.used / amazonRequests.limit) * 100))}
                    <Text style={styles.limitInfo}>
                        {t('rateLimit.resetOn')} {amazonRequests.resetDate}
                    </Text>
                </View>
            )}

            {/* Informacja o resetowaniu limitów */}
            <Text style={styles.footer}>
                {t('rateLimit.allLimitsReset')}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        padding: 15,
        margin: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 10,
        textAlign: 'center',
    },
    limitContainer: {
        marginBottom: 15,
    },
    limitLabel: {
        fontSize: 14,
        color: colors.black,
        marginBottom: 5,
    },
    limitInfo: {
        fontSize: 12,
        color: colors.grayDark,
        marginTop: 3,
        fontStyle: 'italic',
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: colors.grayLight,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    footer: {
        fontSize: 11,
        color: colors.grayDark,
        textAlign: 'center',
        marginTop: 5,
        fontStyle: 'italic',
    },
});
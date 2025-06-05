import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '@/context/AppContext';
import { formatCurrency } from './utils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/styles';

// Dodajemy interfejsy dla brakujących typów
interface BookUniqueness {
    isMassMarket: boolean;
    isFirstEdition: boolean;
    isCollectorsEdition: boolean;
    hasAuthorSignature: boolean;
    isLimitedEdition: boolean;
    isPublisherDefunct: boolean;
}

interface MarketFactors {
    demand: 'veryHigh' | 'high' | 'medium' | 'low' | 'veryLow';
    supply: 'veryLow' | 'low' | 'medium' | 'high' | 'flooded';
    publicationYear?: number;
}

interface MarketData {
    demand: MarketFactors['demand'];
    supply: MarketFactors['supply'];
    priceRange: [number, number];
    priceHistory: { date: string; price: number }[];
    lastUpdated: Date;
    source: 'google' | 'amazon' | 'openLibrary' | 'simulated';
}

interface HistoryItemProps {
    item: {
        isbn: string;
        title?: string;
        authors?: string;
        price?: string;
        originalPrice?: string;
        createdAt?: string;
        marketFactors?: MarketFactors;
        uniqueness?: BookUniqueness;
        marketData?: MarketData;
        publisher?: string;
        description?: string;
    };
}

// Dodajemy domyślne wartości
const defaultUniqueness: BookUniqueness = {
    isMassMarket: false,
    isFirstEdition: false,
    isCollectorsEdition: false,
    hasAuthorSignature: false,
    isLimitedEdition: false,
    isPublisherDefunct: false
};

const defaultMarketFactors: MarketFactors = {
    demand: 'medium',
    supply: 'medium'
};

const HistoryItem = ({ item }: HistoryItemProps) => {
    const router = useRouter();
    const { t } = useTranslation();
    const { exchangeRate, exchangeRateError } = useAppContext();
    const [isPressed, setIsPressed] = useState(false);

    return (
        <TouchableOpacity
            activeOpacity={1}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            onPress={() => {
                router.push({
                    pathname: '/AnalysisScreen',
                    params: {
                        isbn: item.isbn,
                        title: item.title,
                        authors: item.authors,
                        averagePrice: item.price,
                        originalPrice: item.originalPrice || item.price,
                        fromHistory: 'true',
                        editMode: 'true',
                        marketFactors: JSON.stringify(item.marketFactors || defaultMarketFactors),
                        uniqueness: JSON.stringify(item.uniqueness || defaultUniqueness),
                        marketData: item.marketData ? JSON.stringify(item.marketData) : undefined,
                        bookInfo: JSON.stringify({
                            title: item.title,
                            authors: item.authors,
                            publisher: item.publisher,
                            description: item.description,
                            amazonData: item.marketData ? {
                                data: {
                                    marketFactors: item.marketFactors,
                                    priceRange: item.marketData.priceRange
                                }
                            } : undefined
                        })
                    }
                });
            }}
            style={styles.touchable}
        >
            <LinearGradient
                colors={isPressed ? [colors.buttonSelected1, colors.buttonSelected2] : ['white', 'white']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <View style={styles.content}>
                    <View style={styles.textContainer}>
                        <Text style={[styles.title, isPressed && styles.pressedText]}>
                            {item.title || t('bookInfo.unknownTitle')}
                        </Text>
                        <Text style={[styles.isbn, isPressed && styles.pressedText]}>
                            ISBN: {item.isbn}
                        </Text>

                        {item.price && item.price !== '0' ? (
                            <>
                                <Text style={[styles.price, isPressed && styles.pressedText]}>
                                    {t('bookInfo.basePrice')}: {formatCurrency(item.price, exchangeRate)}
                                </Text>
                                {item.originalPrice && item.originalPrice !== item.price && (
                                    <Text style={[styles.originalPrice, isPressed && styles.pressedText]}>
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
                            <Text style={[styles.noPrice, isPressed && styles.pressedText]}>
                                {t('bookInfo.priceNotAvailable')}
                            </Text>
                        )}
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={isPressed ? colors.white : colors.grayDark}
                    />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    touchable: {
        borderRadius: 12,
        marginBottom: 12,
        marginHorizontal: 16,
        overflow: 'hidden',
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    gradient: {
        padding: 16,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.black,
        marginBottom: 4,
    },
    pressedText: {
        color: colors.primary,
    },
    isbn: {
        fontSize: 14,
        color: colors.grayDark,
        marginBottom: 8,
    },
    price: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '500',
    },
    originalPrice: {
        fontSize: 14,
        color: colors.grayDark,
        textDecorationLine: 'line-through',
        marginTop: 4,
    },
    noPrice: {
        fontSize: 14,
        color: colors.grayDark,
        fontStyle: 'italic',
    },
    rateError: {
        fontSize: 12,
        color: colors.error,
        marginTop: 4,
    },
});

export default HistoryItem;
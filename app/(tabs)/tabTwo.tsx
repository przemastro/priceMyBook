import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'expo-router';
import { typography, colors, responsive } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import i18n from "i18next";


export default function TabTwoScreen() {
    const { scanHistory, clearScanHistory, exchangeRate, exchangeRateError } = useAppContext();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const { t } = useTranslation();

    const formatCurrency = (price: string) => {
        const priceNumber = parseFloat(price) || 0;
        if (i18n.language === 'pl') {
            return `${priceNumber.toFixed(2)} PLN`;
        }
        const usdPrice = priceNumber / exchangeRate;
        return `$${usdPrice.toFixed(2)}`;
    };

    const filteredHistory = scanHistory.filter(item =>
        item.isbn.includes(searchQuery) ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }: { item: typeof scanHistory[0] }) => {
        return (
            <TouchableOpacity
                style={styles.item}
                onPress={() => router.push({
                    pathname: '/tabThree',
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
                            {t('bookInfo.basePrice')}: {formatCurrency(item.price)}
                        </Text>
                        {item.originalPrice && item.originalPrice !== item.price && (
                            <Text style={styles.originalPrice}>
                                {t('bookInfo.originalPrice')}: {formatCurrency(item.originalPrice)}
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

    return (
        <View style={styles.container}>
            {/* Dodany nagłówek strony */}
            <Text style={[typography.h1, styles.header]}>
                {t('titles.history')}
            </Text>

            <TextInput
                style={styles.searchInput}
                placeholder={t('placeholders.searchHistory')}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            <FlatList
                data={filteredHistory}
                keyExtractor={(item) => item.isbn + (item.createdAt || '')}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>{t('labels.noScanHistory')}</Text>
                }
            />

            {scanHistory.length > 0 && (
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearScanHistory}
                >
                    <Text style={styles.clearText}>{t('buttons.clearHistory')}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: responsive.mediumMargin,
        backgroundColor: colors.background,
        marginTop: responsive.largeMargin,
    },
    header: {
        marginBottom: responsive.mediumMargin,
        textAlign: 'center',
    },
    searchInput: {
        height: 50,
        borderColor: colors.gray,
        borderWidth: 1,
        borderRadius: 1,
        padding: 15,
        marginBottom: responsive.mediumMargin,
        backgroundColor: colors.white,
    },
    item: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray,
        backgroundColor: colors.white,
        marginBottom: responsive.smallMargin,
        borderRadius: 1,
    },
    emptyText: {
        ...typography.body,
        textAlign: 'center',
        marginTop: 20,
        color: colors.gray,
    },
    clearButton: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderWidth: 2,
        borderColor: colors.black,
        borderRadius: 1,
        marginBottom: responsive.mediumMargin,
    },
    clearText: {
        color: colors.black,
        fontWeight: 'bold',
    },
    price: {
        ...typography.caption,
        color: colors.primary,
        marginTop: 4
    },
    originalPrice: {
        ...typography.caption,
        color: colors.gray,
        textDecorationLine: 'line-through',
        marginTop: 4
    },
    noPrice: {
        ...typography.caption,
        color: colors.gray,
        fontStyle: 'italic',
        marginTop: 4
    },
    rateError: {
        ...typography.caption,
        color: colors.error,
        fontSize: 12,
        marginTop: 4
    }
});
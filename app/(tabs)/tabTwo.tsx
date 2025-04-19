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
            <Text style={[typography.h1, styles.header]}>
                {t('titles.history')}
            </Text>

            <TextInput
                style={styles.searchInput}
                placeholder={t('placeholders.searchHistory')}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#888"
            />

            <FlatList
                data={filteredHistory}
                keyExtractor={(item) => item.isbn + (item.createdAt || '')}
                renderItem={renderItem}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>{t('labels.noScanHistory')}</Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
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
        flexGrow: 1,
        padding: 16,
        paddingTop: 6,
        backgroundColor: '#f8f9fa',
    },
    header: {
        marginBottom: 24,
        marginTop: responsive.largeMargin,
        textAlign: 'left',
        color: colors.black,
    },
    searchInput: {
        height: 50,
        borderColor: 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 16,
        marginBottom: 16,
        backgroundColor: colors.white,
        color: colors.black,
    },
    item: {
        padding: 16,
        marginBottom: 12,
        backgroundColor: colors.white,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    listContent: {
        paddingBottom: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        ...typography.body,
        textAlign: 'center',
        color: colors.grayDark,
    },
    clearButton: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: colors.primary,
        marginVertical: 16,
    },
    clearText: {
        color: colors.primary,
        fontWeight: '600',
    },
    price: {
        ...typography.caption,
        color: colors.primary,
        marginTop: 4
    },
    originalPrice: {
        ...typography.caption,
        color: colors.grayDark,
        textDecorationLine: 'line-through',
        marginTop: 4
    },
    noPrice: {
        ...typography.caption,
        color: colors.grayDark,
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
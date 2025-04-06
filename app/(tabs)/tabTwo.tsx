import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'expo-router';
import { typography, colors, responsive } from '@/styles/styles';
import { useTranslation } from 'react-i18next';

export default function TabTwoScreen() {
    const { scanHistory, clearScanHistory } = useAppContext();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const { t } = useTranslation();

    const filteredHistory = scanHistory.filter(item =>
        item.isbn.includes(searchQuery) ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatPrice = (price: string): string => {
        const priceNumber = parseFloat(price) || 0;
        return `${priceNumber.toFixed(2)} PLN`;
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchInput}
                placeholder={t('placeholders.searchHistory')}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            <FlatList
                data={filteredHistory}
                keyExtractor={(item) => item.isbn + item.createdAt}
                renderItem={({ item }) => (
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
                        {item.price !== '0' && (
                            <Text style={styles.price}>
                                {t('bookInfo.price')}: {formatPrice(item.price)}
                            </Text>
                        )}
                        {item.originalPrice && item.originalPrice !== item.price && (
                            <Text style={styles.originalPrice}>
                                {t('bookInfo.originalPrice')}: {formatPrice(item.originalPrice)}
                            </Text>
                        )}
                    </TouchableOpacity>
                )}
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
    },
    searchInput: {
        height: 50,
        borderColor: colors.gray,
        borderWidth: 1,
        borderRadius: 10,
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
        borderRadius: 5,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: colors.gray,
    },
    clearButton: {
        backgroundColor: colors.error,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        margin: responsive.mediumMargin,
    },
    clearText: {
        color: colors.white,
        fontWeight: 'bold',
    },
    price: {
        color: colors.primary,
        marginTop: 4
    },
    originalPrice: {
        color: colors.gray,
        textDecorationLine: 'line-through',
        marginTop: 4
    }
});
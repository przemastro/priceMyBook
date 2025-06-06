import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useAppContext } from '@/context/AppContext';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/styles';
import HistoryItem from '@/app/components/historyScreen/HistoryItem';
import SearchBar from '@/app/components/historyScreen/SearchBar';
import ClearHistoryButton from '@/app/components/historyScreen/ClearHistoryButton';

export default function HistoryScreen() {
    const { scanHistory, clearScanHistory } = useAppContext();
    const [searchQuery, setSearchQuery] = useState('');
    const { t } = useTranslation();

    const filteredHistory = scanHistory.filter(item =>
        item.isbn.includes(searchQuery) ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.outerContainer}>
            <LinearGradient
                colors={[colors.buttonSelected1, colors.buttonSelected2]}
                style={styles.backgroundGradient}
            />

            {/* Wycentrowany nagłówek z tytułem */}
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>{t('titles.history')}</Text>
            </View>

            <View style={styles.container}>
                <View style={styles.searchContainer}>
                    <SearchBar
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder={t('placeholders.searchHistory')}
                    />
                </View>

                <FlatList
                    data={filteredHistory}
                    keyExtractor={(item) => item.isbn + (item.createdAt || '')}
                    renderItem={({ item }) => <HistoryItem item={item} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>{t('labels.noScanHistory')}</Text>
                        </View>
                    }
                    contentContainerStyle={styles.listContent}
                />

                {scanHistory.length > 0 && (
                    <ClearHistoryButton onPress={clearScanHistory} />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        position: 'relative',
    },
    backgroundGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    headerContainer: {
        paddingTop: 48,
        marginBottom: 10,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '500',
        color: colors.blackDark,
        textAlign: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
        marginHorizontal: 10,
        marginTop: 10,
        marginBottom: 20,
        borderRadius: 20,
        padding: 10,
        paddingTop: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    searchContainer: {
        marginBottom: 20,
        paddingHorizontal: 5,
    },
    listContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: colors.black,
        textAlign: 'center',
    },
});
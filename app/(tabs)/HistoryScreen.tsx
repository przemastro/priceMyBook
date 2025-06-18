import React, { useState } from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import { useAppContext } from '@/context/AppContext';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/styles';
import HistoryItem from '@/app/components/historyScreen/HistoryItem';
import SearchBar from '@/app/components/historyScreen/SearchBar';
import ClearHistoryButton from '@/app/components/historyScreen/ClearHistoryButton';
import {router} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import { styles } from './styles'

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

            <View style={styles.headerContainer}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.blackDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('titles.history')}</Text>
                <View style={styles.spacer} />
            </View>

            <View style={localStyles.container}>
                <View style={localStyles.searchContainer}>
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
                        <View style={localStyles.emptyContainer}>
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

const localStyles = StyleSheet.create({
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
});
import React, { useState } from 'react';
import { View, Text, FlatList} from 'react-native';
import { useAppContext } from '@/context/AppContext';
import { useTranslation } from 'react-i18next';
import { styles } from '@/app/components/historyScreen/styles';
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
        <View style={styles.container}>
            <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t('placeholders.searchHistory')}
            />

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
    );
}
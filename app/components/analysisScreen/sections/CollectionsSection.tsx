import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, FlatList, Dimensions, ScrollView } from 'react-native';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '@/context/AppContext';

interface Collection {
    name: string;
    icon: string;
    createdAt?: string;
}

type CollectionsSectionProps = {
    collections: Collection[];
    books: Record<string, any[]>;
    selectedCollection: string | null;
    onSelectCollection: (collection: string) => void;
    onAddCollection: () => void;
    searchQuery: string;
    onSearchChange: (text: string) => void;
};

const CollectionsSection = ({
                                collections,
                                books,
                                selectedCollection,
                                onSelectCollection,
                                onAddCollection,
                                searchQuery,
                                onSearchChange,
                            }: CollectionsSectionProps) => {
    const { t, i18n } = useTranslation();
    const { collectionCategories } = useAppContext();
    const { height } = Dimensions.get('window');

    const getBookWord = (count: number, lang: string) => {
        if (lang === 'pl') {
            if (count === 1) return 'labels.book_one';
            if (count % 100 >= 12 && count % 100 <= 14) return 'labels.book_many';
            if ([2, 3, 4].includes(count % 10)) return 'labels.book_few';
            return 'labels.book_many';
        }
        return count === 1 ? 'labels.book_one' : 'labels.book_other';
    };

    const filteredCollections = useMemo(() => {
        if (!searchQuery) return collections;
        return collections.filter(collection =>
            collection.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [collections, searchQuery]);

    const calculateCollectionTotal = (collectionName: string): number => {
        return (books[collectionName] || []).reduce((sum: number, book: any) =>
            sum + parseFloat(book.price || '0'), 0);
    };

    const formatCurrency = (price: string): string => {
        const number = parseFloat(price);
        if (isNaN(number)) return price;

        return new Intl.NumberFormat(i18n.language === 'pl' ? 'pl-PL' : 'en-US', {
            style: 'currency',
            currency: i18n.language === 'pl' ? 'PLN' : 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(number);
    };

    const renderItem = ({ item }: { item: Collection }) => {
        const bookCount = books[item.name]?.length || 0;
        const isSelected = selectedCollection === item.name;
        const categories = collectionCategories[item.name] || [];

        const formattedDate = item.createdAt
            ? `${new Date(item.createdAt).toLocaleString(i18n.language, { month: 'short' })}, ${new Date(item.createdAt).getFullYear()}`
            : t('labels.noDate');

        return (
            <TouchableOpacity
                style={[
                    styles.collectionItem,
                    isSelected && styles.selectedCollectionItem
                ]}
                onPress={() => onSelectCollection(item.name)}
                activeOpacity={0.7}
            >
                <LinearGradient
                    colors={isSelected
                        ? [colors.buttonSelected1, colors.buttonSelected2]
                        : [colors.white, colors.whiteBlue]}
                    style={styles.collectionItemGradient}
                >
                    <View style={[
                        styles.collectionIconContainer,
                        isSelected && styles.selectedCollectionIcon
                    ]}>
                        <MaterialIcons
                            name={item.icon as any}
                            size={24}
                            color={isSelected ? colors.primary : colors.secondary}
                        />
                    </View>
                    <View style={styles.collectionTextContainer}>
                        <Text style={[
                            styles.collectionName,
                            isSelected && styles.selectedCollectionName
                        ]}>
                            {item.name}
                        </Text>
                        <View style={styles.collectionMetaContainer}>
                            <Text style={styles.collectionBookCount}>
                                {bookCount} {t(getBookWord(bookCount, i18n.language))}
                                {categories.length > 0 && ` • ${categories.join(', ')}`}
                            </Text>
                            <Text style={styles.collectionDate}>
                                {formattedDate}
                            </Text>
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.combinedSection}>
            <View style={styles.searchHeader}>
                <View style={styles.searchContainer}>
                    <Feather name="search" size={20} color={colors.secondary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('placeholders.searchCollections')}
                        placeholderTextColor={colors.grayDark}
                        value={searchQuery}
                        onChangeText={onSearchChange}
                    />
                </View>
                <TouchableOpacity
                    onPress={onAddCollection}
                    style={styles.addButton}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={[colors.buttonSelected1, colors.buttonSelected2]}
                        style={styles.addButtonGradient}
                    >
                        <Ionicons name="add" size={24} color={colors.primary} />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {filteredCollections.length > 0 ? (
                <ScrollView
                    style={[styles.listContainer, { height: height * 0.35 }]}
                    nestedScrollEnabled={true}
                >
                    <FlatList
                        scrollEnabled={false}
                        data={filteredCollections}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.name}
                        contentContainerStyle={styles.listContent}
                    />
                </ScrollView>
            ) : (
                <View style={styles.noCollectionsContainer}>
                    <Text style={styles.noCollectionsText}>{t('labels.noCollectionsFound')}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    combinedSection: {
        backgroundColor: colors.background,
        borderRadius: 0,
        paddingTop: 20,
        marginBottom: 0,
        flex: 1,
    },
    stepTitle: {
        color: colors.primary,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
    },
    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 10,
        borderWidth: 1,
        borderColor: colors.buttonSelected1,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: colors.black,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    addButtonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    collectionItem: {
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
    selectedCollectionItem: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    collectionItemGradient: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    collectionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.03)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    selectedCollectionIcon: {
        backgroundColor: 'rgba(74,108,247,0.1)',
    },
    collectionTextContainer: {
        flex: 1,
    },
    collectionName: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.secondary,
        marginBottom: 2,
    },
    selectedCollectionName: {
        color: colors.primary,
        fontWeight: '600',
    },
    collectionBookCount: {
        fontSize: 14,
        color: colors.grayDark,
    },
    collectionValue: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
        marginTop: 4,
    },
    listContainer: {
        width: '100%',
    },
    listContent: {
        paddingBottom: 20,
    },
    noCollectionsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noCollectionsText: {
        fontSize: 14,
        color: colors.grayDark,
        textAlign: 'center',
    },
    collectionMetaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    collectionDate: {
        fontSize: 12,
        color: colors.grayDark,
        marginLeft: 8,
    },
});

export default CollectionsSection;
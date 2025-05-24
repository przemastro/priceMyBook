import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, FlatList, ScrollView, Dimensions, Alert } from 'react-native';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';

interface CollectionCarouselProps {
    collections: { name: string; icon: string }[];
    books: Record<string, any[]>;
    selectedCollection: string | null;
    onSelectCollection: (collectionName: string) => void;
    calculateCollectionTotal: (collectionName: string) => number;
    onEditCollection: (collectionName: string, newName: string) => Promise<void>;
    onDeleteCollection: (collectionName: string) => void;
    onExportCollection: (collectionName: string) => void;
    getBookWord: (count: number, lang: string) => string;
    formatCurrency: (price: string) => string;
    onImportCollection: () => void;
    onAddCollection: () => void;
    onNavigateToBooks: () => void; // Nowa prop do nawigacji do książek
}

const CollectionCarousel: React.FC<CollectionCarouselProps> = ({
                                                                   collections,
                                                                   books,
                                                                   selectedCollection,
                                                                   onSelectCollection,
                                                                   calculateCollectionTotal,
                                                                   onEditCollection,
                                                                   onDeleteCollection,
                                                                   onExportCollection,
                                                                   getBookWord,
                                                                   formatCurrency,
                                                                   onImportCollection,
                                                                   onAddCollection,
                                                                   onNavigateToBooks,
                                                               }) => {
    const { t, i18n } = useTranslation();
    const [searchQuery, setSearchQuery] = React.useState('');
    const { width } = Dimensions.get('window');
    const { height } = Dimensions.get('window');

    const filteredCollections = useMemo(() => {
        if (!searchQuery) return collections;
        return collections.filter(collection =>
            collection.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [collections, searchQuery]);

    const handleDeletePress = (collectionName: string, event: any) => {
        event.stopPropagation();
        Alert.alert(
            t('alerts.confirmDeleteTitle'),
            t('alerts.confirmDeleteMessage', {
                collectionName,
                bookCount: books[collectionName]?.length || 0
            }),
            [
                { text: t('buttons.cancel'), style: 'cancel' },
                {
                    text: t('buttons.delete'),
                    onPress: () => onDeleteCollection(collectionName),
                    style: 'destructive'
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: { name: string; icon: string } }) => {
        const bookCount = books[item.name]?.length || 0;
        const isSelected = selectedCollection === item.name;

        return (
            <TouchableOpacity
                style={[
                    styles.collectionItem,
                    isSelected && styles.selectedCollectionItem,
                    { width: width * 0.8 }
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
                        <Text style={styles.collectionBookCount}>
                            {bookCount} {t(getBookWord(bookCount, i18n.language))}
                        </Text>
                        <Text style={styles.collectionValue}>
                            {formatCurrency(calculateCollectionTotal(item.name).toString())}
                        </Text>
                    </View>

                    {/* Strzałka do nawigacji do książek */}
                    <TouchableOpacity
                        style={styles.navigateButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            onSelectCollection(item.name);
                            onNavigateToBooks();
                        }}
                        activeOpacity={0.7}
                    >
                        <Feather name="chevron-right" size={24} color={isSelected ? colors.primary : colors.secondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={(e) => handleDeletePress(item.name, e)}
                        activeOpacity={0.5}
                        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                    >
                        <MaterialIcons
                            name="close"
                            size={18}
                            color={isSelected ? colors.primary : colors.grayDark}
                        />
                    </TouchableOpacity>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.combinedSection, { width: width * 0.9 }]}>
            <View style={styles.searchHeader}>
                <View style={styles.searchContainer}>
                    <Feather name="search" size={20} color={colors.secondary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('placeholders.searchCollections')}
                        placeholderTextColor={colors.grayDark}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                        onPress={onAddCollection}
                        style={styles.actionButton}
                        activeOpacity={0.7}
                    >
                        <LinearGradient
                            colors={[colors.buttonSelected1, colors.buttonSelected2]}
                            style={styles.actionButtonGradient}
                        >
                            <Ionicons name="add" size={20} color={colors.primary} />
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onImportCollection}
                        style={[styles.actionButton, { marginLeft: 8 }]}
                        activeOpacity={0.7}
                    >
                        <LinearGradient
                            colors={[colors.buttonSelected1, colors.buttonSelected2]}
                            style={styles.actionButtonGradient}
                        >
                            <Ionicons name="download" size={20} color={colors.primary} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
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
        backgroundColor: colors.white,
        borderRadius: 0,
        paddingTop: 10,
        marginBottom: 0,
        flex: 1,
        alignSelf: 'center',
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
    actionButtonsContainer: {
        flexDirection: 'row',
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    actionButtonGradient: {
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
        position: 'relative',
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
    deleteButton: {
        position: 'absolute',
        right: 12,
        top: 12,
        padding: 4,
        borderRadius: 12,
    },
    listContainer: {
        width: '100%',
        maxHeight: 300,
    },
    listContent: {
        paddingBottom: 20,
    },
    noCollectionsContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noCollectionsText: {
        fontSize: 14,
        color: colors.grayDark,
        textAlign: 'center',
    },
    navigateButton: {
        position: 'absolute',
        right: 40,
        top: '50%',
        marginTop: -12,
        padding: 4,
    },
});

export default CollectionCarousel;
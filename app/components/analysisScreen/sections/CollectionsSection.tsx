import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';

type CollectionsSectionProps = {
    collections: string[];
    books: Record<string, any[]>;
    selectedCollection: string;
    onSelectCollection: (collection: string) => void;
    onAddCollection: () => void;
};

const CollectionsSection = ({
                                collections,
                                books,
                                selectedCollection,
                                onSelectCollection,
                                onAddCollection,
                            }: CollectionsSectionProps) => {
    const { t, i18n } = useTranslation();

    const getBookWord = (count: number, lang: string) => {
        if (lang === 'pl') {
            if (count === 1) return 'labels.book_one';
            if (count % 100 >= 12 && count % 100 <= 14) return 'labels.book_many';
            if ([2,3,4].includes(count % 10)) return 'labels.book_few';
            return 'labels.book_many';
        }
        return count === 1 ? 'labels.book_one' : 'labels.book_other';
    };

    return (
        <View style={styles.combinedSection}>
            <Text style={styles.stepTitle}>{t('stepTitles.addToCollection')}</Text>
            <View style={styles.collectionsGrid}>
                {collections.map((collection) => {
                    const bookCount = books[collection]?.length || 0;
                    return (
                        <TouchableOpacity
                            key={collection}
                            style={[styles.collectionButton, selectedCollection === collection && styles.selectedCollectionButton]}
                            onPress={() => onSelectCollection(collection)}
                        >
                            <LinearGradient
                                colors={selectedCollection === collection
                                    ? [colors.buttonSelected1, colors.buttonSelected2]
                                    : [colors.white, colors.whiteBlue]}
                                style={styles.collectionButtonGradient}
                            >
                                <View style={styles.collectionIconContainer}>
                                    <MaterialIcons
                                        name="collections-bookmark"
                                        size={24}
                                        color={selectedCollection === collection ? colors.primary : colors.secondary}
                                    />
                                </View>
                                <Text style={[styles.collectionName, selectedCollection === collection && styles.selectedCollectionName]}>
                                    {collection}
                                </Text>
                                <Text style={styles.collectionBookCount}>
                                    {bookCount} {t(getBookWord(bookCount, i18n.language))}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    );
                })}

                <TouchableOpacity
                    style={styles.addCollectionButton}
                    onPress={onAddCollection}
                >
                    <LinearGradient
                        colors={[colors.white, colors.whiteBlue]}
                        style={styles.addCollectionGradient}
                    >
                        <View style={styles.collectionIconContainer}>
                            <Ionicons name="add-circle" size={24} color={colors.primary} />
                        </View>
                        <Text style={styles.addCollectionText}>
                            {t('buttons.createNewCollection')}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default CollectionsSection;

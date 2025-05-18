import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Dimensions} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Carousel from 'react-native-reanimated-carousel';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';

interface CollectionCarouselProps {
    collections: {name: string; icon: string}[];
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
                                                               }) => {
    const { t, i18n } = useTranslation();
    const { width } = Dimensions.get('window');

    const renderItem = ({ item }: { item: {name: string; icon: string} }) => {
        const bookCount = books[item.name]?.length || 0;
        return (
            <TouchableOpacity
                style={[
                    styles.collectionItem,
                    selectedCollection === item.name && styles.selectedCollectionItem
                ]}
                onPress={() => onSelectCollection(item.name)}
            >
                <View style={styles.collectionIcon}>
                    <MaterialIcons
                        name={item.icon as any}
                        size={24}
                        color={selectedCollection === item.name ? colors.primary : colors.secondary}
                    />
                </View>
                <View style={styles.collectionTextContainer}>
                    <Text style={styles.collectionName}>{item.name}</Text>
                    <Text style={styles.collectionBookCount}>
                        {bookCount} {getBookWord(bookCount, i18n.language)}
                    </Text>
                    <Text style={styles.collectionValue}>
                        {formatCurrency(calculateCollectionTotal(item.name).toString())}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Carousel
                loop={false}
                width={width * 0.8}
                height={300}
                data={collections}
                renderItem={renderItem}
                scrollAnimationDuration={300}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 320,
        marginTop: 10,
    },
    collectionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.grayLight,
    },
    selectedCollectionItem: {
        borderColor: colors.primary,
        backgroundColor: colors.whiteBlue,
    },
    collectionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.whiteBlue,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    collectionTextContainer: {
        flex: 1,
    },
    collectionName: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.grayDark,
        marginBottom: 2,
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
});

export default CollectionCarousel;
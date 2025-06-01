import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '@/context/AppContext';

interface CategoriesCarouselProps {
    collectionName: string;
    collectionCategories: { [key: string]: string[] };
    onAddCategory: (collectionName: string, category: string) => void;
    onRemoveCategory: (collectionName: string, category: string) => void;
}

const CategoriesCarousel: React.FC<CategoriesCarouselProps> = ({
                                                                   collectionName,
                                                                   onAddCategory,
                                                                   onRemoveCategory
                                                               }) => {
    const { t } = useTranslation();
    const { collectionCategories } = useAppContext();

    const categories = collectionName ? (collectionCategories[collectionName] || []) : [];

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Existing categories - read only */}
                {categories.map((category, index) => (
                    <View key={index} style={styles.categoryItem}>
                        <Text style={styles.categoryText}>{category}</Text>
                    </View>
                ))}

                {/* Empty state */}
                {categories.length === 0 && (
                    <View style={styles.emptyCategoryItem}>
                        <Text style={styles.emptyCategoryText}>{t('labels.noCategories')}</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        paddingHorizontal: 16,
        height: 40,
    },
    scrollContent: {
        alignItems: 'center',
        gap: 8,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        height: 32,
    },
    categoryText: {
        fontSize: 14,
        color: colors.grayDark,
    },
    emptyCategoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        height: 32,
    },
    emptyCategoryText: {
        fontSize: 14,
        color: colors.gray,
        fontStyle: 'italic',
    },
});

export default CategoriesCarousel;
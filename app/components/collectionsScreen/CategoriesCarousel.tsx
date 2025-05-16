// app/components/collectionsScreen/CategoriesCarousel.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors } from '@/styles/styles';
import Carousel from 'react-native-reanimated-carousel';

const { width: viewportWidth } = Dimensions.get('window');

interface CategoriesCarouselProps {
    categories: string[];
    selectedCollection: string | null;
    collectionCategories: Record<string, string[]>;
}

const CategoriesCarousel: React.FC<CategoriesCarouselProps> = ({
                                                                   selectedCollection,
                                                                   collectionCategories
                                                               }) => {
    if (!selectedCollection || !collectionCategories[selectedCollection]?.length) {
        return null;
    }

    const categories = collectionCategories[selectedCollection];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Categories</Text>
            <Carousel
                loop={false}
                style={styles.carousel}
                width={viewportWidth / 3}
                height={60}
                data={categories}
                scrollAnimationDuration={300}
                renderItem={({ item }) => (
                    <View style={styles.categoryItem}>
                        <Text style={styles.categoryText} numberOfLines={2}>
                            {item}
                        </Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
    },
    carousel: {
        width: '100%',
        height: 80,
    },
    categoryItem: {
        width: viewportWidth / 3 - 20,
        backgroundColor: 'rgba(74,108,247,0.1)',
        borderRadius: 16,
        padding: 10,
        marginHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryText: {
        fontSize: 14,
        color: colors.grayDark,
        textAlign: 'center',
    },
});

export default CategoriesCarousel;
// app/components/collectionsScreen/CategoriesCarousel.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, TextInput } from 'react-native';
import { colors } from '@/styles/styles';
import Carousel from 'react-native-reanimated-carousel';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const { width: viewportWidth } = Dimensions.get('window');

interface CategoriesCarouselProps {
    collectionName: string;
    collectionCategories: Record<string, string[]>;
    onAddCategory: (collectionName: string, category: string) => void;
    onRemoveCategory: (collectionName: string, category: string) => void;
}

const CategoriesCarousel: React.FC<CategoriesCarouselProps> = ({
                                                                   collectionName,
                                                                   collectionCategories,
                                                                   onAddCategory,
                                                                   onRemoveCategory
                                                               }) => {
    const { t } = useTranslation();
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);

    const categories = collectionCategories[collectionName] || [];
    const carouselItems = [...categories, 'add'];

    const handleAddCategory = () => {
        if (newCategoryName.trim()) {
            onAddCategory(collectionName, newCategoryName);
            setNewCategoryName('');
            setIsAddingCategory(false);
        }
    };

    return (
        <View style={styles.container}>
            <Carousel
                loop={false}
                style={styles.carousel}
                width={viewportWidth}
                height={40}
                data={carouselItems}
                scrollAnimationDuration={300}
                renderItem={({ item }) => (
                    <View style={[styles.itemContainer, {
                        width: item === 'add'
                            ? (isAddingCategory ? 200 : 120)
                            : Math.max(item.length * 8 + 40, 80) // Minimalna szerokość 80
                    }]}>
                        {item === 'add' ? (
                            <View style={styles.addContainer}>
                                {isAddingCategory ? (
                                    <View style={styles.addCategoryContainer}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder={t('placeholders.categoryName')}
                                            value={newCategoryName}
                                            onChangeText={setNewCategoryName}
                                            autoFocus
                                            onSubmitEditing={handleAddCategory}
                                        />
                                        <TouchableOpacity
                                            style={[styles.confirmButton, !newCategoryName.trim() && styles.disabledButton]}
                                            onPress={handleAddCategory}
                                            disabled={!newCategoryName.trim()}
                                        >
                                            <Ionicons name="checkmark" size={16} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.addButton}
                                        onPress={() => setIsAddingCategory(true)}
                                    >
                                        <Ionicons name="add" size={16} color={colors.primary} />
                                        <Text style={styles.addButtonText}>{t('buttons.addCategory')}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ) : (
                            <View style={styles.categoryItem}>
                                <Text style={styles.categoryText}>{item}</Text>
                                <TouchableOpacity
                                    onPress={() => onRemoveCategory(collectionName, item)}
                                >
                                    <Ionicons name="close" size={16} color={colors.error} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
    carousel: {
        width: '100%',
        height: 40,
    },
    itemContainer: {
        marginRight: 4,
    },
    addContainer: {
        height: 40,
        justifyContent: 'center',
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
        marginRight: 4,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.primary,
        borderStyle: 'dashed',
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 12,
        height: 32,
    },
    addButtonText: {
        color: colors.primary,
        fontSize: 14,
        marginLeft: 4,
    },
    addCategoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        height: 32,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 16,
        paddingHorizontal: 12,
        backgroundColor: colors.white,
        marginRight: 8,
        minWidth: 120,
    },
    confirmButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
});

export default CategoriesCarousel;
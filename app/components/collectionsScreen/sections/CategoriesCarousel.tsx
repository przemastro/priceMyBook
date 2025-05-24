// app/components/collectionsScreen/CategoriesCarousel.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, TextInput } from 'react-native';
import { colors } from '@/styles/styles';
import Carousel from 'react-native-reanimated-carousel';
import { MaterialIcons } from '@expo/vector-icons';
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
    const showAddButton = categories.length === 0 || isAddingCategory;
    const carouselItems = showAddButton ? ['add'] : [...categories, 'add'];

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
                width={showAddButton ? viewportWidth - 32 : 120} // Full width when only add button, fixed width for categories
                height={40}
                data={carouselItems}
                scrollAnimationDuration={300}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        {item === 'add' ? (
                            <View style={styles.addContainer}>
                                {isAddingCategory || categories.length === 0 ? (
                                    <View style={styles.inputRow}>
                                        <TextInput
                                            style={styles.input}
                                            value={newCategoryName}
                                            onChangeText={setNewCategoryName}
                                            placeholder={t('labels.addCategoryPlaceholder')}
                                            autoFocus={true}
                                            onSubmitEditing={handleAddCategory}
                                        />
                                        <TouchableOpacity
                                            style={styles.confirmButton}
                                            onPress={handleAddCategory}
                                        >
                                            <Text style={styles.confirmText}>{t('buttons.add')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.addButton}
                                        onPress={() => setIsAddingCategory(true)}
                                    >
                                        <Text style={styles.addButtonText}>{t('buttons.addCategory')}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ) : (
                            <View style={styles.categoryItem}>
                                <Text style={styles.categoryText} numberOfLines={1}>
                                    {item}
                                </Text>
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => onRemoveCategory(collectionName, item)}
                                >
                                    <MaterialIcons name="close" size={16} color={colors.grayDark} />
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
        marginTop: 10,
        paddingHorizontal: 16,
    },
    carousel: {
        width: '100%',
        height: 50,
    },
    itemContainer: {
        paddingRight: 8,
    },
    addContainer: {
        height: 40,
        justifyContent: 'center',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: 20,
        paddingHorizontal: 12,
        height: 40,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: colors.grayDark,
        height: 40,
    },
    confirmButton: {
        backgroundColor: colors.primary,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginLeft: 8,
    },
    confirmText: {
        color: colors.white,
        fontSize: 14,
    },
    addButton: {
        backgroundColor: 'rgba(74,108,247,0.1)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.primary,
        borderStyle: 'dashed',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    addButtonText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(74,108,247,0.1)',
        borderRadius: 20,
        paddingHorizontal: 12,
        height: 40,
        minWidth: 100,
    },
    categoryText: {
        fontSize: 14,
        color: colors.grayDark,
        marginRight: 8,
        flexShrink: 1,
    },
    removeButton: {
        marginLeft: 'auto',
    },
});

export default CategoriesCarousel;
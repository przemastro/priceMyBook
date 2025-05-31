import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { colors } from '@/styles/styles';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '@/context/AppContext';

interface CategoriesCarouselProps {
    collectionName: string;
}

const CategoriesCarousel: React.FC<CategoriesCarouselProps> = ({
                                                                   collectionName
                                                               }) => {
    const { t } = useTranslation();
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const { collectionCategories, addCategoryToCollection, removeCategoryFromCollection } = useAppContext();

    const categories = collectionName ? (collectionCategories[collectionName] || []) : [];

    const handleAddCategory = () => {
        if (newCategoryName.trim() && collectionName) {
            addCategoryToCollection(collectionName, newCategoryName);
            setNewCategoryName('');
            setIsAddingCategory(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Existing categories */}
                {categories.map((category, index) => (
                    <View key={index} style={styles.categoryItem}>
                        <Text style={styles.categoryText}>{category}</Text>
                        <TouchableOpacity
                            onPress={() => removeCategoryFromCollection(collectionName, category)}
                        >
                            <Ionicons name="close" size={16} color={colors.error} />
                        </TouchableOpacity>
                    </View>
                ))}

                {/* Add category button */}
                {collectionName && (
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
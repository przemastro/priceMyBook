// app/components/collectionsScreen/CategoriesManager.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';

interface CategoriesManagerProps {
    collectionName: string;
    collectionCategories: Record<string, string[]>;
    onAddCategory: (collectionName: string, category: string) => void;
    onRemoveCategory: (collectionName: string, category: string) => void;
}

const CategoriesManager: React.FC<CategoriesManagerProps> = ({
                                                                 collectionName,
                                                                 collectionCategories,
                                                                 onAddCategory,
                                                                 onRemoveCategory
                                                             }) => {
    const { t } = useTranslation();
    const [addingCategory, setAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const handleAddCategory = () => {
        if (!newCategoryName.trim()) return;
        onAddCategory(collectionName, newCategoryName.trim());
        setNewCategoryName('');
        setAddingCategory(false);
    };

    return (
        <View style={styles.container}>

            <View style={styles.categoriesList}>
                {collectionCategories[collectionName]?.map((category) => (
                    <View key={category} style={styles.categoryItem}>
                        <Text style={styles.categoryText}>{category}</Text>
                        <TouchableOpacity
                            onPress={() => onRemoveCategory(collectionName, category)}
                        >
                            <Ionicons name="close" size={16} color={colors.error} />
                        </TouchableOpacity>
                    </View>
                ))}

                {!addingCategory ? (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setAddingCategory(true)}
                    >
                        <Ionicons name="add" size={16} color={colors.primary} />
                        <Text style={styles.addButtonText}>{t('buttons.addCategory')}</Text>
                    </TouchableOpacity>
                ) : (
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
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
    },
    categoriesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.grayLight,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
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

export default CategoriesManager;
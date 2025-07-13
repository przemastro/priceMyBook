import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import { styles } from './styles'

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
            <Text style={styles.title}>{t('labels.categories')}</Text>

            <View style={styles.categoriesList}>
                {collectionCategories[collectionName]?.map((category) => (
                    <View key={category} style={styles.categoryItem}>
                        <Text style={styles.categoryText}>{category}</Text>
                        <TouchableOpacity
                            onPress={() => onRemoveCategory(collectionName, category)}
                        >
                            <MaterialIcons name="close" size={16} color={colors.error} />
                        </TouchableOpacity>
                    </View>
                ))}

                {!addingCategory ? (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setAddingCategory(true)}
                    >
                        <MaterialIcons name="add" size={16} color={colors.primary} />
                        <Text style={styles.addButtonText}>{t('buttons.addCategory')}</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.addCategoryContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder={t('placeholders.categoryName')}
                            placeholderTextColor={colors.gray}
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
                            <MaterialIcons name="check" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

export default CategoriesManager;
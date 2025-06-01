import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, FlatList } from 'react-native';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

interface AddCollectionModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (name: string, categories: string[], icon: string) => void;
}

const BOOK_ICONS = [
    'book', 'menu-book', 'auto-stories', 'library-books', 'school',
    'science', 'biotech', 'calculate', 'functions', 'psychology',
    'memory', 'data-usage', 'insights',
    'computer', 'code', 'developer-mode', 'terminal', 'smartphone',
    'wifi', 'settings', 'storage', 'security', 'cloud',
    'nature', 'pets', 'spa', 'grass', 'forest',
    'water', 'eco', 'bug-report',
    'medical-services', 'healing', 'fitness-center', 'health-and-safety', 'sanitizer',
    'vaccines', 'medication', 'monitor-heart', 'elderly', 'accessible',
    'palette', 'brush', 'colorize', 'music-note', 'theater-comedy',
    'mic', 'movie', 'photo-camera', 'museum', 'draw',
    'sports-baseball', 'sports-basketball', 'sports-football', 'sports-soccer', 'sports-tennis',
    'sports-volleyball', 'sports-golf', 'sports-handball', 'sports-kabaddi', 'sports-martial-arts',
    'travel-explore', 'map', 'public', 'language', 'flight',
    'train', 'directions-boat', 'directions-car', 'motorcycle', 'commute',
    'history-edu', 'castle', 'account-balance', 'temple-buddhist',
    'temple-hindu', 'mosque', 'church', 'synagogue', 'fort',
    'business-center', 'work', 'attach-money', 'savings', 'trending-up',
    'account-balance-wallet', 'euro', 'currency-exchange', 'receipt', 'credit-card',
    'restaurant', 'local-cafe', 'nightlife', 'cake', 'wine-bar',
    'bakery-dining', 'icecream', 'set-meal', 'ramen-dining', 'rice-bowl',
    'home', 'apartment', 'yard', 'balcony', 'bathtub',
    'bed', 'chair', 'flatware', 'kitchen', 'light',
    'auto-awesome', 'star', 'rocket', 'public-off', 'visibility-off',
    'sunny', 'thunderstorm', 'whatshot', 'flare',
    'fingerprint', 'search', 'gavel', 'policy', 'security',
    'visibility', 'remove-red-eye', 'lock', 'vpn-key', 'shield',
    'favorite', 'celebration', 'mood', 'sentiment-satisfied', 'heart-broken',
    'diamond', 'spa', 'hotel',
    'child-friendly', 'toys', 'crib', 'school', 'face',
    'emoji-people', 'cake', 'park',
];

const AddCollectionModal: React.FC<AddCollectionModalProps> = ({ visible, onClose, onConfirm }) => {
    const { t } = useTranslation();
    const [localCollectionName, setLocalCollectionName] = useState('');
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedIcon, setSelectedIcon] = useState('book');
    const [showIcons, setShowIcons] = useState(false);
    const [newCategory, setNewCategory] = useState('');

    const handleAddCategory = () => {
        if (newCategory.trim() && !categories.includes(newCategory.trim())) {
            setCategories([...categories, newCategory.trim()]);
            setNewCategory('');
        }
    };

    const handleRemoveCategory = (category: string) => {
        setCategories(categories.filter(c => c !== category));
    };

    const handleConfirm = () => {
        if (!localCollectionName.trim()) return;
        onConfirm(localCollectionName, categories, selectedIcon);
        setLocalCollectionName('');
        setCategories([]);
        setSelectedIcon('book');
        onClose();
    };

    const renderIconItem = ({ item }: { item: string }) => (
        <TouchableOpacity
            style={[
                styles.iconItem,
                selectedIcon === item && styles.selectedIconItem
            ]}
            onPress={() => {
                setSelectedIcon(item);
                setShowIcons(false);
            }}
        >
            <MaterialIcons
                name={item as any}
                size={24}
                color={selectedIcon === item ? colors.primary : colors.secondary}
            />
        </TouchableOpacity>
    );

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.iconPreviewContainer}>
                            <View style={styles.iconPreviewCircle}>
                                <MaterialIcons
                                    name={selectedIcon as any}
                                    size={62}
                                    color={colors.primary}
                                />
                            </View>
                        </View>

                        <TextInput
                            style={styles.modalInput}
                            placeholder={t('placeholders.enterCollectionName')}
                            placeholderTextColor={colors.gray}
                            value={localCollectionName}
                            onChangeText={setLocalCollectionName}
                            autoFocus
                        />

                        <TouchableOpacity
                            style={styles.iconSelector}
                            onPress={() => setShowIcons(!showIcons)}
                        >
                            <View style={styles.iconPreview}>
                                <MaterialIcons
                                    name={selectedIcon as any}
                                    size={24}
                                    color={colors.primary}
                                />
                                <Text style={styles.iconSelectorText}>
                                    {t('labels.selectIcon')}
                                </Text>
                            </View>
                            <MaterialIcons
                                name={showIcons ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                size={24}
                                color={colors.secondary}
                            />
                        </TouchableOpacity>

                        {showIcons && (
                            <View style={styles.iconsContainer}>
                                <FlatList
                                    data={BOOK_ICONS}
                                    renderItem={renderIconItem}
                                    keyExtractor={(item) => item}
                                    numColumns={5}
                                    contentContainerStyle={styles.iconsList}
                                />
                            </View>
                        )}

                        <View style={styles.categoriesSection}>
                            <Text style={styles.sectionTitle}>{t('labels.categories')}</Text>

                            <View style={styles.categoriesList}>
                                {categories.map((category, index) => (
                                    <View key={index} style={styles.categoryItem}>
                                        <Text style={styles.categoryText}>{category}</Text>
                                        <TouchableOpacity onPress={() => handleRemoveCategory(category)}>
                                            <MaterialIcons name="close" size={16} color={colors.error} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.addCategoryContainer}>
                                <TextInput
                                    style={styles.categoryInput}
                                    placeholder={t('placeholders.addCategory')}
                                    value={newCategory}
                                    onChangeText={setNewCategory}
                                    onSubmitEditing={handleAddCategory}
                                />
                                <TouchableOpacity
                                    style={styles.addCategoryButton}
                                    onPress={handleAddCategory}
                                    disabled={!newCategory.trim()}
                                >
                                    <MaterialIcons
                                        name="add"
                                        size={24}
                                        color={newCategory.trim() ? colors.primary : colors.gray}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <View style={styles.closeButtonCircle}>
                                <Text style={styles.closeButtonText}>×</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.confirmButton, !localCollectionName.trim() && styles.disabledButton]}
                            onPress={handleConfirm}
                            disabled={!localCollectionName.trim()}
                            activeOpacity={0.7}
                        >
                            <LinearGradient
                                colors={[colors.primary, colors.primary]}
                                style={styles.buttonGradient}
                            >
                                <Text style={styles.confirmButtonText}>{t('buttons.add')}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        maxHeight: '80%',
    },
    modalContent: {
        padding: 24,
        paddingTop: 32,
    },
    iconPreviewContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconPreviewCircle: {
        width: 100,
        height: 100,
        borderRadius: 60,
        backgroundColor: colors.whiteBlue,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(74,108,247,0.1)',
    },
    modalInput: {
        height: 50,
        borderWidth: 1,
        borderColor: 'rgba(74,108,247,0.2)',
        borderRadius: 10,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        marginBottom: 20,
        color: colors.black,
        fontSize: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(74,108,247,0.2)',
        borderRadius: 10,
        marginBottom: 20,
        backgroundColor: 'white',
    },
    iconPreview: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconSelectorText: {
        marginLeft: 10,
        color: colors.secondary,
    },
    iconsContainer: {
        maxHeight: 150,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(74,108,247,0.1)',
        borderRadius: 10,
        padding: 10,
    },
    iconsList: {
        justifyContent: 'center',
    },
    iconItem: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
        borderRadius: 8,
        backgroundColor: colors.whiteBlue,
    },
    selectedIconItem: {
        backgroundColor: colors.primary,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    closeButtonCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(74,108,247,0.1)',
    },
    closeButtonText: {
        fontSize: 24,
        color: colors.primary,
    },
    confirmButton: {
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 16,
    },
    disabledButton: {
        opacity: 0.7,
    },
    buttonGradient: {
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    categoriesSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        color: colors.secondary,
        marginBottom: 8,
    },
    categoriesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    categoryText: {
        fontSize: 14,
        color: colors.grayDark,
        marginRight: 4,
    },
    addCategoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryInput: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: colors.gray,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginRight: 8,
    },
    addCategoryButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.gray,
    },
});

export default AddCollectionModal;
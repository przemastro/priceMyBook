import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, FlatList } from 'react-native';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import CategoriesManager from '../../collectionsScreen/CategoriesManager';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from './styles'

interface EditCollectionModalProps {
    visible: boolean;
    currentName: string;
    onClose: () => void;
    onConfirm: (newName: string, categories: string[], icon: string) => void;
    collectionCategories: Record<string, string[]>;
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

const EditCollectionModal: React.FC<EditCollectionModalProps> = ({
                                                                     visible,
                                                                     currentName,
                                                                     onClose,
                                                                     onConfirm,
                                                                     collectionCategories
                                                                 }) => {
    const { t } = useTranslation();
    const [localCollectionName, setLocalCollectionName] = useState(currentName);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedIcon, setSelectedIcon] = useState('book');
    const [showIcons, setShowIcons] = useState(false);

    useEffect(() => {
        if (visible) {
            setLocalCollectionName(currentName);
            setCategories(collectionCategories[currentName] || []);
        }
    }, [visible, currentName, collectionCategories]);

    const handleAddCategory = (collectionName: string, category: string) => {
        setCategories([...categories, category]);
    };

    const handleRemoveCategory = (collectionName: string, category: string) => {
        setCategories(categories.filter(c => c !== category));
    };

    const handleConfirm = () => {
        if (!localCollectionName.trim()) return;
        onConfirm(localCollectionName, categories, selectedIcon);
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
            <View style={localStyles.modalOverlay}>
                <View style={localStyles.modalContainer}>
                    <View style={localStyles.modalContent}>
                        <View style={localStyles.iconPreviewContainer}>
                            <View style={localStyles.iconPreviewCircle}>
                                <MaterialIcons
                                    name={selectedIcon as any}
                                    size={62}
                                    color={colors.primary}
                                />
                            </View>
                        </View>

                        <Text style={styles.currentNameText}>
                            {t('labels.editingCollection')}: {currentName}
                        </Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder={t('placeholders.enterNewCollectionName')}
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

                        <CategoriesManager
                            collectionName={currentName}
                            collectionCategories={{ [currentName]: categories }}
                            onAddCategory={handleAddCategory}
                            onRemoveCategory={handleRemoveCategory}
                        />

                        <TouchableOpacity
                            style={localStyles.closeButton}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <View style={localStyles.closeButtonCircle}>
                                <Text style={localStyles.closeButtonText}>×</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[localStyles.confirmButton, !localCollectionName.trim() && localStyles.disabledButton]}
                            onPress={handleConfirm}
                            disabled={!localCollectionName.trim()}
                            activeOpacity={0.7}
                        >
                            <LinearGradient
                                colors={!localCollectionName.trim() ?
                                    [colors.primary, colors.primary] :
                                    [colors.primary, colors.primary]}
                                style={localStyles.buttonGradient}
                            >
                                <Text style={localStyles.confirmButtonText}>{t('buttons.saveChanges')}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const localStyles = StyleSheet.create({
    modalContainer: {
        width: '90%',
        backgroundColor: colors.white,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        maxHeight: '80%',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.transparentBlack,
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
        borderColor: colors.transparentLightPrimary,
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
        borderColor: colors.transparentLightPrimary,
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
    disabledButton: {
        opacity: 0.7,
    },
});

export default EditCollectionModal;
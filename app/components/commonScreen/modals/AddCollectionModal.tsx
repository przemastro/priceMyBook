import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, FlatList } from 'react-native';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import CategoriesManager from '../../collectionsScreen/CategoriesManager';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

interface AddCollectionModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (name: string, categories: string[], icon: string) => void;
}

// Lista bezpiecznych ikon dla różnych kategorii książek
const BOOK_ICONS = [
    'book', 'menu-book', 'auto-stories', 'library-books', 'school',
    'history-edu', 'science', 'psychology', 'biotech', 'computer',
    'calculate', 'functions', 'public', 'language', 'travel-explore',
    'map', 'landscape', 'nature', 'pets', 'spa',
    'sports-baseball', 'sports-basketball', 'sports-football', 'sports-soccer', 'sports-tennis',
    'music-note', 'theater-comedy', 'palette', 'brush', 'colorize',
    'star', 'favorite', 'celebration', 'cake', 'restaurant',
    'local-cafe', 'nightlife', 'hotel', 'home', 'apartment',
    'work', 'business-center', 'account-balance', 'attach-money', 'savings',
    'health-and-safety', 'fitness-center', 'medical-services', 'healing', 'spa',
    'directions-car', 'flight', 'train', 'directions-boat', 'motorcycle'
];

const AddCollectionModal: React.FC<AddCollectionModalProps> = ({ visible, onClose, onConfirm }) => {
    const { t } = useTranslation();
    const [localCollectionName, setLocalCollectionName] = useState('');
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedIcon, setSelectedIcon] = useState('book');
    const [showIcons, setShowIcons] = useState(false);

    const handleAddCategory = (collectionName: string, category: string) => {
        setCategories([...categories, category]);
    };

    const handleRemoveCategory = (collectionName: string, category: string) => {
        setCategories(categories.filter(c => c !== category));
    };

    const handleConfirm = () => {
        if (!localCollectionName.trim()) return;
        onConfirm(localCollectionName, categories, selectedIcon); // Dodaj przekazanie ikony
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
                    <LinearGradient
                        colors={['#f5f7ff', '#e8ecff']}
                        start={[0, 0]}
                        end={[1, 1]}
                        style={styles.modalHeader}
                    >
                        <Text style={styles.modalTitle}>{t('labels.addNewCollection')}</Text>
                        <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                            <Text style={styles.closeButton}>×</Text>
                        </TouchableOpacity>
                    </LinearGradient>

                    <View style={styles.modalContent}>
                        <TextInput
                            style={styles.modalInput}
                            placeholder={t('placeholders.enterCollectionName')}
                            placeholderTextColor={colors.gray}
                            value={localCollectionName}
                            onChangeText={setLocalCollectionName}
                            autoFocus
                        />

                        {/* Icon Selection */}
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
                            collectionName="new"
                            collectionCategories={{ new: categories }}
                            onAddCategory={handleAddCategory}
                            onRemoveCategory={handleRemoveCategory}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={onClose}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={['#f5f7ff', '#e8ecff']}
                                    style={styles.buttonGradient}
                                >
                                    <Text style={styles.cancelButtonText}>{t('buttons.cancel')}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={handleConfirm}
                                disabled={!localCollectionName.trim()}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={!localCollectionName.trim() ?
                                        ['#e0e4ff', '#d5daff'] :
                                        ['#4a6cf7', colors.primary]}
                                    style={styles.buttonGradient}
                                >
                                    <Text style={styles.confirmButtonText}>{t('buttons.add')}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
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
        borderRadius: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(74,108,247,0.1)',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
    },
    closeButton: {
        fontSize: 24,
        color: colors.primary,
        paddingHorizontal: 10,
    },
    modalContent: {
        padding: 16,
    },
    modalInput: {
        height: 50,
        borderWidth: 1,
        borderColor: 'rgba(74,108,247,0.2)',
        borderRadius: 8,
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
        borderRadius: 8,
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
        borderRadius: 8,
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
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    cancelButton: {
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 12,
    },
    confirmButton: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    buttonGradient: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '500',
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default AddCollectionModal;
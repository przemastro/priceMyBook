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

const BOOK_ICONS = [
    // Podstawowe ikony książek
    'book', 'menu-book', 'auto-stories', 'library-books', 'school',

    // Nauki ścisłe
    'science', 'biotech', 'calculate', 'functions', 'psychology',
    'memory', 'data-usage', 'insights',

    // Technologia i informatyka
    'computer', 'code', 'developer-mode', 'terminal', 'smartphone',
    'wifi', 'settings', 'storage', 'security', 'cloud',

    // Przyroda i środowisko
    'nature', 'pets', 'spa', 'grass', 'forest',
    'water', 'eco', 'bug-report',

    // Medycyna i zdrowie
    'medical-services', 'healing', 'fitness-center', 'health-and-safety', 'sanitizer',
    'vaccines', 'medication', 'monitor-heart', 'elderly', 'accessible',

    // Sztuka i kultura
    'palette', 'brush', 'colorize', 'music-note', 'theater-comedy',
    'mic', 'movie', 'photo-camera', 'museum', 'draw',

    // Sport i rekreacja
    'sports-baseball', 'sports-basketball', 'sports-football', 'sports-soccer', 'sports-tennis',
    'sports-volleyball', 'sports-golf', 'sports-handball', 'sports-kabaddi', 'sports-martial-arts',

    // Podróże i geografia
    'travel-explore', 'map', 'public', 'language', 'flight',
    'train', 'directions-boat', 'directions-car', 'motorcycle', 'commute',

    // Historia i archeologia
    'history-edu', 'castle', 'account-balance', 'temple-buddhist',
    'temple-hindu', 'mosque', 'church', 'synagogue', 'fort',

    // Biznes i finanse
    'business-center', 'work', 'attach-money', 'savings', 'trending-up',
    'account-balance-wallet', 'euro', 'currency-exchange', 'receipt', 'credit-card',

    // Kulinaria
    'restaurant', 'local-cafe', 'nightlife', 'cake', 'wine-bar',
    'bakery-dining', 'icecream', 'set-meal', 'ramen-dining', 'rice-bowl',

    // Dom i ogród
    'home', 'apartment', 'yard', 'balcony', 'bathtub',
    'bed', 'chair', 'flatware', 'kitchen', 'light',

    // Fantasy i sci-fi
    'auto-awesome', 'star', 'rocket', 'public-off', 'visibility-off',
    'sunny', 'thunderstorm', 'whatshot', 'flare',

    // Kryminały i thrillery
    'fingerprint', 'search', 'gavel', 'policy', 'security',
    'visibility', 'remove-red-eye', 'lock', 'vpn-key', 'shield',

    // Romans i literatura obyczajowa
    'favorite', 'celebration', 'mood', 'sentiment-satisfied', 'heart-broken',
    'diamond', 'spa', 'hotel',

    // Literatura dziecięca
    'child-friendly', 'toys', 'crib', 'school', 'face',
    'emoji-people', 'cake', 'park',
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
                        {/* Icon preview at the top */}
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

                        {/* Close button with border radius 20 */}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <View style={styles.closeButtonCircle}>
                                <Text style={styles.closeButtonText}>×</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Full width confirm button */}
                        <TouchableOpacity
                            style={[styles.confirmButton, !localCollectionName.trim() && styles.disabledButton]}
                            onPress={handleConfirm}
                            disabled={!localCollectionName.trim()}
                            activeOpacity={0.7}
                        >
                            <LinearGradient
                                colors={!localCollectionName.trim() ?
                                    [colors.primary, colors.primary] :
                                    [colors.primary, colors.primary]}
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
});

export default AddCollectionModal;
// AddCollectionModal.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList } from 'react-native';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from './styles';
import { BOOK_ICONS } from "@/app/utils/constants";
import { useAppContext } from '@/context/AppContext';
import { CustomAlertModal } from '@/app/components/alerts/CustomAlertModal';
import CategoriesManager from '../../collectionsScreen/CategoriesManager';

interface AddCollectionModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (name: string, categories: string[], icon: string) => void;
}

const AddCollectionModal: React.FC<AddCollectionModalProps> = ({ visible, onClose, onConfirm }) => {
    const { t } = useTranslation();
    const { checkDuplicateCollection } = useAppContext();
    const [localCollectionName, setLocalCollectionName] = useState('');
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedIcon, setSelectedIcon] = useState('book');
    const [showIcons, setShowIcons] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'error' as 'info' | 'success' | 'error' | 'warning'
    });

    const handleAddCategory = (collectionName: string, category: string) => {
        setCategories([...categories, category]);
    };

    const handleRemoveCategory = (collectionName: string, category: string) => {
        setCategories(categories.filter(c => c !== category));
    };

    const handleConfirm = () => {
        if (!localCollectionName.trim()) {
            setAlertConfig({
                title: t('alerts.error'),
                message: t('alerts.collectionNameRequired'),
                type: 'error'
            });
            setAlertVisible(true);
            return;
        }

        if (checkDuplicateCollection(localCollectionName)) {
            setAlertConfig({
                title: t('alerts.error'),
                message: t('alerts.collectionExists'),
                type: 'error'
            });
            setAlertVisible(true);
            return;
        }

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
        <>
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

                            <CategoriesManager
                                collectionName={localCollectionName || 'new'}
                                collectionCategories={{ 'new': categories }}
                                onAddCategory={handleAddCategory}
                                onRemoveCategory={handleRemoveCategory}
                            />

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

            <CustomAlertModal
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onConfirm={() => setAlertVisible(false)}
                buttonFullWidth={true}
            />
        </>
    );
};

export default AddCollectionModal;
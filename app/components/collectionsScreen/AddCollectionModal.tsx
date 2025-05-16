// app/components/modals/AddCollectionModal.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import CategoriesManager from '../collectionsScreen/CategoriesManager';

interface AddCollectionModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (name: string, categories: string[]) => void;
}

const AddCollectionModal: React.FC<AddCollectionModalProps> = ({ visible, onClose, onConfirm }) => {
    const { t } = useTranslation();
    const [localCollectionName, setLocalCollectionName] = useState('');
    const [categories, setCategories] = useState<string[]>([]);

    const handleAddCategory = (collectionName: string, category: string) => {
        setCategories([...categories, category]);
    };

    const handleRemoveCategory = (collectionName: string, category: string) => {
        setCategories(categories.filter(c => c !== category));
    };

    const handleConfirm = () => {
        if (!localCollectionName.trim()) return;
        onConfirm(localCollectionName, categories);
        setLocalCollectionName('');
        setCategories([]);
        onClose();
    };

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>{t('labels.addNewCollection')}</Text>

                    <TextInput
                        style={styles.modalInput}
                        placeholder={t('placeholders.enterCollectionName')}
                        placeholderTextColor="#888"
                        value={localCollectionName}
                        onChangeText={setLocalCollectionName}
                        autoFocus
                    />

                    <CategoriesManager
                        collectionName="new"
                        collectionCategories={{ new: categories }}
                        onAddCategory={handleAddCategory}
                        onRemoveCategory={handleRemoveCategory}
                    />

                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>{t('buttons.cancel')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.confirmButton]}
                            onPress={handleConfirm}
                            disabled={!localCollectionName.trim()}
                        >
                            <Text style={styles.confirmButtonText}>{t('buttons.add')}</Text>
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
        borderRadius: 2,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.black,
        marginBottom: 15,
    },
    modalInput: {
        height: 50,
        borderColor: 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        borderRadius: 2,
        paddingHorizontal: 16,
        backgroundColor: colors.white,
        marginBottom: 15,
        color: colors.black,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 2,
        marginLeft: 10,
    },
    cancelButton: {
        backgroundColor: colors.white,
    },
    confirmButton: {
        backgroundColor: colors.white,
    },
    cancelButtonText: {
        color: colors.primary,
    },
    confirmButtonText: {
        color: colors.primary,
    },
});

export default AddCollectionModal;
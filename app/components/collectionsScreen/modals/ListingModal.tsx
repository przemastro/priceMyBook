// app/components/modals/ListingModal.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import { FontAwesome5 } from '@expo/vector-icons';

interface ListingModalProps {
    visible: boolean;
    onClose: () => void;
    selectedPlatforms: ('amazon' | 'allegro' | 'olx')[];
    onTogglePlatform: (platform: 'amazon' | 'allegro' | 'olx') => void;
    onConfirm: () => void;
}

const ListingModal: React.FC<ListingModalProps> = ({
                                                       visible,
                                                       onClose,
                                                       selectedPlatforms,
                                                       onTogglePlatform,
                                                       onConfirm
                                                   }) => {
    const { t } = useTranslation();

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>{t('listingModal.title')}</Text>
                    <TouchableOpacity
                        style={[styles.platformButton, selectedPlatforms.includes('amazon') && styles.platformButtonSelected]}
                        onPress={() => onTogglePlatform('amazon')}
                    >
                        <FontAwesome5 name="amazon" size={20} color={selectedPlatforms.includes('amazon') ? colors.white : colors.primary}/>
                        <Text style={[styles.platformButtonText, selectedPlatforms.includes('amazon') && styles.platformButtonTextSelected]}>
                            {t('platforms.amazon')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.platformButton, selectedPlatforms.includes('allegro') && styles.platformButtonSelected]}
                        onPress={() => onTogglePlatform('allegro')}
                    >
                        <FontAwesome5 name="shopping-bag" size={20} color={selectedPlatforms.includes('allegro') ? colors.white : colors.primary}/>
                        <Text style={[styles.platformButtonText, selectedPlatforms.includes('allegro') && styles.platformButtonTextSelected]}>
                            {t('platforms.allegro')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.platformButton, selectedPlatforms.includes('olx') && styles.platformButtonSelected]}
                        onPress={() => onTogglePlatform('olx')}
                    >
                        <Text style={{color: selectedPlatforms.includes('olx') ? colors.white : colors.primary, fontWeight: 'bold', fontSize: 14}}>Olx</Text>
                        <Text style={[styles.platformButtonText, selectedPlatforms.includes('olx') && styles.platformButtonTextSelected]}>
                            {t('platforms.olx')}
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>{t('buttons.cancel')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.confirmButton]}
                            onPress={onConfirm}
                            disabled={selectedPlatforms.length === 0}
                        >
                            <Text style={styles.confirmButtonText}>{t('buttons.listModal')}</Text>
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
    platformButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginVertical: 5,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    platformButtonSelected: {
        backgroundColor: colors.primary,
    },
    platformButtonText: {
        marginLeft: 10,
        color: colors.primary,
    },
    platformButtonTextSelected: {
        color: colors.white,
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

export default ListingModal;
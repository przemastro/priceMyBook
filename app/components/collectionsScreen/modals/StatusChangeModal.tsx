// app/components/modals/StatusChangeModal.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import { FontAwesome5 } from '@expo/vector-icons';

interface StatusChangeModalProps {
    visible: boolean;
    onClose: () => void;
    currentStatus: 'notListed' | 'listed' | 'sold';
    onChangeStatus: (newStatus: 'notListed' | 'listed' | 'sold') => void;
}

const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
                                                                 visible,
                                                                 onClose,
                                                                 currentStatus,
                                                                 onChangeStatus
                                                             }) => {
    const { t } = useTranslation();

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>{t('statusChangeModal.title')}</Text>
                    {currentStatus === 'listed' && (
                        <>
                            <TouchableOpacity style={styles.statusButton} onPress={() => onChangeStatus('sold')}>
                                <FontAwesome5 name="check-circle" size={20} color={colors.success}/>
                                <Text style={styles.statusButtonText}>{t('statusChangeModal.markAsSold')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.statusButton} onPress={() => onChangeStatus('notListed')}>
                                <FontAwesome5 name="times-circle" size={20} color={colors.error}/>
                                <Text style={styles.statusButtonText}>{t('statusChangeModal.cancelListing')}</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    {currentStatus === 'sold' && (
                        <TouchableOpacity style={styles.statusButton} onPress={() => onChangeStatus('notListed')}>
                            <FontAwesome5 name="undo" size={20} color={colors.primary}/>
                            <Text style={styles.statusButtonText}>{t('statusChangeModal.relist')}</Text>
                        </TouchableOpacity>
                    )}
                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>{t('buttons.cancel')}</Text>
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
    statusButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginVertical: 5,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.gray,
    },
    statusButtonText: {
        marginLeft: 10,
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
    cancelButtonText: {
        color: colors.primary,
    },
});

export default StatusChangeModal;
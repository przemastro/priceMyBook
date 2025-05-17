import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors } from '@/styles/styles';
import { BookDefect } from './types';

interface ScanDefectModalProps {
    visible: boolean;
    defect: BookDefect | null;
    onAccept: () => void;
    onReject: () => void;
}

const ScanDefectModal = ({ visible, defect, onAccept, onReject }: ScanDefectModalProps) => {
    const { t } = useTranslation();

    if (!defect) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onReject}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>
                        {t('labels.defectDetected')}
                    </Text>

                    <View style={styles.modalContent}>
                        <View style={styles.modalDefectInfo}>
                            <Ionicons
                                name={defect.icon as any}
                                size={32}
                                color={colors.primary}
                                style={styles.modalDefectIcon}
                            />
                            <Text style={styles.modalDefectName}>
                                {t(`defects.${defect.id}`)}
                            </Text>
                        </View>

                        <Text style={styles.modalText}>
                            {t('labels.confidence')}: <Text style={styles.modalBoldText}>{defect.confidence}%</Text>
                        </Text>
                        <Text style={styles.modalText}>
                            {t('labels.priceReduction')}: <Text style={styles.modalBoldText}>{defect.priceReduction}%</Text>
                        </Text>
                    </View>

                    <View style={styles.modalButtonsContainer}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.rejectButton]}
                            onPress={onReject}
                        >
                            <Text style={styles.rejectButtonText}>
                                {t('buttons.reject')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.acceptButton]}
                            onPress={onAccept}
                        >
                            <Text style={styles.acceptButtonText}>
                                {t('buttons.confirmDefect')}
                            </Text>
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
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 15,
        color: colors.black,
        textAlign: 'left',
    },
    modalContent: {
        marginBottom: 20,
    },
    modalDefectInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalDefectIcon: {
        marginRight: 10,
    },
    modalDefectName: {
        fontSize: 18,
        fontWeight: '500',
        color: colors.black,
    },
    modalText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 8,
        textAlign: 'left',
    },
    modalBoldText: {
        fontWeight: '600',
        color: colors.black,
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
    },
    modalButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 2,
        marginLeft: 10,
    },
    acceptButton: {
        backgroundColor: 'transparent',
    },
    rejectButton: {
        backgroundColor: 'transparent',
    },
    acceptButtonText: {
        color: colors.primary,
        fontWeight: '500',
    },
    rejectButtonText: {
        color: colors.primary,
        fontWeight: '500',
    },
});

export default ScanDefectModal;
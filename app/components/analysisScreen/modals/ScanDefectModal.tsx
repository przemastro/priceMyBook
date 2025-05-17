import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors } from '@/styles/styles';
import { styles } from './styles';
import { BookDefect } from '../types';

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

export default ScanDefectModal;
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors } from '@/styles/styles';
import { LinearGradient } from 'expo-linear-gradient';
import { BookDefect } from '../types';
import { styles } from './styles';

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
            <View style={localStyles.modalOverlay}>
                <View style={localStyles.modalContainer}>
                    <TouchableOpacity
                        style={localStyles.closeButton}
                        onPress={onReject}
                        activeOpacity={0.7}
                    >
                        <View style={localStyles.closeButtonCircle}>
                            <Text style={localStyles.closeButtonText}>×</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={localStyles.modalContent}>
                        <View style={styles.iconPreviewContainer}>
                            <View style={styles.iconPreviewCircle}>
                                <Ionicons
                                    name={defect.icon as any}
                                    size={42}
                                    color={colors.primary}
                                />
                            </View>
                        </View>

                        <Text style={styles.modalTitle}>
                            {t('labels.defectDetected')}
                        </Text>

                        <View style={styles.defectInfoContainer}>
                            <Text style={styles.defectName}>
                                {t(`defects.${defect.id}`)}
                            </Text>

                            <View style={styles.defectDetails}>
                                <Text style={styles.defectDetailText}>
                                    {t('labels.confidence')}:
                                    <Text style={styles.defectDetailValue}> {defect.confidence}%</Text>
                                </Text>
                                <Text style={styles.defectDetailText}>
                                    {t('labels.priceReduction')}:
                                    <Text style={styles.defectDetailValue}> {defect.priceReduction}%</Text>
                                </Text>
                            </View>
                        </View>

                        <View style={localStyles.buttonRow}>
                            <TouchableOpacity
                                style={[localStyles.actionButton, localStyles.acceptButton]}
                                onPress={onAccept}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={[colors.primary, colors.primary]}
                                    style={localStyles.buttonGradient}
                                >
                                    <Text style={localStyles.acceptButtonText}>
                                        {t('buttons.confirmDefect')}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const localStyles = StyleSheet.create({
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
    },
    modalContent: {
        padding: 24,
        paddingTop: 32,
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1,
    },
    closeButtonCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.grayLight,
    },
    closeButtonText: {
        fontSize: 20,
        color: colors.primary,
        lineHeight: 24,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginTop: 20,
    },
    actionButton: {
        borderRadius: 10,
        overflow: 'hidden',
        width: '100%',
        height: 50,
    },
    acceptButton: {
        backgroundColor: colors.primary,
    },
    buttonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    acceptButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.black,
        marginBottom: 16,
        textAlign: 'center',
    },
});

export default ScanDefectModal;
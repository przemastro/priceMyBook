import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors } from '@/styles/styles';
import { LinearGradient } from 'expo-linear-gradient';
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
                    {/* Close button */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onReject}
                        activeOpacity={0.7}
                    >
                        <View style={styles.closeButtonCircle}>
                            <Text style={styles.closeButtonText}>×</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.modalContent}>
                        {/* Icon preview */}
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
                                    <Text style={styles.defectDetailValue}> {defect.confidence?.toFixed(0)}%</Text>
                                </Text>
                                <Text style={styles.defectDetailText}>
                                    {t('labels.priceReduction')}:
                                    <Text style={styles.defectDetailValue}> {defect.priceReduction}%</Text>
                                </Text>
                            </View>
                        </View>

                        {/* Action buttons */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.acceptButton]}
                                onPress={onAccept}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={[colors.primary, colors.primary]}
                                    style={styles.buttonGradient}
                                >
                                    <Text style={styles.acceptButtonText}>
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
    },
    closeButtonCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(74,108,247,0.1)',
    },
    closeButtonText: {
        fontSize: 20,
        color: colors.primary,
        lineHeight: 24,
    },
    iconPreviewContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconPreviewCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.whiteBlue,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(74,108,247,0.1)',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.black,
        marginBottom: 16,
        textAlign: 'center',
    },
    defectInfoContainer: {
        width: '100%',
        marginBottom: 24,
        alignItems: 'center',
    },
    defectName: {
        fontSize: 18,
        fontWeight: '500',
        color: colors.black,
        marginBottom: 8,
        textAlign: 'center',
    },
    defectDetails: {
        width: '100%',
    },
    defectDetailText: {
        fontSize: 16,
        color: colors.grayDark,
        textAlign: 'center',
        marginBottom: 4,
    },
    defectDetailValue: {
        fontWeight: '600',
        color: colors.primary,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
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
    rejectButtonText: {
        color: colors.grayDark,
        fontSize: 16,
        fontWeight: '600',
    },
    acceptButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ScanDefectModal;
import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('statusChangeModal.title')}</Text>

                        {/* Close button */}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <View style={styles.closeButtonCircle}>
                                <Text style={styles.closeButtonText}>×</Text>
                            </View>
                        </TouchableOpacity>

                        {currentStatus === 'listed' && (
                            <>
                                <TouchableOpacity
                                    style={[
                                        styles.statusButton,
                                        styles.withShadow
                                    ]}
                                    onPress={() => onChangeStatus('sold')}
                                    activeOpacity={0.7}
                                >
                                    <LinearGradient
                                        colors={[colors.white, colors.whiteBlue]}
                                        style={styles.buttonGradient}
                                    >
                                        <View style={styles.buttonContent}>
                                            <FontAwesome5 name="check-circle" size={24} color={colors.success}/>
                                            <Text style={styles.statusButtonText}>
                                                {t('statusChangeModal.markAsSold')}
                                            </Text>
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.statusButton,
                                        styles.withShadow
                                    ]}
                                    onPress={() => onChangeStatus('notListed')}
                                    activeOpacity={0.7}
                                >
                                    <LinearGradient
                                        colors={[colors.white, colors.whiteBlue]}
                                        style={styles.buttonGradient}
                                    >
                                        <View style={styles.buttonContent}>
                                            <FontAwesome5 name="times-circle" size={24} color={colors.error}/>
                                            <Text style={styles.statusButtonText}>
                                                {t('statusChangeModal.cancelListing')}
                                            </Text>
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        )}

                        {currentStatus === 'sold' && (
                            <TouchableOpacity
                                style={[
                                    styles.statusButton,
                                    styles.withShadow
                                ]}
                                onPress={() => onChangeStatus('notListed')}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={[colors.white, colors.whiteBlue]}
                                    style={styles.buttonGradient}
                                >
                                    <View style={styles.buttonContent}>
                                        <FontAwesome5 name="undo" size={24} color={colors.primary}/>
                                        <Text style={styles.statusButtonText}>
                                            {t('statusChangeModal.relist')}
                                        </Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
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
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.black,
        marginBottom: 20,
        textAlign: 'center',
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
    statusButton: {
        height: 60,
        borderRadius: 10,
        marginBottom: 12,
        overflow: 'hidden',
    },
    buttonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusButtonText: {
        marginLeft: 15,
        fontSize: 16,
        color: colors.black,
        fontWeight: '500',
    },
    withShadow: {
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
});

export default StatusChangeModal;
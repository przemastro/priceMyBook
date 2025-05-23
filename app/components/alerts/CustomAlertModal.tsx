import React from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {LinearGradient} from "expo-linear-gradient";
import {Ionicons} from '@expo/vector-icons';
import {colors} from '@/styles/styles';

type AlertType = 'info' | 'success' | 'error' | 'warning';

interface CustomAlertModalProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    showCancel?: boolean;
    icon?: React.ReactNode;
    type?: AlertType;
}

export const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
                                                               visible,
                                                               title,
                                                               message,
                                                               confirmText = 'OK',
                                                               cancelText,
                                                               onConfirm,
                                                               onCancel,
                                                               showCancel = false,
                                                               icon,
                                                               type = 'info'
                                                           }) => {
    const getIconColor = () => {
        switch (type) {
            case 'success': return colors.success;
            case 'error': return colors.error;
            case 'warning': return colors.warning;
            default: return colors.primary;
        }
    };

    const defaultIcon = () => {
        switch (type) {
            case 'success': return <Ionicons name="checkmark-circle" size={48} color={getIconColor()} />;
            case 'error': return <Ionicons name="close-circle" size={48} color={getIconColor()} />;
            case 'warning': return <Ionicons name="warning" size={48} color={getIconColor()} />;
            default: return <Ionicons name="information-circle" size={48} color={getIconColor()} />;
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onCancel}
        >
            <View style={styles.alertModalOverlay}>
                <View style={styles.alertModalContainer}>
                    <View style={styles.alertModalContent}>
                        {icon || defaultIcon()}
                        <Text style={styles.alertModalTitle}>{title}</Text>
                        <Text style={styles.alertModalMessage}>{message}</Text>

                        <View style={styles.alertModalButtons}>
                            {showCancel && (
                                <TouchableOpacity
                                    style={[styles.alertModalButton, styles.alertModalCancelButton]}
                                    onPress={onCancel}
                                >
                                    <Text style={styles.alertModalCancelButtonText}>
                                        {cancelText || 'Cancel'}
                                    </Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[styles.alertModalButton, styles.alertModalConfirmButton]}
                                onPress={onConfirm}
                            >
                                <LinearGradient
                                    colors={[colors.primary, colors.primary]}
                                    style={styles.alertModalButtonGradient}
                                >
                                    <Text style={styles.alertModalConfirmButtonText}>
                                        {confirmText}
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
    alertModalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    alertModalContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    alertModalContent: {
        alignItems: 'center',
    },
    alertModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: colors.black,
        textAlign: 'center',
    },
    alertModalMessage: {
        fontSize: 16,
        marginBottom: 20,
        color: colors.grayDark,
        textAlign: 'center',
    },
    alertModalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    alertModalButton: {
        borderRadius: 8,
        overflow: 'hidden',
        minWidth: 100,
    },
    alertModalCancelButton: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray,
        padding: 12,
        marginRight: 10,
    },
    alertModalConfirmButton: {
        flex: 1,
    },
    alertModalButtonGradient: {
        padding: 12,
        alignItems: 'center',
    },
    alertModalCancelButtonText: {
        color: colors.grayDark,
        fontWeight: '500',
    },
    alertModalConfirmButtonText: {
        color: colors.white,
        fontWeight: '500',
    },
});

export default CustomAlertModal;
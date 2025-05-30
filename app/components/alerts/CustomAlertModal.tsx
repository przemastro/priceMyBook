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
    onConfirm: () => void;
    onCancel?: () => void;
    type?: AlertType;
    closeButtonStyle?: any;
    closeButtonTextStyle?: any;
    buttonFullWidth?: boolean;
}

export const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
                                                                      visible,
                                                                      title,
                                                                      message,
                                                                      confirmText = 'OK',
                                                                      onConfirm,
                                                                      type = 'info',
                                                                      closeButtonStyle,
                                                                      closeButtonTextStyle,
                                                                      buttonFullWidth = false,
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
            onRequestClose={onConfirm} // Zamknięcie modala po kliknięciu OK lub X
        >
            <View style={styles.alertModalOverlay}>
                <View style={styles.alertModalContainer}>
                    {/* Przycisk X w prawym górnym rogu */}
                    <TouchableOpacity
                        style={[styles.closeButton, closeButtonStyle]}
                        onPress={onConfirm}
                    >
                        <View style={styles.closeButtonCircle}>
                            <Text style={[styles.closeButtonText, closeButtonTextStyle]}>×</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.alertModalContent}>
                        {defaultIcon()}
                        <Text style={styles.alertModalTitle}>{title}</Text>
                        <Text style={styles.alertModalMessage}>{message}</Text>

                        {/* Przycisk OK na dole - jedyny główny przycisk */}
                        <TouchableOpacity
                            style={[
                                styles.alertModalButton,
                                buttonFullWidth && {width: '100%'}
                            ]}
                            onPress={onConfirm}
                        >
                            <LinearGradient
                                colors={[colors.primary, colors.primary]}
                                style={styles.alertModalButtonGradient}
                            >
                                <Text style={styles.alertModalButtonText}>
                                    {confirmText}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
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
        position: 'relative',
    },
    alertModalContent: {
        alignItems: 'center',
        paddingTop: 20,
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
        width: '100%'
    },
    alertModalConfirmButton: {
        flex: 1,
        backgroundColor: colors.primary
    },
    alertModalButtonGradient: {
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center', // Dodaj to jeśli brakuje
        width: '100%', // Upewnij się że ma pełną szerokość
    },
    alertModalConfirmButtonText: {
        color: colors.white,
        fontWeight: '500',
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
        borderColor: 'rgba(74,108,247,0.1)',
    },
    closeButtonText: {
        fontSize: 20,
        color: colors.primary,
        lineHeight: 24,
    },
    alertModalButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
});

export default CustomAlertModal;
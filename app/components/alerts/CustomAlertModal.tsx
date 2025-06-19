import React from 'react';
import {Modal, View, Text, TouchableOpacity} from 'react-native';
import {LinearGradient} from "expo-linear-gradient";
import {Ionicons} from '@expo/vector-icons';
import {colors} from '@/styles/styles';
import { styles } from './styles';

type AlertType = 'info' | 'success' | 'error' | 'warning';

interface CustomAlertModalProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
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
                                                                      cancelText = 'Cancel',
                                                                      onConfirm,
                                                                      onCancel,
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
            onRequestClose={onCancel || onConfirm}
        >
            <View style={styles.alertModalOverlay}>
                <View style={styles.alertModalContainer}>
                    {/* Przycisk X w prawym górnym rogu */}
                    <TouchableOpacity
                        style={[styles.closeButton, closeButtonStyle]}
                        onPress={onCancel || onConfirm}
                    >
                        <View style={styles.closeButtonCircle}>
                            <Text style={[styles.closeButtonText, closeButtonTextStyle]}>×</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.alertModalContent}>
                        {defaultIcon()}
                        <Text style={styles.alertModalTitle}>{title}</Text>
                        <Text style={styles.alertModalMessage}>{message}</Text>

                        <View style={styles.buttonContainer}>
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
            </View>
        </Modal>
    );
};

export default CustomAlertModal;
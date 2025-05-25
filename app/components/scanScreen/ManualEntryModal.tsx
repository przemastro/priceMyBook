import React from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Modal} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/styles/styles';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

interface ManualEntryModalProps {
    visible: boolean;
    onRequestClose: () => void;
    onManualSubmit: () => void;
    manualISBN: string;
    setManualISBN: (text: string) => void;
}

export const ManualEntryModal = ({
                                     visible,
                                     onRequestClose,
                                     onManualSubmit,
                                     manualISBN,
                                     setManualISBN
                                 }: ManualEntryModalProps) => {
    const { t } = useTranslation();

    if (!visible) return null;

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onRequestClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.iconPreviewContainer}>
                            <View style={styles.iconPreviewCircle}>
                                <MaterialIcons
                                    name="book"
                                    size={62}
                                    color={colors.primary}
                                />
                            </View>
                        </View>

                        <Text style={styles.modalTitle}>
                            {t('labels.enterISBNManually')}
                        </Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder={t('placeholders.enterISBN')}
                            placeholderTextColor={colors.gray}
                            keyboardType="numeric"
                            value={manualISBN}
                            onChangeText={setManualISBN}
                            autoFocus
                        />

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onRequestClose}
                            activeOpacity={0.7}
                        >
                            <View style={styles.closeButtonCircle}>
                                <Text style={styles.closeButtonText}>×</Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.confirmButton]}
                                onPress={onManualSubmit}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={[colors.primary, colors.primary]}
                                    style={styles.buttonGradient}
                                >
                                    <Text style={styles.confirmButtonText}>
                                        {t('buttons.submit')}
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
    iconPreviewContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconPreviewCircle: {
        width: 100,
        height: 100,
        borderRadius: 60,
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
        marginBottom: 8,
        textAlign: 'center',
    },
    modalInput: {
        height: 50,
        borderWidth: 1,
        borderColor: 'rgba(74,108,247,0.2)',
        borderRadius: 10,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        marginBottom: 24,
        color: colors.black,
        fontSize: 16,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
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
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 16,
    },
    actionButton: {
        borderRadius: 10,
        overflow: 'hidden',
        width: '100%',
        height: 50
    },
    cancelButton: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray,
    },
    confirmButton: {
        backgroundColor: colors.primary,
    },
    buttonGradient: {
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    cancelButtonText: {
        color: colors.grayDark,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 50,
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});
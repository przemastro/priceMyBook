import React from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography } from '@/styles/styles';

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
        <View style={styles.modalOverlay}>
            <View style={styles.manualModalContainer}>
                <Text style={styles.modalTitle}>
                    {t('labels.enterISBNManually')}
                </Text>

                <TextInput
                    style={styles.modalInput}
                    placeholder={t('placeholders.enterISBN')}
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    value={manualISBN}
                    onChangeText={setManualISBN}
                    autoFocus
                />

                <View style={styles.modalButtonsContainer}>
                    <TouchableOpacity
                        style={[styles.modalButton, styles.cancelButton]}
                        onPress={onRequestClose}
                    >
                        <Text style={styles.cancelButtonText}>
                            {t('buttons.cancel')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.modalButton, styles.submitButton]}
                        onPress={onManualSubmit}
                    >
                        <Text style={styles.submitButtonText}>
                            {t('buttons.submit')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    manualModalContainer: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 2,
        padding: 20,
        maxHeight: '40%',
    },
    modalTitle: {
        ...typography.h1,
        marginBottom: 16,
        textAlign: 'left',
        color: colors.black,
    },
    modalInput: {
        height: 50,
        borderColor: 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        borderRadius: 2,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        color: colors.black,
        marginVertical: 20,
        fontSize: 16,
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: colors.white,
    },
    submitButton: {
        backgroundColor: colors.white,
    },
    cancelButtonText: {
        color: colors.primary,
        fontWeight: '500',
    },
    submitButtonText: {
        color: colors.primary,
        fontWeight: '500',
    },
});
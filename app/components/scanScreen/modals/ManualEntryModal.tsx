import React from 'react';
import {View, Text, TextInput, TouchableOpacity, Modal} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/styles/styles';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from './styles'

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

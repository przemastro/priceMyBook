// app/components/modals/ListingModal.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ListingModalProps {
    visible: boolean;
    onClose: () => void;
    selectedPlatform: 'amazon' | 'allegro' | 'olx' | null;
    onSelectPlatform: (platform: 'amazon' | 'allegro' | 'olx') => void;
    onConfirm: () => void;
}

const ListingModal: React.FC<ListingModalProps> = ({
                                                       visible,
                                                       onClose,
                                                       selectedPlatform,
                                                       onSelectPlatform,
                                                       onConfirm
                                                   }) => {
    const { t } = useTranslation();

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('listingModal.title')}</Text>

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

                        {/* Platform selection */}
                        <TouchableOpacity
                            style={[
                                styles.platformButton,
                                selectedPlatform === 'amazon' && styles.platformButtonSelected
                            ]}
                            onPress={() => onSelectPlatform('amazon')}
                        >
                            <View style={styles.platformContent}>
                                <FontAwesome5
                                    name="amazon"
                                    size={24}
                                    color={selectedPlatform === 'amazon' ? colors.white : colors.primary}
                                />
                                <Text style={[
                                    styles.platformButtonText,
                                    selectedPlatform === 'amazon' && styles.platformButtonTextSelected
                                ]}>
                                    {t('platforms.amazon')}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.platformButton,
                                selectedPlatform === 'allegro' && styles.platformButtonSelected
                            ]}
                            onPress={() => onSelectPlatform('allegro')}
                        >
                            <View style={styles.platformContent}>
                                <FontAwesome5
                                    name="shopping-bag"
                                    size={24}
                                    color={selectedPlatform === 'allegro' ? colors.white : colors.primary}
                                />
                                <Text style={[
                                    styles.platformButtonText,
                                    selectedPlatform === 'allegro' && styles.platformButtonTextSelected
                                ]}>
                                    {t('platforms.allegro')}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.platformButton,
                                selectedPlatform === 'olx' && styles.platformButtonSelected
                            ]}
                            onPress={() => onSelectPlatform('olx')}
                        >
                            <View style={styles.platformContent}>
                                <Text style={{
                                    color: selectedPlatform === 'olx' ? colors.white : colors.primary,
                                    fontWeight: 'bold',
                                    fontSize: 16
                                }}>
                                    OLX
                                </Text>
                                <Text style={[
                                    styles.platformButtonText,
                                    selectedPlatform === 'olx' && styles.platformButtonTextSelected
                                ]}>
                                    {t('platforms.olx')}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Confirm button */}
                        <TouchableOpacity
                            style={[
                                styles.confirmButton,
                                !selectedPlatform && styles.disabledButton
                            ]}
                            onPress={onConfirm}
                            disabled={!selectedPlatform}
                            activeOpacity={0.7}
                        >
                            <LinearGradient
                                colors={!selectedPlatform
                                    ? [colors.gray, colors.gray]
                                    : [colors.primary, colors.primary]}
                                style={styles.buttonGradient}
                            >
                                <Text style={styles.confirmButtonText}>{t('buttons.listModal')}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
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
    platformButton: {
        height: 60,
        borderWidth: 1,
        borderColor: 'rgba(74,108,247,0.2)',
        borderRadius: 10,
        paddingHorizontal: 16,
        marginBottom: 12,
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    platformButtonSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    platformContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    platformButtonText: {
        marginLeft: 15,
        fontSize: 16,
        color: colors.primary,
    },
    platformButtonTextSelected: {
        color: colors.white,
    },
    confirmButton: {
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 20,
    },
    disabledButton: {
        opacity: 0.7,
    },
    buttonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ListingModal;
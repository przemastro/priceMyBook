import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './styles'

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
            <View style={localStyles.modalOverlay}>
                <View style={localStyles.modalContainer}>
                    <View style={localStyles.modalContent}>
                        <Text style={localStyles.modalTitle}>{t('listingModal.title')}</Text>

                        {/* Close button */}
                        <TouchableOpacity
                            style={localStyles.closeButton}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <View style={localStyles.closeButtonCircle}>
                                <Text style={localStyles.closeButtonText}>×</Text>
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
                                localStyles.confirmButton,
                                !selectedPlatform && localStyles.disabledButton
                            ]}
                            onPress={onConfirm}
                            disabled={!selectedPlatform}
                            activeOpacity={0.7}
                        >
                            <LinearGradient
                                colors={!selectedPlatform
                                    ? [colors.gray, colors.gray]
                                    : [colors.primary, colors.primary]}
                                style={localStyles.buttonGradient}
                            >
                                <Text style={localStyles.confirmButtonText}>{t('buttons.listModal')}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const localStyles = StyleSheet.create({
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
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.transparentBlack,
    },
    modalContainer: {
        width: '90%',
        backgroundColor: colors.white,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: colors.blackDark,
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
        borderColor: colors.transparentLightPrimary,
    },
    closeButtonText: {
        fontSize: 24,
        color: colors.primary,
    },
});

export default ListingModal;
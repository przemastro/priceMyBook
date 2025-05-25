import React from 'react';
import {
    View,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Text,
    Modal,
    Image
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { BookInfo } from './types';
import { colors } from '@/styles/styles';
import { BookInfoDisplay } from './BookInfoDisplay';
import { AmazonPriceButtons } from './AmazonPriceButtons';
import { RateLimitStatus } from './RateLimitStatus';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

interface ScanResultModalProps {
    visible: boolean;
    onRequestClose: () => void;
    onPriceSubmit: () => void;
    loading: boolean;
    bookInfo: BookInfo | null;
    isbn: string | null;
    manualPrice: string;
    setManualPrice: (text: string) => void;
    selectedPrice: number | null;
    setSelectedPrice: (price: any) => void;
    currentLang: string;
}

export const ScanResultModal: React.FC<ScanResultModalProps> = ({
                                                                    visible,
                                                                    onRequestClose,
                                                                    onPriceSubmit,
                                                                    loading,
                                                                    bookInfo,
                                                                    isbn,
                                                                    manualPrice,
                                                                    setManualPrice,
                                                                    selectedPrice,
                                                                    setSelectedPrice,
                                                                    currentLang,
                                                                }) => {
    const { t } = useTranslation();

    if (!visible) return null;

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onRequestClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Close button */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onRequestClose}
                        activeOpacity={0.7}
                    >
                        <View style={styles.closeButtonCircle}>
                            <Text style={styles.closeButtonText}>×</Text>
                        </View>
                    </TouchableOpacity>

                    <ScrollView
                        contentContainerStyle={styles.modalScrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {loading ? (
                            <ActivityIndicator size="large" color={colors.primary} />
                        ) : (
                            <>
                                <BookInfoDisplay bookInfo={bookInfo} isbn={isbn} />
                                <RateLimitStatus style={styles.rateLimitContainer} />

                                <View style={styles.priceInputContainer}>
                                    {bookInfo?.price && (
                                        <Text style={styles.suggestedPriceText}>
                                            {t('bookInfo.suggestedPrice')}: {bookInfo.price.toFixed(2)}{' '}
                                            {bookInfo?.amazonData?.prices?.[0]?.currency || (currentLang === 'pl' ? 'PLN' : 'USD')}
                                        </Text>
                                    )}
                                    {(!bookInfo?.price && !bookInfo?.amazonData) && (
                                        <Text style={styles.suggestedPriceText}>
                                            {t('bookInfo.noPrice')}
                                        </Text>
                                    )}

                                    <AmazonPriceButtons
                                        amazonData={bookInfo?.amazonData}
                                        selectedPrice={selectedPrice}
                                        setSelectedPrice={setSelectedPrice}
                                        setManualPrice={setManualPrice}
                                    />

                                    <TextInput
                                        style={styles.input}
                                        placeholder={currentLang === 'pl'
                                            ? t('placeholders.enterPricePLN')
                                            : t('placeholders.enterPriceUSD')}
                                        placeholderTextColor={colors.grayDark}
                                        keyboardType="numeric"
                                        value={manualPrice}
                                        onChangeText={(text) => {
                                            setManualPrice(text);
                                            setSelectedPrice(null);
                                        }}
                                        autoFocus={!bookInfo?.price && !bookInfo?.amazonData}
                                    />
                                </View>

                                <View style={styles.modalButtonsContainer}>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.submitButton]}
                                        onPress={onPriceSubmit}
                                    >
                                        <LinearGradient
                                            colors={[colors.primary, colors.primary]}
                                            style={styles.buttonGradient}
                                        >
                                            <Text style={styles.submitButtonText}>
                                                {t('buttons.continue')}
                                            </Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </ScrollView>
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
        padding: 20,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1, // Ensure it's above other elements
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
    modalScrollContent: {
        paddingBottom: 20,
    },
    priceInputContainer: {
        width: '100%',
        marginBottom: 16,
    },
    suggestedPriceText: {
        fontSize: 14,
        marginBottom: 8,
        color: colors.primary,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: 'rgba(74,108,247,0.2)',
        borderRadius: 10,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        color: colors.black,
        marginTop: 10,
        fontSize: 16,
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
    },
    modalButton: {
        borderRadius: 10,
        overflow: 'hidden',
        width: '100%',
        height: 50,
    },
    submitButton: {
        backgroundColor: colors.primary,
    },
    buttonGradient: {
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    rateLimitContainer: {
        position: 'absolute',
        marginTop: 80,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 5,
        padding: 5,
        width: 320
    },
});
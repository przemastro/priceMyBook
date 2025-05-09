import React from 'react';
import {
    View,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Text,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { BookInfo } from './types';
import { colors, typography } from '@/styles/styles';
import { BookInfoDisplay } from './BookInfoDisplay';
import { AmazonPriceButtons } from './AmazonPriceButtons';

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
        <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
                <ScrollView
                    contentContainerStyle={styles.modalScrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {loading ? (
                        <ActivityIndicator size="large" color={colors.primary} />
                    ) : (
                        <>
                            <BookInfoDisplay bookInfo={bookInfo} isbn={isbn} />

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
                                    placeholderTextColor="#888"
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
                                    style={styles.cancelButton}
                                    onPress={onRequestClose}
                                >
                                    <Text style={styles.cancelButtonText}>
                                        {t('buttons.cancel')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.primaryButton}
                                    onPress={onPriceSubmit}
                                >
                                    <Text style={styles.continueButtonText}>
                                        {t('buttons.continue')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </ScrollView>
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
    modalContainer: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 2,
        padding: 20,
        maxHeight: '80%',
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
        borderColor: 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        borderRadius: 2,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        color: colors.black,
        marginTop: 10,
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
    },
    primaryButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginLeft: 10,
    },
    continueButtonText: {
        color: colors.primary,
        fontWeight: '500',
    },
    cancelButton: {
        backgroundColor: colors.white,
    },
    cancelButtonText: {
        color: colors.primary,
        fontWeight: '500',
    },
});
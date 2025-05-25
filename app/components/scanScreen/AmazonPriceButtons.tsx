import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AmazonApiResponse, AmazonPriceOffer } from './types';
import { colors } from '@/styles/styles';
import { LinearGradient } from 'expo-linear-gradient';

interface AmazonPriceButtonsProps {
    amazonData: AmazonApiResponse | undefined;
    selectedPrice: number | null;
    setSelectedPrice: (price: number) => void;
    setManualPrice: (text: string) => void;
}

export const AmazonPriceButtons = ({
                                       amazonData,
                                       selectedPrice,
                                       setSelectedPrice,
                                       setManualPrice
                                   }: AmazonPriceButtonsProps) => {
    const { t } = useTranslation();

    if (!amazonData?.prices || amazonData.prices.length === 0) {
        return null;
    }

    return (
        <View style={styles.amazonPricesContainer}>
            <Text style={styles.amazonPricesTitle}>
                {t('bookInfo.amazonPrices')} ({amazonData.marketplace}):
            </Text>
            {amazonData.prices.map((offer: AmazonPriceOffer, index: number) => (
                <TouchableOpacity
                    key={index}
                    style={[
                        styles.amazonPriceButton,
                        selectedPrice === offer.price && styles.amazonPriceButtonSelected
                    ]}
                    onPress={() => {
                        setSelectedPrice(offer.price);
                        setManualPrice('');
                    }}
                >
                    <LinearGradient
                        colors={selectedPrice === offer.price
                            ? [colors.buttonSelected1, colors.buttonSelected2]
                            : [colors.white, colors.whiteBlue]}
                        style={styles.priceButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Text style={[
                            styles.amazonPriceText,
                            selectedPrice === offer.price && styles.selectedPriceText
                        ]}>
                            {offer.price.toFixed(2)} {offer.currency}
                        </Text>
                        <Text style={[
                            styles.amazonPriceDetails,
                            selectedPrice === offer.price && styles.selectedPriceDetails
                        ]}>
                            {offer.condition} • {offer.seller} • {offer.deliveryTime}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    amazonPricesContainer: {
        marginVertical: 10,
    },
    amazonPricesTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: colors.black,
        textAlign: 'center',
    },
    amazonPriceButton: {
        borderRadius: 8,
        marginBottom: 8,
        overflow: 'hidden',
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    amazonPriceButtonSelected: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    priceButtonGradient: {
        padding: 12,
    },
    amazonPriceText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.secondary,
    },
    selectedPriceText: {
        color: colors.primary,
    },
    amazonPriceDetails: {
        fontSize: 12,
        color: colors.grayDark,
        marginTop: 4,
    },
    selectedPriceDetails: {
        color: colors.primary,
    },
});
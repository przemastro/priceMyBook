import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AmazonApiResponse, AmazonPriceOffer } from '../types';
import { colors } from '@/styles/styles';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './styles'

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
            {amazonData.prices.map((offer: AmazonPriceOffer) => (
                <TouchableOpacity
                    key={`price-${offer.price}-${offer.seller}-${offer.condition}`}
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
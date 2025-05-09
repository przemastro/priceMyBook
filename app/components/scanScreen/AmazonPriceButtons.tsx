import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AmazonApiResponse, AmazonPriceOffer } from './types';
import { colors } from '@/styles/styles';

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
                    <Text style={styles.amazonPriceText}>
                        {offer.price.toFixed(2)} {offer.currency}
                    </Text>
                    <Text style={styles.amazonPriceDetails}>
                        {offer.condition} • {offer.seller} • {offer.deliveryTime}
                    </Text>
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
        fontWeight: 'bold' as const, // Explicitly type as 'bold'
        marginBottom: 8,
        color: colors.black,
        textAlign: 'center' as const,
    },
    amazonPriceButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 2,
        padding: 10,
        marginBottom: 8,
        backgroundColor: '#f9f9f9',
    },
    amazonPriceButtonSelected: {
        borderColor: colors.primary,
        backgroundColor: '#e6f7ff',
    },
    amazonPriceText: {
        fontWeight: 'bold' as const,
        color: colors.black,
    },
    amazonPriceDetails: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
});
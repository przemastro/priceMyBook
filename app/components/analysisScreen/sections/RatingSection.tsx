// components/analysisScreen/RatingSection.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { styles } from './styles';
import Animated from 'react-native-reanimated';

interface RatingSectionProps {
    bookRating: number;
    averageUsedPrice: number | null;
    finalPrice: number;
    expanded: boolean;
    toggleExpanded: () => void;
    onShowMarketAnalysis: () => void;
    formatPrice: (price: number) => string;
    children: React.ReactNode;
}

export const RatingSection: React.FC<RatingSectionProps> = ({
                                                                bookRating,
                                                                averageUsedPrice,
                                                                finalPrice,
                                                                expanded,
                                                                toggleExpanded,
                                                                onShowMarketAnalysis,
                                                                formatPrice,
                                                                children
                                                            }) => {
    return (
        <LinearGradient
            colors={[colors.buttonSelected1, colors.buttonSelected2]}
            start={[0, 0]}
            end={[1, 1]}
            style={styles.ratingOuterContainer}
        >
            <View style={styles.ratingContainer}>
                <View style={styles.ratingHeader}>
                    <Text style={styles.ratingTitle}>Stan książki</Text>
                    <View style={styles.ratingStars}>
                        {[...Array(10)].map((_, i) => (
                            <Ionicons
                                key={i}
                                name={i < bookRating ? 'star' : 'star-outline'}
                                size={20}
                                color={i < bookRating ? colors.primary : colors.grayLight}
                            />
                        ))}
                    </View>
                    <Text style={styles.ratingText}>
                        {`${bookRating}/10 - ${
                            bookRating >= 8 ? 'Doskonały' :
                                bookRating >= 6 ? 'Dobry' :
                                    bookRating >= 4 ? 'Średni' :
                                        'Słaby'
                        }`}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.priceSummarySection}
                    onPress={toggleExpanded}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={[colors.white, colors.whiteBlue]}
                        style={styles.priceSummaryGradient}
                    >
                        <View style={styles.priceRow}>
                            <View style={styles.priceLabelContainer}>
                                <Ionicons name="book-outline" size={16} color={colors.secondary} />
                                <Text style={styles.priceLabel}>
                                    Średnia cena używana:
                                </Text>
                            </View>
                            <Text style={styles.priceValue}>
                                {averageUsedPrice ? formatPrice(averageUsedPrice) : 'Brak danych'}
                            </Text>
                        </View>

                        <View style={styles.separator} />

                        <View style={styles.priceRow}>
                            <View style={styles.priceLabelContainer}>
                                <Ionicons name="cash-outline" size={16} color={colors.primary} />
                                <Text style={[styles.priceLabel, styles.estimatedPriceLabel]}>
                                    Szacowana wartość:
                                </Text>
                            </View>
                            <View style={styles.estimatedPriceContainer}>
                                <Text style={[styles.priceValue, styles.estimatedPriceValue]}>
                                    {formatPrice(finalPrice)}
                                </Text>
                                <Ionicons
                                    name={expanded ? "chevron-up" : "chevron-down"}
                                    size={16}
                                    color={colors.primary}
                                    style={styles.expandIcon}
                                />
                            </View>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                <Animated.View
                    style={[
                        styles.tooltip,
                        {
                            opacity: expanded ? 1 : 0,
                            display: expanded ? 'flex' : 'none',
                        }
                    ]}
                >
                    {children}
                </Animated.View>
            </View>
        </LinearGradient>
    );
};

// components/analysisScreen/RatingSection.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/styles/styles';
import Animated from 'react-native-reanimated';
import { styles } from './styles'

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
                                                                children,
                                                            }) => {
    const getRatingLabel = (rating: number) => {
        if (rating >= 8) return 'Doskonały';
        if (rating >= 6) return 'Dobry';
        if (rating >= 4) return 'Średni';
        return 'Słaby';
    };

    return (
        <View style={localStyles.container}>
            <LinearGradient
                colors={[colors.buttonSelected1, colors.buttonSelected2]}
                style={styles.card}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <View style={styles.headerRow}>
                    <Text style={styles.sectionTitle}>Stan książki</Text>
                    <View style={styles.stars}>
                        {[...Array(10)].map((_, i) => (
                            <Ionicons
                                key={i}
                                name={i < bookRating ? 'star' : 'star-outline'}
                                size={16}
                                color={i < bookRating ? colors.primary : colors.grayLight}
                            />
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.infoBox}
                    onPress={toggleExpanded}
                    activeOpacity={0.8}
                >
                    <View style={styles.row}>
                        <Ionicons name="book-outline" size={14} color={colors.secondary} />
                        <Text style={styles.label}>Stan:</Text>
                        <Text style={styles.value}>{`${bookRating}/10 - ${getRatingLabel(bookRating)}`}</Text>
                    </View>

                    <View style={localStyles.separator} />

                    <View style={styles.row}>
                        <Ionicons name="pricetag-outline" size={14} color={colors.secondary} />
                        <Text style={styles.label}>Średnia cena używana:</Text>
                        <Text style={styles.value}>
                            {averageUsedPrice ? formatPrice(averageUsedPrice) : 'Brak danych'}
                        </Text>
                    </View>

                    <View style={localStyles.separator} />

                    <View style={styles.row}>
                        <Ionicons name="cash-outline" size={14} color={colors.primary} />
                        <Text style={[styles.label, { fontWeight: '600' }]}>Szacowana wartość:</Text>
                        <View style={styles.estimatedRow}>
                            <Text style={[styles.value, { fontWeight: '600' }]}>{formatPrice(finalPrice)}</Text>
                            <Ionicons
                                name={expanded ? 'chevron-up' : 'chevron-down'}
                                size={14}
                                color={colors.primary}
                            />
                        </View>
                    </View>
                </TouchableOpacity>

                <Animated.View
                    style={[
                        styles.expandedContainer,
                        {
                            opacity: expanded ? 1 : 0,
                            display: expanded ? 'flex' : 'none',
                        },
                    ]}
                >
                    {children}
                </Animated.View>
            </LinearGradient>
        </View>
    );
};

const localStyles = StyleSheet.create({
    container: {
        marginBottom: 20,
        paddingHorizontal: 0,
    },
    separator: {
        height: 1,
        backgroundColor: colors.grayLight,
        marginVertical: 6,
        opacity: 0.3,
    },
});

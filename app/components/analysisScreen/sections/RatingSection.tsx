// components/analysisScreen/RatingSection.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/styles/styles';
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
                                                                children,
                                                            }) => {
    const getRatingLabel = (rating: number) => {
        if (rating >= 8) return 'Doskonały';
        if (rating >= 6) return 'Dobry';
        if (rating >= 4) return 'Średni';
        return 'Słaby';
    };

    return (
        <View style={styles.container}>
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

                    <View style={styles.separator} />

                    <View style={styles.row}>
                        <Ionicons name="pricetag-outline" size={14} color={colors.secondary} />
                        <Text style={styles.label}>Średnia cena używana:</Text>
                        <Text style={styles.value}>
                            {averageUsedPrice ? formatPrice(averageUsedPrice) : 'Brak danych'}
                        </Text>
                    </View>

                    <View style={styles.separator} />

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

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        paddingHorizontal: 0,
    },
    card: {
        borderRadius: 20,
        padding: 16,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.blackDark,
    },
    stars: {
        flexDirection: 'row',
    },
    infoBox: {
        backgroundColor: 'transparent',
        borderRadius: 12,
        padding: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    estimatedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginLeft: 'auto',
    },
    label: {
        fontSize: 13,
        color: colors.black,
    },
    value: {
        fontSize: 13,
        color: colors.blackDark,
        marginLeft: 'auto',
    },
    separator: {
        height: 1,
        backgroundColor: colors.grayLight,
        marginVertical: 6,
        opacity: 0.3,
    },
    expandedContainer: {
        marginTop: 12,
    },
});

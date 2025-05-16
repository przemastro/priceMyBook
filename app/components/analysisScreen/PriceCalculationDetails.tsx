import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors } from '@/styles/styles';

interface PriceCalculation {
    basePrice: number;
    defectsReduction: number;
    uniquenessBonus: number;
    marketModifier: number;
    finalPrice: number;
}

interface PriceCalculationDetailsProps {
    calculation: PriceCalculation;
    defects: Array<{
        id: string;
        selected: boolean;
        count: number;
    }>;
    uniqueness: Record<string, boolean>;
    marketFactors: {
        demand: string;
        supply: string;
        publicationYear: number;
    };
    onShowMarketAnalysis: () => void;
    averageUsedPrice?: number | null;
    formatPrice: (price: number) => string;
}

const PriceCalculationDetails = ({
                                     calculation,
                                     defects,
                                     uniqueness,
                                     marketFactors,
                                     onShowMarketAnalysis,
                                     averageUsedPrice,
                                     formatPrice
                                 }: PriceCalculationDetailsProps) => {
    const { t } = useTranslation();
    const selectedDefects = defects.filter(d => d.selected);
    const uniqueFeatures = Object.entries(uniqueness)
        .filter(([_, value]) => value)
        .map(([key]) => t(`uniqueness.${key}`));

    return (
        <View style={styles.container}>
            {/* Price Details */}
            <View style={styles.detailsContainer}>
                {/* Base Price */}
                <View style={styles.detailRow}>
                    <View style={styles.detailLabelContainer}>
                        <Ionicons name="book" size={16} color={colors.grayDark} />
                        <Text style={styles.detailLabel}>{t('priceCalculation.basePrice')}</Text>
                    </View>
                    <Text style={styles.detailValue}>{formatPrice(calculation.basePrice)}</Text>
                </View>

                {/* Defects Reduction */}
                <View style={styles.detailSection}>
                    <View style={styles.detailRow}>
                        <View style={styles.detailLabelContainer}>
                            <Ionicons name="warning" size={16} color={colors.error} />
                            <Text style={styles.detailLabel}>
                                {t('priceCalculation.defectsReduction')} ({calculation.defectsReduction.toFixed(1)}%)
                            </Text>
                        </View>
                        <Text style={[styles.detailValue, styles.negativeValue]}>
                            -{formatPrice(calculation.basePrice * calculation.defectsReduction / 100)}
                        </Text>
                    </View>
                    {selectedDefects.length > 0 && (
                        <View style={styles.tagsContainer}>
                            {selectedDefects.map((defect, index) => (
                                <View key={index} style={styles.tag}>
                                    <Text style={styles.tagText}>
                                        {t(`defects.${defect.id}`)} ({defect.count}x)
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Uniqueness Bonus */}
                <View style={styles.detailSection}>
                    <View style={styles.detailRow}>
                        <View style={styles.detailLabelContainer}>
                            <Ionicons name="sparkles" size={16} color={colors.primary} />
                            <Text style={styles.detailLabel}>
                                {t('priceCalculation.uniquenessBonus')} (+{calculation.uniquenessBonus.toFixed(1)}%)
                            </Text>
                        </View>
                        <Text style={[styles.detailValue, styles.positiveValue]}>
                            +{formatPrice(calculation.basePrice * calculation.uniquenessBonus / 100)}
                        </Text>
                    </View>
                    {uniqueFeatures.length > 0 && (
                        <View style={styles.tagsContainer}>
                            {uniqueFeatures.map((feature, index) => (
                                <View key={index} style={[styles.tag, styles.positiveTag]}>
                                    <Text style={[styles.tagText, styles.positiveTagText]}>
                                        {feature}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Market Modifier */}
                <View style={styles.detailSection}>
                    <View style={styles.detailRow}>
                        <View style={styles.detailLabelContainer}>
                            <Ionicons
                                name="trending-up"
                                size={16}
                                color={calculation.marketModifier >= 0 ? colors.primary : colors.error}
                            />
                            <Text style={styles.detailLabel}>
                                {t('priceCalculation.marketModifier')} ({calculation.marketModifier > 0 ? '+' : ''}{calculation.marketModifier.toFixed(1)}%)
                            </Text>
                        </View>
                        <Text style={[
                            styles.detailValue,
                            calculation.marketModifier >= 0 ? styles.positiveValue : styles.negativeValue
                        ]}>
                            {calculation.marketModifier > 0 ? '+' : ''}{formatPrice(calculation.basePrice * calculation.marketModifier / 100)}
                        </Text>
                    </View>
                    <View style={styles.marketFactors}>
                        <View style={styles.marketFactor}>
                            <Text style={styles.marketFactorLabel}>{t('demand')}:</Text>
                            <Text style={styles.marketFactorValue}>{t(`labels.${marketFactors.demand}`)}</Text>
                        </View>
                        <View style={styles.marketFactor}>
                            <Text style={styles.marketFactorLabel}>{t('supply')}:</Text>
                            <Text style={styles.marketFactorValue}>{t(`labels.${marketFactors.supply}`)}</Text>
                        </View>
                        <View style={styles.marketFactor}>
                            <Text style={styles.marketFactorLabel}>{t('publicationYear')}:</Text>
                            <Text style={styles.marketFactorValue}>{marketFactors.publicationYear}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        zIndex: 1000,
        elevation: 5,
    },
    averagePriceContainer: {
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        marginBottom: 8,
    },
    averagePriceLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    averagePriceIcon: {
        marginRight: 8,
    },
    averagePriceLabel: {
        fontSize: 14,
        color: colors.grayDark,
    },
    averagePriceValue: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.black,
    },
    noDataText: {
        fontSize: 14,
        color: colors.gray,
        fontStyle: 'italic',
    },
    detailsContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 1,
    },
    detailSection: {
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    detailLabel: {
        fontSize: 14,
        color: colors.grayDark,
        marginLeft: 8,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.black,
        marginLeft: 8,
        textAlign: 'right',
    },
    positiveValue: {
        color: colors.primary,
    },
    negativeValue: {
        color: colors.error,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 6,
    },
    tag: {
        backgroundColor: 'rgba(255,59,48,0.1)',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 6,
        marginBottom: 6,
    },
    positiveTag: {
        backgroundColor: 'rgba(74,108,247,0.1)',
    },
    tagText: {
        fontSize: 12,
        color: colors.error,
    },
    positiveTagText: {
        color: colors.primary,
    },
    marketFactors: {
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 8,
        padding: 10,
        marginTop: 6,
    },
    marketFactor: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    marketFactorLabel: {
        fontSize: 12,
        color: colors.grayDark,
    },
    marketFactorValue: {
        fontSize: 12,
        fontWeight: '500',
        color: colors.black,
    },
});

export default PriceCalculationDetails;
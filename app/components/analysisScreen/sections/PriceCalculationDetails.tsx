import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors } from '@/styles/styles';
import { styles } from './styles';

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
                            {selectedDefects.map((defect) => (
                                <View key={defect.id} style={styles.tag}>
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
                            {uniqueFeatures.map((feature) => (
                                <View key={feature} style={[styles.tag, styles.positiveTag]}>
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

export default PriceCalculationDetails;
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '@/context/AppContext';
import { colors } from '@/styles/styles';
import { PriceCalculation } from './types';
import { formatCurrency } from '../../utils/currency';

interface PriceCalculationDetailsProps {
    calculation: PriceCalculation;
    defects: any[];
    uniqueness: any;
    marketFactors: any;
    onShowMarketAnalysis: () => void;
}

const PriceCalculationDetails = ({
                                     calculation,
                                     defects,
                                     uniqueness,
                                     marketFactors,
                                     onShowMarketAnalysis
                                 }: PriceCalculationDetailsProps) => {
    const { t } = useTranslation();
    const { exchangeRate } = useAppContext();
    const [expanded, setExpanded] = useState(false);

    const formatPrice = (price: number) => {
        return formatCurrency({
            price: price.toString(),
            exchangeRate
        });
    };

    return (
        <View style={styles.calculationContainer}>
            <TouchableOpacity
                style={styles.calculationHeader}
                onPress={() => setExpanded(!expanded)}
                activeOpacity={0.7}
            >
                <View style={styles.priceSummary}>
                    <Ionicons name="pricetag" size={20} color={colors.primary} />
                    <Text style={styles.finalPriceText}>
                        {t('priceCalculation.finalPrice')}: {formatPrice(calculation.finalPrice)}
                    </Text>
                </View>
                <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={colors.primary}
                />
            </TouchableOpacity>

            {expanded && (
                <View style={styles.calculationDetails}>
                    <View style={styles.calculationRow}>
                        <Text style={styles.calculationLabel}>{t('priceCalculation.basePrice')}:</Text>
                        <Text style={styles.calculationValue}>{formatPrice(calculation.basePrice)}</Text>
                    </View>

                    <View style={styles.calculationRow}>
                        <Text style={styles.calculationLabel}>
                            {t('priceCalculation.defectsReduction')} ({calculation.defectsReduction.toFixed(1)}%):
                        </Text>
                        <Text style={styles.calculationValue}>
                            -{formatPrice(calculation.basePrice * calculation.defectsReduction / 100)}
                        </Text>
                    </View>
                    <View style={styles.calculationSubRow}>
                        <Text style={styles.calculationSubText}>
                            {t('priceCalculation.defectsDetails')}: {defects.filter(d => d.selected).map(d => `${t(`defects.${d.id}`)} (${d.count}x)`).join(', ')}
                        </Text>
                    </View>

                    <View style={styles.calculationRow}>
                        <Text style={styles.calculationLabel}>
                            {t('priceCalculation.uniquenessBonus')} (+{calculation.uniquenessBonus.toFixed(1)}%):
                        </Text>
                        <Text style={styles.calculationValue}>
                            +{formatPrice(calculation.basePrice * calculation.uniquenessBonus / 100)}
                        </Text>
                    </View>
                    <View style={styles.calculationSubRow}>
                        <Text style={styles.calculationSubText}>
                            {t('priceCalculation.uniquenessDetails')}: {Object.entries(uniqueness)
                            .filter(([_, value]) => value)
                            .map(([key]) => t(`uniqueness.${key}`))
                            .join(', ')}
                        </Text>
                    </View>

                    <View style={styles.calculationRow}>
                        <Text style={styles.calculationLabel}>
                            {t('priceCalculation.marketModifier')} ({calculation.marketModifier > 0 ? '+' : ''}{calculation.marketModifier.toFixed(1)}%):
                        </Text>
                        <Text style={styles.calculationValue}>
                            {calculation.marketModifier > 0 ? '+' : ''}{formatPrice(calculation.basePrice * calculation.marketModifier / 100)}
                        </Text>
                    </View>
                    <View style={styles.calculationSubRow}>
                        <Text style={styles.calculationSubText}>
                            {t('priceCalculation.marketDetails')}: {t('demand')}: {t(`labels.${marketFactors.demand}`)}, {t('supply')}: {t(`labels.${marketFactors.supply}`)}, {t('publicationYear')}: {marketFactors.publicationYear}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.marketAnalysisLink}
                        onPress={onShowMarketAnalysis}
                    >
                        <Text style={styles.marketAnalysisLinkText}>
                            {t('buttons.showMarketAnalysis')}
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    calculationContainer: {
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.grayDark,
        overflow: 'hidden',
        backgroundColor: 'rgba(74,108,247,0.08)'
    },
    calculationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    priceSummary: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    finalPriceText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
        marginLeft: 10,
    },
    calculationDetails: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: colors.gray,
    },
    calculationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    calculationLabel: {
        fontSize: 14,
        color: colors.grayDark,
        flex: 1,
    },
    calculationValue: {
        fontSize: 14,
        color: colors.black,
        fontWeight: '500',
        textAlign: 'right',
        flex: 1,
    },
    calculationSubRow: {
        marginBottom: 12,
        paddingLeft: 12,
    },
    calculationSubText: {
        fontSize: 12,
        color: colors.grayDark,
        fontStyle: 'italic',
    },
    marketAnalysisLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 8,
        marginBottom: 12,
        paddingVertical: 4,
    },
    marketAnalysisLinkText: {
        color: colors.primary,
        fontSize: 14,
        marginRight: 4,
    },
});

export default PriceCalculationDetails;
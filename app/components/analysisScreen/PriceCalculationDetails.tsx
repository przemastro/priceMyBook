import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '@/context/AppContext';
import { colors } from '@/styles/styles';
import { PriceCalculation } from './types';
import { formatCurrency } from '../../utils/currency';

const { width: viewportWidth } = Dimensions.get('window');

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
    const animValue = useRef(new Animated.Value(0)).current;

    const selectedDefects = defects.filter(d => d.selected);
    const uniqueFeatures = Object.entries(uniqueness)
        .filter(([_, value]) => value)
        .map(([key]) => t(`uniqueness.${key}`));

    const formatPrice = (price: number) => {
        return formatCurrency({
            price: price.toString(),
            exchangeRate
        });
    };

    const toggleExpanded = () => {
        const toValue = expanded ? 0 : 1;
        setExpanded(!expanded);
        Animated.spring(animValue, {
            toValue,
            useNativeDriver: false,
            bounciness: expanded ? 0 : 6,
        }).start();
    };

    const opacity = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1]
    });

    const translateY = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-5, 0]
    });

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.triggerContainer}
                onPress={toggleExpanded}
                activeOpacity={0.8}
            >
                <View style={styles.priceContainer}>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>{t('labels.estimatedValue')}</Text>
                        <Text style={styles.priceValue}>{formatPrice(calculation.finalPrice)}</Text>
                    </View>
                </View>
                <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={colors.primary}
                />
            </TouchableOpacity>

            <Animated.View
                style={[
                    styles.tooltip,
                    {
                        opacity,
                        transform: [{ translateY }],
                        display: expanded ? 'flex' : 'none',
                    }
                ]}
                pointerEvents={expanded ? 'auto' : 'none'}
            >
                <View style={styles.tooltipContent}>
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
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        zIndex: 1000,
        marginBottom: 16,
        elevation: 5, // dla Androida
    },
    triggerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(74,108,247,0.1)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(74,108,247,0.2)',
    },
    priceContainer: {
        flex: 1,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: '500',
    },
    priceValue: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.primary,
    },
    tooltip: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10, // ważne dla Androida
        marginTop: 8,
        zIndex: 1001,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    tooltipContent: {
        width: '100%',
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
    analysisButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginTop: 8,
    },
    analysisButtonText: {
        color: 'white',
        fontWeight: '600',
        marginRight: 8,
    },
});

export default PriceCalculationDetails;
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/styles';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Easing } from 'react-native-reanimated';

const chartWidth = Dimensions.get('window').width - 40;

const chartConfig = {
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: () => colors.black,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    propsForBackgroundLines: {
        stroke: colors.grayLight
    }
};

const dummyBarData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{ data: [150, 200, 170, 220, 180, 210] }],
};

const dummyLineData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [{ data: [80, 90, 70, 95, 85], strokeWidth: 2 }],
};

const dummyPieData = [
    { name: 'Sales', population: 45, color: colors.primary, legendFontColor: colors.black, legendFontSize: 12 },
    { name: 'Costs', population: 30, color: colors.secondary, legendFontColor: colors.black, legendFontSize: 12 },
    { name: 'Profit', population: 25, color: colors.accent, legendFontColor: colors.black, legendFontSize: 12 },
];

const FinancialReport = () => {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);
    const totalSteps = 3;
    const slideAnim = useRef(new Animated.Value(0)).current;

    const animateSlide = (direction: 'forward' | 'backward') => {
        slideAnim.setValue(direction === 'forward' ? 50 : -50);
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    };

    const goToNextStep = () => {
        if (currentStep < totalSteps - 1) {
            animateSlide('forward');
            setCurrentStep(prev => prev + 1);
        }
    };

    const goToPrevStep = () => {
        if (currentStep > 0) {
            animateSlide('backward');
            setCurrentStep(prev => prev - 1);
        }
    };

    const renderStep = () => {
        const stepTitles = [
            t('charts.monthlySummary'),
            t('charts.weeklyTrend'),
            t('charts.revenueBreakdown')
        ];

        return (
            <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                    <Text style={styles.stepTitle} numberOfLines={1} ellipsizeMode="tail">
                        {stepTitles[currentStep]}
                    </Text>

                    <View style={styles.navigationContainer}>
                        {currentStep > 0 ? (
                            <TouchableOpacity onPress={goToPrevStep} activeOpacity={0.7}>
                                <Ionicons name="chevron-back" size={24} color={colors.primary}/>
                            </TouchableOpacity>
                        ) : (
                            <View style={{width: 24}} />
                        )}

                        <View style={styles.progressDots}>
                            {Array.from({length: totalSteps}).map((_, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.dot,
                                        i === currentStep ? styles.activeDot : styles.inactiveDot
                                    ]}
                                />
                            ))}
                        </View>

                        {currentStep < totalSteps - 1 ? (
                            <TouchableOpacity onPress={goToNextStep} activeOpacity={0.7}>
                                <Ionicons name="chevron-forward" size={24} color={colors.primary}/>
                            </TouchableOpacity>
                        ) : (
                            <View style={{width: 24}} />
                        )}
                    </View>
                </View>

                <Animated.View style={{transform: [{translateX: slideAnim}], flex: 1}}>
                    {(() => {
                        switch (currentStep) {
                            case 0:
                                return (
                                    <View style={styles.stepContent}>
                                        <LinearGradient
                                            colors={[colors.background, colors.background]}
                                            style={[styles.chartContainer, styles.withShadow]}
                                        >
                                            <BarChart
                                                data={dummyBarData}
                                                width={chartWidth}
                                                height={220}
                                                yAxisSuffix=" zł"
                                                chartConfig={chartConfig}
                                                withInnerLines={false}
                                                showBarTops={false}
                                                style={styles.chart}
                                            />
                                        </LinearGradient>
                                        <View style={styles.priceSummarySection}>
                                            <LinearGradient
                                                colors={[colors.buttonSelected1, colors.buttonSelected2]}
                                                style={[styles.priceSummaryGradient, styles.withShadow]}
                                            >
                                                <View style={styles.priceRow}>
                                                    <Text style={styles.priceLabel}>{t('charts.totalRevenue')}</Text>
                                                    <Text style={styles.priceValue}>2,450 zł</Text>
                                                </View>
                                                <View style={styles.priceRow}>
                                                    <Text style={styles.priceLabel}>{t('charts.totalCosts')}</Text>
                                                    <Text style={styles.priceValue}>1,230 zł</Text>
                                                </View>
                                                <View style={styles.priceRow}>
                                                    <Text style={styles.priceLabel}>{t('charts.netProfit')}</Text>
                                                    <Text style={styles.priceValue}>1,220 zł</Text>
                                                </View>
                                            </LinearGradient>
                                        </View>
                                    </View>
                                );
                            case 1:
                                return (
                                    <View style={styles.stepContent}>
                                        <LinearGradient
                                            colors={[colors.background, colors.background]}
                                            style={[styles.chartContainer, styles.withShadow]}
                                        >
                                            <LineChart
                                                data={dummyLineData}
                                                width={chartWidth}
                                                height={220}
                                                yAxisSuffix=" zł"
                                                chartConfig={chartConfig}
                                                bezier
                                                style={styles.chart}
                                            />
                                        </LinearGradient>
                                    </View>
                                );
                            case 2:
                                return (
                                    <View style={styles.stepContent}>
                                        <LinearGradient
                                            colors={[colors.background, colors.background]}
                                            style={[styles.chartContainer, styles.withShadow]}
                                        >
                                            <PieChart
                                                data={dummyPieData}
                                                width={chartWidth}
                                                height={220}
                                                chartConfig={chartConfig}
                                                accessor="population"
                                                backgroundColor="transparent"
                                                paddingLeft="15"
                                                style={styles.chart}
                                            />
                                        </LinearGradient>
                                    </View>
                                );
                            default:
                                return null;
                        }
                    })()}
                </Animated.View>
            </View>
        );
    };

    return (
        <LinearGradient
            colors={[colors.buttonSelected1, colors.buttonSelected2]}
            style={{flex: 1}}
        >
            <ScrollView
                contentContainerStyle={[styles.container, { paddingBottom: 20 }]}
                style={styles.backgroundGradient}
                showsVerticalScrollIndicator={false}
            >
                <LinearGradient
                    colors={['transparent', 'transparent']}
                    start={[0, 0]}
                    end={[1, 1]}
                    style={styles.ratingOuterContainer}
                >
                    <View style={styles.ratingContainer}>
                        <View style={styles.priceSummarySection}>
                            <LinearGradient
                                colors={[colors.buttonSelected1, colors.buttonSelected2]}
                                style={[styles.priceSummaryGradient, styles.withShadow]}
                            >
                                <View style={styles.priceRow}>
                                    <View style={styles.priceLabelContainer}>
                                        <Ionicons name="cash-outline" size={22} color={colors.primary} />
                                        <Text style={styles.priceLabelTotal}>{t('charts.totalValue')}</Text>
                                    </View>
                                    <Text style={styles.priceValueTotal}>5,670 zł</Text>
                                </View>

                                <View style={styles.separator} />

                                <View style={styles.priceRow}>
                                    <View style={styles.priceLabelContainer}>
                                        <Ionicons name="trending-up-outline" size={14} color={colors.secondary} />
                                        <Text style={styles.priceLabel}>{t('charts.monthlyGrowth')}</Text>
                                    </View>
                                    <Text style={[styles.priceValue, {color: colors.grayDark}]}>+12%</Text>
                                </View>

                                <View style={styles.priceRow}>
                                    <View style={styles.priceLabelContainer}>
                                        <Ionicons name="calendar-outline" size={14} color={colors.primary} />
                                        <Text style={styles.priceLabel}>{t('charts.lastUpdated')}</Text>
                                    </View>
                                    <Text style={[styles.priceValue, {color: colors.primary}]}>15.06.2023</Text>
                                </View>
                            </LinearGradient>
                        </View>
                    </View>
                </LinearGradient>

                {renderStep()}
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 10,
        paddingTop: 6,
        backgroundColor: 'transparent',
    },
    backgroundGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    ratingOuterContainer: {
        padding: 10,
        marginBottom: 20,
        marginHorizontal: -16,
        paddingTop: 60,
        marginTop: -20,
        borderRadius: 0,
    },
    ratingContainer: {
        gap: 10,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    priceLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    priceLabel: {
        fontSize: 14,
        color: colors.grayDark,
    },
    priceLabelTotal: {
        fontSize: 18,
        color: colors.blackDark,
        marginLeft: 5
    },
    priceLabelSold: {
        fontSize: 14,
        color: colors.primary,
    },
    priceValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.black,
    },
    priceValueTotal: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
    },
    separator: {
        height: 1,
        backgroundColor: colors.gray,
        marginVertical: 12,
    },
    withShadow: {
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    priceSummarySection: {
        borderRadius: 12,
        overflow: 'hidden',
        marginHorizontal: 4,
        shadowColor: colors.lightPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        marginTop: 10
    },
    priceSummaryGradient: {
        padding: 16,
        backgroundColor: colors.background,
        borderRadius: 12,
    },
    chartContainer: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        backgroundColor: colors.background,
    },
    chart: {
        borderRadius: 8,
    },
    stepContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: colors.background,
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15,
        shadowColor: colors.lightPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    stepHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.grayLight,
    },
    stepTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: colors.blackDark,
        marginRight: 10,
    },
    navigationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressDots: {
        flexDirection: 'row',
        marginHorizontal: 10,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginHorizontal: 3,
    },
    activeDot: {
        backgroundColor: colors.primary,
    },
    inactiveDot: {
        backgroundColor: colors.gray,
    },
    stepContent: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 16,
    },
});

export default FinancialReport;
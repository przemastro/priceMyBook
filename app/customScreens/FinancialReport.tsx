import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/styles';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Easing } from 'react-native-reanimated';
import {router} from "expo-router";

const chartWidth = Dimensions.get('window').width - 70;

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
    },
    decimalPlaces: 0,
    propsForLabels: {
        fontSize: 10
    }
};

// Dane dla wykresu sprzedaży książek per miesiąc
const monthlySalesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{ data: [45, 60, 52, 78, 65, 90] }],
};

// Dane dla wykresu skumulowanej sprzedaży
const cumulativeSalesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
        data: [45, 105, 157, 235, 300, 390], // Skumulowana suma
        color: (opacity = 1) => colors.primary,
        strokeWidth: 3
    }],
};

// Dane dla wykresu wartości księgozbiorów
const booksValueData = [
    {
        name: 'Fantasy',
        population: 35,
        color: '#4CAF50',
        legendFontColor: colors.black,
        legendFontSize: 12
    },
    {
        name: 'Science Fiction',
        population: 25,
        color: '#2196F3',
        legendFontColor: colors.black,
        legendFontSize: 12
    },
    {
        name: 'History',
        population: 20,
        color: '#FF9800',
        legendFontColor: colors.black,
        legendFontSize: 12
    },
    {
        name: 'Biography',
        population: 15,
        color: '#9C27B0',
        legendFontColor: colors.black,
        legendFontSize: 12
    },
    {
        name: 'Other',
        population: 5,
        color: '#607D8B',
        legendFontColor: colors.black,
        legendFontSize: 12
    },
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
            t('charts.monthlySales'),
            t('charts.cumulativeSales'),
            t('charts.booksValue')
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
                                                data={monthlySalesData}
                                                width={chartWidth}
                                                height={220}
                                                yAxisLabel=""
                                                yAxisSuffix=""
                                                chartConfig={chartConfig}
                                                withInnerLines={false}
                                                showBarTops={false}
                                                style={styles.chart}
                                                fromZero
                                            />
                                        </LinearGradient>
                                        <View style={styles.priceSummarySection}>
                                            <LinearGradient
                                                colors={[colors.buttonSelected1, colors.buttonSelected2]}
                                                style={[styles.priceSummaryGradient, styles.withShadow]}
                                            >
                                                <View style={styles.priceRow}>
                                                    <Text style={styles.priceLabel}>{t('charts.booksSoldThisMonth')}</Text>
                                                    <Text style={styles.priceValue}>90</Text>
                                                </View>
                                                <View style={styles.priceRow}>
                                                    <Text style={styles.priceLabel}>{t('charts.monthlyGrowth')}</Text>
                                                    <Text style={styles.priceValue}>+38%</Text>
                                                </View>
                                                <View style={styles.priceRow}>
                                                    <Text style={styles.priceLabel}>{t('charts.bestSellingGenre')}</Text>
                                                    <Text style={styles.priceValue}>Fantasy</Text>
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
                                                data={cumulativeSalesData}
                                                width={chartWidth}
                                                height={220}
                                                yAxisLabel=""
                                                yAxisSuffix=""
                                                chartConfig={{
                                                    ...chartConfig,
                                                    color: (opacity = 1) => colors.primary
                                                }}
                                                bezier
                                                style={styles.chart}
                                                withHorizontalLabels={true}
                                                withVerticalLabels={true}
                                                fromZero
                                            />
                                        </LinearGradient>
                                        <View style={styles.priceSummarySection}>
                                            <LinearGradient
                                                colors={[colors.buttonSelected1, colors.buttonSelected2]}
                                                style={[styles.priceSummaryGradient, styles.withShadow]}
                                            >
                                                <View style={styles.priceRow}>
                                                    <Text style={styles.priceLabel}>{t('charts.totalBooksSold')}</Text>
                                                    <Text style={styles.priceValue}>390</Text>
                                                </View>
                                                <View style={styles.priceRow}>
                                                    <Text style={styles.priceLabel}>{t('charts.averageMonthly')}</Text>
                                                    <Text style={styles.priceValue}>65</Text>
                                                </View>
                                                <View style={styles.priceRow}>
                                                    <Text style={styles.priceLabel}>{t('charts.projectedYearEnd')}</Text>
                                                    <Text style={styles.priceValue}>780</Text>
                                                </View>
                                            </LinearGradient>
                                        </View>
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
                                                data={booksValueData}
                                                width={chartWidth}
                                                height={220}
                                                chartConfig={chartConfig}
                                                accessor="population"
                                                backgroundColor="transparent"
                                                paddingLeft="15"
                                                style={styles.chart}
                                                absolute
                                            />
                                        </LinearGradient>
                                        <View style={styles.priceSummarySection}>
                                            <LinearGradient
                                                colors={[colors.buttonSelected1, colors.buttonSelected2]}
                                                style={[styles.priceSummaryGradient, styles.withShadow]}
                                            >
                                                <View style={styles.priceRow}>
                                                    <Text style={styles.priceLabel}>{t('charts.totalCollectionValue')}</Text>
                                                    <Text style={styles.priceValue}>24,500 zł</Text>
                                                </View>
                                                <View style={styles.priceRow}>
                                                    <Text style={styles.priceLabel}>{t('charts.mostValuableGenre')}</Text>
                                                    <Text style={styles.priceValue}>Fantasy (35%)</Text>
                                                </View>
                                                <View style={styles.priceRow}>
                                                    <Text style={styles.priceLabel}>{t('charts.averageBookValue')}</Text>
                                                    <Text style={styles.priceValue}>62.82 zł</Text>
                                                </View>
                                            </LinearGradient>
                                        </View>
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
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ marginLeft: 10, marginRight: 20, marginBottom: 20 }}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.blackDark} />
                    </TouchableOpacity>
                    <View style={styles.ratingContainer}>
                        <View style={styles.priceSummarySection}>
                            <LinearGradient
                                colors={[colors.buttonSelected1, colors.buttonSelected2]}
                                style={[styles.priceSummaryGradient, styles.withShadow]}
                            >
                                <View style={styles.priceRow}>
                                    <View style={styles.priceLabelContainer}>
                                        <Ionicons name="book-outline" size={22} color={colors.primary} />
                                        <Text style={styles.priceLabelTotal}>{t('charts.totalBooksSold')}</Text>
                                    </View>
                                    <Text style={styles.priceValueTotal}>390</Text>
                                </View>

                                <View style={styles.separator} />

                                <View style={styles.priceRow}>
                                    <View style={styles.priceLabelContainer}>
                                        <Ionicons name="trending-up-outline" size={14} color={colors.secondary} />
                                        <Text style={styles.priceLabel}>{t('charts.monthlyGrowth')}</Text>
                                    </View>
                                    <Text style={[styles.priceValue, {color: colors.grayDark}]}>+38%</Text>
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
        paddingTop: 0,
        backgroundColor: 'transparent',
    },
    backgroundGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    ratingOuterContainer: {
        padding: 12,
        marginBottom: 20,
        marginHorizontal: -16,
        paddingTop: 50,
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
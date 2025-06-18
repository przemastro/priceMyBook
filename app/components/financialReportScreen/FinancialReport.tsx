import React, { useRef, useState, useMemo, useEffect } from 'react';
import { View, Text, Dimensions, ScrollView, Animated, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/styles';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Easing } from 'react-native-reanimated';
import { router } from "expo-router";
import { useAppContext } from '@/context/AppContext';
import moment from 'moment';
import 'moment/locale/pl';
import { styles } from './style'

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const chartWidth = Dimensions.get('window').width - 40;
const chartWidthSmaller = Dimensions.get('window').width - 90;
const chartHeight = 220;
const chartHeightSmaller = 200;

const chartConfig = {
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    color: (opacity = 1) => colors.primary,
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

const FinancialReport = () => {
    const { t, i18n } = useTranslation();
    const {
        books,
        collections,
        collectionCategories,
        calculateTotalValue,
        calculateActiveValue,
        calculateSoldValue
    } = useAppContext();

    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const totalSteps = 3;
    const slideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        moment.locale(i18n.language);
        const timer = setTimeout(() => {
            if (isLoading) {
                setIsLoading(false);
                setHasError(true);
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, [i18n.language]);

    const processFinancialData = () => {
        try {
            if (!books || !collections || collections.length === 0) {
                return {
                    monthlySalesData: { labels: [], datasets: [{ data: [] }] },
                    monthlyRevenueData: { labels: [], datasets: [{ data: [] }] },
                    yearlyBreakdown: { labels: [], datasets: [] },
                    booksValueData: [],
                    stats: {
                        totalBooksSold: 0,
                        monthlyRevenue: 0,
                        yearlyRevenue: 0,
                        monthlyGrowth: 0,
                        mostPopularCategory: t('charts.noData'),
                        averageMonthly: 0,
                        projectedYearEnd: 0,
                        totalCollectionValue: 0,
                        averageBookValue: 0,
                        activeValue: 0,
                        soldValue: 0,
                        lastUpdated: moment().format('LL'),
                        bestSellingMonth: '-',
                        averageSalePrice: 0
                    },
                    hasData: false
                };
            }

            const totalValue = calculateTotalValue();
            const activeValue = calculateActiveValue();
            const soldValue = calculateSoldValue();

            const months = Array.from({ length: 12 }, (_, i) => {
                const date = moment().subtract(11 - i, 'months');
                return {
                    key: date.format('MMM YYYY'),
                    month: date.format('MMM'),
                    year: date.year(),
                    count: 0,
                    revenue: 0
                };
            });

            const yearlyData: Record<string, { count: number, revenue: number }> = {};
            let totalBooksSold = 0;
            let totalRevenue = 0;

            collections.forEach(collection => {
                const currentBooks = books[collection.name] || [];

                currentBooks.forEach(book => {
                    if (book.listingStatus?.status === 'sold') {
                        const saleDate = book.listingStatus.soldDate
                            ? moment(book.listingStatus.soldDate)
                            : moment(book.createdAt);
                        const price = parseFloat(book.price) || 0;

                        const monthKey = saleDate.format('MMM YYYY');
                        const monthIndex = months.findIndex(m => m.key === monthKey);
                        if (monthIndex >= 0) {
                            months[monthIndex].count += 1;
                            months[monthIndex].revenue += price;
                        }

                        const year = saleDate.year().toString();
                        if (!yearlyData[year]) {
                            yearlyData[year] = { count: 0, revenue: 0 };
                        }
                        yearlyData[year].count += 1;
                        yearlyData[year].revenue += price;

                        totalBooksSold += 1;
                        totalRevenue += price;
                    }
                });
            });

            const bestSellingMonth = months.reduce((best, month) =>
                    month.revenue > best.revenue ? month : best,
                { month: '', count: 0, revenue: 0 }
            );

            const monthlyLabels = months.map(m => m.month);
            const monthlySales = months.map(m => m.count);
            const monthlyRevenues = months.map(m => m.revenue);

            const categoriesValue: Record<string, number> = {};
            collections.forEach(collection => {
                const currentBooks = books[collection.name] || [];
                const categories = collectionCategories[collection.name] || [t('charts.generalCategory')];

                currentBooks.forEach(book => {
                    const price = parseFloat(book.price) || 0;
                    const valuePerCategory = price / categories.length;
                    categories.forEach(category => {
                        categoriesValue[category] = (categoriesValue[category] || 0) + valuePerCategory;
                    });
                });
            });

            const pieData = Object.entries(categoriesValue)
                .sort((a, b) => b[1] - a[1])
                .map(([name, value], index) => ({
                    name,
                    value: Math.round(value),
                    color: [
                        '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#607D8B',
                        '#F44336', '#00BCD4', '#8BC34A', '#3F51B5', '#FF5722'
                    ][index % 10],
                    legendFontColor: colors.black,
                    legendFontSize: 12
                }));

            const activeBooksCount = collections.reduce((sum, collection) =>
                    sum + (books[collection.name] || []).filter(b => b.listingStatus?.status !== 'sold').length,
                0
            );

            const averageBookValue = activeBooksCount > 0 ? Math.round(activeValue / activeBooksCount) : 0;
            const averageSalePrice = totalBooksSold > 0 ? totalRevenue / totalBooksSold : 0;

            const monthsWithSales = months.filter(m => m.count > 0).length;
            const monthlyGrowth = months.length > 1
                ? Math.round(((monthlySales[monthlySales.length - 1] - monthlySales[monthlySales.length - 2]) /
                    (monthlySales[monthlySales.length - 2] || 1) * 100))
                : 0;

            setIsLoading(false);
            setHasError(false);

            return {
                monthlySalesData: {
                    labels: monthlyLabels,
                    datasets: [{ data: monthlySales }]
                },
                monthlyRevenueData: {
                    labels: monthlyLabels,
                    datasets: [{
                        data: monthlyRevenues,
                        color: (opacity = 0) => colors.primary,
                        strokeWidth: 3
                    }]
                },
                yearlyBreakdown: {
                    labels: Object.keys(yearlyData).sort(),
                    datasets: [
                        {
                            data: Object.keys(yearlyData).sort().map(year => yearlyData[year].count),
                            color: (opacity = 1) => colors.primary,
                            strokeWidth: 2
                        },
                        {
                            data: Object.keys(yearlyData).sort().map(year => yearlyData[year].revenue),
                            color: (opacity = 1) => colors.secondary,
                            strokeWidth: 2
                        }
                    ]
                },
                booksValueData: pieData,
                stats: {
                    totalBooksSold,
                    monthlyRevenue: monthlyRevenues[monthlyRevenues.length - 1] || 0,
                    yearlyRevenue: totalRevenue,
                    monthlyGrowth,
                    mostPopularCategory: pieData[0]?.name || t('charts.noData'),
                    averageMonthly: Math.round(totalBooksSold / Math.max(1, monthsWithSales)),
                    projectedYearEnd: Math.round(totalBooksSold * (12 / Math.max(1, monthsWithSales))),
                    totalCollectionValue: totalValue,
                    averageBookValue,
                    activeValue,
                    soldValue,
                    lastUpdated: moment().format('LL'),
                    bestSellingMonth: bestSellingMonth.month || '-',
                    averageSalePrice
                },
                hasData: totalBooksSold > 0 || pieData.length > 0
            };
        } catch (error) {
            console.error('Error processing financial data:', error);
            setIsLoading(false);
            setHasError(true);
            return {
                monthlySalesData: { labels: [], datasets: [{ data: [] }] },
                monthlyRevenueData: { labels: [], datasets: [{ data: [] }] },
                yearlyBreakdown: { labels: [], datasets: [] },
                booksValueData: [],
                stats: {
                    totalBooksSold: 0,
                    monthlyRevenue: 0,
                    yearlyRevenue: 0,
                    monthlyGrowth: 0,
                    mostPopularCategory: t('charts.noData'),
                    averageMonthly: 0,
                    projectedYearEnd: 0,
                    totalCollectionValue: 0,
                    averageBookValue: 0,
                    activeValue: 0,
                    soldValue: 0,
                    lastUpdated: moment().format('LL'),
                    bestSellingMonth: '-',
                    averageSalePrice: 0
                },
                hasData: false
            };
        }
    };

    const {
        monthlySalesData,
        monthlyRevenueData,
        booksValueData,
        stats,
        hasData
    } = useMemo(processFinancialData, [books, collections, collectionCategories, t]);

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

    const renderNoDataMessage = (
        iconName: IoniconsName,
        message: string,
        hint?: string
    ) => (
        <View style={styles.noDataContainer}>
            <Ionicons name={iconName} size={48} color={colors.gray} />
            <Text style={styles.noDataText}>{message}</Text>
            {hint && <Text style={styles.noDataHint}>{hint}</Text>}
        </View>
    );

    const renderStep = () => {
        const stepTitles = [
            t('charts.monthlySales'),
            t('charts.revenueTrends'),
            t('charts.booksValue')
        ];

        if (isLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>{t('charts.loadingData')}</Text>
                </View>
            );
        }

        if (hasError) {
            return renderNoDataMessage(
                'alert-circle-outline',
                t('charts.dataLoadError'),
                t('charts.tryAgainLater')
            );
        }

        if (!hasData) {
            return renderNoDataMessage(
                'library-outline',
                t('charts.noFinancialData'),
                t('charts.addBooksHint')
            );
        }

        return (
            <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                    <Text style={styles.stepTitle} numberOfLines={1} ellipsizeMode="tail">
                        {stepTitles[currentStep]}
                    </Text>

                    <View style={styles.navigationContainer}>
                        {currentStep > 0 && (
                            <TouchableOpacity onPress={goToPrevStep} activeOpacity={0.7}>
                                <Ionicons name="chevron-back" size={24} color={colors.primary}/>
                            </TouchableOpacity>
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

                        {currentStep < totalSteps - 1 && (
                            <TouchableOpacity onPress={goToNextStep} activeOpacity={0.7}>
                                <Ionicons name="chevron-forward" size={24} color={colors.primary}/>
                            </TouchableOpacity>
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
                                                width={chartWidthSmaller}
                                                height={chartHeight}
                                                yAxisLabel=""
                                                yAxisSuffix=""
                                                chartConfig={chartConfig}
                                                withInnerLines={false}
                                                showBarTops={false}
                                                style={styles.chart}
                                                fromZero
                                            />
                                        </LinearGradient>
                                        <View style={styles.statsContainer}>
                                            <View style={styles.statItem}>
                                                <Text style={styles.statLabel}>{t('charts.totalBooksSold')}</Text>
                                                <Text style={styles.statValue}>{stats.totalBooksSold}</Text>
                                            </View>
                                            <View style={styles.statItem}>
                                                <Text style={styles.statLabel}>{t('charts.bestSellingMonth')}</Text>
                                                <Text style={styles.statValue}>{stats.bestSellingMonth}</Text>
                                            </View>
                                            <View style={styles.statItem}>
                                                <Text style={styles.statLabel}>{t('charts.monthlyGrowth')}</Text>
                                                <Text style={[
                                                    styles.statValue,
                                                    stats.monthlyGrowth > 0 ? styles.positiveValue :
                                                        stats.monthlyGrowth < 0 ? styles.negativeValue : null
                                                ]}>
                                                    {stats.monthlyGrowth > 0 ? '+' : ''}{stats.monthlyGrowth}%
                                                </Text>
                                            </View>
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
                                                data={monthlyRevenueData}
                                                width={chartWidthSmaller}
                                                height={chartHeight}
                                                yAxisLabel=""
                                                yAxisSuffix=" zł"
                                                chartConfig={{
                                                    ...chartConfig,
                                                    color: (opacity = 1) => colors.primary,  // Tutaj zmieniasz kolor linii
                                                    propsForDots: {
                                                        r: "4",
                                                        strokeWidth: "2",
                                                        stroke: colors.primary  // Tutaj możesz też zmienić kolor kropek
                                                    }
                                                }}
                                                bezier
                                                style={styles.chart}
                                                withHorizontalLabels={true}
                                                withVerticalLabels={true}
                                                fromZero
                                            />
                                        </LinearGradient>
                                        <View style={styles.statsContainer}>
                                            <View style={styles.statItem}>
                                                <Text style={styles.statLabel}>{t('charts.yearlyRevenue')}</Text>
                                                <Text style={styles.statValue}>
                                                    {stats.yearlyRevenue.toFixed(2)} zł
                                                </Text>
                                            </View>
                                            <View style={styles.statItem}>
                                                <Text style={styles.statLabel}>{t('charts.monthlyRevenue')}</Text>
                                                <Text style={styles.statValue}>
                                                    {stats.monthlyRevenue.toFixed(2)} zł
                                                </Text>
                                            </View>
                                            <View style={styles.statItem}>
                                                <Text style={styles.statLabel}>{t('charts.averageSalePrice')}</Text>
                                                <Text style={styles.statValue}>
                                                    {stats.averageSalePrice.toFixed(2)} zł
                                                </Text>
                                            </View>
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
                                                height={chartHeight}
                                                chartConfig={chartConfig}
                                                accessor="value"
                                                backgroundColor="transparent"
                                                paddingLeft="15"
                                                style={styles.chart}
                                                absolute
                                            />
                                        </LinearGradient>
                                        <View style={styles.statsContainer}>
                                            <View style={styles.statItem}>
                                                <Text style={styles.statLabel}>{t('charts.totalValue')}</Text>
                                                <Text style={styles.statValue}>
                                                    {stats.totalCollectionValue.toFixed(2)} zł
                                                </Text>
                                            </View>
                                            <View style={styles.statItem}>
                                                <Text style={styles.statLabel}>{t('charts.activeValue')}</Text>
                                                <Text style={styles.statValue}>
                                                    {stats.activeValue.toFixed(2)} zł
                                                </Text>
                                            </View>
                                            <View style={styles.statItem}>
                                                <Text style={styles.statLabel}>{t('charts.soldValue')}</Text>
                                                <Text style={styles.statValue}>
                                                    {stats.soldValue.toFixed(2)} zł
                                                </Text>
                                            </View>
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
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headerContainer}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.blackDark} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('charts.financialReport')}</Text>
                    <View style={styles.spacer} />
                </View>

                {!isLoading && hasData && (
                    <LinearGradient
                        colors={[colors.buttonSelected1, colors.buttonSelected2]}
                        style={styles.summaryCard}
                    >
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryIcon}>
                                <Ionicons name="library-outline" size={24} color={colors.primary} />
                            </View>
                            <View style={styles.summaryTextContainer}>
                                <Text style={styles.summaryLabel}>{t('charts.totalValue')}</Text>
                                <Text style={styles.summaryValue}>
                                    {stats.totalCollectionValue.toFixed(2)} zł
                                </Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryIcon}>
                                <Ionicons name="calendar-outline" size={20} color={colors.secondary} />
                            </View>
                            <View style={styles.summaryTextContainer}>
                                <Text style={styles.summaryLabel}>{t('charts.lastUpdated')}</Text>
                                <Text style={styles.summaryValue}>{stats.lastUpdated}</Text>
                            </View>
                        </View>
                    </LinearGradient>
                )}

                {renderStep()}
            </ScrollView>
        </LinearGradient>
    );
};

export default FinancialReport;
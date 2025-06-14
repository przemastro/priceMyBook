import React, { useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Animated, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/styles';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Easing } from 'react-native-reanimated';
import { router } from "expo-router";
import { useAppContext } from '@/context/AppContext';

const chartWidth = Dimensions.get('window').width - 40;
const chartWidthSmaller = Dimensions.get('window').width - 90;
const chartHeight = 220;
const chartHeightSmaller = 200;

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

// Typ dla dozwolonych nazw ikon Ionicons
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const FinancialReport = () => {
    const { t } = useTranslation();
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
    const totalSteps = 3;
    const slideAnim = useRef(new Animated.Value(0)).current;

    const { monthlySalesData, cumulativeSalesData, booksValueData, stats, hasData } = useMemo(() => {
        // Initialize empty state if no data
        if (!books || !collections || collections.length === 0) {
            setIsLoading(false);
            return {
                monthlySalesData: { labels: [], datasets: [{ data: [] }] },
                cumulativeSalesData: { labels: [], datasets: [{ data: [] }] },
                booksValueData: [],
                stats: {
                    totalBooksSold: 0,
                    monthlyGrowth: 0,
                    mostPopularCategory: t('charts.noData'),
                    averageMonthly: 0,
                    projectedYearEnd: 0,
                    totalCollectionValue: 0,
                    averageBookValue: 0,
                    activeValue: 0,
                    soldValue: 0,
                    lastUpdated: new Date().toLocaleDateString()
                },
                hasData: false
            };
        }

        setIsLoading(false);

        // Calculate financial values
        const totalValue = calculateTotalValue();
        const activeValue = calculateActiveValue();
        const soldValue = calculateSoldValue();

        // Process categories values
        const categoriesValue: Record<string, number> = {};
        let hasSalesData = false;
        const now = new Date();
        const currentYear = now.getFullYear();
        const monthlySales: Record<string, number> = {};

        collections.forEach(collection => {
            const currentBooks = books[collection.name] || [];
            const categories = collectionCategories[collection.name] || [t('charts.generalCategory')];

            currentBooks.forEach(book => {
                const price = parseFloat(book.price) || 0;
                const valuePerCategory = price / categories.length;

                categories.forEach(category => {
                    categoriesValue[category] = (categoriesValue[category] || 0) + valuePerCategory;
                });

                // Process sales data
                if (book.listingStatus?.status === 'sold') {
                    hasSalesData = true;
                    let saleDate: Date;

                    try {
                        saleDate = book.listingStatus.soldDate ? new Date(book.listingStatus.soldDate) : new Date(book.createdAt);
                    } catch {
                        saleDate = new Date(book.createdAt);
                    }

                    if (saleDate.getFullYear() === currentYear) {
                        const month = saleDate.toLocaleString('default', { month: 'short' });
                        monthlySales[month] = (monthlySales[month] || 0) + 1;
                    }
                }
            });
        });

        // Prepare last 6 months data
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const last6Months = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            last6Months.push(date.toLocaleString('default', { month: 'short' }));
        }

        const monthlyData = last6Months.map(month => monthlySales[month] || 0);

        // Calculate cumulative sales
        let cumulative = 0;
        const cumulativeData = monthlyData.map(value => {
            cumulative += value;
            return cumulative;
        });

        // Prepare pie chart data
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

        // Calculate active books count for average
        const activeBooksCount = collections.reduce((sum, collection) => {
            return sum + (books[collection.name] || []).filter(
                book => book.listingStatus?.status !== 'sold'
            ).length;
        }, 0);

        const averageBookValue = activeBooksCount > 0
            ? Math.round(activeValue / activeBooksCount)
            : 0;

        const totalBooksSold = cumulativeData[cumulativeData.length - 1] || 0;
        const monthlyGrowth = monthlyData.length > 1
            ? Math.round(((monthlyData[monthlyData.length - 1] - monthlyData[monthlyData.length - 2]) /
                (monthlyData[monthlyData.length - 2] || 1) * 100))
            : 0;

        return {
            monthlySalesData: {
                labels: last6Months,
                datasets: [{ data: monthlyData }]
            },
            cumulativeSalesData: {
                labels: last6Months,
                datasets: [{
                    data: cumulativeData,
                    color: (opacity = 1) => colors.primary,
                    strokeWidth: 3
                }]
            },
            booksValueData: pieData,
            stats: {
                totalBooksSold,
                monthlyGrowth,
                mostPopularCategory: pieData[0]?.name || t('charts.noData'),
                averageMonthly: Math.round(totalBooksSold / Math.max(1, last6Months.length)),
                projectedYearEnd: Math.round(totalBooksSold * (12 / Math.max(1, last6Months.length))),
                totalCollectionValue: totalValue,
                averageBookValue,
                activeValue,
                soldValue,
                lastUpdated: new Date().toLocaleDateString()
            },
            hasData: hasSalesData || pieData.length > 0
        };
    }, [books, collections, collectionCategories, t]);

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
            t('charts.cumulativeSales'),
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

        if (!hasData) {
            return renderNoDataMessage(
                'alert-circle-outline',
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
                                if (stats.totalBooksSold === 0) {
                                    return renderNoDataMessage(
                                        'bar-chart-outline',
                                        t('charts.noSalesData'),
                                        t('charts.markBooksAsSoldHint')
                                    );
                                }
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
                                                <Text style={styles.statLabel}>{t('charts.booksSoldThisMonth')}</Text>
                                                <Text style={styles.statValue}>
                                                    {monthlySalesData.datasets[0].data[monthlySalesData.datasets[0].data.length - 1] || 0}
                                                </Text>
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
                                            <View style={styles.statItem}>
                                                <Text style={styles.statLabel}>{t('charts.mostPopularCategory')}</Text>
                                                <Text style={styles.statValue}>
                                                    {stats.mostPopularCategory}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            case 1:
                                if (stats.totalBooksSold === 0) {
                                    return renderNoDataMessage(
                                        'trending-up-outline',
                                        t('charts.noCumulativeData')
                                    );
                                }
                                return (
                                    <View style={styles.stepContent}>
                                        <LinearGradient
                                            colors={[colors.background, colors.background]}
                                            style={[styles.chartContainer, styles.withShadow]}
                                        >
                                            <LineChart
                                                data={cumulativeSalesData}
                                                width={chartWidthSmaller}
                                                height={chartHeight}
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
                                        <View style={styles.statsContainer}>
                                            <View style={styles.statItem}>
                                                <Text style={styles.statLabel}>{t('charts.totalBooksSold')}</Text>
                                                <Text style={styles.statValue}>{stats.totalBooksSold}</Text>
                                            </View>
                                            <View style={styles.statItem}>
                                                <Text style={styles.statLabel}>{t('charts.averageMonthly')}</Text>
                                                <Text style={styles.statValue}>{stats.averageMonthly}</Text>
                                            </View>
                                            <View style={styles.statItem}>
                                                <Text style={styles.statLabel}>{t('charts.projectedYearEnd')}</Text>
                                                <Text style={styles.statValue}>{stats.projectedYearEnd}</Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            case 2:
                                if (booksValueData.length === 0) {
                                    return renderNoDataMessage(
                                        'pie-chart-outline',
                                        t('charts.noCategoriesData'),
                                        t('charts.addCategoriesHint')
                                    );
                                }
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
                                            <View style={styles.statItem}>
                                                <Text style={styles.statLabel}>{t('charts.avgBookValue')}</Text>
                                                <Text style={styles.statValue}>
                                                    {stats.averageBookValue.toFixed(2)} zł
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

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        paddingTop: 60,
        minHeight: Dimensions.get('window').height,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 15,
        width: '100%',
        justifyContent: 'space-between',
        position: 'absolute',
        top: 30,
        left: 0,
        zIndex: 10,
        paddingHorizontal: 0
    },
    backButton: {
        marginLeft: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '500',
        color: colors.blackDark,
        textAlign: 'center',
        flex: 1,
        marginLeft: 30
    },
    spacer: {
        width: 44,
        marginRight: 10,
    },
    summaryCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    summaryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    summaryTextContainer: {
        flex: 1,
    },
    summaryLabel: {
        fontSize: 14,
        color: colors.grayDark,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 8,
    },
    stepContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: colors.background,
        borderRadius: 12,
        shadowColor: colors.lightPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: -30,
        paddingBottom: 30,
    },
    stepHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.grayLight,
    },
    stepTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: colors.blackDark,
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
        padding: 16,
    },
    chartContainer: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    chart: {
        borderRadius: 8,
    },
    withShadow: {
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    statsContainer: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 16,
    },
    statItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statLabel: {
        fontSize: 14,
        color: colors.grayDark,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.black,
    },
    positiveValue: {
        color: colors.success,
    },
    negativeValue: {
        color: colors.error,
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    noDataText: {
        fontSize: 16,
        color: colors.grayDark,
        marginTop: 16,
        textAlign: 'center',
    },
    noDataHint: {
        fontSize: 14,
        color: colors.gray,
        marginTop: 8,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: colors.grayDark,
    },
});

export default FinancialReport;
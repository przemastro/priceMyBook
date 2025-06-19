import React, { useRef } from 'react';
import { View, Text, ActivityIndicator, Dimensions, Animated, Easing } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useTranslation } from 'react-i18next';
import Carousel from 'react-native-reanimated-carousel';
import { colors } from '@/styles/styles';
import { MarketData } from '../types';
import { styles, chartConfig } from './styles';

interface MarketChartProps {
    marketData: MarketData | null;
}

const getDemandValue = (demand: string) => {
    switch (demand) {
        case 'veryHigh': return 100;
        case 'high': return 80;
        case 'medium': return 60;
        case 'low': return 40;
        default: return 20;
    }
};

const getSupplyValue = (supply: string) => {
    switch (supply) {
        case 'veryLow': return 20;
        case 'low': return 40;
        case 'medium': return 60;
        case 'high': return 80;
        default: return 100;
    }
};

const MarketChart = React.memo(({ marketData }: MarketChartProps) => {
    const { t } = useTranslation();
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - 84;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
                easing: Easing.out(Easing.exp)
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
                easing: Easing.out(Easing.back(1.2))
            })
        ]).start();
    }, []);

    if (!marketData) {
        return (
            <Animated.View style={[styles.skeletonContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }]}]}>
                <Text style={styles.chartTitle}>{t('labels.marketAnalysis')}</Text>
                <ActivityIndicator size="small" color={colors.primary} />
            </Animated.View>
        );
    }

    const renderBarChart = () => (
        <View style={styles.chartContainer} key="bar-chart">
            <Text style={styles.chartSubtitle}>{t('labels.demandVsSupply')}</Text>
            <BarChart
                data={{
                    labels: [t('labels.demand'), t('labels.supply')],
                    datasets: [{
                        data: [
                            getDemandValue(marketData.demand),
                            getSupplyValue(marketData.supply)
                        ],
                        colors: [
                            (opacity = 1) => `rgba(74, 108, 247, ${opacity})`,
                            (opacity = 1) => `rgba(255, 159, 64, ${opacity})`
                        ]
                    }]
                }}
                width={chartWidth}
                height={200}
                yAxisLabel=""
                yAxisSuffix="%"
                chartConfig={chartConfig}
                style={styles.chartStyle}
                fromZero
                showBarTops={false}
                withCustomBarColorFromData={true}
            />
        </View>
    );

    const renderLineChart = () => {
        if (!marketData.priceHistory || marketData.priceHistory.length <= 1) return null;

        return (
            <View style={styles.chartContainer} key="line-chart">
                <Text style={styles.chartSubtitle}>{t('labels.priceHistory')}</Text>
                <LineChart
                    data={{
                        labels: marketData.priceHistory.map(entry =>
                            new Date(entry.date).toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' })),
                        datasets: [{
                            data: marketData.priceHistory.map(entry => entry.price),
                            color: (opacity = 1) => `rgba(74, 108, 247, ${opacity})`,
                            strokeWidth: 3
                        }]
                    }}
                    width={chartWidth}
                    height={200}
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={chartConfig}
                    style={styles.chartStyle}
                    bezier
                    withDots={true}
                />
            </View>
        );
    };

    const charts = [
        renderLineChart(),
        ...(marketData.priceHistory && marketData.priceHistory.length > 1 ? [renderBarChart()] : [])
    ].filter(Boolean);

    return (
        <Animated.View style={[styles.premiumContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }]}]}>
            <Text style={styles.chartTitle}>{t('labels.marketAnalysis')}</Text>

            {charts.length > 1 ? (
                <View style={styles.carouselWrapper}>
                    <Carousel
                        loop={false}
                        width={chartWidth + 32}
                        height={280}
                        autoPlay={false}
                        data={charts}
                        renderItem={({ item }) => (
                            <View style={styles.carouselItem}>
                                {item}
                            </View>
                        )}
                        scrollAnimationDuration={400}
                    />
                </View>
            ) : (
                <View style={styles.singleChartContainer}>
                    {charts[0]}
                </View>
            )}
        </Animated.View>
    );
});

export default MarketChart;
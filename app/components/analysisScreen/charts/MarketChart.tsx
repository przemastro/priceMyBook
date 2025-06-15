import React, { useRef } from 'react';
import { View, Text, ActivityIndicator, Dimensions, Animated, Easing } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useTranslation } from 'react-i18next';
import { colors } from '@/styles/styles';
import { MarketData } from '../types';
import { styles, chartConfig } from './styles';

interface MarketChartProps {
    marketData: MarketData | null;
}

const MarketChart = React.memo(({ marketData }: MarketChartProps) => {
    const { t } = useTranslation();
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - 64;
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

    if (!marketData || !marketData.source || marketData.source === 'simulated') {
        return (
            <Animated.View style={[styles.skeletonContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }]}]}>
                <Text style={styles.chartTitle}>{t('labels.marketAnalysis')}</Text>
                <Text style={styles.noDataText}>{t('labels.noMarketData')}</Text>
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
                            marketData.demand === 'veryHigh' ? 100 :
                                marketData.demand === 'high' ? 80 :
                                    marketData.demand === 'medium' ? 60 :
                                        marketData.demand === 'low' ? 40 : 20,
                            marketData.supply === 'veryLow' ? 20 :
                                marketData.supply === 'low' ? 40 :
                                    marketData.supply === 'medium' ? 60 :
                                        marketData.supply === 'high' ? 80 : 100
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
        if (!marketData.priceHistory || marketData.priceHistory.length <= 1) {
            return (
                <View style={styles.chartContainer}>
                    <Text style={styles.chartSubtitle}>{t('labels.priceHistory')}</Text>
                    <Text style={styles.noDataText}>{t('labels.noPriceHistory')}</Text>
                </View>
            );
        }

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

    return (
        <Animated.View style={[styles.premiumContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }]}]}>
            <Text style={styles.chartTitle}>{t('labels.marketAnalysis')}</Text>
            <View style={styles.singleChartContainer}>
                {renderLineChart()}
                {renderBarChart()}
            </View>
        </Animated.View>
    );
});

export default MarketChart;
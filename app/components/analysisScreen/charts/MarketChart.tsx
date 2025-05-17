import React, { useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useTranslation } from 'react-i18next';
import { colors } from '@/styles/styles';
import { MarketData } from '../types';
import Carousel from 'react-native-reanimated-carousel';
import { styles } from './styles';

interface MarketChartProps {
    marketData: MarketData | null;
}

const MarketChart = React.memo(({ marketData }: MarketChartProps) => {
    const { t } = useTranslation();
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - 64;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    // Animacje
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

    // Premium config - odpicowana kolorystyka
    const premiumConfig = {
        backgroundColor: '#f8f9ff', // Jasnoniebieskie tło
        backgroundGradientFrom: '#f8f9ff',
        backgroundGradientTo: '#f8f9ff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(74, 108, 247, ${opacity})`, // Główny niebieski
        labelColor: (opacity = 1) => `rgba(60, 60, 60, ${opacity})`, // Ciemnoszary dla tekstu
        style: {
            borderRadius: 16,
            paddingRight: 20
        },
        propsForDots: {
            r: "5",
            strokeWidth: "2",
            stroke: colors.primary,
            fill: "#fff" // Białe wypełnienie kropek
        },
        fillShadowGradient: colors.primary,
        fillShadowGradientOpacity: 0.15, // Delikatny gradient
        strokeWidth: 2,
        barPercentage: 0.7,
        barRadius: 6,
        useShadowColorFromDataset: false,
        propsForBackgroundLines: {
            strokeWidth: 0, // Usuwamy siatkę
        },
        propsForLabels: {
            fontFamily: 'System',
            fontSize: 12,
            fontWeight: '500'
        },
        propsForVerticalLabels: {
            dx: -10,
            dy: 0
        },
        propsForHorizontalLabels: {
            dy: 5,
            rotation: -45 // Ukośne etykiety dla lepszej czytelności
        }
    };

    if (!marketData) {
        return (
            <Animated.View style={[styles.skeletonContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }]}]}>
                <Text style={styles.chartTitle}>{t('labels.marketAnalysis')}</Text>
                <ActivityIndicator size="small" color={colors.primary} />
                </Animated.View>
            );
            }

    const renderBarChart = () => (
        <View key="bar-chart">
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
                            (opacity = 1) => `rgba(74, 108, 247, ${opacity})`, // Niebieski dla popytu
                            (opacity = 1) => `rgba(255, 159, 64, ${opacity})`  // Pomarańczowy dla podaży
                        ]
                    }]
                }}
                width={chartWidth}
                height={220}
                yAxisLabel=""
                yAxisSuffix="%"
                yAxisInterval={20}
                chartConfig={{
                    ...premiumConfig,
                    fillShadowGradientFromOpacity: 0.3,
                    fillShadowGradientToOpacity: 0.1,
                }}
                style={{
                    marginVertical: 8,
                    borderRadius: 16,
                }}
                fromZero
                showBarTops={false}
                withCustomBarColorFromData={true}
            />
        </View>
    );

    const renderLineChart = () => {
        if (!marketData.priceHistory || marketData.priceHistory.length <= 1) return null;

        return (
            <View key="line-chart">
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
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={{
                        ...premiumConfig,
                        fillShadowGradientFrom: 'rgba(74, 108, 247, 0.3)',
                        fillShadowGradientTo: 'rgba(74, 108, 247, 0.01)',
                    }}
                    style={{
                        marginVertical: 8,
                        borderRadius: 16,
                    }}
                    bezier
                    withHorizontalLabels={true}
                    withVerticalLabels={true}
                    withInnerLines={false} // Brak linii siatki
                    withOuterLines={false}
                    withShadow={true}
                    withDots={true}
                />
            </View>
        );
    };

    const charts = [
        renderBarChart(),
        ...(marketData.priceHistory && marketData.priceHistory.length > 1 ? [renderLineChart()] : [])
    ].filter(Boolean);

    return (
        <Animated.View style={[styles.premiumContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }]}]}>
            <Text style={styles.chartTitle}>{t('labels.marketAnalysis')}</Text>

        {charts.length > 1 ? (
            <Carousel
            loop={false}
                       width={screenWidth - 32}
                       height={280} // Więcej miejsca na podpisy
                       autoPlay={false}
                       data={charts}
                       renderItem={({ item }) => (
                           <View style={styles.carouselItem}>
                               {item}
                           </View>
                       )}
                       scrollAnimationDuration={400}
        />
    ) : (
        <View style={styles.singleChartContainer}>
            {charts[0]}
        </View>
    )}

<View style={styles.legendContainer}>
<View style={styles.legendItem}>
<View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
<Text style={styles.legendText}>{t('labels.demand')}</Text>
</View>
    <View style={styles.legendItem}>
        <View style={[styles.legendColor, { backgroundColor: '#FF9F40' }]} />
        <Text style={styles.legendText}>{t('labels.supply')}</Text>
    </View>
</View>
</Animated.View>
);
});

export default MarketChart;
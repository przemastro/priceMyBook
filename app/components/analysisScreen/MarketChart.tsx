import React from 'react';
import {View, Text, ActivityIndicator, ScrollView, StyleSheet, Dimensions} from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useTranslation } from 'react-i18next';
import { colors } from '@/styles/styles';
import { MarketData } from './types';

interface MarketChartProps {
    marketData: MarketData | null;
}

const MarketChart = React.memo(({ marketData }: MarketChartProps) => {
    const { t } = useTranslation();
    const chartWidth = Dimensions.get('window').width - 64;

    if (!marketData) {
        return (
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>{t('labels.marketAnalysis')}</Text>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>{t('labels.marketAnalysis')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ width: chartWidth }}>
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
                                ]
                            }]
                        }}
                        width={chartWidth}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={{
                            backgroundColor: colors.white,
                            backgroundGradientFrom: colors.white,
                            backgroundGradientTo: colors.white,
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(74, 108, 247, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            style: { borderRadius: 16 },
                            propsForDots: {
                                r: "6",
                                strokeWidth: "2",
                                stroke: colors.primary
                            }
                        }}
                        style={{
                            marginVertical: 8,
                            borderRadius: 16
                        }}
                    />

                    {marketData.priceHistory && marketData.priceHistory.length > 1 && (
                        <LineChart
                            data={{
                                labels: marketData.priceHistory.map(entry =>
                                    new Date(entry.date).toLocaleDateString()),
                                datasets: [{
                                    data: marketData.priceHistory.map(entry => entry.price)
                                }]
                            }}
                            width={chartWidth}
                            height={220}
                            yAxisLabel=""
                            yAxisSuffix=""
                            chartConfig={{
                                backgroundColor: colors.white,
                                backgroundGradientFrom: colors.white,
                                backgroundGradientTo: colors.white,
                                decimalPlaces: 2,
                                color: (opacity = 1) => `rgba(74, 108, 247, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                style: { borderRadius: 16 }
                            }}
                            bezier
                            style={{
                                marginVertical: 8,
                                borderRadius: 16
                            }}
                        />
                    )}
                </View>
            </ScrollView>
        </View>
    );
});

const styles = StyleSheet.create({
    chartContainer: {
        backgroundColor: 'white',
        borderRadius: 2,
        padding: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: colors.black,
    },
});

export default MarketChart;
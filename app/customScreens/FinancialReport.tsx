import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/styles';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { useTranslation } from 'react-i18next';

const chartWidth = Dimensions.get('window').width / 2 - 30;

const chartConfig = {
    backgroundGradientFrom: colors.buttonSelected1,
    backgroundGradientTo: colors.buttonSelected2,
    backgroundGradientFromOpacity: 0.5,
    backgroundGradientToOpacity: 0.7,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: () => colors.white,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
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
    { name: 'Sales', population: 45, color: '#4CAF50', legendFontColor: colors.black, legendFontSize: 12 },
    { name: 'Costs', population: 30, color: '#F44336', legendFontColor: colors.black, legendFontSize: 12 },
    { name: 'Profit', population: 25, color: '#2196F3', legendFontColor: colors.black, legendFontSize: 12 },
];

const FinancialReport = () => {
    const { t } = useTranslation();

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{t('titlesShort.financialReport')}</Text>

            <View style={styles.grid}>
                {/* Monthly Sales - Bar Chart */}
                <LinearGradient colors={[colors.buttonSelected1, colors.buttonSelected2]} style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>{t('charts.monthlySales')}</Text>
                    <BarChart
                        data={dummyBarData}
                        width={chartWidth}
                        height={180}
                        yAxisSuffix=" zł"
                        chartConfig={chartConfig}
                        withInnerLines={false}
                        showBarTops={false}
                        style={styles.chart}
                    />
                </LinearGradient>

                {/* Weekly Trend - Line Chart */}
                <LinearGradient colors={[colors.buttonSelected1, colors.buttonSelected2]} style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>{t('charts.weeklyTrend')}</Text>
                    <LineChart
                        data={dummyLineData}
                        width={chartWidth}
                        height={180}
                        yAxisSuffix=" zł"
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chart}
                    />
                </LinearGradient>

                {/* Revenue Share - Pie Chart */}
                <LinearGradient colors={[colors.buttonSelected1, colors.buttonSelected2]} style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>{t('charts.revenueShare')}</Text>
                    <PieChart
                        data={dummyPieData}
                        width={chartWidth}
                        height={180}
                        chartConfig={chartConfig}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        style={styles.chart}
                    />
                </LinearGradient>

                {/* Cost Breakdown - Bar Chart */}
                <LinearGradient colors={[colors.buttonSelected1, colors.buttonSelected2]} style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>{t('charts.costBreakdown')}</Text>
                    <BarChart
                        data={dummyBarData}
                        width={chartWidth}
                        height={180}
                        yAxisSuffix=" zł"
                        chartConfig={chartConfig}
                        withInnerLines={false}
                        style={styles.chart}
                    />
                </LinearGradient>

                {/* Profit Trend - Line Chart */}
                <LinearGradient colors={[colors.buttonSelected1, colors.buttonSelected2]} style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>{t('charts.profitTrend')}</Text>
                    <LineChart
                        data={dummyLineData}
                        width={chartWidth}
                        height={180}
                        yAxisSuffix=" zł"
                        chartConfig={chartConfig}
                        style={styles.chart}
                    />
                </LinearGradient>

                {/* Sales by Category - Pie Chart */}
                <LinearGradient colors={[colors.buttonSelected1, colors.buttonSelected2]} style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>{t('charts.salesByCategory')}</Text>
                    <PieChart
                        data={dummyPieData}
                        width={chartWidth}
                        height={180}
                        chartConfig={chartConfig}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        style={styles.chart}
                    />
                </LinearGradient>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 100,
        paddingBottom: 40,
        paddingHorizontal: 20,
        backgroundColor: colors.background,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.blackDark,
        marginBottom: 20,
        textAlign: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    chartContainer: {
        width: chartWidth,
        borderRadius: 16,
        padding: 10,
        marginBottom: 20,
    },
    chartTitle: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 14,
        marginBottom: 10,
        textAlign: 'center',
    },
    chart: {
        borderRadius: 12,
    },
});

export default FinancialReport;

import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '@/styles/styles';

// Typy dla stylów
interface IStyles {
    // Container styles
    premiumContainer: ViewStyle;
    skeletonContainer: ViewStyle;
    chartContainer: ViewStyle;
    singleChartContainer: ViewStyle;
    carouselWrapper: ViewStyle;
    carouselItem: ViewStyle;

    // Text styles
    chartTitle: TextStyle;
    chartSubtitle: TextStyle;
    noDataText: TextStyle;

    // Chart styles
    chartStyle: ViewStyle;

    // Legend styles
    legendContainer: ViewStyle;
    legendItem: ViewStyle;
    legendColor: ViewStyle;
    legendText: TextStyle;
}

// Style dla komponentów
export const styles = StyleSheet.create<IStyles>({
    premiumContainer: {
        backgroundColor: colors.background,
        borderRadius: 24,
        padding: 20,
        marginVertical: 16,
        marginHorizontal: 16,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
        width: '90%',
        alignSelf: 'center',
        maxWidth: 500,
    },

    skeletonContainer: {
        backgroundColor: colors.background,
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
    },

    chartContainer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 8,
        marginBottom: 16,
    },

    singleChartContainer: {
        width: '100%',
        alignItems: 'center',
    },

    carouselWrapper: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },

    carouselItem: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },

    chartTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 12,
        textAlign: 'center',
    },

    chartSubtitle: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.grayDark,
        marginBottom: 12,
        textAlign: 'center',
    },

    noDataText: {
        fontSize: 14,
        color: colors.gray,
        textAlign: 'center',
        marginTop: 16,
        paddingHorizontal: 20,
        lineHeight: 20,
    },

    chartStyle: {
        marginVertical: 8,
        borderRadius: 16,
    },

    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginTop: 16,
        gap: 16,
    },

    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
    },

    legendColor: {
        width: 14,
        height: 14,
        borderRadius: 7,
        marginRight: 6,
    },

    legendText: {
        fontSize: 12,
        color: colors.grayDark,
        fontWeight: '500'
    },
});

// Konfiguracja wykresów
export const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    decimalPlaces: 0,
    color: () => colors.primary,
    labelColor: () => colors.grayDark,
    style: {
        borderRadius: 16,
    },
    propsForDots: {
        r: "5",
        strokeWidth: "2",
        stroke: colors.primary,
        fill: colors.background
    },
    fillShadowGradient: colors.primary,
    fillShadowGradientOpacity: 0.15,
    strokeWidth: 2,
    barPercentage: 0.7,
    barRadius: 6,
    useShadowColorFromDataset: false,
    propsForBackgroundLines: {
        strokeWidth: 1,
        stroke: colors.grayLight,
        strokeDasharray: [3, 3],
    },
    propsForLabels: {
        fontSize: 11,
        fontWeight: '500'
    },
    propsForVerticalLabels: {
        dx: -8,
    },
    propsForHorizontalLabels: {
        dy: 4,
    },
};
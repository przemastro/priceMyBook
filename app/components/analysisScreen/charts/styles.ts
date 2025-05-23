import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '@/styles/styles';

// Typy dla stylów kontenerów
interface IStyles {
    premiumContainer: ViewStyle;
    skeletonContainer: ViewStyle;
    chartTitle: TextStyle;
    chartSubtitle: TextStyle;
    chartContainer: ViewStyle;
    chartStyle: ViewStyle;
    carouselWrapper: ViewStyle;
    carouselItem: ViewStyle;
    singleChartContainer: ViewStyle;
    legendContainer: ViewStyle;
    legendItem: ViewStyle;
    legendColor: ViewStyle;
    legendText: TextStyle;
}

// Style dla kontenerów i elementów UI
export const styles = StyleSheet.create<IStyles>({
    premiumContainer: {
        backgroundColor: '#f8f9ff',
        borderRadius: 24,
        padding: 16,
        marginBottom: 20,
        marginHorizontal: 16,
        shadowColor: '#4A6CF7',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
        width: '100%',
        alignSelf: 'center',
        maxWidth: 500,
    },
    skeletonContainer: {
        backgroundColor: '#f8f9ff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        height: 200
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 16,
        textAlign: 'center',
    },
    chartSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.grayDark,
        marginBottom: 8,
        textAlign: 'center',
    },
    chartContainer: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    chartStyle: {
        marginVertical: 8,
        borderRadius: 16,
    },
    carouselWrapper: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    carouselItem: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    singleChartContainer: {
        width: '100%',
        alignItems: 'center',
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
        gap: 20
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendColor: {
        width: 14,
        height: 14,
        borderRadius: 7,
        marginRight: 6,
    },
    legendText: {
        fontSize: 13,
        color: colors.grayDark,
        fontWeight: '500'
    },
});

// Konfiguracja specyficzna dla wykresów
export const chartConfig = {
    backgroundColor: '#f8f9ff',
    backgroundGradientFrom: '#f8f9ff',
    backgroundGradientTo: '#f8f9ff',
    decimalPlaces: 0,
    color: () => colors.primary,
    labelColor: () => colors.grayDark,
    style: {
        borderRadius: 16,
        paddingRight: 20
    },
    propsForDots: {
        r: "5",
        strokeWidth: "2",
        stroke: colors.primary,
        fill: "#fff"
    },
    fillShadowGradient: colors.primary,
    fillShadowGradientOpacity: 0.15,
    strokeWidth: 2,
    barPercentage: 0.7,
    barRadius: 6,
    useShadowColorFromDataset: false,
    propsForBackgroundLines: {
        strokeWidth: 0,
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
        rotation: -45
    }
};
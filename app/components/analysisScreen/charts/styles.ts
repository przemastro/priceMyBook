import {StyleSheet} from "react-native";
import {colors} from "@/styles/styles";

export const styles = StyleSheet.create({
    premiumContainer: {
        backgroundColor: '#f8f9ff', // Jasne niebieskie tło
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#4A6CF7',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
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
    carouselItem: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    singleChartContainer: {
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
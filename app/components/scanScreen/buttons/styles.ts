import {StyleSheet} from "react-native";
import {colors} from "@/styles/styles";

export const styles = StyleSheet.create({
    amazonPricesContainer: {
        marginVertical: 10,
    },
    amazonPricesTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: colors.black,
        textAlign: 'center',
    },
    amazonPriceButton: {
        borderRadius: 8,
        marginBottom: 8,
        overflow: 'hidden',
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    amazonPriceButtonSelected: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    priceButtonGradient: {
        padding: 12,
    },
    amazonPriceText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.secondary,
    },
    selectedPriceText: {
        color: colors.primary,
    },
    amazonPriceDetails: {
        fontSize: 12,
        color: colors.grayDark,
        marginTop: 4,
    },
    selectedPriceDetails: {
        color: colors.primary,
    },
});
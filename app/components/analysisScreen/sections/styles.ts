import {StyleSheet} from "react-native";
import {colors} from "@/styles/styles";

export const styles = StyleSheet.create({
    detailsRowContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 16,
    },
    bookCoverContainer: {
        width: 110,
        height: 160,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    bookCoverImage: {
        width: '100%',
        height: '100%',
    },
    bookCoverPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookDetailsColumn: {
        flex: 1,
        justifyContent: 'space-between',
    },
    editButton: {
        borderRadius: 8,
        overflow: 'hidden',
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    editButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    editButtonText: {
        color: colors.primary,
        marginLeft: 4,
        fontSize: 14,
        fontWeight: '500',
    },
    container: {
        zIndex: 1000,
        elevation: 5,
    },
    averagePriceContainer: {
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        marginBottom: 8,
    },
    averagePriceLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    averagePriceIcon: {
        marginRight: 8,
    },
    averagePriceLabel: {
        fontSize: 14,
        color: colors.grayDark,
    },
    averagePriceValue: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.black,
    },
    noDataText: {
        fontSize: 14,
        color: colors.gray,
        fontStyle: 'italic',
    },
    detailsContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 1,
    },
    detailSection: {
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    detailLabel: {
        fontSize: 14,
        color: colors.grayDark,
        marginLeft: 8,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.black,
        marginLeft: 8,
        textAlign: 'right',
    },
    positiveValue: {
        color: colors.primary,
    },
    negativeValue: {
        color: colors.error,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 6,
    },
    tag: {
        backgroundColor: 'rgba(255,59,48,0.1)',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 6,
        marginBottom: 6,
    },
    positiveTag: {
        backgroundColor: 'rgba(74,108,247,0.1)',
    },
    tagText: {
        fontSize: 12,
        color: colors.error,
    },
    positiveTagText: {
        color: colors.primary,
    },
    marketFactors: {
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 8,
        padding: 10,
        marginTop: 6,
    },
    marketFactor: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    marketFactorLabel: {
        fontSize: 12,
        color: colors.grayDark,
    },
    marketFactorValue: {
        fontSize: 12,
        fontWeight: '500',
        color: colors.black,
    },
    ratingOuterContainer: {
        marginLeft: -16,
        marginRight: -16,
        marginBottom: 0,
        paddingTop: 40,
        marginTop: -80,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        overflow: 'hidden',
    },
    ratingContainer: {
        padding: 24,
        paddingBottom: 16,
    },
    ratingHeader: {
        alignItems: 'center',
        marginBottom: 16,
    },
    ratingTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 12,
    },
    ratingStars: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    ratingText: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: '500',
    },
    priceSummarySection: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 16,
        shadowColor: colors.lightPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    priceSummaryGradient: {
        padding: 16,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    priceLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 14,
        color: colors.grayDark,
        marginLeft: 8,
    },
    estimatedPriceLabel: {
        color: colors.primary,
        fontWeight: '500',
    },
    priceValue: {
        fontSize: 16,
        color: colors.black,
        fontWeight: '500',
    },
    estimatedPriceValue: {
        color: colors.primary,
        fontWeight: '600',
    },
    estimatedPriceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    expandIcon: {
        marginLeft: 8,
    },
    separator: {
        height: 1,
        backgroundColor: colors.buttonSelected1,
        marginVertical: 12,
    },
    tooltip: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginTop: 8,
        borderWidth: 1,
        borderColor: colors.buttonSelected1,
        shadowColor: colors.lightPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
});
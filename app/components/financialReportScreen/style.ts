import {Dimensions, StyleSheet} from "react-native";
import {colors} from "@/styles/styles";

export const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        paddingTop: 60,
        minHeight: Dimensions.get('window').height,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 15,
        width: '100%',
        justifyContent: 'space-between',
        position: 'absolute',
        top: 30,
        left: 0,
        zIndex: 10,
        paddingHorizontal: 0
    },
    backButton: {
        marginLeft: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '500',
        color: colors.blackDark,
        textAlign: 'center',
        flex: 1,
        marginLeft: 30
    },
    spacer: {
        width: 44,
        marginRight: 10,
    },
    summaryCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        marginTop: 30,
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    summaryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.transparentWhite,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    summaryTextContainer: {
        flex: 1,
    },
    summaryLabel: {
        fontSize: 14,
        color: colors.grayDark,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: colors.transparentWhite,
        marginVertical: 8,
    },
    stepContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: colors.background,
        borderRadius: 12,
        shadowColor: colors.lightPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: -30,
        paddingBottom: 30,
    },
    stepHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.grayLight,
    },
    stepTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: colors.blackDark,
    },
    navigationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressDots: {
        flexDirection: 'row',
        marginHorizontal: 10,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginHorizontal: 3,
    },
    activeDot: {
        backgroundColor: colors.primary,
    },
    inactiveDot: {
        backgroundColor: colors.gray,
    },
    stepContent: {
        flex: 1,
        padding: 16,
    },
    chartContainer: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    chart: {
        borderRadius: 8,
    },
    withShadow: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    statsContainer: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 16,
    },
    statItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statLabel: {
        fontSize: 14,
        color: colors.grayDark,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.black,
    },
    positiveValue: {
        color: colors.success,
    },
    negativeValue: {
        color: colors.error,
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    noDataText: {
        fontSize: 16,
        color: colors.grayDark,
        marginTop: 16,
        textAlign: 'center',
    },
    noDataHint: {
        fontSize: 14,
        color: colors.gray,
        marginTop: 8,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: colors.grayDark,
    },
});
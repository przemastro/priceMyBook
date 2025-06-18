import {StyleSheet} from "react-native";
import {colors} from "@/styles/styles";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        backgroundColor: colors.background,
    },
    backgroundGradient: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.9
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
    },
    spacer: {
        width: 44,
        marginRight: 10,
    },
    scrollContainer: {
        flex: 1,
        paddingTop: 80,
    },
    scrollContent: {
        paddingHorizontal: 10,
    },
    mainCard: {
        backgroundColor: colors.background,
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15,
        overflow: 'hidden',
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        marginTop: 10,
        minHeight: 900,
        maxHeight: 900
    },
    tabsWrapper: {
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        overflow: 'hidden',
    },
    tabsGradient: {
        padding: 2,
    },
    tabsContainer: {
        backgroundColor: colors.transparentWhite,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    tab: {
        alignItems: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        width: '23%',
    },
    activeTab: {
        backgroundColor: colors.transparentWhite,
    },
    tabIconContainer: {
        marginBottom: 4,
    },
    tabIcon: {
        color: colors.black,
    },
    activeTabIcon: {
        color: colors.primary,
    },
    tabLabel: {
        color: colors.black,
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
    },
    activeTabLabel: {
        fontWeight: '700',
        color: colors.primary,
    },
    contentWrapper: {
        padding: 20,
    },
    tabContent: {
        paddingBottom: 10,
    },
    settingsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: colors.primary,
    },
    aboutText: {
        fontSize: 16,
        marginBottom: 20,
        color: colors.black,
        lineHeight: 24,
    },
    featuresTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
        color: colors.primary,
    },
    featureItem: {
        fontSize: 15,
        color: colors.grayDark,
        lineHeight: 24,
        marginBottom: 8,
        marginLeft: 10,
    },
    algorithmDescription: {
        fontSize: 16,
        marginBottom: 20,
        color: colors.black,
        lineHeight: 24,
    },
    algorithmSectionTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
        color: colors.primary,
    },
    algorithmStep: {
        fontSize: 15,
        color: colors.grayDark,
        lineHeight: 24,
        marginBottom: 8,
        marginLeft: 10,
    },
    formulaTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: colors.primary,
    },
    formula: {
        fontSize: 15,
        fontStyle: 'italic',
        color: colors.grayDark,
        lineHeight: 24,
        marginLeft: 10,
        backgroundColor: colors.transparentLightPrimary,
        padding: 12,
        borderRadius: 8,
    },
    languageButton: {
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3
    },
    languageButtonText: {
        color: colors.white,
        fontSize: 17,
        fontWeight: '600',
    },
    rateOptionsContainer: {
        marginTop: 20,
        gap: 15,
    },
    rateOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    rateButton: {
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    rateButtonText: {
        color: colors.white,
        fontSize: 17,
        fontWeight: '600',
    },
    donateButton: {
        backgroundColor: colors.secondary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    donateButtonText: {
        color: colors.white,
        fontSize: 17,
        fontWeight: '600',
    },
});
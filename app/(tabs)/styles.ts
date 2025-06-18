import {StyleSheet} from "react-native";
import {colors} from "@/styles/styles";
import {color} from "ansi-fragments";

export const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 10,
        paddingTop: 50,
        backgroundColor: 'transparent',
    },
    backgroundGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    priceValue: {
        fontSize: 16,
        color: colors.black,
        fontWeight: '500',
    },
    selectedDefect: {
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    combinedSection: {
        backgroundColor: colors.background,
        borderRadius: 0,
        marginTop: 10,
        marginBottom: 0,
    },
    fullScreenContainer: {
        flex: 1,
        backgroundColor: 'black',
    },
    fullScreenCamera: {
        flex: 1,
        width: '100%',
    },
    cameraOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
        padding: 20,
    },
    scanFrame: {
        position: 'absolute',
        top: '35%',
        alignSelf: 'center',
        width: 250,
        height: 250,
        borderWidth: 0,
    },
    scanFrameTopLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 50,
        height: 50,
        borderLeftWidth: 4,
        borderTopWidth: 4,
        borderColor: 'white',
    },
    scanFrameTopRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 50,
        height: 50,
        borderRightWidth: 4,
        borderTopWidth: 4,
        borderColor: 'white',
    },
    scanFrameBottomLeft: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 50,
        height: 50,
        borderLeftWidth: 4,
        borderBottomWidth: 4,
        borderColor: 'white',
    },
    scanFrameBottomRight: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 50,
        height: 50,
        borderRightWidth: 4,
        borderBottomWidth: 4,
        borderColor: 'white',
    },
    bottomControls: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    scanButton: {
        backgroundColor: colors.transparentBlack,
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    scanButtonText: {
        color: colors.white,
        marginLeft: 10,
    },
    progressContainer: {
        width: '80%',
        alignItems: 'center',
    },
    progressBar: {
        width: '100%',
        backgroundColor: colors.gray,
        height: 5,
        borderRadius: 2,
        marginBottom: 5,
        overflow: 'hidden'
    },
    scanningText: {
        color: 'white',
        textAlign: 'center',
    },
    collectionName: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        color: colors.secondary,
        marginBottom: 4,
    },
    saveButton: {
        position: 'absolute',
        bottom: 100,
        left: 30,
        right: 30,
        borderRadius: 10,
        height: 50,
        overflow: 'hidden',
    },
    saveButtonGradient: {
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    stepContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: colors.background,
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15,
        shadowColor: colors.lightPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    stepHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.grayLight,
    },
    stepTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: colors.blackDark,
        marginRight: 10,
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
        justifyContent: 'flex-start',
        alignSelf: 'stretch',
        minHeight: 500,
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.transparentBlack,
    },
    modalContainer: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    modalContent: {
        padding: 24,
        paddingTop: 32,
        alignItems: 'center',
    },
    iconPreviewContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconPreviewCircle: {
        width: 100,
        height: 100,
        borderRadius: 60,
        backgroundColor: colors.whiteBlue,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.transparentLightPrimary,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.black,
        marginBottom: 8,
        textAlign: 'center',
    },
    modalText: {
        fontSize: 16,
        color: colors.grayDark,
        marginBottom: 24,
        textAlign: 'center',
        lineHeight: 24,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    closeButtonScanScreen: {
        position: 'absolute',
        top: 46,
        left: 16,
    },
    closeButtonCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.transparentLightPrimary,
    },
    closeButtonText: {
        fontSize: 20,
        color: colors.primary,
        lineHeight: 24,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 16,
    },
    actionButton: {
        borderRadius: 10,
        overflow: 'hidden',
        width: '100%',
        height: 50
    },
    confirmButton: {
        backgroundColor: colors.primary,
        height: 50
    },
    buttonGradient: {
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        paddingVertical: 0,
    },
    ratingOuterContainer: {
        paddingTop: 0,
        marginBottom: 20,
        marginHorizontal: -2,
        borderRadius: 0,
    },
    ratingContainer: {
        gap: 10,
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
        gap: 6,
    },
    priceLabel: {
        fontSize: 14,
        color: colors.grayDark,
    },
    priceLabelTotal: {
        fontSize: 18,
        color: colors.blackDark,
        marginLeft: 5
    },
    priceLabelSold: {
        fontSize: 14,
        color: colors.primary,
    },
    priceValueTotal: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
    },
    separator: {
        height: 1,
        backgroundColor: colors.gray,
        marginVertical: 12,
    },
    withShadow: {
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    priceSummarySection: {
        borderRadius: 15,
        overflow: 'hidden',
        marginHorizontal: 4,
        shadowColor: colors.lightPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        marginTop: 20
    },
    priceSummaryGradient: {
        padding: 16,
        backgroundColor: colors.background,
        borderRadius: 12,
    },
    emptyBookContainer: {
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: colors.transparentBlackLight,
    },
    collectionDetails: {
        marginTop: 0,
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: colors.background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.transparentBlackLight,
        marginTop: 20,
        width: '90%',
        marginLeft: 20,
        marginRight: 20
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        color: colors.grayDark,
    },
    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: colors.buttonSelected1,
        marginRight: 5,
        marginLeft: 5
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: colors.black,
    },
    headerButtons: {
        flexDirection: 'row',
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    headerButtonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    emptyActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    emptyActionText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 5,
    },
    moreButton: {
        alignSelf: 'flex-end',
        borderRadius: 8,
        overflow: 'hidden',
        marginTop: 20
    },
    moreButtonText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '500'
    },
    outerContainer: {
        flex: 1,
        position: 'relative',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 48,
        marginBottom: 10,
        width: '100%',
        justifyContent: 'space-between',
    },
    backButton: {
        marginLeft: 20,
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
        marginRight: 20,
    },
    listContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    headerOuterContainer: {
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 10
    },
    servicesContainer: {
        flex: 1,
        marginTop: 10,
        backgroundColor: colors.background,
        padding: 20,
        borderRadius: 15,
        marginBottom: 10,
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3
    },
    button: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    iconContainer: {
        backgroundColor: colors.transparentBlackLight,
        borderRadius: 30,
        padding: 12
    },
    buttonTitle: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.black,
        marginTop: 8,
        textAlign: 'center'
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: colors.whiteBlue,
    },
    permissionText: {
        marginBottom: 16,
        textAlign: 'center',
        color: colors.primary2,
    },
    permissionButton: {
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 2,
    },
    permissionButtonText: {
        color: 'white',
        fontWeight: '500',
    },
    headerGradient: {
        padding: 2,
        opacity: 0.85
    },
    header: {
        padding: 20,
        borderRadius: 15,
        marginBottom: 0
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.blackDark,
        marginBottom: 8,
        textAlign: 'center'
    },
    descriptionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: colors.black,
        flex: 1,
        marginRight: 10
    },
    buttonWrapper: {
        alignItems: 'center',
        marginBottom: 20
    },
});
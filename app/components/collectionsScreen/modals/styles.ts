import {StyleSheet} from "react-native";
import {colors} from "@/styles/styles";

export const styles = StyleSheet.create({
    currentNameText: {
        fontSize: 16,
        color: colors.grayDark,
        textAlign: 'center',
        marginBottom: 10,
    },
    modalInput: {
        height: 50,
        borderWidth: 1,
        borderColor: 'rgba(74,108,247,0.2)',
        borderRadius: 10,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        marginBottom: 20,
        color: colors.black,
        fontSize: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(74,108,247,0.2)',
        borderRadius: 10,
        marginBottom: 20,
        backgroundColor: 'white',
    },
    iconPreview: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconSelectorText: {
        marginLeft: 10,
        color: colors.secondary,
    },
    iconsContainer: {
        maxHeight: 150,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(74,108,247,0.1)',
        borderRadius: 10,
        padding: 10,
    },
    iconsList: {
        justifyContent: 'center',
    },
    iconItem: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
        borderRadius: 8,
        backgroundColor: colors.whiteBlue,
    },
    selectedIconItem: {
        backgroundColor: colors.primary,
        borderWidth: 1,
        borderColor: colors.primary,
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.black,
        marginBottom: 16,
        textAlign: 'center',
    },
    infoContainer: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: colors.whiteBlue,
        borderRadius: 8,
    },
    infoText: {
        fontSize: 16,
        color: colors.grayDark,
        marginBottom: 4,
    },
    infoValue: {
        fontWeight: '600',
        color: colors.primary,
    },
    previewScroll: {
        maxHeight: 200,
        marginBottom: 16,
    },
    previewScrollContent: {
        paddingRight: 8,
    },
    bookPreview: {
        padding: 12,
        marginBottom: 8,
        backgroundColor: colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.gray,
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.black,
        marginBottom: 4,
    },
    bookDetails: {
        fontSize: 14,
        color: colors.grayDark,
        marginBottom: 4,
    },
    bookMeta: {
        fontSize: 12,
        color: colors.grayDark,
        marginTop: 4,
        fontStyle: 'italic',
    },
    moreItemsText: {
        fontSize: 14,
        color: colors.grayDark,
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
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
        height: 50,
        justifyContent: 'center',
    },

    platformButton: {
        height: 60,
        borderWidth: 1,
        borderColor: 'rgba(74,108,247,0.2)',
        borderRadius: 10,
        paddingHorizontal: 16,
        marginBottom: 12,
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    platformButtonSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    platformContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    platformButtonText: {
        marginLeft: 15,
        fontSize: 16,
        color: colors.primary,
    },
    platformButtonTextSelected: {
        color: colors.white,
    },

    statusButton: {
        height: 60,
        borderRadius: 10,
        marginBottom: 12,
        overflow: 'hidden',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusButtonText: {
        marginLeft: 15,
        fontSize: 16,
        color: colors.black,
        fontWeight: '500',
    },
    withShadow: {
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },

    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 80,
    },

    bookCoverSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    bookCoverImage: {
        width: 150,
        height: 200,
        borderRadius: 8,
    },
    bookCoverPlaceholder: {
        width: 150,
        height: 200,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.whiteBlue,
    },
    detailsSection: {
        width: '100%',
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'flex-start',
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.primary,
        marginRight: 8,
        minWidth: 100,
    },
    detailValue: {
        fontSize: 14,
        color: colors.primary,
        flex: 1,
    },
    multilineValue: {
        flex: 1,
        flexWrap: 'wrap',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: 'transparent',
        borderTopWidth: 1,
        borderTopColor: colors.grayLight,
    },
    footerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 8,
    },
    pdfButton: {
        flex: 1,
    },
    editButton: {
        flex: 1,
        backgroundColor: colors.primary,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    editButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

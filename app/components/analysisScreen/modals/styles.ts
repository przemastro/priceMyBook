import {StyleSheet} from "react-native";
import {colors} from "@/styles/styles";

export const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.transparentBlack,
    },
    modalContainer: {
        width: '90%',
        backgroundColor: colors.transparentBlack,
        borderRadius: 8,
        maxHeight: '80%',
        overflow: 'hidden',
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
    },
    modalContent: {
        padding: 16,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: colors.buttonSelected2,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: colors.white,
    },
    cancelButton: {
        padding: 12,
        marginRight: 8,
        borderRadius: 8,
        backgroundColor: colors.buttonSelected1,
    },
    cancelButtonText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '500',
    },
    saveButton: {
        borderRadius: 8,
        overflow: 'hidden',
        minWidth: 100,
    },
    saveButtonGradient: {
        padding: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    modalText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 8,
        textAlign: 'left',
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
    },
    modalButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 2,
        marginLeft: 10,
    },
    acceptButton: {
        backgroundColor: 'transparent',
    },
    acceptButtonText: {
        color: colors.primary,
        fontWeight: '500',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 50,
        paddingBottom: 90,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
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
    bookCoverSection: {
        alignItems: 'center',
        marginBottom: 24,
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
    },
    bookCoverPlaceholderText: {
        marginTop: 8,
        color: colors.primary,
        fontSize: 14,
    },
    formSection: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        color: colors.secondary,
        marginBottom: 8,
        fontWeight: '500',
    },
    footer: {
        padding: 16,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.grayLight,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        borderRadius: 10,
        overflow: 'hidden',
        width: '100%',
        height: 50,
    },
    buttonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    editableInput: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.buttonSelected1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: colors.black,
    },
    errorInput: {
        borderColor: 'red',
    },
    iconPreviewContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconPreviewCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.whiteBlue,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.transparentLightPrimary,
    },
    defectInfoContainer: {
        width: '100%',
        marginBottom: 24,
        alignItems: 'center',
    },
    defectName: {
        fontSize: 18,
        fontWeight: '500',
        color: colors.black,
        marginBottom: 8,
        textAlign: 'center',
    },
    defectDetails: {
        width: '100%',
    },
    defectDetailText: {
        fontSize: 16,
        color: colors.grayDark,
        textAlign: 'center',
        marginBottom: 4,
    },
    defectDetailValue: {
        fontWeight: '600',
        color: colors.primary,
    },
    rejectButtonText: {
        color: colors.grayDark,
        fontSize: 16,
        fontWeight: '600',
    },
});
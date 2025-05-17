import {StyleSheet} from "react-native";
import {colors} from "@/styles/styles";

export const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 8,
        maxHeight: '80%',
        overflow: 'hidden',
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.buttonSelected1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
    },
    closeModalButton: {
        padding: 4,
    },
    modalContent: {
        padding: 16,
    },
    modalBookCoverContainer: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    modalBookCoverImage: {
        width: '100%',
        height: '100%',
    },
    modalBookCoverPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBookCoverPlaceholderText: {
        marginTop: 8,
        fontSize: 14,
        color: colors.primary,
    },
    modalInputGroup: {
        marginBottom: 16,
    },
    modalInputLabel: {
        fontSize: 14,
        color: colors.secondary,
        marginBottom: 4,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: colors.buttonSelected2,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: 'white',
    },
    modalDescriptionText: {
        fontSize: 14,
        color: colors.black,
        lineHeight: 20,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: colors.buttonSelected1,
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
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    modalDefectInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalDefectIcon: {
        marginRight: 10,
    },
    modalDefectName: {
        fontSize: 18,
        fontWeight: '500',
        color: colors.black,
    },
    modalText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 8,
        textAlign: 'left',
    },
    modalBoldText: {
        fontWeight: '600',
        color: colors.black,
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
    rejectButton: {
        backgroundColor: 'transparent',
    },
    acceptButtonText: {
        color: colors.primary,
        fontWeight: '500',
    },
    rejectButtonText: {
        color: colors.primary,
        fontWeight: '500',
    },
});
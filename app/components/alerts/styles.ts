import {StyleSheet} from "react-native";
import {colors} from "@/styles/styles";

export const styles = StyleSheet.create({
    alertModalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    alertModalContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        position: 'relative',
    },
    alertModalContent: {
        alignItems: 'center',
        paddingTop: 20,
    },
    alertModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: colors.black,
        textAlign: 'center',
    },
    alertModalMessage: {
        fontSize: 16,
        marginBottom: 20,
        color: colors.grayDark,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    alertModalButton: {
        borderRadius: 8,
        overflow: 'hidden',
        width: '100%',
    },
    cancelButton: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray,
    },
    alertModalButtonGradient: {
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1,
    },
    closeButtonCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(74,108,247,0.1)',
    },
    closeButtonText: {
        fontSize: 20,
        color: colors.primary,
        lineHeight: 24,
    },
    alertModalButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
    cancelButtonText: {
        color: colors.grayDark,
        fontWeight: '600',
        padding: 12,
        textAlign: 'center',
    },
});
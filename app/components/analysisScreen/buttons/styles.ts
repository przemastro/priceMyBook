import {StyleSheet} from "react-native";
import {colors} from "@/styles/styles";

export const styles = StyleSheet.create({
    scanButtonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        marginBottom: 20,
    },
    scanButtonWrapper: {
        borderRadius: 50,
        width: 80,
        height: 80,
        shadowColor: colors.lightPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    scanButtonGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanButtonLabel: {
        marginTop: 10,
        color: colors.primary,
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
});
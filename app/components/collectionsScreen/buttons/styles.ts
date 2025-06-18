import {StyleSheet} from "react-native";
import {colors} from "@/styles/styles";

export const styles = StyleSheet.create({
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
        borderRadius: 8,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: colors.primary,
        gap: 8,
    },
    buttonText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '600',
    }
});
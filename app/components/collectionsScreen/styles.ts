import {StyleSheet} from "react-native";
import {colors} from "@/styles/styles";

export const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
    },
    categoriesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.grayLight,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    categoryText: {
        fontSize: 14,
        color: colors.grayDark,
        marginRight: 4,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.primary,
        borderStyle: 'dashed',
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    addButtonText: {
        color: colors.primary,
        fontSize: 14,
        marginLeft: 4,
    },
    addCategoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        height: 32,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 16,
        paddingHorizontal: 12,
        backgroundColor: colors.white,
        marginRight: 8,
    },
    confirmButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
});
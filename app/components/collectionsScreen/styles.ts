import {StyleSheet} from "react-native";
import {colors} from "@/styles/styles";

export const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    title: {
        fontSize: 16,
        color: colors.secondary,
        marginBottom: 8,
    },
    categoriesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
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
        gap: 8,
        width: '100%',
    },
    input: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: colors.gray,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: colors.white,
        color: colors.black,
    },
    confirmButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
});
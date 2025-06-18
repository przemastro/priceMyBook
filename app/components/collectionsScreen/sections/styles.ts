import {Dimensions, StyleSheet} from "react-native";
import {colors} from "@/styles/styles";



export const styles = StyleSheet.create({
    booksCarousel: {
        width: '100%',
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 60,
        width: '100%',
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
    },
    navButton: {
        padding: 10,
        marginHorizontal: 5,
        backgroundColor: colors.white,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.gray,
    },
    navSpacer: {
        width: 20,
    },
    container: {
        marginTop: 16,
        paddingHorizontal: 16,
        height: 40,
    },
    scrollContent: {
        alignItems: 'center',
        gap: 8,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        height: 32,
    },
    categoryText: {
        fontSize: 14,
        color: colors.grayDark,
    },
    emptyCategoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        height: 32,
    },
    emptyCategoryText: {
        fontSize: 14,
        color: colors.gray,
        fontStyle: 'italic',
    },
    listContainer: {
        flexGrow: 0, // Zapobiega rozszerzaniu się kontenera
        minHeight: 200, // Minimalna wysokość
    },
    itemContainer: {
        marginBottom: 12,
        paddingHorizontal: 8,
    },
    collectionCard: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    selectedCollectionCard: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    cardGradient: {
        flex: 1,
        padding: 12,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    collectionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.transparentBlackLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    selectedCollectionIcon: {
        backgroundColor: colors.transparentLightPrimary,
    },
    textContainer: {
        flex: 1,
    },
    collectionName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.secondary,
        marginBottom: 4,
    },
    selectedCollectionName: {
        color: colors.primary,
    },
    collectionBookCount: {
        fontSize: 13,
        color: colors.grayDark,
    },
    collectionValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
        marginTop: 2,
    },
    menuButton: {
        padding: 8,
        marginLeft: 8,
    },
    listContent: {
        paddingBottom: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.blackDark,
    },
    menuContainer: {
        position: 'absolute',
        backgroundColor: colors.white,
        borderRadius: 8,
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 10,
        minWidth: 160,
    },
    menuTriangle: {
        position: 'absolute',
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: colors.white,
    },
    menuTriangleTop: {
        top: -8,
        right: 12,
    },
    menuTriangleBottom: {
        bottom: -8,
        right: 12,
        transform: [{ rotate: '180deg' }],
    },
    menuContent: {
        paddingVertical: 4,
    },
    menuOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    menuOptionText: {
        fontSize: 14,
        marginLeft: 8,
        color: colors.blackDark,
    },
    deleteOption: {
        borderTopWidth: 1,
        borderTopColor: colors.grayLight,
    },
    deleteText: {
        fontSize: 14,
        marginLeft: 8,
        color: colors.blackDark,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1,
    },
    closeButtonText: {
        fontSize: 20,
        color: colors.primary,
        lineHeight: 24,
    },
});
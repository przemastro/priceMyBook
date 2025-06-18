import {Dimensions, StyleSheet} from "react-native";
import {colors} from "@/styles/styles";

const BOOK_CARD_WIDTH = Dimensions.get('window').width * 0.9;
const BOOK_CARD_HEIGHT = Dimensions.get('window').height * 0.35;
const IMAGE_SIZE = 80;
const CARD_PADDING = 12;
export const styles = StyleSheet.create({
    bookItemContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    bookCard: {
        width: BOOK_CARD_WIDTH - 20,
        height: BOOK_CARD_HEIGHT - 110,
        borderRadius: 12,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
        marginBottom: 20,
    },
    bookCardGradient: {
        flex: 1,
        padding: CARD_PADDING,
        justifyContent: 'space-between',
    },
    clearButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10,
        backgroundColor: colors.buttonSelected1,
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
        marginTop: 10,
        marginBottom: 10,
    },
    bookImageContainer: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        borderRadius: IMAGE_SIZE / 2,
        overflow: 'hidden',
        marginRight: 12,
        backgroundColor: colors.whiteBlue,
    },
    bookImage: {
        width: '100%',
        height: '100%',
    },
    bookImagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.transparentWhite,
    },
    errorOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.whiteBlue,
    },
    bookDetailsScroll: {
        flex: 1,
        maxHeight: BOOK_CARD_HEIGHT - 140,
    },
    bookDetails: {
        flex: 1,
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 8,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 4,
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.primary,
        marginRight: 6,
        minWidth: 70,
    },
    detailValue: {
        fontSize: 13,
        color: colors.primary,
        flex: 1,
    },
    multilineValue: {
        flex: 1,
        flexWrap: 'wrap',
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: BOOK_CARD_WIDTH - 20,
        paddingHorizontal: 10,
        marginTop: 12,
    },
    actionButton: {
        alignItems: 'center',
        width: '48%',
    },
    actionIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    actionButtonText: {
        fontSize: 12,
        textAlign: 'center',
        color: colors.grayDark,
        fontWeight: '500',
    },
});
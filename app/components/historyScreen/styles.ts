import { StyleSheet } from 'react-native';
import { colors, typography } from '@/styles/styles';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        paddingTop: 80,
        backgroundColor: '#f8f9ff',
    },
    listContent: {
        paddingBottom: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: colors.grayDark,
        textAlign: 'center',
    },
    item: {
        borderRadius: 12,
        marginBottom: 12,
        marginHorizontal: 16,
        overflow: 'hidden',
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemGradient: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.black,
        marginBottom: 4,
    },
    isbn: {
        fontSize: 14,
        color: colors.grayDark,
        marginBottom: 8,
    },
    price: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '500',
    },
    originalPrice: {
        fontSize: 14,
        color: colors.grayDark,
        textDecorationLine: 'line-through',
        marginTop: 4,
    },
    noPrice: {
        fontSize: 14,
        color: colors.grayDark,
        fontStyle: 'italic',
    },
    rateError: {
        fontSize: 12,
        color: colors.error,
        marginTop: 4,
    },
});
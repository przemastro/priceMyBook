import { StyleSheet } from 'react-native';
import { colors, typography } from '@/styles/styles';

export const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        paddingTop: 80,
        backgroundColor: '#f8f9fa',
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
        ...typography.body,
        textAlign: 'center',
        color: colors.grayDark,
    },
    // Add these new styles
    item: {
        padding: 16,
        marginBottom: 12,
        backgroundColor: colors.white,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    price: {
        ...typography.caption,
        color: colors.primary,
        marginTop: 4
    },
    originalPrice: {
        ...typography.caption,
        color: colors.grayDark,
        textDecorationLine: 'line-through',
        marginTop: 4
    },
    noPrice: {
        ...typography.caption,
        color: colors.grayDark,
        fontStyle: 'italic',
        marginTop: 4
    },
    rateError: {
        ...typography.caption,
        color: colors.error,
        fontSize: 12,
        marginTop: 4
    }
});
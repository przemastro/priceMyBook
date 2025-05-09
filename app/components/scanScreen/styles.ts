import { StyleSheet } from 'react-native';
import { colors } from '@/styles/styles';

export const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#f8f9fa',
    },
    permissionText: {
        marginBottom: 16,
        textAlign: 'center',
        color: '#2c3e50',
    },
    permissionButton: {
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 2,
    },
    permissionButtonText: {
        color: 'white',
        fontWeight: '500',
    },
    fullScreenContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
});
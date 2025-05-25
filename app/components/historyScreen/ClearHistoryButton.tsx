import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/styles';
import { t } from "i18next";

type ClearHistoryButtonProps = {
    onPress: () => void;
};

const ClearHistoryButton = ({ onPress }: ClearHistoryButtonProps) => (
    <TouchableOpacity
        style={styles.button}
        onPress={onPress}
    >
        <Text style={styles.buttonText}>
            {t('buttons.clearHistory')}
        </Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 16,
        alignItems: 'center' as const, // Dodane 'as const' dla typu
        justifyContent: 'center' as const, // Dodane 'as const' dla typu
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600' as const, // Dodane 'as const' dla typu
    }
});

export default ClearHistoryButton;
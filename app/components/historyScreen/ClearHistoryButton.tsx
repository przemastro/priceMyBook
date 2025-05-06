import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { colors } from '@/styles/styles';
import {t} from "i18next";

type ClearHistoryButtonProps = {
    onPress: () => void;
};

const ClearHistoryButton = ({ onPress }: ClearHistoryButtonProps) => (
    <TouchableOpacity
        style={{
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.white,
            borderRadius: 2,
            borderWidth: 1,
            borderColor: colors.primary,
            marginVertical: 16,
        }}
        onPress={onPress}
    >
        <Text style={{ color: colors.primary, fontWeight: '600' }}>
            {t('buttons.clearHistory')}
        </Text>
    </TouchableOpacity>
);

export default ClearHistoryButton;
import React from 'react';
import { TouchableOpacity, Text} from 'react-native';
import { t } from "i18next";
import { styles } from './styles'

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

export default ClearHistoryButton;
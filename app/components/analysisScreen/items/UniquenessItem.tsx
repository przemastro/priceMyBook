import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import { UNIQUENESS_TYPES } from '../types';

type UniquenessItemProps = {
    item: typeof UNIQUENESS_TYPES[number];
    selected: boolean;
    onPress: () => void;
};

const UniquenessItem = ({ item, selected, onPress }: UniquenessItemProps) => {
    const { t } = useTranslation();

    return (
        <TouchableOpacity
            style={[styles.defectItemContainer, selected && styles.selectedDefect]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <LinearGradient
                colors={selected
                    ? [colors.buttonSelected1, colors.buttonSelected2]
                    : [colors.white, colors.whiteBlue]}
                style={styles.defectItemGradient}
            >
                <View style={styles.defectIconContainer}>
                    <Ionicons
                        name={item.icon as any}
                        size={28}
                        color={selected ? colors.primary : colors.secondary}
                    />
                </View>
                <Text style={[styles.defectName, selected && styles.selectedDefectName]}>
                    {t(item.label)}
                </Text>
            </LinearGradient>
        </TouchableOpacity>
    );
};

export default React.memo(UniquenessItem);
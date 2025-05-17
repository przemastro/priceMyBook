import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import { BookDefect } from '../types';

type DefectItemProps = {
    item: BookDefect;
    onPress: () => void;
};

const DefectItem = ({ item, onPress }: DefectItemProps) => {
    const { t } = useTranslation();

    return (
        <TouchableOpacity
            style={[styles.defectItemContainer, item.selected && styles.selectedDefect]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <LinearGradient
                colors={item.selected
                    ? [colors.buttonSelected1, colors.buttonSelected2]
                    : [colors.white, colors.whiteBlue]}
                style={styles.defectItemGradient}
            >
                {item.selected && item.count > 0 && (
                    <View style={styles.defectCountBadge}>
                        <Text style={styles.defectCountBadgeText}>{item.count}</Text>
                    </View>
                )}
                <View style={styles.defectIconContainer}>
                    <Ionicons
                        name={item.icon as any}
                        size={28}
                        color={item.selected ? colors.primary : colors.secondary}
                    />
                </View>
                <Text style={[styles.defectName, item.selected && styles.selectedDefectName]}>
                    {t(`defects.${item.id}`)}
                </Text>
            </LinearGradient>
        </TouchableOpacity>
    );
};

export default React.memo(DefectItem);
import React from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { BookDefect } from '../types';
import { styles } from './styles'

type DefectItemProps = {
    item: BookDefect;
    onPress: () => void;
    buttonSize: number;
};

const DefectItem = ({ item, onPress, buttonSize }: DefectItemProps) => {
    return (
        <TouchableOpacity
            style={[
                localStyles.button,
                item.selected && localStyles.selectedDefect,
                {
                    width: buttonSize,
                    height: buttonSize,
                }
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <LinearGradient
                colors={item.selected
                    ? [colors.buttonSelected1, colors.buttonSelected2]
                    : [colors.white, colors.whiteBlue]}
                style={styles.buttonGradient}
            >
                {item.selected && item.count > 0 && (
                    <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{item.count}</Text>
                    </View>
                )}
                <View style={styles.iconContainer}>
                    <Ionicons
                        name={item.icon as any}
                        size={24}
                        color={item.selected ? colors.primary : item.color}
                    />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};


const localStyles = StyleSheet.create({
    button: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    selectedDefect: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
});

export default React.memo(DefectItem);
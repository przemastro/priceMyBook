import React from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import { UNIQUENESS_TYPES } from '../types';

type UniquenessItemProps = {
    item: typeof UNIQUENESS_TYPES[number];
    selected: boolean;
    onPress: () => void;
    buttonSize: number;
};

const UniquenessItem = ({ item, selected, onPress, buttonSize }: UniquenessItemProps) => {
    const { t } = useTranslation();

    return (
        <TouchableOpacity
            style={[
                styles.button,
                selected && styles.selectedUniqueness,
                {
                    width: buttonSize,
                    height: buttonSize,
                }
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <LinearGradient
                colors={selected
                    ? [colors.buttonSelected1, colors.buttonSelected2]
                    : [colors.white, colors.whiteBlue]}
                style={styles.buttonGradient}
            >
                <View style={styles.iconContainer}>
                    <Ionicons
                        name={item.icon as any}
                        size={24}
                        color={selected ? colors.primary : item.color || colors.secondary}
                    />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    selectedUniqueness: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    buttonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 30,
        padding: 12,
    },
});

export default React.memo(UniquenessItem);
import React from 'react';
import {TouchableOpacity, View, StyleSheet} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { MarketFactorToggle } from '../types';
import { styles } from './styles'

type MarketFactorItemProps = {
    item: MarketFactorToggle;
    selected: boolean;
    onPress: () => void;
    buttonSize: number;
};

const MarketFactorItem = ({ item, selected, onPress, buttonSize }: MarketFactorItemProps) => {

    return (
        <TouchableOpacity
            style={[
                localStyles.button,
                selected && styles.selectedFactor,
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
                style={localStyles.buttonGradient}
            >
                <View style={localStyles.iconContainer}>
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
    buttonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        backgroundColor: colors.transparentBlackLight,
        borderRadius: 30,
        padding: 12,
    },
});

export default React.memo(MarketFactorItem);
import React from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { BookDefect } from '../types';

type DefectItemProps = {
    item: BookDefect;
    onPress: () => void;
    buttonSize: number;
};

const DefectItem = ({ item, onPress, buttonSize }: DefectItemProps) => {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                item.selected && styles.selectedDefect,
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
    selectedDefect: {
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
    countBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: colors.primary,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    countBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default React.memo(DefectItem);
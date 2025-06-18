import React from 'react';
import { View, TouchableOpacity, Text, Dimensions, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SharedValue } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { styles } from './styles'

const { width } = Dimensions.get('window');

interface CameraOverlayProps {
    pulseAnim: SharedValue<number>;
    onManualEntryPress: () => void;
}

export const CameraOverlay = ({ pulseAnim, onManualEntryPress }: CameraOverlayProps) => {
    const { t } = useTranslation();

    return (
        <View style={styles.cameraOverlay}>
            <Animated.View style={[localStyles.scanFrame, { transform: [{ scale: pulseAnim }] }]}>
                <View style={styles.scanFrameTopLeft} />
                <View style={styles.scanFrameTopRight} />
                <View style={styles.scanFrameBottomLeft} />
                <View style={styles.scanFrameBottomRight} />
            </Animated.View>

            <TouchableOpacity
                style={styles.manualEntryButton}
                onPress={onManualEntryPress}
            >
                <Ionicons name="keypad-outline" size={24} color="white" />
                <Text style={styles.manualEntryButtonText}>
                    {t('buttons.manualEntry')}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const localStyles = StyleSheet.create({
    scanFrame: {
        width: width * 0.7,
        height: width * 0.7,
        position: 'relative',
        backgroundColor: 'transparent',
    },
});
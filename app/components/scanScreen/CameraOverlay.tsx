import React from 'react';
import { View, TouchableOpacity, Text, Dimensions, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SharedValue } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

interface CameraOverlayProps {
    pulseAnim: SharedValue<number>;
    onManualEntryPress: () => void;
}

export const CameraOverlay = ({ pulseAnim, onManualEntryPress }: CameraOverlayProps) => {
    const { t } = useTranslation();

    return (
        <View style={styles.cameraOverlay}>
            <Animated.View style={[styles.scanFrame, { transform: [{ scale: pulseAnim }] }]}>
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

const styles = StyleSheet.create({
    cameraOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    scanFrame: {
        width: width * 0.7,
        height: width * 0.7,
        position: 'relative',
        backgroundColor: 'transparent',
    },
    scanFrameTopLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 50,
        height: 50,
        borderLeftWidth: 4,
        borderTopWidth: 4,
        borderColor: 'white',
    },
    scanFrameTopRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 50,
        height: 50,
        borderRightWidth: 4,
        borderTopWidth: 4,
        borderColor: 'white',
    },
    scanFrameBottomLeft: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 50,
        height: 50,
        borderLeftWidth: 4,
        borderBottomWidth: 4,
        borderColor: 'white',
    },
    scanFrameBottomRight: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 50,
        height: 50,
        borderRightWidth: 4,
        borderBottomWidth: 4,
        borderColor: 'white',
    },
    manualEntryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 2,
        marginTop: 20,
    },
    manualEntryButtonText: {
        color: 'white',
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '500',
    },
});
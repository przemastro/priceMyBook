import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';

type ScanButtonProps = {
    onPress: () => void;
    isScanning?: boolean;
    isLoading?: boolean;
};

const ScanButton = ({ onPress, isScanning = false, isLoading = false }: ScanButtonProps) => {
    const { t } = useTranslation();

    return (
        <View style={styles.scanButtonContainer}>
            <TouchableOpacity
                style={styles.scanButtonWrapper}
                onPress={onPress}
                disabled={isScanning || isLoading}
                activeOpacity={0.7}
            >
                <LinearGradient
                    colors={isScanning || isLoading
                        ? [colors.buttonSelected1, colors.buttonSelected2]
                        : [colors.lightPrimary, colors.primary]}
                    style={styles.scanButtonGradient}
                >
                    <Ionicons
                        name="scan-sharp"
                        size={50}
                        color={isScanning || isLoading ? colors.gray : 'white'}
                    />
                </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.scanButtonLabel}>
                {t(isScanning ? 'buttons.scanningInProgress' : 'buttons.startScanning')}
            </Text>
        </View>
    );
};

export default React.memo(ScanButton);
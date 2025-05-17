// components/analysisScreen/NavigationButtons.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/styles';
import { styles } from './styles';

interface NavigationButtonsProps {
    currentStep: number;
    totalSteps: number;
    onPrev: () => void;
    onNext: () => void;
    isLastStep: boolean;
    editMode: boolean;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
                                                                        currentStep,
                                                                        totalSteps,
                                                                        onPrev,
                                                                        onNext,
                                                                        isLastStep,
                                                                        editMode
                                                                    }) => {
    return (
        <View style={styles.fixedNavigationContainer}>
            <TouchableOpacity
                onPress={onPrev}
                disabled={currentStep === 0}
                activeOpacity={0.7}
            >
                <LinearGradient
                    style={[
                        styles.simpleNavButton,
                        currentStep === 0 && styles.disabledNavButton
                    ]}
                    colors={[colors.lightPrimary, colors.primary]}
                >
                    <Text style={styles.navButtonText}>Wstecz</Text>
                </LinearGradient>
            </TouchableOpacity>
            <View style={styles.progressDotsContainer}>
                {Array.from({ length: totalSteps }).map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.progressDot,
                            index === currentStep && styles.activeProgressDot
                        ]}
                    />
                ))}
            </View>
            <TouchableOpacity
                onPress={onNext}
                activeOpacity={0.7}
            >
                <LinearGradient
                    style={styles.simpleNavButton}
                    colors={[colors.lightPrimary, colors.primary]}
                >
                    <Text style={styles.navButtonText}>
                        {isLastStep
                            ? editMode ? 'Zapisz' : 'Dodaj'
                            : 'Dalej'}
                    </Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '@/styles/styles';

export default function WelcomeScreen() {
    const [showApp, setShowApp] = useState(false);
    const fadeAnim = useState(new Animated.Value(0))[0];
    const scaleAnim = useState(new Animated.Value(0.5))[0];

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.elastic(1.2),
                    useNativeDriver: true,
                })
            ]),
            Animated.delay(2500),
        ]).start(() => {
            setShowApp(true);
        });
    }, []);

    if (showApp) {
        return <Redirect href="/(tabs)/tabOne" />;
    }

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.logoContainer, {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
            }]}>
                <Ionicons name="book" size={80} color="white" />
                <Text style={styles.appName}>PriceMyBook</Text>
                <Text style={styles.appSlogan}>Zeskanuj • Wyceń • Zarabiaj</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    appName: {
        ...typography.h1,
        color: 'white',
        marginTop: 20,
    },
    appSlogan: {
        ...typography.body,
        color: 'white',
        marginTop: 10,
        opacity: 0.8,
        letterSpacing: 1,
    },
});
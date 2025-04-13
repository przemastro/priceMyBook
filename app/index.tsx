import React, { useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Redirect, router } from 'expo-router';
import { colors, typography, responsive } from '@/styles/styles';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        title: 'Witaj w PriceMyBook',
        description: 'Skanuj ISBN książek i sprawdzaj ich wartość',
        icon: 'scan-outline' // Zmienione z barcode-outline na scan-outline
    },
    {
        id: '2',
        title: 'Analizuj stan książek',
        description: 'Oceń wady i oblicz końcową cenę',
        icon: 'analytics-outline' // Zmienione z camera-outline na analytics-outline
    },
    {
        id: '3',
        title: 'Zarządzaj kolekcjami',
        description: 'Twórz kolekcje i eksportuj dane',
        icon: 'library-outline' // Pozostawione library-outline (spójne z tabFour)
    },
];

export default function WelcomeScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showApp, setShowApp] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const handleScroll = (event: any) => {
        const x = event.nativeEvent.contentOffset.x;
        const index = Math.round(x / width);
        setCurrentIndex(index);
    };

    const handleSkip = () => {
        setShowApp(true);
    };

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            scrollViewRef.current?.scrollTo({ x: (currentIndex + 1) * width, animated: true });
        } else {
            setShowApp(true);
        }
    };

    if (showApp) {
        return <Redirect href="/(tabs)/tabOne" />;
    }

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {slides.map((slide) => (
                    <View key={slide.id} style={styles.slide}>
                        <View style={styles.iconContainer}>
                            <Ionicons
                                name={slide.icon as any}
                                size={48}
                                color={colors.primary}
                                style={styles.icon}
                            />
                        </View>
                        <Text style={styles.title}>{slide.title}</Text>
                        <Text style={styles.description}>{slide.description}</Text>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.pagination}>
                {slides.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            currentIndex === index && styles.activeDot
                        ]}
                    />
                ))}
            </View>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                    <Text style={styles.skipButtonText}>Pomiń</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.nextButton,
                        currentIndex === slides.length - 1 && styles.startButton
                    ]}
                    onPress={handleNext}
                >
                    <Text style={styles.nextButtonText}>
                        {currentIndex === slides.length - 1 ? 'Rozpocznij' : 'Dalej'}
                    </Text>
                    <Ionicons
                        name="arrow-forward"
                        size={20}
                        color="white"
                        style={styles.arrowIcon}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
        justifyContent: 'center',
    },
    slide: {
        width,
        justifyContent: 'center',
        alignItems: 'center',
        padding: responsive.largeMargin,
    },
    iconContainer: {
        backgroundColor: 'rgba(74,108,247,0.1)',
        borderRadius: 50,
        padding: 16,
        marginBottom: 24,
    },
    icon: {
        alignSelf: 'center',
    },
    image: {
        width: width * 0.7,
        height: width * 0.7,
        resizeMode: 'contain',
        marginBottom: 40,
    },
    title: {
        ...typography.h1,
        textAlign: 'center',
        marginBottom: 16,
        color: colors.black,
    },
    description: {
        ...typography.body,
        textAlign: 'center',
        color: colors.gray,
        paddingHorizontal: 24,
        lineHeight: 24,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 40,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.gray,
        marginHorizontal: 5,
    },
    activeDot: {
        backgroundColor: colors.primary,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: responsive.largeMargin,
        marginBottom: 24,
    },
    skipButton: {
        padding: 12,
    },
    skipButtonText: {
        ...typography.body,
        color: colors.gray,
    },
    nextButton: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    startButton: {
        paddingHorizontal: 32,
    },
    nextButtonText: {
        ...typography.body,
        color: colors.white,
        fontWeight: '600',
    },
    arrowIcon: {
        marginLeft: 8,
    }
});
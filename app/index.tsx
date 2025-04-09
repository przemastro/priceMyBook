import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Redirect, router } from 'expo-router';
import { colors, typography, responsive } from '@/styles/styles';

const { width } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        title: 'Witaj w PriceMyBook',
        description: 'Skanuj ISBN książek i sprawdzaj ich wartość',
        image: require('@/assets/images/welcome1.png'),
    },
    {
        id: '2',
        title: 'Analizuj stan książek',
        description: 'Oceń wady i oblicz końcową cenę',
        image: require('@/assets/images/welcome2.png'),
    },
    {
        id: '3',
        title: 'Zarządzaj kolekcjami',
        description: 'Twórz kolekcje i eksportuj dane',
        image: require('@/assets/images/welcome3.png'),
    },
];

export default function Index() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showApp, setShowApp] = useState(false);

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

    const scrollViewRef = React.useRef<ScrollView>(null);

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
                        <Image source={slide.image} style={styles.image} />
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
                <TouchableOpacity onPress={handleSkip}>
                    <Text style={styles.skipButton}>Pomiń</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextButtonText}>
                        {currentIndex === slides.length - 1 ? 'Rozpocznij' : 'Dalej'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    slide: {
        width,
        justifyContent: 'center',
        alignItems: 'center',
        padding: responsive.largeMargin,
    },
    image: {
        width: width * 0.8,
        height: width * 0.8,
        resizeMode: 'contain',
        marginBottom: responsive.largeMargin,
    },
    title: {
        ...typography.h1,
        textAlign: 'center',
        marginBottom: responsive.smallMargin,
    },
    description: {
        ...typography.body,
        textAlign: 'center',
        color: colors.gray,
        paddingHorizontal: responsive.mediumMargin,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: responsive.largeMargin,
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
        paddingHorizontal: responsive.largeMargin,
        marginBottom: responsive.smallMargin,
    },
    skipButton: {
        ...typography.body,
        color: colors.black,
    },
    nextButton: {
        ...typography.body,
        color: colors.black,
    },
    nextButtonText: {
        ...typography.body,
        color: colors.black,
    },
});
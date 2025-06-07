// screens/Settings.tsx
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {router, useLocalSearchParams, useRouter} from 'expo-router';
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/config';
import { colors } from "@/styles/styles";
import { LinearGradient } from 'expo-linear-gradient';

export default function SettingsScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { initialTab } = useLocalSearchParams<SettingsScreenParams>();
    const [activeTab, setActiveTab] = useState(initialTab || 'about');
    const spinValue = useRef(new Animated.Value(0)).current;
    const [activeFactors, setActiveFactors] = useState({
        defects: true,
        uniqueness: true,
        market: true
    });

    const toggleLanguage = () => {
        const newLang = i18n.language === 'pl' ? 'en' : 'pl';
        i18n.changeLanguage(newLang);

        spinValue.setValue(0);
        Animated.spring(spinValue, {
            toValue: 1,
            friction: 5,
            tension: 30,
            useNativeDriver: true,
        }).start();
    };

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    const renderContent = () => {
        switch (activeTab) {
            case 'about':
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.settingsTitle}>{t('settings.about')}</Text>
                        <Text style={styles.aboutText}>
                            {t('settings.appDescription')}
                        </Text>
                        <Text style={styles.featuresTitle}>{t('settings.features')}:</Text>
                        <Text style={styles.featureItem}>• {t('settings.feature1')}</Text>
                        <Text style={styles.featureItem}>• {t('settings.feature2')}</Text>
                        <Text style={styles.featureItem}>• {t('settings.feature3')}</Text>
                        <Text style={styles.featureItem}>• {t('settings.feature4')}</Text>
                        <Text style={styles.featureItem}>• {t('settings.feature5')}</Text>
                        <Text style={styles.featureItem}>• {t('settings.feature6')}</Text>
                        <Text style={styles.featureItem}>• {t('settings.feature7')}</Text>
                    </View>
                );
            case 'algorithm':
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.settingsTitle}>{t('settings.algorithmTitle')}</Text>
                        <Text style={styles.algorithmDescription}>
                            {t('settings.algorithmDescription')}
                        </Text>

                        <Text style={styles.algorithmSectionTitle}>{t('settings.algorithmSteps')}:</Text>
                        <Text style={styles.algorithmStep}>1. {t('settings.algorithmStep1')}</Text>
                        <Text style={styles.algorithmStep}>2. {t('settings.algorithmStep2')}</Text>
                        <Text style={styles.algorithmStep}>3. {t('settings.algorithmStep3')}</Text>
                        <Text style={styles.algorithmStep}>4. {t('settings.algorithmStep4')}</Text>
                        <Text style={styles.algorithmStep}>5. {t('settings.algorithmStep5')}</Text>
                        <Text style={styles.algorithmStep}>6. {t('settings.algorithmStep6')}</Text>

                        <Text style={styles.formulaTitle}>{t('settings.formulaTitle')}:</Text>
                        <Text style={styles.formula}>
                            {t('settings.formula')}
                        </Text>
                    </View>
                );
            case 'language':
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.settingsTitle}>{t('settings.language')}</Text>
                        <TouchableOpacity
                            style={styles.languageButton}
                            onPress={toggleLanguage}
                            activeOpacity={0.7}
                        >
                            <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                <Text style={styles.languageButtonText}>
                                    {i18n.language === 'pl' ? 'English' : 'Polski'}
                                </Text>
                            </Animated.View>
                        </TouchableOpacity>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.buttonSelected1, colors.buttonSelected2]}
                style={styles.backgroundGradient}
            />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ marginLeft: 10, marginRight: 20, marginBottom: 20 }}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.blackDark} />
                </TouchableOpacity>
                <View style={styles.tabsOuterContainer}>
                    <LinearGradient
                        colors={[colors.buttonSelected1, colors.buttonSelected2]}
                        style={styles.tabsGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <View style={styles.tabsContainer}>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'about' && styles.activeTab]}
                                onPress={() => setActiveTab('about')}
                            >
                                <Ionicons
                                    name="information-circle"
                                    size={20}
                                    color={activeTab === 'about' ? colors.white : colors.white}
                                />
                                <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
                                    {t('settings.about')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'algorithm' && styles.activeTab]}
                                onPress={() => setActiveTab('algorithm')}
                            >
                                <Ionicons
                                    name="calculator"
                                    size={20}
                                    color={activeTab === 'algorithm' ? colors.white : colors.white}
                                />
                                <Text style={[styles.tabText, activeTab === 'algorithm' && styles.activeTabText]}>
                                    {t('settings.priceAlgorithm')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'language' && styles.activeTab]}
                                onPress={() => setActiveTab('language')}
                            >
                                <Ionicons
                                    name="language"
                                    size={20}
                                    color={activeTab === 'language' ? colors.white : colors.white}
                                />
                                <Text style={[styles.tabText, activeTab === 'language' && styles.activeTabText]}>
                                    {t('settings.language')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>

                <View style={styles.contentContainer}>
                    {renderContent()}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    backgroundGradient: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.9
    },
    scrollContainer: {
        padding: 10,
        paddingTop: 20,
        marginTop: 30
    },
    tabsOuterContainer: {
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3
    },
    tabsGradient: {
        padding: 2,
        opacity: 0.85
    },
    tabsContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderRadius: 15,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10
    },
    tab: {
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: 'row',
    },
    activeTab: {
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    tabText: {
        marginLeft: 8,
        color: colors.white,
        fontSize: 14,
        fontWeight: '500'
    },
    activeTabText: {
        fontWeight: '700',
    },
    contentContainer: {
        backgroundColor: colors.background,
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3
    },
    tabContent: {
        paddingBottom: 10,
    },
    settingsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: colors.primary,
    },
    aboutText: {
        fontSize: 16,
        marginBottom: 15,
        color: colors.black,
        lineHeight: 24,
    },
    featuresTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        color: colors.primary,
    },
    featureItem: {
        fontSize: 14,
        color: colors.grayDark,
        lineHeight: 22,
        marginBottom: 5,
        marginLeft: 10,
    },
    algorithmDescription: {
        fontSize: 16,
        marginBottom: 15,
        color: colors.black,
        lineHeight: 24,
    },
    algorithmSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        color: colors.primary,
    },
    algorithmStep: {
        fontSize: 14,
        color: colors.grayDark,
        lineHeight: 22,
        marginBottom: 5,
        marginLeft: 10,
    },
    formulaTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 5,
        color: colors.primary,
    },
    formula: {
        fontSize: 14,
        fontStyle: 'italic',
        color: colors.grayDark,
        lineHeight: 22,
        marginLeft: 10,
        backgroundColor: 'rgba(74,108,247,0.05)',
        padding: 10,
        borderRadius: 5,
    },
    languageButton: {
        backgroundColor: colors.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3
    },
    languageButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});
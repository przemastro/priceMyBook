// screens/Settings.tsx
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/config';
import { colors } from "@/styles/styles";
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './styles'

type SettingsScreenParams = {
    initialTab?: string;
};

export default function SettingsScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { initialTab } = useLocalSearchParams<SettingsScreenParams>();
    const [activeTab, setActiveTab] = useState(initialTab || 'about');
    const spinValue = useRef(new Animated.Value(0)).current;

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

    const handleRateApp = (platform: 'ios' | 'android') => {
        const urls = {
            ios: 'https://apps.apple.com/app/idYOUR_APPLE_ID',
            android: 'https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME',
        };
        Linking.openURL(urls[platform]).catch(err =>
            console.error("Couldn't open store page", err)
        );
    };

    const openBuyMeACoffee = () => {
        Linking.openURL('https://buymeacoffee.com/YOUR_PROFILE').catch(err =>
            console.error("Couldn't open Buy Me a Coffee page", err)
        );
    };

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
                        <Text style={styles.settingsTitle}>{t('settings.algorithm')}</Text>
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
                        <Text style={styles.aboutText}>
                            {t('settings.languageDescription')}
                            {"\n\n"}
                            {t('settings.currencyConversion')}
                        </Text>
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
            case 'rate':
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.settingsTitle}>{t('settings.rateUs')}</Text>
                        <Text style={styles.aboutText}>
                            {t('settings.rateDescription')}
                        </Text>

                        <View style={styles.rateOptionsContainer}>
                            {/* App Store Rating */}
                            <TouchableOpacity
                                style={[styles.rateButton, styles.rateOption]}
                                onPress={() => handleRateApp('ios')}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="logo-apple" size={24} color={colors.white} />
                                <Text style={styles.rateButtonText}>
                                    {t('settings.rateOnAppStore')}
                                </Text>
                            </TouchableOpacity>

                            {/* Google Play Rating */}
                            <TouchableOpacity
                                style={[styles.rateButton, styles.rateOption]}
                                onPress={() => handleRateApp('android')}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="logo-google-playstore" size={24} color={colors.white} />
                                <Text style={styles.rateButtonText}>
                                    {t('settings.rateOnPlayStore')}
                                </Text>
                            </TouchableOpacity>

                            {/* Buy Me a Coffee */}
                            <TouchableOpacity
                                style={[styles.donateButton, styles.rateOption]}
                                onPress={openBuyMeACoffee}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="cafe-outline" size={24} color={colors.white} />
                                <Text style={styles.donateButtonText}>
                                    {t('settings.buyMeCoffee')}
                                </Text>
                            </TouchableOpacity>
                        </View>
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

            <View style={styles.headerContainer}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.blackDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('titles.settings')}</Text>
                <View style={styles.spacer} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollContainer}
            >
                <View style={styles.mainCard}>
                    <View style={styles.tabsWrapper}>
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
                                    <View style={styles.tabIconContainer}>
                                        <Ionicons
                                            name="information-circle"
                                            size={24}
                                            style={[styles.tabIcon, activeTab === 'about' && styles.activeTabIcon]}
                                        />
                                    </View>
                                    <Text style={[styles.tabLabel, activeTab === 'about' && styles.activeTabLabel]}>
                                        {t('settings.about')}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.tab, activeTab === 'algorithm' && styles.activeTab]}
                                    onPress={() => setActiveTab('algorithm')}
                                >
                                    <View style={styles.tabIconContainer}>
                                        <Ionicons
                                            name="calculator"
                                            size={24}
                                            style={[styles.tabIcon, activeTab === 'algorithm' && styles.activeTabIcon]}
                                        />
                                    </View>
                                    <Text style={[styles.tabLabel, activeTab === 'algorithm' && styles.activeTabLabel]}>
                                        {t('settings.algorithm')}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.tab, activeTab === 'language' && styles.activeTab]}
                                    onPress={() => setActiveTab('language')}
                                >
                                    <View style={styles.tabIconContainer}>
                                        <Ionicons
                                            name="language"
                                            size={24}
                                            style={[styles.tabIcon, activeTab === 'language' && styles.activeTabIcon]}
                                        />
                                    </View>
                                    <Text style={[styles.tabLabel, activeTab === 'language' && styles.activeTabLabel]}>
                                        {t('settings.language')}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.tab, activeTab === 'rate' && styles.activeTab]}
                                    onPress={() => setActiveTab('rate')}
                                >
                                    <View style={styles.tabIconContainer}>
                                        <Ionicons
                                            name="heart"
                                            size={24}
                                            style={[styles.tabIcon, activeTab === 'rate' && styles.activeTabIcon]}
                                        />
                                    </View>
                                    <Text style={[styles.tabLabel, activeTab === 'rate' && styles.activeTabLabel]}>
                                        {t('settings.rateUs')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </View>

                    <View style={styles.contentWrapper}>
                        {renderContent()}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

// screens/Settings.tsx
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/config';
import { colors } from "@/styles/styles";
import { LinearGradient } from 'expo-linear-gradient';

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        backgroundColor: colors.background,
    },
    backgroundGradient: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.9
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 15,
        width: '100%',
        justifyContent: 'space-between',
        position: 'absolute',
        top: 30,
        left: 0,
        zIndex: 10,
        paddingHorizontal: 0
    },
    backButton: {
        marginLeft: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '500',
        color: colors.blackDark,
        textAlign: 'center',
        flex: 1,
    },
    spacer: {
        width: 44,
        marginRight: 10,
    },
    scrollContainer: {
        flex: 1,
        paddingTop: 80,
    },
    scrollContent: {
        paddingHorizontal: 10,
    },
    mainCard: {
        backgroundColor: colors.background,
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        marginTop: 10,
        minHeight: 900,
        maxHeight: 900
    },
    tabsWrapper: {
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        overflow: 'hidden',
    },
    tabsGradient: {
        padding: 2,
    },
    tabsContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    tab: {
        alignItems: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        width: '23%',
    },
    activeTab: {
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    tabIconContainer: {
        marginBottom: 4,
    },
    tabIcon: {
        color: colors.black,
    },
    activeTabIcon: {
        color: colors.primary,
    },
    tabLabel: {
        color: colors.black,
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
    },
    activeTabLabel: {
        fontWeight: '700',
        color: colors.primary,
    },
    contentWrapper: {
        padding: 20,
    },
    tabContent: {
        paddingBottom: 10,
    },
    settingsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: colors.primary,
    },
    aboutText: {
        fontSize: 16,
        marginBottom: 20,
        color: colors.black,
        lineHeight: 24,
    },
    featuresTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
        color: colors.primary,
    },
    featureItem: {
        fontSize: 15,
        color: colors.grayDark,
        lineHeight: 24,
        marginBottom: 8,
        marginLeft: 10,
    },
    algorithmDescription: {
        fontSize: 16,
        marginBottom: 20,
        color: colors.black,
        lineHeight: 24,
    },
    algorithmSectionTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
        color: colors.primary,
    },
    algorithmStep: {
        fontSize: 15,
        color: colors.grayDark,
        lineHeight: 24,
        marginBottom: 8,
        marginLeft: 10,
    },
    formulaTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: colors.primary,
    },
    formula: {
        fontSize: 15,
        fontStyle: 'italic',
        color: colors.grayDark,
        lineHeight: 24,
        marginLeft: 10,
        backgroundColor: 'rgba(74,108,247,0.05)',
        padding: 12,
        borderRadius: 8,
    },
    languageButton: {
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3
    },
    languageButtonText: {
        color: colors.white,
        fontSize: 17,
        fontWeight: '600',
    },
    rateOptionsContainer: {
        marginTop: 20,
        gap: 15,
    },
    rateOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    rateButton: {
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    rateButtonText: {
        color: colors.white,
        fontSize: 17,
        fontWeight: '600',
    },
    donateButton: {
        backgroundColor: colors.secondary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    donateButtonText: {
        color: colors.white,
        fontSize: 17,
        fontWeight: '600',
    },
});
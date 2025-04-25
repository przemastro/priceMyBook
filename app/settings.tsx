// screens/settings.tsx
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from './i18n/config';
import { colors } from "@/styles/styles";

export default function SettingsScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const spinValue = useRef(new Animated.Value(0)).current;
    const [activeTab, setActiveTab] = useState('about');
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
                            {t('settings.appName')}: {t('settings.name')}
                        </Text>
                        <Text style={styles.aboutText}>
                            {t('settings.version')}: 1.0.0
                        </Text>
                        <Text style={styles.aboutText}>
                            {t('settings.changelog')}:
                        </Text>
                        <Text style={styles.changelogText}>
                            - {t('settings.changelog1')} {'\n'}
                            - {t('settings.changelog2')} {'\n'}
                            - {t('settings.changelog3')}
                        </Text>
                    </View>
                );
            case 'algorithm':
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.settingsTitle}>{t('settings.activeFactors')}</Text>
                        <View style={styles.factorsContainer}>
                            <TouchableOpacity
                                style={styles.factorItem}
                                onPress={() => setActiveFactors({...activeFactors, defects: !activeFactors.defects})}
                            >
                                <Ionicons
                                    name={activeFactors.defects ? "checkbox-outline" : "square-outline"}
                                    size={24}
                                    color={activeFactors.defects ? colors.primary : colors.gray}
                                />
                                <Text style={styles.factorText}>{t('settings.defectsFactor')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.factorItem}
                                onPress={() => setActiveFactors({...activeFactors, uniqueness: !activeFactors.uniqueness})}
                            >
                                <Ionicons
                                    name={activeFactors.uniqueness ? "checkbox-outline" : "square-outline"}
                                    size={24}
                                    color={activeFactors.uniqueness ? colors.primary : colors.gray}
                                />
                                <Text style={styles.factorText}>{t('settings.uniquenessFactor')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.factorItem}
                                onPress={() => setActiveFactors({...activeFactors, market: !activeFactors.market})}
                            >
                                <Ionicons
                                    name={activeFactors.market ? "checkbox-outline" : "square-outline"}
                                    size={24}
                                    color={activeFactors.market ? colors.primary : colors.gray}
                                />
                                <Text style={styles.factorText}>{t('settings.marketFactor')}</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.algorithmStepTitle}>{t('settings.steps')}:</Text>
                        <Text style={styles.algorithmStep}>
                            1. {t('settings.basePrice')}{'\n'}
                            2. {activeFactors.defects && t('settings.defectReduction')}{'\n'}
                            3. {activeFactors.uniqueness && t('settings.uniquenessBonus')}{'\n'}
                            4. {activeFactors.market && t('settings.marketAdjustment')}{'\n'}
                            5. {t('settings.maxReduction')} (90%){'\n'}
                            6. {t('settings.finalPriceCalculation')}
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
        <ScrollView style={styles.container}>
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'about' && styles.activeTab]}
                    onPress={() => setActiveTab('about')}
                >
                    <Ionicons
                        name="information-circle"
                        size={20}
                        color={activeTab === 'about' ? colors.primary : colors.black}
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
                        color={activeTab === 'algorithm' ? colors.primary : colors.black}
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
                        color={activeTab === 'language' ? colors.primary : colors.black}
                    />
                    <Text style={[styles.tabText, activeTab === 'language' && styles.activeTabText]}>
                        {t('settings.language')}
                    </Text>
                </TouchableOpacity>
            </View>

            {renderContent()}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray,
        paddingBottom: 10,
    },
    tab: {
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        flexDirection: 'row',
    },
    activeTab: {
        backgroundColor: 'rgba(74,108,247,0.1)',
    },
    tabText: {
        marginLeft: 5,
        color: colors.black,
    },
    activeTabText: {
        color: colors.primary,
        fontWeight: '500',
    },
    tabContent: {
        paddingBottom: 30,
    },
    settingsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: colors.primary,
    },
    languageButton: {
        backgroundColor: 'rgba(74,108,247,0.1)',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    languageButtonText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '500',
    },
    aboutText: {
        fontSize: 16,
        marginBottom: 10,
        color: colors.black,
    },
    changelogText: {
        fontSize: 14,
        color: colors.grayDark,
        lineHeight: 20,
        marginLeft: 10,
    },
    algorithmStepTitle: {
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
        marginBottom: 15,
        marginLeft: 10,
    },
    factorsContainer: {
        marginBottom: 20,
    },
    factorItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.grayDark,
    },
    factorText: {
        marginLeft: 10,
        fontSize: 16,
        color: colors.black,
    },
});
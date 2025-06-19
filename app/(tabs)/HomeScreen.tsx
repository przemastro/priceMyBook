import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/styles';
import { styles } from './styles'

type HomeButton = {
    name: React.ComponentProps<typeof Ionicons>['name'];
    title: string;
    screen: string;
    iconColor: string;
    isTab?: boolean;
    customPath?: string;
    id: string; // Added unique identifier for each button
};

const COLUMNS = 3;
const BUTTON_MARGIN = 15;
const MAX_DESCRIPTION_LENGTH = 193;

const HomeScreen = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { width } = Dimensions.get('window');

    const buttonSize = (width - 40 - (BUTTON_MARGIN * (COLUMNS - 1) * 2.7)) / COLUMNS;

    const buttons: HomeButton[] = [
        {
            id: 'scan-button',
            name: 'scan',
            title: t('titlesShort.scan'),
            screen: 'ScanScreen',
            iconColor: colors.primary,
            isTab: true
        },
        {
            id: 'history-button',
            name: 'time-outline',
            title: t('titlesShort.history'),
            screen: 'HistoryScreen',
            iconColor: '#386641',
            isTab: true
        },
        {
            id: 'analysis-button',
            name: 'settings-outline',
            title: t('titlesShort.analyzeCondition'),
            screen: 'AnalysisScreen',
            iconColor: '#184e77',
            isTab: true
        },
        {
            id: 'collections-button',
            name: 'book-outline',
            title: t('titlesShort.manageCollections'),
            screen: 'CollectionsScreen',
            iconColor: '#5e548e',
            isTab: true
        },
        {
            id: 'financial-report-button',
            name: 'bar-chart-outline',
            title: t('titlesShort.financialReport'),
            screen: 'FinancialReport',
            iconColor: '#168aad',
            customPath: '/components/financialReportScreen/FinancialReport'
        },
        {
            id: 'settings-button',
            name: 'settings-sharp',
            title: t('titlesShort.settings'),
            screen: 'Settings',
            iconColor: '#184e77',
            customPath: '/components/settingsScreen/Settings'
        }
    ];

    const truncateDescription = (text: string) => {
        return text.length > MAX_DESCRIPTION_LENGTH
            ? text.substring(0, MAX_DESCRIPTION_LENGTH) + '...'
            : text;
    };

    const getNavigationPath = (screen: string, isTab?: boolean, customPath?: string) => {
        if (customPath) return customPath;
        return isTab ? `/(tabs)/${screen}` : `/${screen}`;
    };

    const navigateToScreen = (screen: string, isTab?: boolean, customPath?: string) => {
        const path = getNavigationPath(screen, isTab, customPath);
        router.push(path as any);
    };

    return (
        <View style={localStyles.container}>
            <LinearGradient
                colors={[colors.buttonSelected1, colors.buttonSelected2]}
                style={styles.backgroundGradient}
            />

            <View style={styles.headerOuterContainer}>
                <LinearGradient
                    colors={[colors.buttonSelected1, colors.buttonSelected2]}
                    style={styles.headerGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <View style={localStyles.headerContainer}>
                        <View style={styles.header}>
                            <Text style={styles.welcomeTitle}>{t('home.welcome')}</Text>
                            <View style={styles.descriptionContainer}>
                                <Text style={styles.welcomeSubtitle}>
                                    {truncateDescription(t('settings.appDescription'))}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => navigateToScreen('Settings', false, '/components/settingsScreen/Settings')}
                                style={styles.moreButton}
                            >
                                <Text style={styles.moreButtonText}>{t('home.more')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>
            </View>

            <View style={styles.servicesContainer}>
                <Text style={localStyles.sectionTitle}>{t('home.services')}</Text>
                <View style={localStyles.buttonsContainer}>
                    {buttons.map((button) => (
                        <View key={button.id} style={styles.buttonWrapper}>
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    {
                                        width: buttonSize,
                                        height: buttonSize,
                                        marginHorizontal: BUTTON_MARGIN
                                    }
                                ]}
                                onPress={() =>
                                    navigateToScreen(button.screen, button.isTab, button.customPath)
                                }
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={[colors.white, colors.whiteBlue]}
                                    style={localStyles.buttonGradient}
                                >
                                    <View style={styles.iconContainer}>
                                        <Ionicons
                                            name={button.name}
                                            size={24}
                                            color={button.iconColor}
                                        />
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                            <Text
                                style={styles.buttonTitle}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                            >
                                {button.title}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        paddingTop: 95,
        position: 'relative'
    },
    headerContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderRadius: 18
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.blackDark,
        marginBottom: 15,
        marginLeft: BUTTON_MARGIN,
        textAlign: 'left'
    },
    buttonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginHorizontal: -BUTTON_MARGIN
    },
    buttonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
});

export default HomeScreen;
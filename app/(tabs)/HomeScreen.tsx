import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/styles';

type TabScreen = 'ScanScreen' | 'HistoryScreen' | 'AnalysisScreen' | 'CollectionsScreen' | 'FinancialReport';
type NonTabScreen = 'Settings';

type HomeButton = {
    name: React.ComponentProps<typeof Ionicons>['name'];
    title: string;
    screen: TabScreen | NonTabScreen;
    iconColor: string;
    isTab?: boolean;
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
            name: 'scan',
            title: t('titlesShort.scan'),
            screen: 'ScanScreen',
            iconColor: colors.primary,
            isTab: true
        },
        {
            name: 'time-outline',
            title: t('titlesShort.history'),
            screen: 'HistoryScreen',
            iconColor: '#386641',
            isTab: true
        },
        {
            name: 'settings-outline',
            title: t('titlesShort.analyzeCondition'),
            screen: 'AnalysisScreen',
            iconColor: '#184e77',
            isTab: true
        },
        {
            name: 'book-outline',
            title: t('titlesShort.manageCollections'),
            screen: 'CollectionsScreen',
            iconColor: '#5e548e',
            isTab: true
        },
        {
            name: 'bar-chart-outline',
            title: t('titlesShort.financialReport'),
            screen: 'FinancialReport',
            iconColor: '#168aad',
            isTab: true
        },
        {
            name: 'settings-sharp',
            title: t('titlesShort.settings'),
            screen: 'Settings',
            iconColor: '#184e77',
            isTab: false
        }
    ];

    const truncateDescription = (text: string) => {
        if (text.length > MAX_DESCRIPTION_LENGTH) {
            return text.substring(0, MAX_DESCRIPTION_LENGTH) + '...';
        }
        return text;
    };

    const navigateToScreen = (screen: TabScreen | NonTabScreen, isTab?: boolean) => {
        const path = isTab ? `/(tabs)/${screen}` : `/${screen}`;
        router.push(path as any);
    };

    return (
        <View style={styles.container}>
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
                    <View style={styles.headerContainer}>
                        <View style={styles.header}>
                            <Text style={styles.welcomeTitle}>{t('home.welcome')}</Text>
                            <View style={styles.descriptionContainer}>
                                <Text style={styles.welcomeSubtitle}>
                                    {truncateDescription(t('settings.appDescription'))}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => navigateToScreen('Settings', false)}
                                style={styles.moreButton}
                            >
                                <Text style={styles.moreButtonText}>{t('home.more')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>
            </View>

            <View style={styles.servicesContainer}>
                <Text style={styles.sectionTitle}>{t('home.services')}</Text>
                <View style={styles.buttonsContainer}>
                    {buttons.map((button, index) => (
                        <View key={index} style={styles.buttonWrapper}>
                            <TouchableOpacity
                                style={[styles.button, {
                                    width: buttonSize,
                                    height: buttonSize,
                                    marginHorizontal: BUTTON_MARGIN
                                }]}
                                onPress={() => navigateToScreen(button.screen, button.isTab)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.buttonIconContainer, {backgroundColor: colors.whiteBlue}]}>
                                    <Ionicons
                                        name={button.name}
                                        size={24}
                                        color={button.iconColor}
                                    />
                                </View>
                            </TouchableOpacity>
                            <Text style={styles.buttonTitle}>{button.title}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        paddingTop: 120,
        position: 'relative',
    },
    backgroundGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    headerOuterContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 30,
    },
    headerGradient: {
        padding: 2,
        opacity: 0.85
    },
    headerContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderRadius: 18,
    },
    header: {
        padding: 20,
        borderRadius: 15,
        marginBottom: 0,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.blackDark,
        marginBottom: 8,
        textAlign: 'center',
    },
    descriptionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: colors.black,
        flex: 1,
        marginRight: 10,
    },
    moreButton: {
        alignSelf: 'flex-end',
        borderRadius: 8,
        overflow: 'hidden',
        marginTop: 20
    },
    moreButtonText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '500',
    },
    servicesContainer: {
        flex: 1,
        marginTop: 10,
        backgroundColor: colors.background,
        padding: 20,
        borderRadius: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
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
        marginHorizontal: -BUTTON_MARGIN,
    },
    buttonWrapper: {
        alignItems: 'center',
        marginBottom: 20,
    },
    button: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonTitle: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.black,
        marginTop: 8,
        textAlign: 'center',
    },
});

export default HomeScreen;
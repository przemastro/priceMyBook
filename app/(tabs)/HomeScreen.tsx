import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/styles';

type HomeButton = {
    name: React.ComponentProps<typeof FontAwesome>['name'];
    title: string;
    description: string;
    screen: 'ScanScreen' | 'HistoryScreen' | 'AnalysisScreen' | 'CollectionsScreen';
};

const MAX_DESCRIPTION_LENGTH = 100;

const HomeScreen = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { width } = Dimensions.get('window');
    const buttonSize = width * 0.4;

    const buttons: HomeButton[] = [
        {
            name: 'camera',
            title: t('titlesShort.scan'),
            description: t('home.scanDescription'),
            screen: 'ScanScreen'
        },
        {
            name: 'history',
            title: t('titlesShort.history'),
            description: t('home.historyDescription'),
            screen: 'HistoryScreen'
        },
        {
            name: 'cogs',
            title: t('titlesShort.analyzeCondition'),
            description: t('home.analyzeDescription'),
            screen: 'AnalysisScreen'
        },
        {
            name: 'book',
            title: t('titlesShort.manageCollections'),
            description: t('home.collectionsDescription'),
            screen: 'CollectionsScreen'
        }
    ];

    const truncateDescription = (text: string) => {
        if (text.length > MAX_DESCRIPTION_LENGTH) {
            return text.substring(0, MAX_DESCRIPTION_LENGTH) + '...';
        }
        return text;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcomeTitle}>{t('home.welcome')}</Text>
                <View style={styles.descriptionContainer}>
                    <Text style={styles.welcomeSubtitle}>
                        {truncateDescription(t('settings.appDescription'))}
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/settings')}
                        style={styles.moreButton}
                    >
                        <LinearGradient
                            colors={[colors.buttonSelected1, colors.buttonSelected2]}
                            style={styles.moreButtonGradient}
                        >
                            <Text style={styles.moreButtonText}>{t('home.more')}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.buttonsContainer}>
                {buttons.map((button, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.button, { width: buttonSize + 10, height: buttonSize }]}
                        onPress={() => router.push(`/(tabs)/${button.screen}`)}
                        activeOpacity={0.7}
                    >
                        <LinearGradient
                            colors={[colors.buttonSelected1, colors.buttonSelected2]}
                            style={styles.buttonGradient}
                        >
                            <View style={styles.buttonIconContainer}>
                                <LinearGradient
                                    colors={[colors.buttonSelected1, colors.buttonSelected2]}
                                    style={styles.iconGradient}
                                >
                                    <FontAwesome
                                        name={button.name}
                                        size={24}
                                        color={colors.primary}
                                    />
                                </LinearGradient>
                            </View>
                            <Text style={styles.buttonTitle}>{button.title}</Text>
                            <Text style={styles.buttonDescription}>{button.description}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        paddingTop: 120
    },
    header: {
        marginBottom: 30,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 20,
        padding: 20,
        backgroundColor: colors.white,
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.primary,
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
        color: colors.grayDark,
        flex: 1,
        marginRight: 10,
    },
    moreButton: {
        alignSelf: 'flex-end',
        borderRadius: 8,
        overflow: 'hidden',
    },
    moreButtonGradient: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    moreButtonText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '500'
    },
    buttonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    button: {
        borderRadius: 16,
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonGradient: {
        width: '100%',
        height: '100%',
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        overflow: 'hidden',
    },
    iconGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
    },
    buttonTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 6,
        textAlign: 'center',
    },
    buttonDescription: {
        fontSize: 12,
        color: colors.grayDark,
        textAlign: 'center',
    },
});

export default HomeScreen;
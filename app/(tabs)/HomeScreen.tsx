import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/styles/styles';

type HomeButton = {
    name: React.ComponentProps<typeof FontAwesome>['name'];
    title: string;
    description: string;
    screen: 'ScanScreen' | 'HistoryScreen' | 'AnalysisScreen' | 'CollectionsScreen';
};

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

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcomeTitle}>{t('home.welcome')}</Text>
                <Text style={styles.welcomeSubtitle}>{t('home.welcomeSubtitle')}</Text>
            </View>

            <View style={styles.buttonsContainer}>
                {buttons.map((button, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.button, { width: buttonSize, height: buttonSize }]}
                        onPress={() => router.push(`/(tabs)/${button.screen}`)}
                    >
                        <View style={styles.buttonIconContainer}>
                            <FontAwesome
                                name={button.name}
                                size={32}
                                color={colors.primary}
                            />
                        </View>
                        <Text style={styles.buttonTitle}>{button.title}</Text>
                        <Text style={styles.buttonDescription}>{button.description}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 20,
    },
    header: {
        marginBottom: 30,
        alignItems: 'center',
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: 8,
        textAlign: 'center',
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: colors.grayDark,
        textAlign: 'center',
        maxWidth: '80%',
    },
    buttonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    button: {
        backgroundColor: colors.background,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(74, 108, 247, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
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
import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { AppProvider } from '@/context/AppContext';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet } from 'react-native';
import { colors } from "@/styles/styles";

function TabBarIcon(props: {
    name: React.ComponentProps<typeof FontAwesome>['name'];
    color: string;
}) {
    return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const { t } = useTranslation();

    return (
        <AppProvider>
            <Tabs
                initialRouteName="tabOne"
                screenOptions={{
                    tabBarActiveTintColor: colors.primary, // Wymuszamy kolor primary
                    tabBarInactiveTintColor: '#8e8e93', // Szary dla nieaktywnych
                    headerShown: false,
                    tabBarStyle: {
                        ...styles.tabBar,
                        backgroundColor: '#ffffff', // Stałe białe tło niezależne od motywu
                        borderTopWidth: 0,
                        shadowColor: '#000',
                        shadowOffset: {
                            width: 0,
                            height: -2, // Cień od góry
                        },
                        shadowOpacity: 0.08,
                        shadowRadius: 4,
                        elevation: 8, // Dla Androida
                    },
                    tabBarLabelStyle: styles.tabBarLabel,
                    tabBarItemStyle: styles.tabBarItem,
                }}
            >
                <Tabs.Screen
                    name="tabOne"
                    options={{
                        title: t('titlesShort.scan'),
                        tabBarIcon: ({ color, focused }) => (
                            <TabBarIcon
                                name="camera"
                                color={focused ? colors.primary : color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="tabTwo"
                    options={{
                        title: t('titlesShort.history'),
                        tabBarIcon: ({ color, focused }) => (
                            <TabBarIcon
                                name="history"
                                color={focused ? colors.primary : color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="tabThree"
                    options={{
                        title: t('titlesShort.analyzeCondition'),
                        tabBarIcon: ({ color, focused }) => (
                            <TabBarIcon
                                name="cogs"
                                color={focused ? colors.primary : color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="tabFour"
                    options={{
                        title: t('titlesShort.manageCollections'),
                        tabBarIcon: ({ color, focused }) => (
                            <TabBarIcon
                                name="book"
                                color={focused ? colors.primary : color}
                            />
                        ),
                    }}
                />
            </Tabs>
        </AppProvider>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        height: Platform.select({
            ios: 80,
            android: 60,
        }),
        paddingBottom: Platform.select({
            ios: 20,
            android: 5,
        }),
        paddingTop: 5,
    },
    tabBarLabel: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: Platform.select({
            ios: 15,
            android: 5,
        }),
    },
    tabBarItem: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
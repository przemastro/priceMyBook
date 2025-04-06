import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { AppProvider } from '@/context/AppContext';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet } from 'react-native';

function TabBarIcon(props: {
    name: React.ComponentProps<typeof FontAwesome>['name'];
    color: string;
}) {
    return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const { t } = useTranslation();

    const themeColors = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const activeColor = themeColors.tint || 'blue';
    const inactiveColor = themeColors.tabIconDefault || 'gray';

    return (
        <AppProvider>
            <Tabs
                initialRouteName="tabOne"
                screenOptions={{
                    tabBarActiveTintColor: activeColor,
                    tabBarInactiveTintColor: inactiveColor,
                    headerShown: false,
                    tabBarStyle: {
                        ...styles.tabBar,
                        backgroundColor: themeColors.background,
                    },
                    tabBarLabelStyle: styles.tabBarLabel,
                    tabBarItemStyle: styles.tabBarItem,
                }}
            >
                <Tabs.Screen
                    name="tabOne"
                    options={{
                        title: t('titles.scan'),
                        tabBarIcon: ({ color, focused }) => (
                            <TabBarIcon
                                name="camera"
                                color={focused ? activeColor : color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="tabTwo"
                    options={{
                        title: t('titles.history'),
                        tabBarIcon: ({ color, focused }) => (
                            <TabBarIcon
                                name="history"
                                color={focused ? activeColor : color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="tabThree"
                    options={{
                        title: t('titles.analyzeCondition'),
                        tabBarIcon: ({ color, focused }) => (
                            <TabBarIcon
                                name="cogs"
                                color={focused ? activeColor : color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="tabFour"
                    options={{
                        title: t('titles.manageCollections'),
                        tabBarIcon: ({ color, focused }) => (
                            <TabBarIcon
                                name="book"
                                color={focused ? activeColor : color}
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
        borderTopWidth: 0,
        elevation: 0,
    },
    tabBarLabel: {
        fontSize: 12,
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
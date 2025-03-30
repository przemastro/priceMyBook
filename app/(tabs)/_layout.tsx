import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { AppProvider } from '@/context/AppContext';
import { useTranslation } from 'react-i18next';

function TabBarIcon(props: {
    name: React.ComponentProps<typeof FontAwesome>['name'];
    color: string;
}) {
    return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
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
                screenOptions={{
                    tabBarActiveTintColor: activeColor,
                    tabBarInactiveTintColor: inactiveColor,
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: themeColors.background,
                        //borderTopColor: themeColors.border,
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: t('titles.scan'), // Zmienione na titles.scan dla spójności
                        tabBarIcon: ({ color, focused }) => (
                            <TabBarIcon
                                name="camera"
                                color={focused ? activeColor : color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="two"
                    options={{
                        title: t('titles.analyzeCondition'), // Używamy istniejącego klucza
                        tabBarIcon: ({ color, focused }) => (
                            <TabBarIcon
                                name="cogs"
                                color={focused ? activeColor : color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="three"
                    options={{
                        title: t('titles.manageCollections'), // Używamy istniejącego klucza
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
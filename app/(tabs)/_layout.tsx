import React, { useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useColorScheme } from '@/app/components/useColorScheme';
import { AppProvider } from '@/context/AppContext';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View } from 'react-native';
import { colors } from "@/styles/styles";
import { Svg, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import {Ionicons} from "@expo/vector-icons";

function TabBarIcon(props: {
    name: React.ComponentProps<typeof FontAwesome>['name'];
    color: string;
}) {
    return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const { t } = useTranslation();
    const [activeFactors, setActiveFactors] = useState({
        defects: true,
        uniqueness: true,
        market: true
    });

    return (
        <AppProvider>
            <Tabs
                initialRouteName="tabOne"
                screenOptions={{
                    tabBarActiveTintColor: colors.primary,
                    tabBarInactiveTintColor: '#8e8e93',
                    headerShown: false,
                    tabBarStyle: {
                        ...styles.tabBar,
                        backgroundColor: 'transparent',
                        borderTopWidth: 1,
                        borderTopColor: colors.white,
                        elevation: 0,
                    },
                    tabBarBackground: () => (
                        <View style={styles.tabBarBackground}>
                            {/* Górna część z białym tłem */}
                            <View style={styles.topBackground} />

                            {/* Łuk z gradientem */}
                            <View style={styles.arcContainer}>
                                <Svg width="100%" height={125} viewBox="0 0 100 15" preserveAspectRatio="none">
                                    <Defs>
                                        <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="0">
                                            <Stop offset="0%" stopColor="#f8f9ff" />
                                            <Stop offset="100%" stopColor="#f8f9ff" />
                                        </LinearGradient>
                                    </Defs>
                                    <Path
                                        d="M0 0
                                           H30
                                           C38 0, 40 5, 50 5
                                           C60 5, 62 0, 70 0
                                           H100"
                                        fill="url(#gradient)"
                                    />
                                </Svg>
                            </View>

                            {/* Dolna część z białym tłem i cieniem */}
                            <View style={styles.bottomBackground} />
                        </View>
                    ),
                    tabBarLabelStyle: styles.tabBarLabel,
                }}
            >
                <Tabs.Screen
                    name="HomeScreen"
                    options={{
                        title: t('titlesShort.home'),
                        tabBarIcon: ({ color, focused }) => (
                            <TabBarIcon
                                name="home"
                                color={focused ? colors.primary : color}
                            />
                        ),
                        tabBarItemStyle: styles.regularTabItem,
                    }}
                />
                <Tabs.Screen
                    name="HistoryScreen"
                    options={{
                        title: t('titlesShort.history'),
                        tabBarIcon: ({ color, focused }) => (
                            <TabBarIcon
                                name="history"
                                color={focused ? colors.primary : color}
                            />
                        ),
                        tabBarItemStyle: styles.regularTabItem,
                    }}
                />
                <Tabs.Screen
                    name="ScanScreen"
                    options={{
                        title: '',
                        tabBarIcon: ({ color, focused }) => (
                            <View style={[
                                styles.scanButton,
                                focused && styles.scanButtonActive
                            ]}>
                                <Ionicons
                                    name="scan"
                                    size={30}
                                    color={focused ? colors.white : colors.white}
                                />
                            </View>
                        ),
                        tabBarItemStyle: styles.scanTabItem,
                    }}
                />
                <Tabs.Screen
                    name="AnalysisScreen"
                    options={{
                        title: t('titlesShort.analyzeCondition'),
                        tabBarIcon: ({ color, focused }) => (
                            <TabBarIcon
                                name="cogs"
                                color={focused ? colors.primary : color}
                            />
                        ),
                        tabBarItemStyle: styles.regularTabItem,
                    }}
                />
                <Tabs.Screen
                    name="CollectionsScreen"
                    options={{
                        title: t('titlesShort.manageCollections'),
                        tabBarIcon: ({ color, focused }) => (
                            <TabBarIcon
                                name="book"
                                color={focused ? colors.primary : color}
                            />
                        ),
                        tabBarItemStyle: styles.regularTabItem,
                    }}
                />
            </Tabs>
        </AppProvider>
    );
}

const ARC_HEIGHT = 15;
const SCAN_BUTTON_SIZE = 70;
const SCAN_BUTTON_TOP = -30;

const styles = StyleSheet.create({
    tabBar: {
        height: Platform.select({
            ios: 70,
            android: 60,
        }),
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    tabBarBackground: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '100%',
        backgroundColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    topBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: 'white',
    },
    bottomBackground: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: 'white',
    },
    arcContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: ARC_HEIGHT,
        zIndex: 2,
    },
    tabBarLabel: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: Platform.select({
            ios: 15,
            android: 5,
        }),
    },
    regularTabItem: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10,
    },
    scanTabItem: {
        height: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: SCAN_BUTTON_TOP,
        zIndex: 1,
    },
    scanButton: {
        width: SCAN_BUTTON_SIZE,
        height: SCAN_BUTTON_SIZE,
        borderRadius: SCAN_BUTTON_SIZE / 2,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.primary,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        marginBottom: 40
    },
    scanButtonActive: {
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOpacity: 0.2,
    },
});
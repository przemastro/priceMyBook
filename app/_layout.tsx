import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { View, TouchableOpacity, StyleSheet, Animated, Platform, Linking } from 'react-native';
import i18n from './i18n/config';
import { Ionicons } from '@expo/vector-icons';
import { colors } from "@/styles/styles";

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const { t } = useTranslation();
  const router = useRouter();
  const spinValue = useRef(new Animated.Value(0)).current;
  const [activeSettingsTab, setActiveSettingsTab] = useState('about');
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

  const navigateToSettings = () => {
    router.push('/settings');
  };

  const handleRateApp = () => {
    const url = Platform.select({
      ios: 'https://apps.apple.com/app/idYOUR_APPLE_ID', // ← podmień na swój Apple ID
      android: 'https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME', // ← podmień na swój package name
    });

    if (typeof url === "string") {
      Linking.openURL(url).catch(err =>
          console.error("Couldn't open store page", err)
      );
    }
  };

  return (
      <>
        <Stack>
          <Stack.Screen
              name="index"
              options={{ headerShown: false }}
          />
          <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false }}
              initialParams={{ activeFactors: JSON.stringify(activeFactors) }}
          />
          <Stack.Screen
              name="modal"
              options={{
                presentation: 'modal',
                title: t('titles.modal'),
              }}
          />
          <Stack.Screen
              name="settings"
              options={{
                title: t('settings.title'),
                headerTitleStyle: {
                  color: colors.black,
                  fontSize: 20,
                  fontWeight: 'bold',
                },
                headerLeft: () => (
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ marginLeft: 0, marginRight: 20 }}
                    >
                      <Ionicons name="arrow-back" size={24} color={colors.primary} />
                    </TouchableOpacity>
                ),
              }}
          />
        </Stack>

        <View style={styles.headerButtonsContainer}>
          <TouchableOpacity
              style={styles.ratingButton}
              onPress={handleRateApp}
              activeOpacity={0.7}
          >
            <Ionicons name="heart-outline" size={24} color={colors.black} />
          </TouchableOpacity>
          <TouchableOpacity
              style={styles.settingsButton}
              onPress={navigateToSettings}
              activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={24} color={colors.black} />
          </TouchableOpacity>
        </View>
      </>
  );
}

const styles = StyleSheet.create({
  headerButtonsContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 100,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    marginLeft: 0,
    padding: 8,
  },
  ratingButton: {
    marginLeft: 15,
    padding: 8,
  },
});

import { Stack } from 'expo-router';
import { useEffect, useRef } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
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
  const spinValue = useRef(new Animated.Value(0)).current;

  const toggleLanguage = () => {
    const newLang = i18n.language === 'pl' ? 'en' : 'pl';
    i18n.changeLanguage(newLang);

    // Animacja obrotu ikony
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

  return (
      <>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
              name="modal"
              options={{
                presentation: 'modal',
                title: t('titles.modal'),
              }}
          />
        </Stack>

        <View style={styles.headerButtonsContainer}>
          {/* Przycisk zmiany języka z animacją */}
          <TouchableOpacity
              style={styles.iconButton}
              onPress={toggleLanguage}
              activeOpacity={0.7}
          >
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Text style={styles.languageText}>
                {i18n.language === 'pl' ? 'EN' : 'PL'}
              </Text>
            </Animated.View>
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
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  languageText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: 'transparent',
  },
});
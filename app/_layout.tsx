import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { View, TouchableOpacity, Text } from 'react-native';
import i18n from './i18n/config';
import {colors} from "@/styles/styles";

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

  const toggleLanguage = () => {
    const newLang = i18n.language === 'pl' ? 'en' : 'pl';
    i18n.changeLanguage(newLang);
  };

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
        <View style={languageSwitchStyles.container}>
          <TouchableOpacity onPress={toggleLanguage}>
            <Text style={languageSwitchStyles.text}>
              {i18n.language === 'pl' ? 'EN' : 'PL'}
            </Text>
          </TouchableOpacity>
        </View>
      </>
  );
}

const languageSwitchStyles = {
  container: {
    position: 'absolute' as const,
    top: 40,
    right: 20,
    zIndex: 100,
    padding: 10,
    elevation: 5,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#007AFF',
  },
};
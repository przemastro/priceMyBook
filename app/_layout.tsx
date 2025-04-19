import { Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Modal, ScrollView, Dimensions } from 'react-native';
import i18n from './i18n/config';
import { Ionicons } from '@expo/vector-icons';
import { colors } from "@/styles/styles";

const { height } = Dimensions.get('window');

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
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('language');

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

  const toggleSettings = () => {
    setSettingsVisible(!settingsVisible);
    if (!settingsVisible) {
      setActiveSettingsTab('about');
    }
  };

  const renderSettingsContent = () => {
    switch (activeSettingsTab) {
      case 'about':
        return (
            <View style={styles.settingsTabContent}>
              <Text style={styles.settingsTitle}>{t('settings.about')}</Text>
              <Text style={styles.aboutText}>
                {t('settings.appName')}: {t('settings.name')}
              </Text>
              <Text style={styles.aboutText}>
                {t('settings.version')}: 1.0.0
              </Text>
              <Text style={styles.aboutText}>
                {t('settings.changelog')}:
              </Text>
              <Text style={styles.changelogText}>
                - {t('settings.changelog1')} {'\n'}
                - {t('settings.changelog2')} {'\n'}
                - {t('settings.changelog3')}
              </Text>
            </View>
        );
      case 'algorithm':
        return (
            <View style={styles.settingsTabContent}>
              <Text style={styles.settingsTitle}>{t('settings.priceAlgorithm')}</Text>
              <Text style={styles.algorithmText}>
                {t('settings.algorithmDescription')}:
              </Text>

              <View style={styles.mathContainer}>
                <Text style={styles.mathText}>
                  P<Text style={styles.mathSub}>final</Text> = max(P<Text style={styles.mathSub}>base</Text> × (1 - Σr<Text style={styles.mathSub}>i</Text>), P<Text style={styles.mathSub}>base</Text> × 0.1)
                </Text>
                <View style={styles.mathLegend}>
                  <Text style={styles.mathLegendItem}>P<Text style={styles.mathSub}>final</Text> - {t('settings.finalPrice')}</Text>
                  <Text style={styles.mathLegendItem}>P<Text style={styles.mathSub}>base</Text> - {t('settings.basePrice')}</Text>
                  <Text style={styles.mathLegendItem}>r<Text style={styles.mathSub}>i</Text> - {t('settings.defectReduction')} (0-1)</Text>
                </View>
              </View>

              <Text style={styles.algorithmStepTitle}>{t('settings.steps')}:</Text>
              <Text style={styles.algorithmStep}>
                1. {t('settings.basePrice')}{'\n'}
                2. {t('settings.defectReduction')}{'\n'}
                3. {t('settings.maxReduction')} (90%){'\n'}
                4. {t('settings.finalPriceCalculation')}
              </Text>
              <Text style={styles.algorithmExampleTitle}>{t('settings.example')}:</Text>
              <Text style={styles.algorithmExample}>
                P<Text style={styles.mathSub}>base</Text> = 100 PLN{'\n'}
                Σr<Text style={styles.mathSub}>i</Text> = 0.2 + 0.3 = 0.5 (50%){'\n'}
                P<Text style={styles.mathSub}>final</Text> = max(100 × (1 - 0.5), 100 × 0.1) = max(50, 10) = 50 PLN
              </Text>
            </View>
        );
      case 'language':
        return (
            <View style={styles.settingsTabContent}>
              <Text style={styles.settingsTitle}>{t('settings.language')}</Text>
              <TouchableOpacity
                  style={styles.languageButton}
                  onPress={toggleLanguage}
                  activeOpacity={0.7}
              >
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <Text style={styles.languageButtonText}>
                    {i18n.language === 'pl' ? 'English' : 'Polski'}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            </View>
        );
      default:
        return null;
    }
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

        <View style={styles.headerButtonsContainer}>
          {/* Przycisk ustawień */}
          <TouchableOpacity
              style={styles.settingsButton}
              onPress={toggleSettings}
              activeOpacity={0.7}
          >
            <Ionicons name="settings" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Modal z ustawieniami */}
        <Modal
            visible={settingsVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={toggleSettings}
        >
          <View style={styles.settingsModal}>
            <View style={[styles.settingsContainer, { height: height * 0.7 }]}>
              <View style={styles.settingsHeader}>
                <Text style={styles.settingsHeaderText}>{t('settings.title')}</Text>
                <TouchableOpacity onPress={toggleSettings}>
                  <Ionicons name="close" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.settingsTabs}>

                <TouchableOpacity
                    style={[styles.settingsTab, activeSettingsTab === 'about' && styles.activeTab]}
                    onPress={() => setActiveSettingsTab('about')}
                >
                  <Ionicons
                      name="information-circle"
                      size={20}
                      color={activeSettingsTab === 'about' ? colors.primary : colors.black}
                  />
                  <Text style={[styles.tabText, activeSettingsTab === 'about' && styles.activeTabText]}>
                    {t('settings.about')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.settingsTab, activeSettingsTab === 'algorithm' && styles.activeTab]}
                    onPress={() => setActiveSettingsTab('algorithm')}
                >
                  <Ionicons
                      name="calculator"
                      size={20}
                      color={activeSettingsTab === 'algorithm' ? colors.primary : colors.black}
                  />
                  <Text style={[styles.tabText, activeSettingsTab === 'algorithm' && styles.activeTabText]}>
                    {t('settings.priceAlgorithm')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.settingsTab, activeSettingsTab === 'language' && styles.activeTab]}
                    onPress={() => setActiveSettingsTab('language')}
                >
                  <Ionicons
                      name="language"
                      size={20}
                      color={activeSettingsTab === 'language' ? colors.primary : colors.black}
                  />
                  <Text style={[styles.tabText, activeSettingsTab === 'language' && styles.activeTabText]}>
                    {t('settings.language')}
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.settingsContent}>
                {renderSettingsContent()}
              </ScrollView>
            </View>
          </View>
        </Modal>
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
    marginLeft: 15,
    padding: 8,
  },
  settingsModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  settingsContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    padding: 20,
    width: '100%',
    maxHeight: '50%'
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingsHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  settingsTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
    paddingBottom: 10,
  },
  settingsTab: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    flexDirection: 'row',
  },
  activeTab: {
    backgroundColor: 'rgba(74,108,247,0.1)',
  },
  tabText: {
    marginLeft: 5,
    color: colors.black,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '500',
  },
  settingsContent: {
    paddingHorizontal: 10,
  },
  settingsTabContent: {
    paddingBottom: 30,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.primary,
  },
  languageButton: {
    backgroundColor: 'rgba(74,108,247,0.1)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  languageButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  aboutText: {
    fontSize: 16,
    marginBottom: 10,
    color: colors.black,
  },
  changelogText: {
    fontSize: 14,
    color: colors.grayDark,
    lineHeight: 20,
    marginLeft: 10,
  },
  algorithmText: {
    fontSize: 16,
    marginBottom: 15,
    color: colors.black,
  },
  mathContainer: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 15,
    borderRadius: 2,
    marginBottom: 20,
  },
  mathText: {
    fontSize: 18,
    fontFamily: 'SpaceMono',
    color: colors.primary,
    marginBottom: 10,
    paddingTop: 20,
  },
  mathSub: {
    fontSize: 12,
    lineHeight: 18,
  },
  mathLegend: {
    borderTopWidth: 1,
    borderTopColor: colors.gray,
    paddingTop: 10,
  },
  mathLegendItem: {
    fontSize: 14,
    color: colors.grayDark,
    marginBottom: 5,
  },
  algorithmStepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: colors.primary,
  },
  algorithmStep: {
    fontSize: 14,
    color: colors.grayDark,
    lineHeight: 22,
    marginBottom: 15,
    marginLeft: 10,
  },
  algorithmExampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: colors.primary,
  },
  algorithmExample: {
    fontSize: 14,
    color: colors.black,
    lineHeight: 22,
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 10,
    borderRadius: 5,
  },
});
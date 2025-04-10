import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Modal,
  View,
  Text,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useAppContext } from '@/context/AppContext';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, responsive, modal, globalStyles } from '@/styles/styles';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const fetchBookInfoFromGoogleAPI = async (isbn: string) => {
  const API_KEY = ''; // Replace with your actual API key
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const book = data.items[0].volumeInfo;
      return {
        title: book.title,
        authors: book.authors ? book.authors.join(', ') : 'Unknown',
        publisher: book.publisher || 'Unknown',
        description: book.description || 'No description available',
        price: book.saleInfo?.listPrice?.amount || null,
        image: book.imageLinks?.thumbnail || null,
      };
    }
    throw new Error('No book found');
  } catch (error) {
    console.error('Error fetching book info:', error);
    throw error;
  }
};

export default function TabOneScreen() {
  const { t, i18n } = useTranslation();
  const { isbn, setISBN, addToScanHistory } = useAppContext();
  const router = useRouter();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [bookInfo, setBookInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [manualPrice, setManualPrice] = useState('');
  const [cameraKey, setCameraKey] = useState(0);
  const [currentLang, setCurrentLang] = useState(i18n.language);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animation effect
  useEffect(() => {
    const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.9,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  // Language change handling
  useEffect(() => {
    const handleLanguageChange = () => setCurrentLang(i18n.language);
    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, [i18n]);

  // Camera permission
  const getBarCodeScannerPermissions = async () => {
    try {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert(t('alerts.error'), t('status.noCameraAccess'));
      }
    } catch (error) {
      console.error('Error getting camera permission:', error);
      setHasPermission(false);
    }
  };

  // Reset scanner state
  const resetScanner = useCallback(() => {
    setScanned(false);
    setCameraKey(prev => prev + 1);
    setModalVisible(false);
    setBookInfo(null);
    setManualPrice('');
  }, []);

  // Handle focus effect
  useFocusEffect(
      useCallback(() => {
        let isActive = true;

        const prepareScanner = async () => {
          try {
            await getBarCodeScannerPermissions();
            if (isActive) {
              resetScanner();
            }
          } catch (error) {
            console.error('Error preparing scanner:', error);
          }
        };

        prepareScanner();

        return () => {
          isActive = false;
        };
      }, [resetScanner])
  );

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;

    setScanned(true);
    setISBN(data);
    setLoading(true);
    setModalVisible(true);

    // Temporary entry
    addToScanHistory({
      isbn: data,
      title: 'Searching...',
      authors: '...',
      price: '0',
      displayPrice: 'N/A',
      originalPrice: '0',
      foundInApi: false
    });

    try {
      const book = await fetchBookInfoFromGoogleAPI(data);
      setBookInfo(book);

      // Final entry
      addToScanHistory({
        isbn: data,
        title: book.title || 'Not Found',
        authors: book.authors || 'Unknown',
        price: book.price ? book.price.toString() : '0',
        displayPrice: book.price ? `$${book.price.toFixed(2)}` : 'N/A',
        originalPrice: book.price ? book.price.toString() : '0',
        foundInApi: !!book.title
      });
    } catch (error) {
      console.error('Error:', error);
      addToScanHistory({
        isbn: data,
        title: 'Not Found',
        authors: 'Unknown',
        price: '0',
        displayPrice: 'N/A',
        originalPrice: '0',
        foundInApi: false
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setScanned(false);
      }, 3000);
    }
  };

  const handlePrice = () => {
    const priceValue = manualPrice ? manualPrice :
        (bookInfo?.price ? bookInfo.price.toString() : '');

    if (!priceValue) {
      Alert.alert(t('alerts.error'), t('alerts.enterPrice'));
      return;
    }

    const numericPrice = parseFloat(priceValue).toFixed(2);

    addToScanHistory({
      isbn: isbn!,
      title: bookInfo?.title || 'Manual Entry',
      authors: bookInfo?.authors || 'Unknown',
      price: numericPrice,
      displayPrice: `$${numericPrice}`,
      originalPrice: numericPrice,
      foundInApi: !!bookInfo?.title
    });

    router.push({
      pathname: '/tabThree',
      params: {
        isbn,
        averagePrice: numericPrice,
        originalPrice: numericPrice,
        title: bookInfo?.title || 'Manual Entry',
        authors: bookInfo?.authors || 'Unknown',
        fromHistory: 'false'
      }
    });
  };

  const handleCancel = () => {
    resetScanner();
  };

  if (hasPermission === null) {
    return (
        <View style={globalStyles.container}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text>{t('status.requestingPermission')}</Text>
        </View>
    );
  }

  if (hasPermission === false) {
    return (
        <View style={globalStyles.container}>
          <Text style={{ marginBottom: 20 }}>{t('status.noCameraAccess')}</Text>
          <TouchableOpacity
              style={styles.permissionButton}
              onPress={getBarCodeScannerPermissions}
          >
            <Text style={styles.permissionButtonText}>
              {t('buttons.requestPermission')}
            </Text>
          </TouchableOpacity>
        </View>
    );
  }

  return (
      <View style={styles.fullScreenContainer}>
        {!scanned && (
            <BarCodeScanner
                key={`barcode-scanner-${cameraKey}`}
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={[StyleSheet.absoluteFill, styles.barcodeScanner]}
            >
              <View style={styles.cameraOverlay}>
                <Animated.View style={[styles.scanFrame, { transform: [{ scale: pulseAnim }] }]}>
                  <View style={styles.scanFrameTopLeft} />
                  <View style={styles.scanFrameTopRight} />
                  <View style={styles.scanFrameBottomLeft} />
                  <View style={styles.scanFrameBottomRight} />
                </Animated.View>
              </View>
            </BarCodeScanner>
        )}

        <Modal
            animationType="slide"
            transparent
            visible={modalVisible}
            onRequestClose={handleCancel}
            key={currentLang}
        >
          <View style={modal.container}>
            <ScrollView contentContainerStyle={modal.content}>
              <Text style={typography.h1}>
                {t('bookInfo.scannedISBN')}: {isbn}
              </Text>

              {loading ? (
                  <ActivityIndicator size="large" color={colors.primary} />
              ) : (
                  <>
                    {bookInfo && (
                        <View style={styles.bookInfoContainer}>
                          <Text style={typography.body}>
                            {t('bookInfo.title')}: {bookInfo.title || t('bookInfo.unknown')}
                          </Text>
                          <Text style={typography.body}>
                            {t('bookInfo.authors')}: {bookInfo.authors || t('bookInfo.unknown')}
                          </Text>
                          {bookInfo.publisher && (
                              <Text style={typography.body}>
                                {t('bookInfo.publisher')}: {bookInfo.publisher}
                              </Text>
                          )}
                          {bookInfo.image && (
                              <Image
                                  source={{ uri: bookInfo.image }}
                                  style={styles.bookImage}
                              />
                          )}
                        </View>
                    )}

                    <View style={styles.priceInputContainer}>
                      <Text style={typography.caption}>
                        {t('bookInfo.suggestedPrice')}: {bookInfo?.price ? `$${bookInfo.price.toFixed(2)}` : t('bookInfo.noPrice')}
                      </Text>
                      <TextInput
                          style={styles.input}
                          placeholder={t('placeholders.enterPrice')}
                          keyboardType="numeric"
                          value={manualPrice}
                          onChangeText={setManualPrice}
                          autoFocus={!bookInfo?.price}
                      />
                    </View>

                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                          style={styles.actionButton}
                          onPress={handlePrice}
                      >
                        <Text style={styles.actionButtonText}>
                          {t('buttons.continue')}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                          style={[styles.cancelButton]}
                          onPress={handleCancel}
                      >
                        <Text style={styles.cancelButtonText}>
                          {t('buttons.cancel')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
              )}
            </ScrollView>
          </View>
        </Modal>
      </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  barcodeScanner: {
    width: '100%',
    height: '100%',
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  scanFrame: {
    width: width * 0.7,
    height: width * 0.7,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  scanFrameTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 50,
    height: 50,
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderColor: 'white',
  },
  scanFrameTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 50,
    height: 50,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderColor: 'white',
  },
  scanFrameBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 50,
    height: 50,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderColor: 'white',
  },
  scanFrameBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 50,
    height: 50,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderColor: 'white',
  },
  bookInfoContainer: {
    marginBottom: responsive.mediumMargin,
  },
  priceInputContainer: {
    width: '100%',
    marginBottom: responsive.mediumMargin,
  },
  input: {
    height: 50,
    borderColor: colors.gray,
    borderWidth: 1,
    paddingLeft: 15,
    width: '100%',
    borderRadius: 1,
    backgroundColor: colors.background,
    marginTop: responsive.smallMargin,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: responsive.mediumMargin,
  },
  bookImage: {
    width: 100,
    height: 150,
    marginTop: responsive.smallMargin,
    resizeMode: 'contain',
    borderRadius: 10,
    alignSelf: 'center',
  },
  permissionButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 1,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  actionButton: {
    ...typography.body,
    color: colors.black,
  },
  cancelButton: {
    ...typography.body,
    color: colors.black,
  },
  actionButtonText: {
    ...typography.body,
    color: colors.black,
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.black,
  },
});
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
  Dimensions,
  Platform
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useAppContext } from '@/context/AppContext';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, responsive } from '@/styles/styles';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const fetchBookInfoFromGoogleAPI = async (isbn: string) => {
  const API_KEY = ''; // Tutaj należy dodać klucz API
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
  const [manualISBN, setManualISBN] = useState('');
  const [cameraKey, setCameraKey] = useState(0);
  const [currentLang, setCurrentLang] = useState(i18n.language);
  const [isManualMode, setIsManualMode] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  useEffect(() => {
    const handleLanguageChange = () => setCurrentLang(i18n.language);
    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, [i18n]);

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

  const resetScanner = useCallback(() => {
    setScanned(false);
    setCameraKey(prev => prev + 1);
    setModalVisible(false);
    setBookInfo(null);
    setManualPrice('');
    setIsManualMode(false);
    setManualISBN('');
  }, []);

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

    addToScanHistory({
      isbn: data,
      title: t('status.searching'),
      authors: '...',
      price: '0',
      displayPrice: 'N/A',
      originalPrice: '0',
      foundInApi: false
    });

    try {
      const book = await fetchBookInfoFromGoogleAPI(data);
      setBookInfo(book);

      addToScanHistory({
        isbn: data,
        title: book.title || t('bookInfo.notFound'),
        authors: book.authors || t('bookInfo.unknown'),
        price: book.price ? book.price.toString() : '0',
        displayPrice: book.price ? `$${book.price.toFixed(2)}` : 'N/A',
        originalPrice: book.price ? book.price.toString() : '0',
        foundInApi: !!book.title
      });
    } catch (error) {
      console.error('Error:', error);
      addToScanHistory({
        isbn: data,
        title: t('bookInfo.notFound'),
        authors: t('bookInfo.unknown'),
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

  const handleManualSubmit = () => {
    if (!manualISBN.trim()) {
      Alert.alert(t('alerts.error'), t('alerts.enterISBN'));
      return;
    }

    setISBN(manualISBN);
    setModalVisible(true);
    setLoading(true);

    addToScanHistory({
      isbn: manualISBN,
      title: t('status.searching'),
      authors: '...',
      price: '0',
      displayPrice: 'N/A',
      originalPrice: '0',
      foundInApi: false
    });

    fetchBookInfoFromGoogleAPI(manualISBN)
        .then(book => {
          setBookInfo(book);
          addToScanHistory({
            isbn: manualISBN,
            title: book.title || t('bookInfo.notFound'),
            authors: book.authors || t('bookInfo.unknown'),
            price: book.price ? book.price.toString() : '0',
            displayPrice: book.price ? `$${book.price.toFixed(2)}` : 'N/A',
            originalPrice: book.price ? book.price.toString() : '0',
            foundInApi: !!book.title
          });
        })
        .catch(error => {
          console.error('Error:', error);
          addToScanHistory({
            isbn: manualISBN,
            title: t('bookInfo.notFound'),
            authors: t('bookInfo.unknown'),
            price: '0',
            displayPrice: 'N/A',
            originalPrice: '0',
            foundInApi: false
          });
        })
        .finally(() => {
          setLoading(false);
        });
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
      title: bookInfo?.title || t('bookInfo.manualEntry'),
      authors: bookInfo?.authors || t('bookInfo.unknown'),
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
        title: bookInfo?.title || t('bookInfo.manualEntry'),
        authors: bookInfo?.authors || t('bookInfo.unknown'),
        fromHistory: 'false'
      }
    });
  };

  const handleCancel = () => {
    resetScanner();
  };

  const toggleManualMode = () => {
    setIsManualMode(true);
    setScanned(true);
  };

  if (hasPermission === null) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text>{t('status.requestingPermission')}</Text>
        </View>
    );
  }

  if (hasPermission === false) {
    return (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>{t('status.noCameraAccess')}</Text>
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
        {!isManualMode && !scanned && (
            <BarCodeScanner
                key={`barcode-scanner-${cameraKey}`}
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={
                  Platform.OS === "android"
                      ? {
                        position: "absolute",
                        top: 0,
                        transform: [{ translateX: width / 2 }],
                        right: 0,
                        bottom: 0,
                        width: width * 2,
                        height: height,
                      }
                      : StyleSheet.absoluteFillObject
                }
            >
              <View style={styles.cameraOverlay}>
                <Animated.View style={[styles.scanFrame, { transform: [{ scale: pulseAnim }] }]}>
                  <View style={styles.scanFrameTopLeft} />
                  <View style={styles.scanFrameTopRight} />
                  <View style={styles.scanFrameBottomLeft} />
                  <View style={styles.scanFrameBottomRight} />
                </Animated.View>

                <Text style={styles.scanHintText}>{t('labels.scanBarcode')}</Text>
              </View>
            </BarCodeScanner>
        )}

        {/* Przycisk zamknięcia na stałe w lewym górnym rogu */}
        {!isManualMode && !scanned && (
            <TouchableOpacity
                style={styles.closeButton}
                onPress={toggleManualMode}
            >
              <Ionicons name="close" size={32} color="white" />
            </TouchableOpacity>
        )}

        {isManualMode && (
            <View style={styles.manualInputContainer}>
              <View style={styles.manualHeader}>
                <TouchableOpacity onPress={resetScanner}>
                  <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[typography.h1, styles.manualInputTitle]}>
                  {t('labels.enterISBNManually')}
                </Text>
                <View style={{ width: 24 }} />
              </View>

              <View style={styles.inputRow}>
                <TextInput
                    style={[styles.input, styles.flexInput]}
                    placeholder={t('placeholders.enterISBN')}
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    value={manualISBN}
                    onChangeText={setManualISBN}
                    autoFocus
                />
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleManualSubmit}
                >
                  <Text style={styles.submitButtonText}>
                    {t('buttons.submit')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
        )}

        <Modal
            animationType="fade"
            transparent
            visible={modalVisible}
            onRequestClose={handleCancel}
            key={currentLang}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                {t('bookInfo.scannedISBN')}: {isbn}
              </Text>

              {loading ? (
                  <ActivityIndicator size="large" color={colors.primary} />
              ) : (
                  <>
                    {bookInfo && (
                        <View style={styles.bookInfoContainer}>
                          {bookInfo.image && (
                              <Image
                                  source={{ uri: bookInfo.image }}
                                  style={styles.bookImage}
                              />
                          )}
                          <Text style={styles.bookInfoText}>
                            {t('bookInfo.title')}: {bookInfo.title || t('bookInfo.unknown')}
                          </Text>
                          <Text style={styles.bookInfoText}>
                            {t('bookInfo.authors')}: {bookInfo.authors || t('bookInfo.unknown')}
                          </Text>
                          {bookInfo.publisher && (
                              <Text style={styles.bookInfoText}>
                                {t('bookInfo.publisher')}: {bookInfo.publisher}
                              </Text>
                          )}
                        </View>
                    )}

                    <View style={styles.priceInputContainer}>
                      <Text style={styles.suggestedPriceText}>
                        {t('bookInfo.suggestedPrice')}: {bookInfo?.price ? `$${bookInfo.price.toFixed(2)}` : t('bookInfo.noPrice')}
                      </Text>
                      <TextInput
                          style={styles.input}
                          placeholder={t('placeholders.enterPrice')}
                          placeholderTextColor="#888"
                          keyboardType="numeric"
                          value={manualPrice}
                          onChangeText={setManualPrice}
                          autoFocus={!bookInfo?.price}
                      />
                    </View>

                    <View style={styles.modalButtonsContainer}>
                      <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={handleCancel}
                      >
                        <Text style={styles.cancelButtonText}>
                          {t('buttons.cancel')}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                          style={styles.primaryButton}
                          onPress={handlePrice}
                      >
                        <Text style={styles.continueButtonText}>
                          {t('buttons.continue')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
              )}
            </View>
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
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    zIndex: 100,
    borderRadius: 50,
    padding: 10,
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
  scanHintText: {
    color: 'white',
    marginTop: 20,
    fontSize: 16,
  },
  manualInputContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  manualHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    marginTop: responsive.largeMargin
  },
  manualInputTitle: {
    textAlign: 'center',
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  flexInput: {
    flex: 1,
    marginRight: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
  },
  permissionText: {
    marginBottom: 16,
    textAlign: 'center',
    color: '#2c3e50',
  },
  permissionButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 5,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 2,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    ...typography.h1,
    marginBottom: 16,
    textAlign: 'left',
    color: colors.black,
  },
  bookInfoContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  bookInfoText: {
    ...typography.body,
    marginBottom: 8,
  },
  bookImage: {
    width: 120,
    height: 180,
    marginBottom: 16,
    borderRadius: 5,
  },
  priceInputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  suggestedPriceText: {
    ...typography.caption,
    marginBottom: 8,
    color: colors.primary,
  },
  input: {
    height: 50,
    borderColor: 'rgba(0,0,0,0.1)',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    color: colors.black,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  primaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 10,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  continueButtonText: {
    color: colors.primary,
    fontWeight: '500',
  },
  cancelButtonText: {
    color: colors.primary,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  submitButtonText: {
    fontWeight: '600',
    color: colors.white
  },
});
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
import { colors, typography } from '@/styles/styles';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

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
  const [manualISBN, setManualISBN] = useState('');
  const [cameraKey, setCameraKey] = useState(0);
  const [currentLang, setCurrentLang] = useState(i18n.language);
  const [isManualMode, setIsManualMode] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animation effect
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
    setIsManualMode(false);
    setManualISBN('');
  }, []);

  // Handle focus effect - always start in scan mode
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

  const handleManualSubmit = () => {
    if (!manualISBN.trim()) {
      Alert.alert(t('alerts.error'), t('alerts.enterISBN'));
      return;
    }

    setISBN(manualISBN);
    setModalVisible(true);
    setLoading(true);

    // Temporary entry
    addToScanHistory({
      isbn: manualISBN,
      title: 'Searching...',
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
            title: book.title || 'Not Found',
            authors: book.authors || 'Unknown',
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
            title: 'Not Found',
            authors: 'Unknown',
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

  const toggleManualMode = () => {
    setIsManualMode(true);
    setScanned(true); // Prevent scanning while in manual mode
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
                style={[StyleSheet.absoluteFill, styles.barcodeScanner]}
            >
              <View style={styles.cameraOverlay}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={toggleManualMode}
                >
                  <Ionicons name="close" size={32} color="white" />
                </TouchableOpacity>

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

        {isManualMode && (
            <View style={styles.manualInputContainer}>
              <Text style={[typography.h1, styles.manualInputTitle]}>{t('labels.enterISBNManually')}</Text>

              <TextInput
                  style={styles.input}
                  placeholder={t('placeholders.enterISBN')}
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={manualISBN}
                  onChangeText={setManualISBN}
                  autoFocus
              />

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={resetScanner}
                >
                  <Text style={styles.cancelButtonText}>
                    {t('buttons.cancel')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.submitButton]}
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
            animationType="slide"
            transparent
            visible={modalVisible}
            onRequestClose={handleCancel}
            key={currentLang}
        >
          <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={[typography.h1, styles.modalTitle]}>
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

                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                          style={[styles.button, styles.primaryButton]}
                          onPress={handlePrice}
                      >
                        <Text style={styles.continueButtonText}>
                          {t('buttons.continue')}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                          style={[styles.button, styles.cancelButton]}
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
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    borderRadius: 50,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scanFrame: {
    width: width * 0.7,
    height: width * 0.8,
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  manualInputTitle: {
    marginBottom: 24,
    textAlign: 'center',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 5,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  button: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  continueButtonText: {
    fontWeight: '600',
    color: colors.white
  },
  submitButtonText: {
    fontWeight: '600',
    color: colors.white
  },
  cancelButtonText: {
    fontWeight: '600',
    color: colors.black
  },
});
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
  Platform,
  Clipboard
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useAppContext } from '@/context/AppContext';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, responsive } from '@/styles/styles';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

type BookSource = 'google' | 'amazon' | 'manual';

// Funkcja konwertująca ISBN na ASIN
const convertIsbnToAsin = (isbn: string): string => {
  const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');

  if (/^\d{9}[\dX]$/i.test(cleanIsbn)) {
    return cleanIsbn.toUpperCase();
  }

  if (/^978\d{10}$/.test(cleanIsbn)) {
    const isbnWithoutPrefix = cleanIsbn.substring(3, 12);
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(isbnWithoutPrefix.charAt(i)) * (10 - i);
    }

    const checkDigit = (11 - (sum % 11)) % 11;
    const checkChar = checkDigit === 10 ? 'X' : checkDigit.toString();

    return isbnWithoutPrefix + checkChar;
  }

  return isbn;
};

interface AmazonPriceOffer {
  price: number;
  currency: string;
  condition: string;
  seller: string;
  delivery: string;
  deliveryTime: string;
  rawOffer: any;
}

interface AmazonApiResponse {
  prices: AmazonPriceOffer[];
  productTitle?: string;
  productImage?: string;
  productUrl?: string;
  isPrime: boolean;
  marketplace: string;
  rawResponse: any;
  error?: string;
}

const fetchBookPriceFromAmazonAPI = async (isbn: string): Promise<AmazonApiResponse> => {
  const asin = convertIsbnToAsin(isbn);
  const url = `https://real-time-amazon-data.p.rapidapi.com/product-offers?asin=${asin}&country=US&limit=5&page=1`;

  console.log('[Amazon API] Request:', {
    url,
    headers: {
      'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
      'x-rapidapi-key': 'e9afae8b1amsh0201a5bdb36bea1p164ad8jsn949616e357e6',
    }
  });

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
        'x-rapidapi-key': 'e9afae8b1amsh0201a5bdb36bea1p164ad8jsn949616e357e6',
      }
    });

    const data = await response.json();
    console.log('[Amazon API] Response:', data);

    if (data.status === "OK" && data.data?.product_offers?.length > 0) {
      const offers = data.data.product_offers.slice(0, 5);
      const prices = offers.map((offer: any): AmazonPriceOffer => {
        const priceStr = offer.product_price || '';
        const priceValue = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
        return {
          price: isNaN(priceValue) ? 0 : priceValue,
          currency: offer.currency || 'USD',
          condition: offer.product_condition,
          seller: offer.seller,
          delivery: offer.delivery_price,
          deliveryTime: offer.delivery_time,
          rawOffer: offer
        };
      });

      return {
        prices,
        productTitle: data.data.product_title,
        productImage: data.data.product_photo,
        productUrl: data.data.product_url,
        isPrime: data.data.is_prime || false,
        marketplace: data.data.country || 'US',
        rawResponse: data
      };
    }

    return {
      prices: [],
      rawResponse: data,
      isPrime: false,
      marketplace: 'US'
    };
  } catch (error: unknown) {
    console.error('[Amazon API] Error:', error);
    return {
      prices: [],
      rawResponse: null,
      isPrime: false,
      marketplace: 'US',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

interface BookInfo {
  title: string;
  authors: string;
  publisher?: string;
  description?: string;
  price: number | null;
  image: string | null;
  asin: string;
  source: BookSource;
  amazonData?: AmazonApiResponse;
}

const fetchBookInfoFromGoogleAPI = async (isbn: string): Promise<BookInfo | null> => {
  const API_KEY = ''; // Add your Google API key here
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
        asin: convertIsbnToAsin(isbn),
        source: 'google'
      };
    }
    return null;
  } catch (error: unknown) {
    console.error('Error fetching book info from Google:', error);
    return null;
  }
};

const fetchBookInfoFromAmazon = async (isbn: string): Promise<BookInfo | null> => {
  const amazonData = await fetchBookPriceFromAmazonAPI(isbn);

  if (amazonData.prices.length > 0) {
    return {
      title: amazonData.productTitle || `Book (ISBN: ${isbn})`,
      authors: 'Unknown',
      publisher: 'Unknown',
      description: 'No description available',
      price: amazonData.prices[0].price,
      image: amazonData.productImage || null,
      amazonData,
      asin: convertIsbnToAsin(isbn),
      source: 'amazon'
    };
  }

  return null;
};

export default function TabOneScreen() {
  const { t, i18n } = useTranslation();
  const { isbn, setISBN, addToScanHistory, exchangeRate } = useAppContext();
  const router = useRouter();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [bookInfo, setBookInfo] = useState<BookInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualPrice, setManualPrice] = useState('');
  const [manualISBN, setManualISBN] = useState('');
  const [cameraKey, setCameraKey] = useState(0);
  const [currentLang, setCurrentLang] = useState(i18n.language);
  const [isManualMode, setIsManualMode] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [apiLogs, setApiLogs] = useState<string>('');
  const [logsVisible, setLogsVisible] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);

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
    setCameraKey((prev: number) => prev + 1);
    setModalVisible(false);
    setBookInfo(null);
    setManualPrice('');
    setIsManualMode(false);
    setManualISBN('');
    setSelectedPrice(null);
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

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
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
      averagePrice: '0',
      defects: {},
      rating: 10,
      foundInApi: false,
      source: 'manual'
    });

    try {
      let book = await fetchBookInfoFromGoogleAPI(data);

      if (!book) {
        book = await fetchBookInfoFromAmazon(data);
      }

      if (book) {
        setBookInfo(book);

        if (book.source === 'google' && !book.price) {
          const amazonData = await fetchBookPriceFromAmazonAPI(data);
          if (amazonData.prices.length > 0) {
            setBookInfo(prev => ({
              ...prev!,
              amazonData,
              price: amazonData.prices[0].price
            }));
          }
        }

        addToScanHistory({
          isbn: data,
          title: book.title || t('bookInfo.notFound'),
          authors: book.authors || t('bookInfo.unknown'),
          price: book.price ? book.price.toString() : '0',
          displayPrice: book.price ? `$${book.price.toFixed(2)}` : 'N/A',
          originalPrice: book.price ? book.price.toString() : '0',
          averagePrice: book.price ? book.price.toString() : '0',
          defects: {},
          rating: 10,
          foundInApi: !!book.title,
          source: book.source
        });
      } else {
        throw new Error('Book not found in any API');
      }
    } catch (error) {
      console.error('Error:', error);
      addToScanHistory({
        isbn: data,
        title: t('bookInfo.notFound'),
        authors: t('bookInfo.unknown'),
        price: '0',
        displayPrice: 'N/A',
        originalPrice: '0',
        averagePrice: '0',
        defects: {},
        rating: 10,
        foundInApi: false,
        source: 'manual'
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setScanned(false);
      }, 3000);
    }
  };

  const handleManualSubmit = async () => {
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
      averagePrice: '0',
      defects: {},
      rating: 10,
      foundInApi: false,
      source: 'manual'
    });

    try {
      let book = await fetchBookInfoFromGoogleAPI(manualISBN);

      if (!book) {
        book = await fetchBookInfoFromAmazon(manualISBN);
      }

      if (book) {
        setBookInfo(book);

        if (book.source === 'google' && !book.price) {
          const amazonData = await fetchBookPriceFromAmazonAPI(manualISBN);
          if (amazonData.prices.length > 0) {
            setBookInfo(prev => ({
              ...prev!,
              amazonData,
              price: amazonData.prices[0].price
            }));
          }
        }

        addToScanHistory({
          isbn: manualISBN,
          title: book.title || t('bookInfo.notFound'),
          authors: book.authors || t('bookInfo.unknown'),
          price: book.price ? book.price.toString() : '0',
          displayPrice: book.price ? `$${book.price.toFixed(2)}` : 'N/A',
          originalPrice: book.price ? book.price.toString() : '0',
          averagePrice: book.price ? book.price.toString() : '0',
          defects: {},
          rating: 10,
          foundInApi: !!book.title,
          source: book.source
        });
      } else {
        throw new Error('Book not found in any API');
      }
    } catch (error) {
      console.error('Error:', error);
      addToScanHistory({
        isbn: manualISBN,
        title: t('bookInfo.notFound'),
        authors: t('bookInfo.unknown'),
        price: '0',
        displayPrice: 'N/A',
        originalPrice: '0',
        averagePrice: '0',
        defects: {},
        rating: 10,
        foundInApi: false,
        source: 'manual'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrice = () => {
    let priceValue = manualPrice;
    let priceSource = 'manual';
    let currency = 'USD';

    if (selectedPrice !== null) {
      priceValue = selectedPrice.toString();
      priceSource = 'amazon';
      currency = bookInfo?.amazonData?.prices?.[0]?.currency || 'USD';
    }
    else if (!priceValue && bookInfo?.price) {
      priceValue = bookInfo.price.toString();
      priceSource = bookInfo.source || 'manual';
      currency = 'USD';
    }
    else if (!priceValue) {
      Alert.alert(t('alerts.error'), t('alerts.enterPrice'));
      return;
    }

    let numericPrice = parseFloat(priceValue);
    let displayPrice = '';

    if (i18n.language === 'pl') {
      if (currency === 'USD') {
        numericPrice = numericPrice * exchangeRate;
      }
      displayPrice = `${numericPrice.toFixed(2)} PLN`;
    } else {
      if (currency !== 'USD') {
        numericPrice = numericPrice / exchangeRate;
      }
      displayPrice = `$${numericPrice.toFixed(2)}`;
    }

    addToScanHistory({
      isbn: isbn!,
      title: bookInfo?.title || t('bookInfo.manualEntry'),
      authors: bookInfo?.authors || t('bookInfo.unknown'),
      price: numericPrice.toFixed(2),
      displayPrice: displayPrice,
      originalPrice: numericPrice.toFixed(2),
      averagePrice: numericPrice.toFixed(2),
      defects: {},
      rating: 10,
      foundInApi: !!bookInfo?.title,
      source: bookInfo?.source || 'manual'
    });

    router.push({
      pathname: '/tabThree',
      params: {
        isbn,
        averagePrice: numericPrice.toFixed(2),
        originalPrice: numericPrice.toFixed(2),
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

  const showApiLogs = () => {
    let logs = '=== API Request Details ===\n';

    if (bookInfo?.source === 'google') {
      logs += 'Source: Google Books API\n';
      logs += `ISBN: ${isbn}\n\n`;
    } else {
      logs += 'Source: Amazon API\n';
      logs += `ASIN: ${bookInfo?.asin}\n`;
      logs += `URL: https://real-time-amazon-data.p.rapidapi.com/product-offers?asin=${bookInfo?.asin}&country=US&limit=5&page=1\n\n`;
    }

    logs += '=== API Response ===\n';
    if (bookInfo?.source === 'google') {
      logs += 'Google API response data not stored\n';
    } else {
      logs += JSON.stringify(bookInfo?.amazonData?.rawResponse || 'No response data', null, 2);
      logs += '\n\n';
    }

    logs += '=== Processed Book Info ===\n';
    logs += `Title: ${bookInfo?.title || 'N/A'}\n`;
    logs += `Authors: ${bookInfo?.authors || 'N/A'}\n`;
    logs += `Price: ${bookInfo?.price || 'N/A'} ${bookInfo?.amazonData?.prices?.[0]?.currency || 'USD'}\n`;
    logs += `Image URL: ${bookInfo?.image || 'N/A'}\n`;
    logs += `Source: ${bookInfo?.source || 'manual'}\n`;

    setApiLogs(logs);
    setLogsVisible(true);
  };

  const renderAmazonPriceButtons = () => {
    if (!bookInfo?.amazonData?.prices || bookInfo.amazonData.prices.length === 0) {
      return null;
    }

    return (
        <View style={styles.amazonPricesContainer}>
          <Text style={styles.amazonPricesTitle}>{t('bookInfo.amazonPrices')}:</Text>
          {bookInfo.amazonData.prices.map((offer: AmazonPriceOffer, index: number) => (
              <TouchableOpacity
                  key={index}
                  style={[
                    styles.amazonPriceButton,
                    selectedPrice === offer.price && styles.amazonPriceButtonSelected
                  ]}
                  onPress={() => {
                    setSelectedPrice(offer.price);
                    setManualPrice('');
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }}
              >
                <Text style={styles.amazonPriceText}>
                  {offer.price.toFixed(2)} {offer.currency}
                </Text>
                <Text style={styles.amazonPriceDetails}>
                  {offer.condition} • {offer.seller} • {offer.deliveryTime}
                </Text>
              </TouchableOpacity>
          ))}
        </View>
    );
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
              <ScrollView
                  ref={scrollViewRef}
                  contentContainerStyle={styles.modalScrollContent}
                  showsVerticalScrollIndicator={false}
              >
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
                                    resizeMode="contain"
                                />
                            )}
                            <Text style={styles.bookInfoText}>
                              {t('bookInfo.title')}: {bookInfo.title || t('bookInfo.unknown')}
                            </Text>
                            <Text style={styles.bookInfoText}>
                              {t('bookInfo.authors')}: {bookInfo.authors || t('bookInfo.unknown')}
                            </Text>
                            {bookInfo.publisher && bookInfo.publisher !== 'Unknown' && (
                                <Text style={styles.bookInfoText}>
                                  {t('bookInfo.publisher')}: {bookInfo.publisher}
                                </Text>
                            )}
                            {bookInfo.source === 'amazon' && (
                                <Text style={styles.bookInfoText}>
                                  Source: Amazon
                                </Text>
                            )}
                          </View>
                      )}

                      <View style={styles.priceInputContainer}>
                        {bookInfo?.price && (
                            <Text style={styles.suggestedPriceText}>
                              {t('bookInfo.suggestedPrice')}: {bookInfo.price.toFixed(2)} {bookInfo?.amazonData?.prices?.[0]?.currency || 'USD'}
                            </Text>
                        )}
                        {(!bookInfo?.price && !bookInfo?.amazonData) && (
                            <Text style={styles.suggestedPriceText}>
                              {t('bookInfo.noPrice')}
                            </Text>
                        )}

                        {renderAmazonPriceButtons()}

                        <TextInput
                            style={styles.input}
                            placeholder={i18n.language === 'pl' ?
                                t('placeholders.enterPricePLN') :
                                t('placeholders.enterPriceUSD')}
                            placeholderTextColor="#888"
                            keyboardType="numeric"
                            value={manualPrice}
                            onChangeText={(text) => {
                              setManualPrice(text);
                              setSelectedPrice(null);
                            }}
                            autoFocus={!bookInfo?.price && !bookInfo?.amazonData}
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
              </ScrollView>
            </View>
          </View>
        </Modal>

        {bookInfo && (
            <TouchableOpacity
                style={styles.logsButton}
                onPress={showApiLogs}
            >
              <Ionicons name="information-circle" size={24} color="white" />
            </TouchableOpacity>
        )}

        <Modal
            animationType="slide"
            transparent={false}
            visible={logsVisible}
            onRequestClose={() => setLogsVisible(false)}
        >
          <View style={styles.logsContainer}>
            <View style={styles.logsHeader}>
              <Text style={styles.logsTitle}>API Logs</Text>
              <TouchableOpacity
                  style={styles.closeLogsButton}
                  onPress={() => setLogsVisible(false)}
              >
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.logsContent}>
              <Text style={styles.logsText}>{apiLogs}</Text>
            </ScrollView>
            <TouchableOpacity
                style={styles.copyLogsButton}
                onPress={() => {
                  Clipboard.setString(apiLogs);
                  Alert.alert('Logs copied to clipboard');
                }}
            >
              <Text style={styles.copyLogsText}>Copy to Clipboard</Text>
            </TouchableOpacity>
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
    padding: 16,
    paddingTop: 6,
    backgroundColor: '#f8f9fa',
  },
  manualHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    marginTop: responsive.largeMargin,
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
    borderRadius: 8,
    padding: 20,
    maxHeight: '80%',
  },
  modalScrollContent: {
    paddingBottom: 20,
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
    textAlign: 'center',
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
    fontSize: 14,
    marginBottom: 8,
    color: colors.primary,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: 'rgba(0,0,0,0.1)',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    color: colors.black,
    marginTop: 10,
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
  amazonPricesContainer: {
    marginVertical: 10,
  },
  amazonPricesTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.black,
    textAlign: 'center',
  },
  amazonPriceButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  amazonPriceButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: '#e6f7ff',
  },
  amazonPriceText: {
    fontWeight: 'bold',
    color: colors.black,
  },
  amazonPriceDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  logsButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  logsContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeLogsButton: {
    padding: 8,
  },
  logsContent: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  logsText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 12,
  },
  copyLogsButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  copyLogsText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
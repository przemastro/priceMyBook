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

interface BookUniqueness {
  isMassMarket: boolean;
  isFirstEdition: boolean;
  isCollectorsEdition: boolean;
  hasAuthorSignature: boolean;
  isLimitedEdition: boolean;
  isPublisherDefunct: boolean;
}

interface MarketFactors {
  demand: 'veryHigh' | 'high' | 'medium' | 'low' | 'veryLow';
  supply: 'veryLow' | 'low' | 'medium' | 'high' | 'flooded';
  publicationYear?: number;
}

interface BookAgeInfo {
  years: number;
}

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

const fetchBookPriceFromAmazonAPI = async (isbn: string, language: string): Promise<AmazonApiResponse> => {
  const asin = convertIsbnToAsin(isbn);
  const country = language === 'pl' ? 'PL' : 'US';
  const url = `https://real-time-amazon-data.p.rapidapi.com/product-offers?asin=${asin}&country=${country}&limit=5&page=1`;

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
        // Dla Polski zamieniamy przecinek na kropkę przed parsowaniem
        const normalizedPriceStr = country === 'PL'
            ? priceStr.replace(/\./g, '').replace(',', '.')
            : priceStr.replace(/[^0-9.]/g, '');

        const priceValue = parseFloat(normalizedPriceStr);
        return {
          price: isNaN(priceValue) ? 0 : priceValue,
          currency: offer.currency || (country === 'PL' ? 'PLN' : 'USD'),
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
        marketplace: country,
        rawResponse: data
      };
    }

    return {
      prices: [],
      rawResponse: data,
      isPrime: false,
      marketplace: country
    };
  } catch (error: unknown) {
    console.error('[Amazon API] Error:', error);
    return {
      prices: [],
      rawResponse: null,
      isPrime: false,
      marketplace: country,
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

const fetchBookInfoFromAmazon = async (isbn: string, language: string): Promise<BookInfo | null> => {
  const amazonData = await fetchBookPriceFromAmazonAPI(isbn, language);

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

  const defaultUniqueness: BookUniqueness = {
    isMassMarket: false,
    isFirstEdition: false,
    isCollectorsEdition: false,
    hasAuthorSignature: false,
    isLimitedEdition: false,
    isPublisherDefunct: false
  };

  const defaultMarketFactors: MarketFactors = {
    demand: 'medium',
    supply: 'medium',
    publicationYear: new Date().getFullYear()
  };

  const defaultAgeInfo: BookAgeInfo = {
    years: 0
  };

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
      defects: {},
      rating: 10,
      foundInApi: false,
      source: 'manual',
      uniqueness: defaultUniqueness,
      marketFactors: defaultMarketFactors,
      ageInfo: defaultAgeInfo
    });

    try {
      let book = await fetchBookInfoFromGoogleAPI(data);

      if (!book) {
        book = await fetchBookInfoFromAmazon(data, i18n.language);
      }

      if (book) {
        setBookInfo(book);

        if (book.source === 'google' && !book.price) {
          const amazonData = await fetchBookPriceFromAmazonAPI(data, i18n.language);
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
          displayPrice: book.price ? `${book.price.toFixed(2)} ${book.amazonData?.prices?.[0]?.currency || 'USD'}` : 'N/A',
          originalPrice: book.price ? book.price.toString() : '0',
          defects: {},
          rating: 10,
          foundInApi: !!book.title,
          source: book.source,
          uniqueness: defaultUniqueness,
          marketFactors: defaultMarketFactors,
          ageInfo: defaultAgeInfo
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
        defects: {},
        rating: 10,
        foundInApi: false,
        source: 'manual',
        uniqueness: defaultUniqueness,
        marketFactors: defaultMarketFactors,
        ageInfo: defaultAgeInfo
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
      defects: {},
      rating: 10,
      foundInApi: false,
      source: 'manual',
      uniqueness: defaultUniqueness,
      marketFactors: defaultMarketFactors,
      ageInfo: defaultAgeInfo
    });

    try {
      let book = await fetchBookInfoFromGoogleAPI(manualISBN);

      if (!book) {
        book = await fetchBookInfoFromAmazon(manualISBN, i18n.language);
      }

      if (book) {
        setBookInfo(book);

        if (book.source === 'google' && !book.price) {
          const amazonData = await fetchBookPriceFromAmazonAPI(manualISBN, i18n.language);
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
          displayPrice: book.price ? `${book.price.toFixed(2)} ${book.amazonData?.prices?.[0]?.currency || 'USD'}` : 'N/A',
          originalPrice: book.price ? book.price.toString() : '0',
          defects: {},
          rating: 10,
          foundInApi: !!book.title,
          source: book.source,
          uniqueness: defaultUniqueness,
          marketFactors: defaultMarketFactors,
          ageInfo: defaultAgeInfo
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
        defects: {},
        rating: 10,
        foundInApi: false,
        source: 'manual',
        uniqueness: defaultUniqueness,
        marketFactors: defaultMarketFactors,
        ageInfo: defaultAgeInfo
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrice = () => {
    let priceValue = manualPrice;
    let priceSource = 'manual';
    let currency = bookInfo?.amazonData?.prices?.[0]?.currency || (i18n.language === 'pl' ? 'PLN' : 'USD');

    if (selectedPrice !== null) {
      priceValue = selectedPrice.toString();
      priceSource = 'amazon';
      currency = bookInfo?.amazonData?.prices?.[0]?.currency || (i18n.language === 'pl' ? 'PLN' : 'USD');
    }
    else if (!priceValue && bookInfo?.price) {
      priceValue = bookInfo.price.toString();
      priceSource = bookInfo.source || 'manual';
      currency = bookInfo?.amazonData?.prices?.[0]?.currency || (i18n.language === 'pl' ? 'PLN' : 'USD');
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
      defects: {},
      rating: 10,
      foundInApi: !!bookInfo?.title,
      source: bookInfo?.source || 'manual',
      uniqueness: defaultUniqueness,
      marketFactors: defaultMarketFactors,
      ageInfo: defaultAgeInfo
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

  const showApiLogs = () => {
    let logs = '=== API Request Details ===\n';

    if (bookInfo?.source === 'google') {
      logs += 'Source: Google Books API\n';
      logs += `ISBN: ${isbn}\n\n`;
    } else {
      logs += 'Source: Amazon API\n';
      logs += `Marketplace: ${bookInfo?.amazonData?.marketplace || 'US'}\n`;
      logs += `ASIN: ${bookInfo?.asin}\n`;
      logs += `URL: https://real-time-amazon-data.p.rapidapi.com/product-offers?asin=${bookInfo?.asin}&country=${bookInfo?.amazonData?.marketplace || 'US'}&limit=5&page=1\n\n`;
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
    logs += `Price: ${bookInfo?.price || 'N/A'} ${bookInfo?.amazonData?.prices?.[0]?.currency || (i18n.language === 'pl' ? 'PLN' : 'USD')}\n`;
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
          <Text style={styles.amazonPricesTitle}>{t('bookInfo.amazonPrices')} ({bookInfo.amazonData.marketplace}):</Text>
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

                <TouchableOpacity
                    style={styles.manualEntryButton}
                    onPress={() => setIsManualMode(true)}
                >
                  <Ionicons name="keypad-outline" size={24} color="white" />
                  <Text style={styles.manualEntryButtonText}>
                    {t('buttons.manualEntry')}
                  </Text>
                </TouchableOpacity>
              </View>
            </BarCodeScanner>
        )}

        <Modal
            animationType="fade"
            transparent={true}
            visible={isManualMode}
            onRequestClose={() => setIsManualMode(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.manualModalContainer}>
              <Text style={styles.modalTitle}>
                {t('labels.enterISBNManually')}
              </Text>

              <TextInput
                  style={styles.modalInput}
                  placeholder={t('placeholders.enterISBN')}
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={manualISBN}
                  onChangeText={setManualISBN}
                  autoFocus
              />

              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setIsManualMode(false)}
                >
                  <Text style={styles.cancelButtonText}>
                    {t('buttons.cancel')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modalButton, styles.submitButton]}
                    onPress={handleManualSubmit}
                >
                  <Text style={styles.submitButtonText}>
                    {t('buttons.submit')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
            animationType="fade"
            transparent={true}
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
                                  Source: Amazon ({bookInfo.amazonData?.marketplace})
                                </Text>
                            )}
                          </View>
                      )}

                      <View style={styles.priceInputContainer}>
                        {bookInfo?.price && (
                            <Text style={styles.suggestedPriceText}>
                              {t('bookInfo.suggestedPrice')}: {bookInfo.price.toFixed(2)} {bookInfo?.amazonData?.prices?.[0]?.currency || (i18n.language === 'pl' ? 'PLN' : 'USD')}
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
      </View>
  );
}

const styles = StyleSheet.create({
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
  manualEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 2,
    marginTop: 20,
  },
  manualEntryButtonText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
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
    borderRadius: 2,
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
    borderRadius: 2,
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
    borderRadius: 2,
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
  continueButtonText: {
    color: colors.primary,
    fontWeight: '500',
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
    borderRadius: 2,
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
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scanButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  searchModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  searchModalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  searchModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
  },
  searchInputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    marginBottom: 8,
    color: colors.black,
    fontWeight: '500',
  },
  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    color: colors.black,
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#888',
  },
  searchSubmitButton: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  searchSubmitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  manualModalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 2,
    padding: 20,
    maxHeight: '40%',
  },
  modalInput: {
    height: 50,
    borderColor: 'rgba(0,0,0,0.1)',
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    color: colors.black,
    marginVertical: 20,
    fontSize: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: colors.white,
  },
  submitButton: {
    backgroundColor: colors.white,
  },
  cancelButtonText: {
    color: colors.primary,
    fontWeight: '500',
  },
  submitButtonText: {
    color: colors.primary,
    fontWeight: '500',
  },
});
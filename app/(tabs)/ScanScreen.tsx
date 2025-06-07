import React, { useState, useEffect, useCallback } from 'react';
import { Modal, View, ActivityIndicator, Text, Dimensions, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Animated, { useSharedValue, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { ProgressBar, useTheme } from 'react-native-paper';
import { useAppContext } from '@/context/AppContext';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '@/styles/styles';
import { fetchBookInfoFromGoogleAPI, fetchBookInfoFromAmazon, fetchBookPriceFromAmazonAPI } from '../components/scanScreen/bookApi';
import {BookInfo, BookUniqueness, MarketFactors, BookAgeInfo, MarketData} from '../components/scanScreen/types';
import { CameraOverlay } from '../components/scanScreen/CameraOverlay';
import { ManualEntryModal } from '../components/scanScreen/ManualEntryModal';
import { ScanResultModal } from '../components/scanScreen/ScanResultModal';
import { LIMITS } from '../utils/constants';
import { CustomAlertModal } from '@/app/components/alerts/CustomAlertModal';

const { width, height } = Dimensions.get('window');

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

export default function ScanScreen() {
  const { t, i18n } = useTranslation();
  const { isbn, setISBN, addToScanHistory, exchangeRate, books, collections, checkGlobalLimits } = useAppContext();
  const router = useRouter();
  const theme = useTheme();

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
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'error' as 'info' | 'success' | 'error' | 'warning'
  });

  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    const animation = () => {
      pulseAnim.value = withRepeat(
          withSequence(
              withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
              withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
          ),
          -1
      );
    };
    animation();
    return () => {
      pulseAnim.value = 1;
    };
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
        setAlertConfig({
          visible: true,
          title: t('alerts.error'),
          message: t('status.noCameraAccess'),
          type: 'error'
        });
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

  const checkLimits = () => {
    const { totalBooks, booksLimitReached, collectionLimitReached } = checkGlobalLimits();
    const collectionProgress = collections.length / LIMITS.MAX_COLLECTIONS;
    const booksProgress = totalBooks / LIMITS.MAX_TOTAL_BOOKS;

    return {
      collectionProgress,
      booksProgress,
      collectionLimitReached,
      booksLimitReached,
      totalBooks
    };
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;

    const { booksLimitReached } = checkLimits();
    if (booksLimitReached) {
      setAlertConfig({
        visible: true,
        title: t('alerts.error'),
        message: t('alerts.bookLimitReached', { limit: LIMITS.MAX_TOTAL_BOOKS }),
        type: 'error'
      });
      return;
    }

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

        if (book.source === 'google' && !book.price && book.amazonData) {
          const amazonData = await fetchBookPriceFromAmazonAPI(data, i18n.language);
          if (amazonData?.prices?.length > 0) {
            setBookInfo(prev => ({
              ...prev!,
              amazonData,
              price: amazonData.prices[0].price
            }));
            book.price = amazonData.prices[0].price;
            book.amazonData = amazonData;
          }
        }

        // Prepare market data with proper typing
// Prepare market data with proper typing
        const marketData: MarketData | undefined = book.amazonData?.data?.marketFactors && book.amazonData.data.priceRange
            ? {
              demand: book.amazonData.data.marketFactors.demand,
              supply: book.amazonData.data.marketFactors.supply,
              priceRange: book.amazonData.data.priceRange, // This is now required
              priceHistory: [
                {date: '2023-01-01', price: book.amazonData.data.priceRange[0] * 0.9},
                {date: '2023-04-01', price: book.amazonData.data.priceRange[1] * 1.1},
                {date: '2023-07-01', price: (book.amazonData.data.priceRange[0] + book.amazonData.data.priceRange[1]) / 2},
                {date: '2023-10-01', price: book.amazonData.data.priceRange[0] * 0.95},
                {date: '2024-01-01', price: book.amazonData.data.priceRange[1] * 1.05},
                {date: new Date().toISOString(), price: parseFloat(book.price?.toString() || '0')}
              ],
              lastUpdated: new Date(),
              source: 'amazon' as const
            }
            : undefined;

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
          source: book.source || 'manual',
          uniqueness: defaultUniqueness,
          marketFactors: book.amazonData?.data?.marketFactors || defaultMarketFactors,
          ageInfo: defaultAgeInfo,
          marketData,
          publisher: book.publisher,
          description: book.description
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
      setAlertConfig({
        visible: true,
        title: t('alerts.error'),
        message: t('alerts.enterISBN'),
        type: 'error'
      });
      return;
    }

    const { booksLimitReached } = checkLimits();
    if (booksLimitReached) {
      setAlertConfig({
        visible: true,
        title: t('alerts.error'),
        message: t('alerts.bookLimitReached', { limit: LIMITS.MAX_TOTAL_BOOKS }),
        type: 'error'
      });
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

        if (book.source === 'google' && !book.price && book.amazonData) {
          const amazonData = await fetchBookPriceFromAmazonAPI(manualISBN, i18n.language);
          if (amazonData?.prices?.length > 0) {
            setBookInfo(prev => ({
              ...prev!,
              amazonData,
              price: amazonData.prices[0].price
            }));
            book.price = amazonData.prices[0].price;
            book.amazonData = amazonData;
          }
        }

        // Prepare market data with proper typing
        const marketData: MarketData | undefined = book.amazonData?.data?.marketFactors && book.amazonData.data.priceRange
            ? {
              demand: book.amazonData.data.marketFactors.demand,
              supply: book.amazonData.data.marketFactors.supply,
              priceRange: book.amazonData.data.priceRange,
              priceHistory: [
                {date: '2023-01-01', price: book.amazonData.data.priceRange[0] * 0.9},
                {date: '2023-04-01', price: book.amazonData.data.priceRange[1] * 1.1},
                {date: '2023-07-01', price: (book.amazonData.data.priceRange[0] + book.amazonData.data.priceRange[1]) / 2},
                {date: '2023-10-01', price: book.amazonData.data.priceRange[0] * 0.95},
                {date: '2024-01-01', price: book.amazonData.data.priceRange[1] * 1.05},
                {date: new Date().toISOString(), price: parseFloat(book.price?.toString() || '0')}
              ],
              lastUpdated: new Date(),
              source: 'amazon' as const
            }
            : undefined;

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
          source: book.source || 'manual',
          uniqueness: defaultUniqueness,
          marketFactors: book.amazonData?.data?.marketFactors || defaultMarketFactors,
          ageInfo: defaultAgeInfo,
          marketData,
          publisher: book.publisher,
          description: book.description
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
      setAlertConfig({
        visible: true,
        title: t('alerts.error'),
        message: t('alerts.enterPrice'),
        type: 'error'
      });
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
      pathname: '/AnalysisScreen',
      params: {
        isbn,
        averagePrice: numericPrice.toFixed(2),
        originalPrice: numericPrice.toFixed(2),
        title: bookInfo?.title || t('bookInfo.manualEntry'),
        authors: bookInfo?.authors || t('bookInfo.unknown'),
        fromHistory: 'false',
        marketFactors: JSON.stringify({
          demand: 'medium',
          supply: 'medium',
          publicationYear: bookInfo?.amazonData?.data?.marketFactors?.publicationYear ||
              new Date().getFullYear() - Math.floor(Math.random() * 10)
        }),
        bookInfo: JSON.stringify(bookInfo)
      }
    });
  };

  const handleCancel = () => {
    resetScanner();
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

  const { collectionProgress, booksProgress, totalBooks } = checkLimits();

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
              <CameraOverlay
                  pulseAnim={pulseAnim}
                  onManualEntryPress={() => setIsManualMode(true)}
              />
            </BarCodeScanner>
        )}
        <ManualEntryModal
            visible={isManualMode}
            onRequestClose={() => setIsManualMode(false)}
            onManualSubmit={handleManualSubmit}
            manualISBN={manualISBN}
            setManualISBN={setManualISBN}
        />
        <ScanResultModal
            visible={modalVisible}
            onRequestClose={handleCancel}
            onPriceSubmit={handlePrice}
            loading={loading}
            bookInfo={bookInfo}
            isbn={isbn}
            manualPrice={manualPrice}
            setManualPrice={setManualPrice}
            selectedPrice={selectedPrice}
            setSelectedPrice={setSelectedPrice}
            currentLang={currentLang}
        />
        <CustomAlertModal
            visible={alertConfig.visible}
            title={alertConfig.title}
            message={alertConfig.message}
            type={alertConfig.type}
            onConfirm={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
        />
      </View>
  );
}

const styles = StyleSheet.create({
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
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  limitsContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    padding: 12,
  },
  limitItem: {
    marginBottom: 8,
  },
  limitText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});
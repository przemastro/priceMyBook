import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {CameraType, CameraView, useCameraPermissions} from 'expo-camera';
import {useAppContext} from '@/context/AppContext';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {colors, responsive, typography} from '@/styles/styles';
import {useTranslation} from 'react-i18next';
import {Ionicons} from '@expo/vector-icons';
import i18n from "i18next";
import 'react-native-svg';
import Svg, { Path } from 'react-native-svg';


// Import komponentów
import MarketChart from '../components/analysisScreen/MarketChart';
import PriceCalculationDetails from '../components/analysisScreen/PriceCalculationDetails';
import ScanDefectModal from '../components/analysisScreen/ScanDefectModal';
import AddCollectionModal from '../components/collectionsScreen/AddCollectionModal';
import {
  BookDefect,
  MarketData,
  MarketFactorToggle,
  ListingStatus,
  BookAgeInfo,
  BookUniqueness,
  MarketFactors,
  PriceCalculation,
  DEFECT_TYPES,
  UNIQUENESS_TYPES,
  MARKET_FACTOR_TOGGLES,
  IncludedMarketFactors
} from '../components/analysisScreen/types';
import { formatCurrency } from '../utils/currency';

const { width: viewportWidth } = Dimensions.get('window');

const parseParam = <T,>(param: string | string[] | undefined): T | undefined => {
  if (!param) return undefined;
  try {
    const paramString = Array.isArray(param) ? param[0] : param;
    return JSON.parse(paramString) as T;
  } catch (error) {
    console.error('Error parsing param:', error);
    return undefined;
  }
};

const getDefaultReduction = (id: string): number => {
  const reductions: Record<string, number> = {
    tornPages: 10,
    brokenSpine: 8,
    missingPages: 5,
    heavyWear: 10,
    stainedPages: 7,
    looseBinding: 9,
    writtingMarks: 5,
    foldedCorners: 3,
    fadedCover: 4
  };
  return reductions[id] || 10;
};

const getBookWord = (count: number, language: string) => {
  if (language === 'pl') {
    if (count === 1) return 'labels.book_one';
    if (count % 100 >= 12 && count % 100 <= 14) return 'labels.book_many';
    if ([2,3,4].includes(count % 10)) return 'labels.book_few';
    return 'labels.book_many';
  } else {
    return count === 1 ? 'labels.book_one' : 'labels.book_other';
  }
};

export default function AnalysisScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [hasScanned, setHasScanned] = useState(false);
  const [showAddCollectionModal, setShowAddCollectionModal] = useState(false);

  const {
    collections,
    addBookToCollection,
    removeBookFromCollection,
    updateBookInCollection,
    exchangeRate,
    exchangeRateError,
    books,
    addCollection
  } = useAppContext();

  const [defects, setDefects] = useState<BookDefect[]>(DEFECT_TYPES.map(defect => ({
    id: defect.id,
    selected: false,
    priceReduction: getDefaultReduction(defect.id),
    count: 0,
    icon: defect.icon
  })));

  const [ageInfo, setAgeInfo] = useState<BookAgeInfo>({ years: 0 });

  const initialUniqueness = parseParam<BookUniqueness>(params.uniqueness) || {
    isMassMarket: true,
    isFirstEdition: false,
    isCollectorsEdition: false,
    hasAuthorSignature: false,
    isLimitedEdition: false,
    isPublisherDefunct: false
  };
  const [uniqueness, setUniqueness] = useState<BookUniqueness>(initialUniqueness);

  const initialMarketFactors = parseParam<MarketFactors>(params.marketFactors) || {
    demand: 'medium',
    supply: 'medium',
    publicationYear: parseParam<{publicationYear?: number}>(params.marketFactors)?.publicationYear ||
        new Date().getFullYear() - Math.floor(Math.random() * 10)
  };
  const [marketFactors, setMarketFactors] = useState<MarketFactors>(initialMarketFactors);
  const [marketData, setMarketData] = useState<MarketData | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedDefect, setScannedDefect] = useState<BookDefect | null>(null);
  const [showDefectModal, setShowDefectModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [editingOriginalPrice, setEditingOriginalPrice] = useState(false);
  const [originalPriceInput, setOriginalPriceInput] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const bookInfo = params.bookInfo ? JSON.parse(params.bookInfo as string) : null;

  const isbn = Array.isArray(params.isbn) ? params.isbn[0] : params.isbn || '';
  const originalPriceParam = Array.isArray(params.originalPrice) ? params.originalPrice[0] : params.originalPrice || '0';
  const title = Array.isArray(params.title) ? params.title[0] : params.title || t('bookInfo.unknownTitle');
  const authors = Array.isArray(params.authors) ? params.authors[0] : params.authors || t('bookInfo.unknown');
  const editMode = Array.isArray(params.editMode) ? params.editMode[0] === 'true' : params.editMode === 'true';
  const collectionName = Array.isArray(params.collectionName) ? params.collectionName[0] : params.collectionName;
  const bookIndex = params.bookIndex ? parseInt(Array.isArray(params.bookIndex) ? params.bookIndex[0] : params.bookIndex) : null;
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(title);
  const [editingIsbn, setEditingIsbn] = useState(false);
  const [isbnInput, setIsbnInput] = useState(isbn);
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [editingYear, setEditingYear] = useState(false);
  const [yearInput, setYearInput] = useState(marketFactors.publicationYear?.toString() || '');
  const [includedMarketFactors, setIncludedMarketFactors] = useState<IncludedMarketFactors>({
    includePublicationYear: true,
    includeDemand: true,
    includeSupply: true
  });

  // Nowy stan dla kroków/slajdów
  const [currentStep, setCurrentStep] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Animacja przejścia między krokami
  const animateSlide = (direction: 'forward' | 'backward') => {
    slideAnim.setValue(direction === 'forward' ? -50 : 50);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const goToNextStep = () => {
    animateSlide('forward');
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const goToPrevStep = () => {
    animateSlide('backward');
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    let isMounted = true;

    const loadMarketData = async () => {
      if (!originalPriceParam || !isMounted) return;

      setIsLoading(true);
      try {
        const amazonFactors = bookInfo?.amazonData?.data?.marketFactors;

        if (amazonFactors && isMounted) {
          setMarketFactors({
            demand: amazonFactors.demand,
            supply: amazonFactors.supply,
            publicationYear: amazonFactors.publicationYear
          });

          const newMarketData: MarketData = {
            demand: amazonFactors.demand,
            supply: amazonFactors.supply,
            priceRange: bookInfo.amazonData.data.priceRange,
            priceHistory: [
              { date: '2023-01-01', price: bookInfo.amazonData.data.priceRange[0] * 0.9 },
              { date: '2023-04-01', price: bookInfo.amazonData.data.priceRange[1] * 1.1 },
              { date: '2023-07-01', price: (bookInfo.amazonData.data.priceRange[0] + bookInfo.amazonData.data.priceRange[1]) / 2 },
              { date: '2023-10-01', price: bookInfo.amazonData.data.priceRange[0] * 0.95 },
              { date: '2024-01-01', price: bookInfo.amazonData.data.priceRange[1] * 1.05 },
              { date: new Date().toISOString(), price: parseFloat(originalPriceParam) }
            ],
            lastUpdated: new Date(),
            source: 'amazon'
          };
          setMarketData(newMarketData);
        } else if (isMounted) {
          const newSimulatedData: MarketData = {
            demand: 'high',
            supply: 'medium',
            priceRange: [parseFloat(originalPriceParam) * 0.8, parseFloat(originalPriceParam) * 1.2],
            priceHistory: [
              { date: '2023-01-01', price: parseFloat(originalPriceParam) * 0.9 },
              { date: '2023-04-01', price: parseFloat(originalPriceParam) * 1.1 },
              { date: '2023-07-01', price: parseFloat(originalPriceParam) * 1.0 },
              { date: '2023-10-01', price: parseFloat(originalPriceParam) * 0.95 },
              { date: '2024-01-01', price: parseFloat(originalPriceParam) * 1.05 },
              { date: new Date().toISOString(), price: parseFloat(originalPriceParam) }
            ],
            lastUpdated: new Date(),
            source: 'simulated'
          };
          setMarketData(newSimulatedData);
        }
      } catch (error) {
        console.error('Error loading market data:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMarketData();

    return () => {
      isMounted = false;
    };
  }, [originalPriceParam]);

  useEffect(() => {
    if (editMode) {
      const bookDefects = parseParam<Record<string, {selected: boolean, reduction: number, count: number}>>(params.defects) || {};
      const bookUniqueness = parseParam<BookUniqueness>(params.uniqueness) || initialUniqueness;
      const bookMarketFactors = parseParam<MarketFactors>(params.marketFactors) || initialMarketFactors;

      const updatedDefects = DEFECT_TYPES.map(defect => {
        const bookDefect = bookDefects[defect.id];
        return {
          id: defect.id,
          selected: bookDefect?.selected || false,
          priceReduction: bookDefect?.reduction || getDefaultReduction(defect.id),
          count: bookDefect?.count || 0,
          icon: defect.icon
        };
      });

      setDefects(updatedDefects);
      setUniqueness(bookUniqueness);
      setMarketFactors(bookMarketFactors);
      setHasScanned(true);
    }
  }, [editMode]);

  useEffect(() => {
    setOriginalPrice(originalPriceParam);
    setOriginalPriceInput(originalPriceParam);
    setTitleInput(title);
    setIsbnInput(isbn);
  }, [originalPriceParam, title, isbn]);

  useEffect(() => {
    if (collections.length > 0) {
      const initialCollection = editMode && collectionName ? collectionName : collections[0];
      setSelectedCollection(initialCollection);
    }
  }, [collections, editMode, collectionName]);

  useEffect(() => {
    Animated.loop(
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
    ).start();
  }, [pulseAnim]);

  const calculateDefectsReduction = (defects: BookDefect[]): number => {
    return defects
        .filter(defect => defect.selected)
        .reduce((total, defect) => {
          const countFactor = Math.min(defect.count, 5);
          return total + (defect.priceReduction * countFactor);
        }, 0);
  };

  const calculateAgeModifier = (ageInfo: BookAgeInfo, isMassMarket: boolean): number => {
    const { years } = ageInfo;
    if (isMassMarket) {
      if (years <= 2) return 0;
      if (years <= 5) return 5;
      if (years <= 10) return 10;
      if (years <= 20) return 15;
      return 20;
    } else {
      if (years <= 2) return 0;
      if (years <= 5) return 5;
      if (years <= 10) return 10;
      if (years <= 20) return 15;
      return 20;
    }
  };

  const calculateUniquenessBonus = (uniqueness: BookUniqueness): number => {
    let bonus = 0;
    if (uniqueness.isFirstEdition) bonus += 10;
    if (uniqueness.isCollectorsEdition) bonus += 15;
    if (uniqueness.hasAuthorSignature) bonus += 20;
    if (uniqueness.isLimitedEdition) bonus += 10;
    if (uniqueness.isPublisherDefunct) bonus += 7.5;
    return Math.min(bonus, 50);
  };

  const calculateMarketModifier = (marketFactors: MarketFactors, ageInfo: BookAgeInfo, uniqueness: BookUniqueness): number => {
    const demandModifiers = {
      veryHigh: includedMarketFactors.includeDemand ? 20 : 0,
      high: includedMarketFactors.includeDemand ? 10 : 0,
      medium: 0,
      low: includedMarketFactors.includeDemand ? -5 : 0,
      veryLow: includedMarketFactors.includeDemand ? -10 : 0
    };

    const supplyModifiers = {
      veryLow: includedMarketFactors.includeSupply ? 25 : 0,
      low: includedMarketFactors.includeSupply ? 10 : 0,
      medium: 0,
      high: includedMarketFactors.includeSupply ? -5 : 0,
      flooded: includedMarketFactors.includeSupply ? -10 : 0
    };

    const ageModifier = includedMarketFactors.includePublicationYear
        ? calculateAgeModifier(ageInfo, uniqueness.isMassMarket)
        : 0;

    const baseModifier = (demandModifiers[marketFactors.demand] + supplyModifiers[marketFactors.supply]) / 2;
    const totalModifier = baseModifier + ageModifier;
    return Math.max(-30, Math.min(30, totalModifier));
  };

  const priceCalculation = useMemo(() => {
    const basePrice = parseFloat(originalPrice) || 0;
    const defectsReduction = calculateDefectsReduction(defects);
    const priceAfterDefects = basePrice * (1 - defectsReduction / 100);
    const maxDefectReduction = 0.9 * basePrice;
    const priceAfterDefectsLimited = Math.max(priceAfterDefects, basePrice - maxDefectReduction);
    const uniquenessBonus = calculateUniquenessBonus(uniqueness);
    const priceAfterUniqueness = priceAfterDefectsLimited * (1 + uniquenessBonus / 100);
    const marketModifier = calculateMarketModifier(marketFactors, ageInfo, uniqueness);
    const priceAfterMarket = priceAfterUniqueness * (1 + marketModifier / 100);
    const finalPrice = Math.max(0.01, priceAfterMarket);

    return {
      basePrice,
      defectsReduction,
      uniquenessBonus,
      marketModifier,
      finalPrice
    };
  }, [originalPrice, defects, uniqueness, marketFactors, ageInfo, includedMarketFactors]);

  const finalPrice = priceCalculation.finalPrice;

  const bookRating = useMemo(() => {
    const selectedDefects = defects.filter(d => d.selected);
    if (selectedDefects.length === 0) return 10;

    let ratingReduction = selectedDefects.length;
    const countReduction = selectedDefects.reduce((sum, defect) => sum + Math.floor(defect.count / 5), 0);
    const totalReduction = ratingReduction + countReduction;
    return Math.max(1, 10 - totalReduction);
  }, [defects]);

  const startScanning = async () => {
    setIsLoading(true);
    try {
      if (!permission) {
        const { status } = await requestPermission();
        if (status !== 'granted') {
          Alert.alert(t('alerts.error'), t('status.noCameraAccess'));
          return;
        }
      }

      if (permission?.granted) {
        setIsScanning(true);
        setScanProgress(0);
      } else {
        Alert.alert(t('alerts.error'), t('status.noCameraAccess'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    setIsAnalyzing(false);
    setScanProgress(0);
  };

  const simulateDefectDetection = () => {
    setIsAnalyzing(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        const newProgress = Math.min(prev + 10, 100);
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          const randomDefect = DEFECT_TYPES[Math.floor(Math.random() * DEFECT_TYPES.length)];
          const defect = defects.find(d => d.id === randomDefect.id);
          if (defect) {
            setScannedDefect({
              ...defect,
              confidence: Math.floor(Math.random() * 50) + 50
            });
            setShowDefectModal(true);
            setHasScanned(true);
          }
        }
        return newProgress;
      });
    }, 300);
  };

  const takePictureAndAnalyze = async () => {
    if (!cameraRef.current) return;
    try {
      simulateDefectDetection();
    } catch (error) {
      console.error('Failed to take picture:', error);
      Alert.alert(t('alerts.error'), t('alerts.cameraError'));
    }
  };

  const acceptDefect = () => {
    if (!scannedDefect) return;
    setDefects(prev => prev.map(d =>
        d.id === scannedDefect.id ? {
          ...d,
          selected: true,
          count: d.count + 1
        } : d
    ));
    setShowDefectModal(false);
  };

  const rejectDefect = () => {
    setShowDefectModal(false);
  };

  const toggleDefectSelection = (id: string) => {
    setDefects(prev => prev.map(d =>
        d.id === id ? {
          ...d,
          selected: !d.selected,
          count: !d.selected ? Math.max(1, d.count) : 0
        } : d
    ));
  };

  const toggleUniquenessSelection = (id: keyof BookUniqueness) => {
    setUniqueness(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleEditOriginalPrice = () => {
    setEditingOriginalPrice(!editingOriginalPrice);
    if (!editingOriginalPrice) {
      setOriginalPriceInput(originalPrice);
    }
  };

  const saveOriginalPrice = () => {
    if (!originalPriceInput || isNaN(parseFloat(originalPriceInput))) {
      Alert.alert(t('alerts.error'), t('alerts.enterValidPrice'));
      return;
    }
    setOriginalPrice(originalPriceInput);
    setEditingOriginalPrice(false);
  };

  const saveTitle = () => {
    if (!titleInput.trim()) {
      Alert.alert(t('alerts.error'), t('alerts.enterTitle'));
      return;
    }
    setEditingTitle(false);
  };

  const saveIsbn = () => {
    if (!isbnInput.trim()) {
      Alert.alert(t('alerts.error'), t('alerts.enterISBN'));
      return;
    }
    setEditingIsbn(false);
  };

  const handleAddCollection = (name: string) => {
    addCollection(name);
    setSelectedCollection(name);
    setShowAddCollectionModal(false);
  };

  const handleSaveBook = () => {
    const priceValue = finalPrice.toFixed(2);
    const currentIsbn = editingIsbn ? isbnInput : isbn;
    const currentTitle = editingTitle ? titleInput : title;

    const defaultListingStatus: ListingStatus = {
      status: 'notListed',
      platforms: []
    };

    const bookData = {
      isbn: currentIsbn,
      title: currentTitle,
      authors,
      price: priceValue,
      displayPrice: formatCurrency({ price: priceValue, exchangeRate }),
      foundInApi: params.fromHistory !== 'true',
      originalPrice,
      defects: defects.filter(d => d.selected).reduce((acc, defect) => ({
        ...acc,
        [defect.id]: {
          selected: true,
          reduction: defect.priceReduction,
          count: defect.count
        }
      }), {}),
      rating: bookRating,
      ageInfo,
      uniqueness,
      marketFactors,
      listingStatus: editMode && collectionName && bookIndex !== null
          ? books[collectionName][bookIndex].listingStatus || defaultListingStatus
          : defaultListingStatus
    };

    if (editMode && collectionName && bookIndex !== null) {
      if (selectedCollection === collectionName) {
        updateBookInCollection(collectionName, bookIndex, bookData);
        Alert.alert(t('alerts.success'), t('alerts.bookUpdated'));
        router.back();
      } else {
        const bookToMove = books[collectionName][bookIndex];
        addBookToCollection(selectedCollection, {
          ...bookData,
          listingStatus: bookToMove.listingStatus || defaultListingStatus
        });
        removeBookFromCollection(collectionName, bookIndex);
        Alert.alert(t('alerts.success'), t('alerts.bookMoved', {
          oldCollection: collectionName,
          newCollection: selectedCollection
        }));
        router.back();
      }
    } else {
      if (!selectedCollection) {
        Alert.alert(t('alerts.error'), t('alerts.selectCollection'));
        return;
      }
      addBookToCollection(selectedCollection, bookData);
      Alert.alert(t('alerts.success'), `${t('alerts.bookAdded')}: ${selectedCollection}`);
      router.back();
    }
  };

  const totalSteps = 5; // Całkowita liczba kroków

  const renderProgressDots = () => (
      <View style={styles.progressDotsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
            <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.activeProgressDot
                ]}
            />
        ))}
      </View>
  );

  const renderNavigationButtons = () => (
      <View style={styles.fixedNavigationContainer}>
        <TouchableOpacity
            style={[
              styles.simpleNavButton,
              currentStep === 0 && styles.disabledNavButton
            ]}
            onPress={goToPrevStep}
            disabled={currentStep === 0}
        >
          <Text style={styles.navButtonText}>{t('buttons.back')}</Text>
        </TouchableOpacity>

        {renderProgressDots()}

        <TouchableOpacity
            style={styles.simpleNavButton}
            onPress={currentStep === totalSteps - 1 ? handleSaveBook : goToNextStep}
        >
          <Text style={styles.navButtonText}>
            {currentStep === totalSteps - 1
                ? editMode ? t('buttons.save') : t('buttons.save')
                : t('buttons.next')}
          </Text>
        </TouchableOpacity>
      </View>
  );
  // Renderowanie poszczególnych kroków
  const renderStep = () => {
    const stepTitles = [
      t('stepTitles.scanForDefects'),
      t('stepTitles.detectedDefects'),
      t('stepTitles.uniqueness'),
      t('stepTitles.marketFactors'),
      t('stepTitles.addToCollection')
    ];
    switch(currentStep) {
      case 0: // Krok 1: Szczegóły książki
        return (
            <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
              <View style={styles.combinedSection}>
                <Text style={styles.stepTitle}>{stepTitles[0]}</Text>
                <View style={styles.priceSection}>
                  <View style={styles.titleRow}>
                    <Text style={typography.body}>{t('bookInfo.title')}:</Text>
                    {editingTitle ? (
                        <View style={styles.titleInputContainer}>
                          <TextInput
                              style={styles.titleInput}
                              value={titleInput}
                              onChangeText={setTitleInput}
                              autoFocus
                              placeholder={title}
                          />
                          <TouchableOpacity
                              style={styles.saveTitleButton}
                              onPress={saveTitle}
                          >
                            <Ionicons name="checkmark" size={20} color="white" />
                          </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.titleDisplay}
                            onPress={() => {
                              setTitleInput(title);
                              setEditingTitle(true);
                            }}
                        >
                          <Text style={typography.body} numberOfLines={1} ellipsizeMode="tail">
                            {titleInput || title}
                          </Text>
                          <Ionicons
                              name="create"
                              size={16}
                              color={colors.primary}
                              style={styles.editIcon}
                          />
                        </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.isbnRow}>
                    <Text style={typography.body}>{t('bookInfo.isbn')}:</Text>
                    {editingIsbn ? (
                        <View style={styles.isbnInputContainer}>
                          <TextInput
                              style={styles.isbnInput}
                              value={isbnInput}
                              onChangeText={setIsbnInput}
                              autoFocus
                              placeholder={isbn}
                              keyboardType="numeric"
                          />
                          <TouchableOpacity
                              style={styles.saveTitleButton}
                              onPress={saveIsbn}
                          >
                            <Ionicons name="checkmark" size={20} color="white" />
                          </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.titleDisplay}
                            onPress={() => {
                              setIsbnInput(isbn);
                              setEditingIsbn(true);
                            }}
                        >
                          <Text style={typography.body}>
                            {isbnInput || isbn || t('bookInfo.noISBN')}
                          </Text>
                          <Ionicons
                              name="create"
                              size={16}
                              color={colors.primary}
                              style={styles.editIcon}
                          />
                        </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.priceRow}>
                    <Text style={typography.body}>
                      {t('bookInfo.originalPrice')}:
                    </Text>
                    {editingOriginalPrice ? (
                        <View style={styles.priceInputContainer}>
                          <TextInput
                              style={styles.priceInput}
                              value={originalPriceInput}
                              onChangeText={setOriginalPriceInput}
                              keyboardType="numeric"
                              autoFocus
                          />
                          <TouchableOpacity
                              style={styles.savePriceButton}
                              onPress={saveOriginalPrice}
                          >
                            <Ionicons name="checkmark" size={20} color="white" />
                          </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.priceDisplay}
                            onPress={toggleEditOriginalPrice}
                        >
                          <Text style={typography.body}>
                            {formatCurrency({ price: originalPrice, exchangeRate })}
                          </Text>
                          <Ionicons
                              name="create"
                              size={16}
                              color={colors.primary}
                              style={styles.editIcon}
                          />
                        </TouchableOpacity>
                    )}
                  </View>
                  {exchangeRateError && (
                      <Text style={[typography.caption, { color: colors.error }]}>
                        {t('alerts.exchangeRateError')}
                      </Text>
                  )}
                </View>

                <View style={styles.horizontalLine} />
                <TouchableOpacity
                    style={[
                      styles.startScanButton,
                      (isScanning || isLoading) && styles.disabledButton
                    ]}
                    onPress={startScanning}
                    disabled={isScanning || isLoading}
                    activeOpacity={0.7}
                >
                  <Ionicons
                      name="camera"
                      size={24}
                      color={isScanning || isLoading ? colors.gray : colors.primary}
                      style={styles.scanIcon}
                  />
                  <Text style={[
                    styles.startScanButtonText,
                    (isScanning || isLoading) && styles.disabledButtonText
                  ]}>
                    {t('buttons.startScanning')}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
        );

      case 1: // Krok 2: Wady książki
        return (
            <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
              <View style={styles.combinedSection}>
                <Text style={styles.stepTitle}>{stepTitles[1]}</Text>
                <View style={styles.defectsGrid}>
                  <FlatList
                      data={defects}
                      renderItem={({ item }) => (
                          <TouchableOpacity
                              style={[
                                styles.defectItemContainer,
                                item.selected && styles.selectedDefect
                              ]}
                              onPress={() => toggleDefectSelection(item.id)}
                              activeOpacity={0.7}
                          >
                            {item.selected && (
                                <>
                                  <View style={styles.sliderRow}>
                                    <Text style={styles.reductionText}>
                                      {item.priceReduction.toFixed(0)}%
                                    </Text>
                                  </View>
                                </>
                            )}
                            {item.selected && item.count > 0 && (
                                <View style={styles.defectCountBadge}>
                                  <Text style={styles.defectCountBadgeText}>{item.count}</Text>
                                </View>
                            )}

                            <View style={styles.defectIconContainer}>
                              <Ionicons
                                  name={item.icon as any}
                                  size={28}
                                  color={item.selected ? colors.primary : '#5c6b7e'}
                              />
                            </View>
                            <Text style={[
                              styles.defectName,
                              item.selected && styles.selectedDefectName
                            ]}>
                              {t(`defects.${item.id}`)}
                            </Text>
                          </TouchableOpacity>
                      )}
                      keyExtractor={item => item.id}
                      numColumns={3}
                      columnWrapperStyle={styles.columnWrapper}
                      scrollEnabled={false}
                  />
                </View>
              </View>
            </Animated.View>
        );

      case 2: // Krok 3: Unikatowość
        return (
            <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
              <View style={styles.combinedSection}>
                <Text style={styles.stepTitle}>{stepTitles[2]}</Text>
                <FlatList
                    data={UNIQUENESS_TYPES}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                              styles.defectItemContainer,
                              uniqueness[item.id] && styles.selectedDefect
                            ]}
                            onPress={() => toggleUniquenessSelection(item.id)}
                            activeOpacity={0.7}
                        >
                          <View style={styles.defectIconContainer}>
                            <Ionicons
                                name={item.icon as any}
                                size={28}
                                color={uniqueness[item.id] ? colors.primary : '#5c6b7e'}
                            />
                          </View>
                          <Text style={[
                            styles.defectName,
                            uniqueness[item.id] && styles.selectedDefectName
                          ]}>
                            {t(item.label)}
                          </Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item.id}
                    numColumns={3}
                    columnWrapperStyle={styles.columnWrapper}
                    scrollEnabled={false}
                />
              </View>
            </Animated.View>
        );

      case 3: // Krok 4: Czynniki rynkowe
        return (
            <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
              <View style={styles.combinedSection}>
                <Text style={styles.stepTitle}>{stepTitles[3]}</Text>

                <FlatList
                    data={MARKET_FACTOR_TOGGLES}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                              styles.defectItemContainer,
                              includedMarketFactors[item.id] && styles.selectedDefect
                            ]}
                            onPress={() => setIncludedMarketFactors(prev => ({
                              ...prev,
                              [item.id]: !prev[item.id]
                            }))}
                            activeOpacity={0.7}
                        >
                          <View style={styles.defectIconContainer}>
                            <Ionicons
                                name={item.icon as any}
                                size={28}
                                color={includedMarketFactors[item.id] ? colors.primary : '#5c6b7e'}
                            />
                          </View>
                          <Text style={[
                            styles.defectName,
                            includedMarketFactors[item.id] && styles.selectedDefectName
                          ]}>
                            {t(item.label)}
                          </Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item.id}
                    numColumns={3}
                    columnWrapperStyle={styles.columnWrapper}
                    scrollEnabled={false}
                />

                {/* Dodaj sekcję z analizą rynku */}
                <Text style={[styles.stepTitle, { marginTop: 30, marginBottom: 16 }]}>
                  {t('stepTitles.marketAnalysis')}
                </Text>

                {marketData && (
                    <View style={styles.chartContainer}>
                      <MarketChart marketData={marketData} />
                    </View>
                )}
              </View>
            </Animated.View>
        );

      case 4: // Krok 5: Zapisanie do księgozbioru
        return (
            <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
              <View style={styles.combinedSection}>
                <Text style={styles.stepTitle}>{stepTitles[4]}</Text>
                <View style={styles.collectionRow}>
                  <View style={styles.collectionPickerContainer}>
                    {collections.length > 0 ? (
                        <View style={styles.pickerContainer}>
                          <Picker
                              selectedValue={selectedCollection}
                              onValueChange={setSelectedCollection}
                              style={styles.picker}
                              dropdownIconColor={colors.primary}
                          >
                            {collections.map((collection) => (
                                <Picker.Item
                                    key={collection}
                                    label={collection}
                                    value={collection}
                                />
                            ))}
                          </Picker>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.createCollectionButton}
                            onPress={() => setShowAddCollectionModal(true)}
                        >
                          <Text style={styles.createCollectionText}>
                            {t('buttons.createFirstCollection')}
                          </Text>
                        </TouchableOpacity>
                    )}
                  </View>

                  {collections.length > 0 && (
                      <View style={styles.bookCountContainer}>
                        <Ionicons name="book" size={20} color={colors.primary} />
                        <Text style={styles.bookCountText}>
                          {books[selectedCollection]?.length || 0} {t(getBookWord(books[selectedCollection]?.length || 0, i18n.language))}
                        </Text>
                      </View>
                  )}
                </View>

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveBook}
                    disabled={isLoading}
                >
                  {isLoading ? (
                      <ActivityIndicator color="white" />
                  ) : (
                      <View style={styles.saveButtonContent}>
                        <Ionicons
                            name={editMode ? "save-outline" : "add-circle-outline"}
                            size={24}
                            color="white"
                            style={styles.saveButtonIcon}
                        />
                        <Text style={styles.saveButtonText}>
                          {editMode ? t('buttons.saveChanges') : t('buttons.addToCollection')}
                        </Text>
                      </View>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
        );

      default:
        return null;
    }
  };

  if (!permission) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );
  }

  if (isScanning && permission?.granted) {
    return (
        <View style={styles.fullScreenContainer}>
          <CameraView
              ref={cameraRef}
              style={styles.fullScreenCamera}
              facing={cameraType}
              mode="picture"
              responsiveOrientationWhenOrientationLocked
          >
            <View style={styles.cameraOverlay}>
              <TouchableOpacity
                  style={styles.closeButton}
                  onPress={stopScanning}
              >
                <Ionicons name="close" size={32} color="white" />
              </TouchableOpacity>

              <Animated.View style={[styles.scanFrame, { transform: [{ scale: pulseAnim }] }]}>
                <View style={styles.scanFrameTopLeft} />
                <View style={styles.scanFrameTopRight} />
                <View style={styles.scanFrameBottomLeft} />
                <View style={styles.scanFrameBottomRight} />
              </Animated.View>

              <View style={styles.bottomControls}>
                <Pressable
                    style={styles.scanButton}
                    onPress={takePictureAndAnalyze}
                >
                  <Ionicons name="scan" size={24} color="white" style={styles.scanIcon} />
                  <Text style={styles.scanButtonText}>
                    {t('labels.scanningDefects')}
                  </Text>
                </Pressable>

                {isAnalyzing && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View style={{
                          width: `${scanProgress}%`,
                          backgroundColor: colors.primary,
                          height: '100%'
                        }}/>
                      </View>
                      <Text style={styles.scanningText}>
                        {scanProgress}%
                      </Text>
                    </View>
                )}
              </View>
            </View>
          </CameraView>

          <ScanDefectModal
              visible={showDefectModal}
              defect={scannedDefect}
              onAccept={acceptDefect}
              onReject={rejectDefect}
          />
        </View>
    );
  }

  const renderRatingSection = () => (
      <View style={styles.ratingOuterContainer}>
        <View style={styles.ratingContainer}>
          <View style={styles.ratingHeader}>
            <Text style={styles.ratingTitle}>{t('labels.bookCondition')}</Text>
            <View style={styles.ratingStars}>
              {[...Array(10)].map((_, i) => (
                  <Ionicons
                      key={i}
                      name={i < bookRating ? 'star' : 'star-outline'}
                      size={20}
                      color={i < bookRating ? colors.primary : colors.gray}
                  />
              ))}
            </View>
            <Text style={styles.ratingText}>
              {`${bookRating}/10 - ${
                  bookRating >= 8 ? t('labels.excellent') :
                      bookRating >= 6 ? t('labels.good') :
                          bookRating >= 4 ? t('labels.fair') :
                              t('labels.poor')
              }`}
            </Text>
          </View>

          <View style={styles.priceSummary}>

            <View style={{alignItems: 'center', marginVertical: 4}}>
              <Ionicons name="arrow-down" size={16} color={colors.gray} />
            </View>

            <View style={{zIndex: 1000}}>
              <PriceCalculationDetails
                  calculation={priceCalculation}
                  defects={defects}
                  uniqueness={uniqueness}
                  marketFactors={marketFactors}
                  onShowMarketAnalysis={() => setShowMarketModal(true)}
              />
            </View>
          </View>
        </View>
      </View>
  );

  return (
      <View style={{ flex: 1 }}>
        <ScrollView
            contentContainerStyle={[styles.container, { paddingBottom: 80 }]} // Add padding for fixed nav
            showsVerticalScrollIndicator={false}
        >
        {renderRatingSection()}

        {/* Renderowanie aktualnego kroku */}
        {renderStep()}

        </ScrollView>
        {/* Fixed navigation at bottom */}
        {renderNavigationButtons()}
        <Modal
            visible={showMarketModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowMarketModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.marketModalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                    style={styles.closeModalButton}
                    onPress={() => setShowMarketModal(false)}
                >
                  <Ionicons name="close" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {marketData && (
                  <>
                    <MarketChart marketData={marketData} />
                  </>
              )}
            </View>
          </View>
        </Modal>

        <AddCollectionModal
            visible={showAddCollectionModal}
            onClose={() => setShowAddCollectionModal(false)}
            onConfirm={handleAddCollection}
        />
      </View>
  );
}

const styles = StyleSheet.create({
  ratingLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: colors.black,
  },
  priceSection: {
    paddingBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  priceInput: {
    height: 30,
    width: 80,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  savePriceButton: {
    backgroundColor: colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  editIcon: {
    marginLeft: 8,
  },
  horizontalLine: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginVertical: 16,
  },
  startScanButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    marginBottom: 20,
    width: '100%',
  },
  disabledButton: {
    opacity: 0.5,
    borderColor: colors.gray,
  },
  disabledButtonText: {
    color: colors.gray,
  },
  startScanButtonText: {
    color: colors.primary,
    fontWeight: '500',
  },
  scanIcon: {
    marginRight: 10,
  },
  defectsGrid: {
    marginBottom: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  defectItemContainer: {
    width: 100, // Zmieniamy z '48%' na '30%' aby zmieścić 3 kolumny
    padding: 5, // Zmniejszamy padding aby zaoszczędzić miejsce
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 12,
    backgroundColor: colors.grayLight,
    marginBottom: 12,
    alignItems: 'center',
    height: 100, // Zmniejszamy wysokość
    position: 'relative',
    marginHorizontal: '1.66%', // Dodajemy marginesy po bokach
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedDefect: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(74,108,247,0.05)',
    shadowColor: 'rgba(74,108,247,0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  defectIconContainer: {
    marginBottom: 4,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 20,
    padding: 8, // Zmniejszamy padding
    marginTop: 4, // Zmniejszamy margines
  },
  defectName: {
    color: '#2c3e50',
    textAlign: 'center',
    fontSize: 12, // Zmniejszamy rozmiar czcionki
    lineHeight: 14, // Ustawiamy odpowiedni interlinia
    height: 28, // Stała wysokość dla dwóch linii
    marginBottom: 4,
  },
  selectedDefectName: {
    color: colors.primary,
    fontWeight: '500',
  },
  defectCountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defectCountBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sliderRow: {
    position: 'absolute',
    top: 8,
    left: -5,
    width: 20,
    height: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 0,
  },
  reductionText: {
    color: colors.primary,
    width: 40,
    textAlign: 'right',
    fontWeight: '500',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayDark,
  },
  dataText: {
    fontSize: 16,
    color: colors.black,
  },
  collectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  collectionPickerContainer: {
    flex: 1,
    marginRight: 12,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerContainer: {
    borderWidth: 0,
    borderRadius: 2,
    overflow: 'hidden',
  },
  bookCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  bookCountText: {
    marginLeft: 5,
    color: colors.primary,
  },
  createCollectionButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  createCollectionText: {
    color: colors.primary,
    fontWeight: '500',
  },
  saveButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 16,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonIcon: {
    marginRight: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  fullScreenCamera: {
    flex: 1,
    width: '100%',
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    borderRadius: 20,
    padding: 10,
    backgroundColor: 'transparent',
  },
  scanFrame: {
    position: 'absolute',
    top: '35%',
    alignSelf: 'center',
    width: 250,
    height: 250,
    borderWidth: 0,
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
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 2,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  scanButtonText: {
    color: colors.white,
    marginLeft: 10,
  },
  scanningText: {
    color: 'white',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  marketModalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 2,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeModalButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  isbnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  titleInput: {
    flex: 1,
    height: 30,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  isbnInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  isbnInput: {
    flex: 1,
    height: 30,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  saveTitleButton: {
    backgroundColor: colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    flex: 1,
  },
  ratingHeader: {
    flex: 1,
    paddingRight: 16,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  ratingStars: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: colors.grayDark,
  },
  originalPriceLabel: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 2,
  },
  originalPrice: {
    fontSize: 16,
    color: colors.grayDark,
    textDecorationLine: 'line-through',
    marginBottom: 8,
  },
  finalPriceContainer: {
    backgroundColor: 'rgba(74,108,247,0.1)',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  finalPriceLabel: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  finalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  priceSummary: {
    flex: 1,
    overflow: 'visible', // zmieniamy z 'hidden' na 'visible'
    zIndex: 1000,
    elevation: 5, // dla Androida
    marginBottom: 20, // dodatkowy margines
  },
  ratingContainerWrapper: {
    position: 'relative',
    marginBottom: 16,
    overflow: 'hidden',
  },
  ratingContainer: {
    padding: 16,
    paddingBottom: 15, // Więcej miejsca na dole dla fali
  },
  ratingOuterContainer: {
    marginLeft: -16,
    marginRight: -16,
    marginBottom: 0,
    backgroundColor: '#f0f4ff',
    paddingTop: 40,
    marginTop: -80,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    zIndex: 999, // niższy niż tooltip
    elevation: 4, // dla Androida
  },

  // Aktualizujemy container aby lepiej wypełniał przestrzeń
  container: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 82,
    backgroundColor: colors.white,
  },

  // Nowy styl dla tooltipa
  tooltipContainer: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
    flexDirection: 'row', // Etykieta i wartość w jednej linii
    justifyContent: 'space-between', // Rozmieszczenie na całej szerokości
    alignItems: 'center', // Wyśrodkowanie w pionie
  },
  tooltipLabel: {
    fontSize: 14,
    color: colors.grayDark,
  },
  tooltipValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },

  // Aktualizacja dla sekcji poniżej
  combinedSection: {
    backgroundColor: 'white',
    borderRadius: 1, // Zaokrąglenie rogów
    padding: 16,
    marginBottom: 16,
    borderWidth: 0,
    borderColor: 'rgba(0,0,0,0.05)',
    marginLeft: -20, // Usuwamy marginesy boczne
    marginRight: 0,
    width: '110%', // Pełna szerokość
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  progressText: {
    fontSize: 14,
    color: colors.grayDark,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: colors.grayLight,
    borderRadius: 2,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 0,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  navButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
  },
  backButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.primary,
    marginRight: 8,
    borderRadius: 12,
    width: 120
  },
  backButtonText: {
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,

    marginLeft: 8,
    width: 120
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '500',
    marginRight: 8,
  },
  progressDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: colors.grayLight,
  },
  activeProgressDot: {
    backgroundColor: colors.primary,
    width: 12,
  },

  // Simplified navigation container
  fixedNavigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: colors.grayLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  simpleNavButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  navButtonText: {
    color: colors.primary,
    fontWeight: '500',
  },
  disabledNavButton: {
    opacity: 0.5,
  },
  stepTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 26,
    marginTop: 20,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
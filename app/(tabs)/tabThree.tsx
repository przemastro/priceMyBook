import React, {useEffect, useRef, useState} from 'react';
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

const { width: viewportWidth } = Dimensions.get('window');

interface BookDefect {
  id: string;
  selected: boolean;
  priceReduction: number;
  count: number;
  confidence?: number;
  icon: string;
}

interface ListingStatus {
  status: 'notListed' | 'listed' | 'sold';
  platforms: ('amazon' | 'allegro' | 'olx')[];
  listedDate?: string;
  soldDate?: string;
}

interface BookAgeInfo {
  years: number;
}

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

interface ActiveFactors {
  defects: boolean;
  uniqueness: boolean;
  market: boolean;
}

interface ActiveFactorsParams {
  defects?: string;
  uniqueness?: string;
  market?: string;
}

interface BookDefects {
  [key: string]: {
    selected: boolean;
    reduction: number;
    count: number;
  };
}

interface SearchParams {
  isbn?: string;
  title?: string;
  authors?: string;
  originalPrice?: string;
  editMode?: string;
  collectionName?: string;
  bookIndex?: string;
  defects?: string;
  uniqueness?: string;
  marketFactors?: string;
  fromHistory?: string;
  activeFactors?: string;
}

const DEFECT_TYPES = [
  { id: 'tornPages', icon: 'document-text-outline' },
  { id: 'brokenSpine', icon: 'book-outline' },
  { id: 'waterDamage', icon: 'water-outline' },
  { id: 'missingPages', icon: 'remove-outline' },
  { id: 'heavyWear', icon: 'alert-circle-outline' },
  { id: 'stainedPages', icon: 'color-filter-outline' },
  { id: 'looseBinding', icon: 'unlink-outline' },
  { id: 'writtingMarks', icon: 'pencil-outline' },
  { id: 'foldedCorners', icon: 'copy-outline' },
  { id: 'fadedCover', icon: 'sunny-outline' }
] as const;

const UNIQUENESS_TYPES = [
  { id: 'isMassMarket', icon: 'copy-outline', label: 'labels.massMarket' },
  { id: 'isFirstEdition', icon: 'book-outline', label: 'labels.firstEdition' },
  { id: 'isCollectorsEdition', icon: 'ribbon-outline', label: 'labels.collectorsEdition' },
  { id: 'hasAuthorSignature', icon: 'create-outline', label: 'labels.authorSignature' },
  { id: 'isLimitedEdition', icon: 'diamond-outline', label: 'labels.limitedEdition' },
  { id: 'isPublisherDefunct', icon: 'skull-outline', label: 'labels.defunctPublisher' }
] as const;

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
    waterDamage: 12,
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

const parseActiveFactors = (param: string | string[] | undefined): ActiveFactors => {
  const defaultFactors = {
    defects: true,
    uniqueness: true,
    market: true
  };

  if (!param) return defaultFactors;

  try {
    const paramString = Array.isArray(param) ? param[0] : param;
    const parsed = JSON.parse(paramString) as ActiveFactorsParams;

    return {
      defects: parsed.defects !== 'false',
      uniqueness: parsed.uniqueness !== 'false',
      market: parsed.market !== 'false'
    };
  } catch {
    return defaultFactors;
  }
};

export default function TabThreeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const rawParams = useLocalSearchParams();
  const [activeFactors, setActiveFactors] = useState<ActiveFactors>(
      parseActiveFactors(rawParams.activeFactors)
  );
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hasScanned, setHasScanned] = useState(false);

  const {
    collections,
    addBookToCollection,
    removeBookFromCollection,
    updateBookInCollection,
    exchangeRateError,
    formatCurrency,
    books
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

  const getBookWord = (count: number, language: string) => {
    if (language === 'pl') {
      // Odmiana polska
      if (count === 1) return t('labels.book_one');
      if (count % 100 >= 12 && count % 100 <= 14) return t('labels.book_many');
      if ([2,3,4].includes(count % 10)) return t('labels.book_few');
      return t('labels.book_many');
    } else {
      // Odmiana angielska
      return count === 1 ? t('labels.book_one') : t('labels.book_other');
    }
  };

  const initialMarketFactors = parseParam<MarketFactors>(params.marketFactors) || {
    demand: 'medium',
    supply: 'medium',
    publicationYear: new Date().getFullYear() - Math.floor(Math.random() * 10)
  };
  const [marketFactors, setMarketFactors] = useState<MarketFactors>(initialMarketFactors);

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

  const isbn = Array.isArray(params.isbn) ? params.isbn[0] : params.isbn || '';
  const originalPriceParam = Array.isArray(params.originalPrice) ? params.originalPrice[0] : params.originalPrice || '0';
  const title = Array.isArray(params.title) ? params.title[0] : params.title || t('bookInfo.unknownTitle');
  const authors = Array.isArray(params.authors) ? params.authors[0] : params.authors || t('bookInfo.unknown');
  const editMode = Array.isArray(params.editMode) ? params.editMode[0] === 'true' : params.editMode === 'true';
  const collectionName = Array.isArray(params.collectionName) ? params.collectionName[0] : params.collectionName;
  const bookIndex = params.bookIndex ? parseInt(Array.isArray(params.bookIndex) ? params.bookIndex[0] : params.bookIndex) : null;
  const defaultListingStatus: ListingStatus = {
    status: 'notListed',
    platforms: []
  };
  const slides = [
    {
      id: 'defects',
      title: t('labels.selectDefects'),
      icon: 'warning-outline'
    },
    {
      id: 'uniqueness',
      title: t('labels.uniqueness'),
      icon: 'sparkles-outline'
    },
    {
      id: 'market',
      title: t('labels.marketFactors'),
      icon: 'trending-up-outline'
    },
    {
      id: 'collection',
      title: t('labels.collection'),
      icon: 'library-outline'
    }
  ];

  useEffect(() => {
    const newFactors = parseActiveFactors(rawParams.activeFactors);
    setActiveFactors(newFactors);
  }, [rawParams.activeFactors]);

  useEffect(() => {
    if (!activeFactors.defects) {
      setDefects(defects.map(d => ({ ...d, selected: false, count: 0 })));
    }
    if (!activeFactors.uniqueness) {
      setUniqueness({
        isMassMarket: false,
        isFirstEdition: false,
        isCollectorsEdition: false,
        hasAuthorSignature: false,
        isLimitedEdition: false,
        isPublisherDefunct: false
      });
    }
    if (!activeFactors.market) {
      setMarketFactors({
        demand: 'medium',
        supply: 'medium',
        publicationYear: new Date().getFullYear()
      });
      setAgeInfo({ years: 0 });
    }
  }, [activeFactors]);

  useEffect(() => {
    if (editMode) {
      const bookDefects = parseParam<BookDefects>(params.defects) || {};
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
      setHasScanned(true); // Enable slides in edit mode
    }
  }, [editMode, params.defects, params.uniqueness, params.marketFactors]);

  useEffect(() => {
    setOriginalPrice(originalPriceParam);
    setOriginalPriceInput(originalPriceParam);
  }, [originalPriceParam]);

  const getBookCount = (collection: string) => {
    return books[collection]?.length || 0;
  };

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
    if (!activeFactors.defects) return 0;

    return defects
        .filter(defect => defect.selected)
        .reduce((total, defect) => {
          const countFactor = Math.min(defect.count, 5);
          return total + (defect.priceReduction * countFactor);
        }, 0);
  };

  const calculateAgeModifier = (ageInfo: BookAgeInfo, isMassMarket: boolean): number => {
    if (!activeFactors.market) return 0;

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
    if (!activeFactors.uniqueness) return 0;

    let bonus = 0;
    if (uniqueness.isFirstEdition) bonus += 10;
    if (uniqueness.isCollectorsEdition) bonus += 15;
    if (uniqueness.hasAuthorSignature) bonus += 20;
    if (uniqueness.isLimitedEdition) bonus += 10;
    if (uniqueness.isPublisherDefunct) bonus += 7.5;

    return Math.min(bonus, 50);
  };

  const calculateMarketModifier = (marketFactors: MarketFactors): number => {
    if (!activeFactors.market) return 0;

    const demandModifiers = {
      veryHigh: 20,
      high: 10,
      medium: 0,
      low: -5,
      veryLow: -10
    };

    const supplyModifiers = {
      veryLow: 25,
      low: 10,
      medium: 0,
      high: -5,
      flooded: -10
    };

    return (demandModifiers[marketFactors.demand] + supplyModifiers[marketFactors.supply]) / 2;
  };

  const calculateFinalPrice = (): number => {
    let adjustedPrice = parseFloat(originalPrice) || 0;

    if (activeFactors.defects) {
      const defectsReduction = calculateDefectsReduction(defects);
      const maxDefectReduction = 0.9 * adjustedPrice;
      const priceAfterDefects = adjustedPrice * (1 - defectsReduction / 100);
      adjustedPrice = Math.max(priceAfterDefects, adjustedPrice - maxDefectReduction);
    }

    if (activeFactors.uniqueness) {
      const uniquenessBonus = calculateUniquenessBonus(uniqueness);
      adjustedPrice *= (1 + uniquenessBonus / 100);
    }

    if (activeFactors.market) {
      const marketModifier = calculateMarketModifier(marketFactors);
      adjustedPrice *= (1 + marketModifier / 100);
    }

    return Math.max(0.01, adjustedPrice);
  };

  const calculateBookRating = (): number => {
    const selectedDefects = defects.filter(d => d.selected);
    if (selectedDefects.length === 0) return 10;

    let ratingReduction = selectedDefects.length;
    const countReduction = selectedDefects.reduce((sum, defect) => {
      return sum + Math.floor(defect.count / 5);
    }, 0);

    const totalReduction = ratingReduction + countReduction;
    return Math.max(1, 10 - totalReduction);
  };

  const finalPrice = calculateFinalPrice();
  const bookRating = calculateBookRating();

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
            setHasScanned(true); // Enable slides after first scan
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

  const handleSaveBook = () => {
    // Sprawdź czy istnieją jakiekolwiek kolekcje
    if (collections.length === 0) {
      Alert.alert(
          t('alerts.error'),
          t('alerts.noCollectionsExist'),
          [
            {
              text: t('buttons.cancel'),
              style: 'cancel'
            },
            {
              text: t('buttons.createCollection'),
              onPress: () => router.push('/tabFour')
            }
          ]
      );
      return;
    }

    const selectedDefects = defects.filter(d => d.selected);
    const priceValue = finalPrice.toFixed(2);

    // Pobierz istniejący status listingu jeśli jest w trybie edycji
    let listingStatus = defaultListingStatus;
    if (editMode && collectionName && bookIndex !== null) {
      const existingBook = books[collectionName][bookIndex];
      listingStatus = existingBook.listingStatus || defaultListingStatus;
    }

    const bookData = {
      isbn,
      title,
      authors,
      price: priceValue,
      displayPrice: formatCurrency(priceValue),
      foundInApi: params.fromHistory !== 'true',
      originalPrice: originalPrice,
      defects: selectedDefects.reduce((acc, defect) => ({
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
      listingStatus // Zachowaj status listingu
    };

    if (editMode && collectionName && bookIndex !== null) {
      if (selectedCollection === collectionName) {
        // Aktualizuj w tej samej kolekcji
        updateBookInCollection(collectionName, bookIndex, bookData);
        Alert.alert(t('alerts.success'), t('alerts.bookUpdated'));
        router.back();
      } else {
        // Przenieś do innej kolekcji
        const bookToMove = books[collectionName][bookIndex];
        const bookWithStatus = {
          ...bookData,
          listingStatus: bookToMove.listingStatus || defaultListingStatus
        };

        // Najpierw dodaj do nowej kolekcji
        addBookToCollection(selectedCollection, bookWithStatus);

        // Następnie usuń ze starej kolekcji
        removeBookFromCollection(collectionName, bookIndex);

        Alert.alert(
            t('alerts.success'),
            t('alerts.bookMoved', {
              oldCollection: collectionName,
              newCollection: selectedCollection
            })
        );
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

  const [expandedTabs, setExpandedTabs] = useState<Record<string, boolean>>({
    defects: false,
    uniqueness: false,
    market: false,
    collection: false
  });

  const toggleTab = (tabId: string) => {
    setExpandedTabs(prev => ({
      ...Object.keys(prev).reduce((acc, key) => {
        acc[key] = key === tabId ? !prev[key] : false;
        return acc;
      }, {} as Record<string, boolean>)
    }));
  };

  const renderDefectItem = ({ item }: { item: BookDefect }) => (
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
  );

  const renderUniquenessItem = ({ item }: { item: typeof UNIQUENESS_TYPES[number] }) => (
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
  );

  const renderTabSection = () => (
      <View style={styles.tabSectionContainer}>
        <View style={styles.tabsContainer}>
          {slides.map((slide) => (
              <TouchableOpacity
                  key={slide.id}
                  style={[
                    styles.tabButton,
                    expandedTabs[slide.id] && styles.activeTabButton
                  ]}
                  onPress={() => toggleTab(slide.id)}
                  activeOpacity={0.7}
              >
                <View style={styles.tabContent}>
                  <Ionicons
                      name={slide.icon as any}
                      size={20}
                      color={expandedTabs[slide.id] ? colors.primary : colors.grayDark}
                      style={styles.tabIcon}
                  />
                  <Text style={[
                    styles.tabText,
                    expandedTabs[slide.id] && styles.activeTabText
                  ]}>
                    {slide.title}
                  </Text>
                </View>
              </TouchableOpacity>
          ))}
        </View>

        {/* Content container with padding */}
        <View style={styles.tabContentWrapper}>
          {expandedTabs[slides[0].id] && renderSlide(slides[0])}
          {expandedTabs[slides[1].id] && renderSlide(slides[1])}
          {expandedTabs[slides[2].id] && renderSlide(slides[2])}
          {expandedTabs[slides[3].id] && renderSlide(slides[3])}
        </View>
      </View>
  );

  const renderSlide = (slide: typeof slides[0]) => {
    switch (slide.id) {
      case 'defects':
        return (
            <View style={styles.slideContent}>
              <FlatList
                  data={defects}
                  renderItem={renderDefectItem}
                  keyExtractor={item => item.id}
                  numColumns={2}
                  columnWrapperStyle={styles.columnWrapper}
                  scrollEnabled={false}
              />
            </View>
        );
      case 'uniqueness':
        return (
            <View style={styles.slideContent}>
              <FlatList
                  data={UNIQUENESS_TYPES}
                  renderItem={renderUniquenessItem}
                  keyExtractor={item => item.id}
                  numColumns={2}
                  columnWrapperStyle={styles.columnWrapper}
                  scrollEnabled={false}
              />
            </View>
        );
      case 'market':
        return (
            <View style={styles.slideContent}>
              <View style={styles.dataRow}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                <Text style={styles.dataText}>
                  {t('labels.publicationYear')}: {marketFactors.publicationYear}
                </Text>
              </View>

              <View style={styles.dataRow}>
                <Ionicons name="trending-up-outline" size={20} color={colors.primary} />
                <Text style={styles.dataText}>
                  {t('labels.demand')}: {t(`labels.${marketFactors.demand}`)}
                </Text>
              </View>

              <View style={styles.dataRow}>
                <Ionicons name="trending-down-outline" size={20} color={colors.primary} />
                <Text style={styles.dataText}>
                  {t('labels.supply')}: {t(`labels.${marketFactors.supply}`)}
                </Text>
              </View>

              <Text style={styles.noteText}>
                {t('labels.marketDataNote')}
              </Text>
            </View>
        );
      case 'collection':
        return (
            <View style={styles.slideContent}>
              <View style={styles.collectionRow}>
                <View style={styles.collectionPickerContainer}>
                  {collections.length > 0 ? (
                      <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedCollection}
                            style={styles.picker}
                            onValueChange={(itemValue) => setSelectedCollection(itemValue)}
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
                          onPress={() => router.push('/tabFour')}
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
                        {getBookCount(selectedCollection)} {getBookWord(getBookCount(selectedCollection), i18n.language)}
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

    <Modal
        visible={showDefectModal}
        transparent={true}
        animationType="fade"
        onRequestClose={rejectDefect}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {t('labels.defectDetected')}
          </Text>

          <View style={styles.modalContent}>
            <View style={styles.modalDefectInfo}>
              <Ionicons
                  name={scannedDefect?.icon as any}
                  size={32}
                  color={colors.primary}
                  style={styles.modalDefectIcon}
              />
              <Text style={styles.modalDefectName}>
                {t(`defects.${scannedDefect?.id}`)}
              </Text>
            </View>

            <Text style={styles.modalText}>
              {t('labels.confidence')}: <Text style={styles.modalBoldText}>{scannedDefect?.confidence}%</Text>
            </Text>
            <Text style={styles.modalText}>
              {t('labels.priceReduction')}: <Text style={styles.modalBoldText}>{scannedDefect?.priceReduction}%</Text>
            </Text>
          </View>

          <View style={styles.modalButtonsContainer}>
            <TouchableOpacity
                style={[styles.modalButton, styles.rejectButton]}
                onPress={rejectDefect}
            >
              <Text style={styles.rejectButtonText}>
                {t('buttons.reject')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.modalButton, styles.acceptButton]}
                onPress={acceptDefect}
            >
              <Text style={styles.acceptButtonText}>
                {t('buttons.confirmDefect')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  </View>
  );
  }

  return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[typography.h1, styles.header]}>
        </Text>

        <View style={styles.ratingContainer}>
          <Text style={styles.ratingLabel}>{t('labels.bookCondition')}</Text>
          <View style={styles.ratingStars}>
            {[...Array(10)].map((_, i) => (
                <Ionicons
                    key={i}
                    name={i < bookRating ? 'star' : 'star-outline'}
                    size={24}
                    color={i < bookRating ? colors.primary : colors.gray}
                />
            ))}
          </View>
          <Text style={styles.ratingText}>
            {bookRating}/10 {bookRating >= 8 ? t('labels.excellent') :
              bookRating >= 6 ? t('labels.good') :
                  bookRating >= 4 ? t('labels.fair') :
                      t('labels.poor')}
          </Text>
        </View>

        <View style={styles.combinedSection}>
          <View style={styles.priceSection}>
            <Text style={typography.body}>{t('bookInfo.isbn')}: {isbn || t('bookInfo.noISBN')}</Text>

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
                      {formatCurrency(originalPrice)}
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
            <View style={styles.finalPriceContainer}>
              <Ionicons name="pricetag" size={24} color={colors.primary} style={styles.priceIcon} />
              <Text style={[typography.h2, { color: colors.primary }]}>
                {t('bookInfo.finalPrice')}: {formatCurrency(finalPrice.toString())}
              </Text>
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
        {renderTabSection()}
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 6,
    backgroundColor: '#f8f9fa',
  },
  header: {
    marginBottom: 4,
    marginTop: responsive.largeMargin,
    textAlign: 'left',
    color: colors.black,
  },
  ratingContainer: {
    backgroundColor: colors.white,
    borderRadius: 2,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  ratingLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: colors.black,
  },
  ratingStars: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
  combinedSection: {
    backgroundColor: 'white',
    borderRadius: 2,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
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
  finalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    borderRadius: 2,
    backgroundColor: 'rgba(74,108,247,0.08)',
  },
  priceIcon: {
    marginRight: 10,
  },
  startScanButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.primary,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
  disabledSlideNavButton: {
    opacity: 0.5,
  },
  disabledSlideNavText: {
    color: colors.grayDark,
  },
  defectsGrid: {
    marginBottom: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  defectItemContainer: {
    width: '48%',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 2,
    backgroundColor: 'white',
    marginBottom: 12,
    alignItems: 'center',
    height: 130,
    position: 'relative'
  },
  selectedDefect: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(74,108,247,0.05)',
  },
  defectIconContainer: {
    marginBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 20,
    padding: 12,
    marginTop: 10,
  },
  defectName: {
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
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
  slider: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
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
  noteText: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 16,
    fontStyle: 'italic',
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
  progressContainer: {
    width: '80%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    backgroundColor: colors.gray,
    height: 5,
    borderRadius: 2,
    marginBottom: 5,
    overflow: 'hidden'
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
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 2,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: colors.black,
    textAlign: 'left',
  },
  modalContent: {
    marginBottom: 20,
  },
  modalDefectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalDefectIcon: {
    marginRight: 10,
  },
  modalDefectName: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.black,
  },
  modalText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    textAlign: 'left',
  },
  modalBoldText: {
    fontWeight: '600',
    color: colors.black,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 2,
    marginLeft: 10,
  },
  acceptButton: {
    backgroundColor: 'transparent',
  },
  rejectButton: {
    backgroundColor: 'transparent',
  },
  acceptButtonText: {
    color: colors.primary,
    fontWeight: '500',
  },
  rejectButtonText: {
    color: colors.primary,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  slidesContainer: {
    backgroundColor: 'white',
    borderRadius: 2,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  slideContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 16,
  },
  slideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  slideHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slideIcon: {
    marginRight: 12,
  },
  slideTitle: {
    ...typography.h3,
    color: colors.black,
  },
  slideContent: {
    paddingBottom: 16,
  },
  slidesNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 2,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    borderBottomWidth: 0,
    paddingHorizontal: 8,
  },
  slideNavButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    position: 'relative',
  },
  activeSlideNavButton: {
    // Brak zmiany tła - tylko podkreślenie
  },
  slideNavContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideNavText: {
    fontSize: 12,
    color: colors.gray,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  activeSlideNavText: {
    color: colors.primary,
    fontWeight: '600',
  },
  slideNavIcon: {
    marginBottom: 2,
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '70%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  slide: {
    width: viewportWidth - 32,
    padding: 16,
    backgroundColor: 'white',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    borderTopWidth: 0,
  },
  tabSectionContainer: {
    backgroundColor: 'white',
    borderRadius: 2,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 4, // dodajemy padding na dole
  },
  tabContentWrapper: {
    padding: 16,
    paddingTop: 12, // mniejszy padding u góry zawartości
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 4, // dodajemy padding po bokach
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 12,
    color: colors.grayDark,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  tabIcon: {
    marginBottom: 2,
  },
  tabContentContainer: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    borderTopWidth: 0, // usuwamy górną granicę
    padding: 16,
    paddingTop: 12, // mniejszy padding u góry zawartości
  },
  activeTabButton: {
  },
});
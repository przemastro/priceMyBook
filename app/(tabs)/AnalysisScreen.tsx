import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {CameraType, CameraView, useCameraPermissions} from 'expo-camera';
import {useAppContext} from '@/context/AppContext';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {colors} from '@/styles/styles';
import {useTranslation} from 'react-i18next';
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import PriceCalculationDetails from '../components/analysisScreen/sections/PriceCalculationDetails';
import ScanDefectModal from '../components/analysisScreen/modals/ScanDefectModal';
import AddCollectionModal from '../components/commonScreen/modals/AddCollectionModal';
import {EditBookDetailsModal} from '../components/analysisScreen/modals/EditBookDetailsModal';
import {BasicInfoSection} from '../components/analysisScreen/sections/BasicInfoSection';
import {RatingSection} from '../components/analysisScreen/sections/RatingSection';
import CollectionsSection from '../components/analysisScreen/sections/CollectionsSection';
import {BookDefect, MarketData, ListingStatus, BookAgeInfo, BookUniqueness, MarketFactors, DEFECT_TYPES, MARKET_FACTOR_TOGGLES, IncludedMarketFactors} from '../components/analysisScreen/types';
import {formatCurrency} from '../utils/currency';
import DefectsSection from "@/app/components/analysisScreen/sections/DefectsSection";
import UniquenessSection from "@/app/components/analysisScreen/sections/UniquenessSection";
import MarketFactorsSection from "@/app/components/analysisScreen/sections/MarketFactorsSection";
import {LinearGradient} from "expo-linear-gradient";
import {CustomAlertModal} from "@/app/components/alerts/CustomAlertModal";
import {LIMITS} from "@/app/utils/constants";
import {useFocusEffect} from "@react-navigation/native";
import { styles } from './styles'

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

export default function AnalysisScreen() {
  const {t} = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [cameraType] = useState<CameraType>('back');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [hasScanned, setHasScanned] = useState(false);
  const [showAddCollectionModal, setShowAddCollectionModal] = useState(false);
  const [bookImage, setBookImage] = useState<string | null>(null);
  const {collections, addBookToCollection, removeBookFromCollection, updateBookInCollection, exchangeRate, books, addCollection} = useAppContext();
  const [defects, setDefects] = useState<BookDefect[]>(DEFECT_TYPES.map(defect => ({
    id: defect.id,
    selected: false,
    priceReduction: getDefaultReduction(defect.id),
    count: 0,
    icon: defect.icon,
    color: defect.color
  })));
  const [ageInfo] = useState<BookAgeInfo>({years: 0});
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
    publicationYear: parseParam<{ publicationYear?: number }>(params.marketFactors)?.publicationYear ?? new Date().getFullYear() - Math.floor(Math.random() * 10)
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
  const [originalPriceInput, setOriginalPriceInput] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const bookInfo = params.bookInfo ? JSON.parse(params.bookInfo as string) : null;
  const isbn = Array.isArray(params.isbn) ? params.isbn[0] : params.isbn || '';
  const originalPriceParam = Array.isArray(params.originalPrice) ? params.originalPrice[0] : params.originalPrice || '0';
  const title = Array.isArray(params.title) ? params.title[0] : params.title || t('bookInfo.unknownTitle');
  const editMode = Array.isArray(params.editMode) ? params.editMode[0] === 'true' : params.editMode === 'true';
  const collectionName = Array.isArray(params.collectionName) ? params.collectionName[0] : params.collectionName;
  const bookIndex = params.bookIndex ? parseInt(Array.isArray(params.bookIndex) ? params.bookIndex[0] : params.bookIndex) : null;
  const [titleInput, setTitleInput] = useState(title);
  const [isbnInput, setIsbnInput] = useState(isbn);
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [authors, setAuthors] = useState(Array.isArray(params.authors) ? params.authors[0] : params.authors || t('bookInfo.unknown'));
  const [publisher, setPublisher] = useState(bookInfo?.publisher ?? '');
  const [description, setDescription] = useState(bookInfo?.description ?? '');
  const [includedMarketFactors, setIncludedMarketFactors] = useState<IncludedMarketFactors>({
    includePublicationYear: true,
    includeDemand: true,
    includeSupply: true
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const animValue = useRef(new Animated.Value(0)).current;
  const [currentStep, setCurrentStep] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const totalSteps = 5;
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalTitle, setErrorModalTitle] = useState('');
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState('');
  const [successModalMessage, setSuccessModalMessage] = useState('');

  useEffect(() => {
    const directImageUri = Array.isArray(params.imageUri) ? params.imageUri[0] : params.imageUri;

    if (!directImageUri && bookInfo?.imageUri) {
      setBookImage(bookInfo.imageUri);
    } else if (directImageUri) {
      setBookImage(directImageUri);
    }
  }, [bookInfo, params.imageUri]);

  const showAlert = (title: string, message: string, type: 'error' | 'success' = 'error') => {
    if (type === 'error') {
      setErrorModalTitle(title);
      setErrorModalMessage(message);
      setShowErrorModal(true);
    } else {
      setSuccessModalTitle(title);
      setSuccessModalMessage(message);
      setShowSuccessModal(true);
    }
  };

  const openEditModal = () => setShowEditModal(true);
  const closeEditModal = () => setShowEditModal(false);

  const pickImage = async () => {
    try {
      const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert(t('alerts.error'), t('status.noPhotoLibraryAccess'));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets[0].uri) {
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();
        if (blob.size > 200 * 1024) {
          showAlert(t('alerts.error'), t('alerts.imageSizeLimit'));
          return;
        }
        setBookImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showAlert(t('alerts.error'), t('alerts.imageUploadError'));
    }
  };

  const handleConfirm = () => {
    setShowConfirmModal(true);
  };

  const handleAddConfirmed = async () => {
    try {
      await handleSaveBook();
      setShowConfirmModal(false);
    } catch (error) {
      console.error('Error in handleAddConfirmed:', error);
    }
  };

  const animateSlide = (direction: 'forward' | 'backward') => {
    slideAnim.setValue(direction === 'forward' ? 50 : -50);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const goToNextStep = () => {
    animateSlide('forward');
    setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
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
              {date: '2023-01-01', price: bookInfo.amazonData.data.priceRange[0] * 0.9},
              {date: '2023-04-01', price: bookInfo.amazonData.data.priceRange[1] * 1.1},
              {date: '2023-07-01', price: (bookInfo.amazonData.data.priceRange[0] + bookInfo.amazonData.data.priceRange[1]) / 2},
              {date: '2023-10-01', price: bookInfo.amazonData.data.priceRange[0] * 0.95},
              {date: '2024-01-01', price: bookInfo.amazonData.data.priceRange[1] * 1.05},
              {date: new Date().toISOString(), price: parseFloat(originalPriceParam)}
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
              {date: '2023-01-01', price: parseFloat(originalPriceParam) * 0.9},
              {date: '2023-04-01', price: parseFloat(originalPriceParam) * 1.1},
              {date: '2023-07-01', price: parseFloat(originalPriceParam) * 1.0},
              {date: '2023-10-01', price: parseFloat(originalPriceParam) * 0.95},
              {date: '2024-01-01', price: parseFloat(originalPriceParam) * 1.05},
              {date: new Date().toISOString(), price: parseFloat(originalPriceParam)}
            ],
            lastUpdated: new Date(),
            source: 'simulated'
          };
          setMarketData(newSimulatedData);
        }
      } catch (error) {
        console.error('Error loading market data:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadMarketData();
    return () => {
      isMounted = false;
    };
  }, [originalPriceParam]);

  const toggleExpanded = () => {
    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);
    Animated.spring(animValue, {
      toValue,
      useNativeDriver: false,
      bounciness: expanded ? 0 : 6,
    }).start();
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
      React.useCallback(() => {
        fadeAnim.setValue(0);
        setCurrentStep(0);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();

        return () => {
          fadeAnim.setValue(0);
        };
      }, [fadeAnim])
  );

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
          icon: defect.icon,
          color: defect.color
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
      const initialCollection = editMode && collectionName ? collectionName : collections[0].name;
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
    const {years} = ageInfo;
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
        const {status} = await requestPermission();
        if (status !== 'granted') {
          showAlert(t('alerts.error'), t('status.noCameraAccess'));
          return;
        }
      }
      if (permission?.granted) {
        setIsScanning(true);
        setScanProgress(0);
      } else {
        showAlert(t('alerts.error'), t('status.noCameraAccess'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const averageUsedPrice = bookInfo?.amazonData?.prices?.find((p: { condition: string }) =>
      p.condition?.includes('average') || p.condition?.includes('średnia')
  )?.price ?? null;

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
              confidence: Math.floor(Math.random() * 50) + 50,
              color: defect.color
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
      showAlert(t('alerts.error'), t('alerts.cameraError'));
    }
  };

  const acceptDefect = () => {
    if (!scannedDefect) return;
    setDefects(prev => prev.map(d =>
        d.id === scannedDefect.id ? {
          ...d,
          selected: true,
          count: d.count + 1,
          color: d.color
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

  const saveOriginalPrice = async () => {
    if (!originalPriceInput || isNaN(parseFloat(originalPriceInput))) {
      showAlert(t('alerts.error'), t('alerts.enterValidPrice'));
      return false;
    }
    setOriginalPrice(originalPriceInput);
    return true;
  };

  const saveTitle = async () => {
    if (!titleInput.trim()) {
      showAlert(t('alerts.error'), t('alerts.enterTitle'));
      return false;
    }
    return true;
  };


  const saveIsbn = async () => {
    if (!isbnInput.trim()) {
      showAlert(t('alerts.error'), t('alerts.enterISBN'));
      return false;
    }
    return true;
  };

  const handleAddCollection = (name: string, categories: string[] = [], icon: string = 'book') => {
    addCollection(name, icon, categories);
    setSelectedCollection(name);
    setShowAddCollectionModal(false);
  };

  const handleClearPress = () => {
    setBookImage(null);
    setTitleInput('');
    setIsbnInput('');
    setOriginalPrice('');
    setAuthors('');
    setPublisher('');
    setDescription('');
  };

  const handleClearFields = () => {
    setTitleInput('');
    setAuthors('');
    setPublisher('');
    setIsbnInput('');
    setOriginalPriceInput('');
    setDescription('');
  };

  const handleSaveBook = async () => {
    const currentBooksCount = books[selectedCollection]?.length || 0;
    if (currentBooksCount >= LIMITS.MAX_BOOKS_PER_COLLECTION) {
      showAlert(
          t('alerts.error'),
          t('alerts.bookLimitReached', { limit: LIMITS.MAX_BOOKS_PER_COLLECTION }),
          'error'
      );
      return;
    }

    try {
      const priceValue = finalPrice.toFixed(2);
      const defaultListingStatus: ListingStatus = {
        status: 'notListed',
        platforms: []
      };
      const bookData = {
        isbn: isbnInput,
        title: titleInput,
        authors: authors,
        publisher: publisher,
        price: priceValue,
        displayPrice: formatCurrency({price: priceValue, exchangeRate}),
        foundInApi: params.fromHistory !== 'true',
        originalPrice: originalPriceInput,
        description: description,
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
            : defaultListingStatus,
        imageUri: bookImage ?? undefined
      };

      if (editMode && collectionName && bookIndex !== null) {
        if (selectedCollection === collectionName) {
          updateBookInCollection(collectionName, bookIndex, bookData);
          showAlert(t('alerts.success'), t('alerts.bookUpdated'), 'success');
        } else {
          const bookToMove = books[collectionName][bookIndex];
          await addBookToCollection(selectedCollection, {
            ...bookData,
            listingStatus: bookToMove.listingStatus || defaultListingStatus
          });
          removeBookFromCollection(collectionName, bookIndex);
          showAlert(t('alerts.success'), t('alerts.bookMoved', {
            oldCollection: collectionName,
            newCollection: selectedCollection
          }), 'success');
        }
      } else {
        if (!selectedCollection) {
          showAlert(t('alerts.error'), t('alerts.selectCollection'));
          return;
        }
        await addBookToCollection(selectedCollection, bookData);
        showAlert(t('alerts.success'), `${t('alerts.bookAdded')}: ${selectedCollection}`, 'success');
      }
    } catch (error) {
      console.error('Error saving book:', error);
      showAlert(t('alerts.error'), t('alerts.saveBookError'));
    }
  };

  const validateFields = () => {
    let isValid = true;

    if (!titleInput.trim()) {
      showAlert(t('alerts.error'), t('alerts.enterTitle'));
      isValid = false;
    }

    if (!isbnInput.trim()) {
      showAlert(t('alerts.error'), t('alerts.enterISBN'));
      isValid = false;
    }

    if (!originalPriceInput || isNaN(parseFloat(originalPriceInput))) {
      showAlert(t('alerts.error'), t('alerts.enterValidPrice'));
      isValid = false;
    }

    return isValid;
  };

  const renderStep = () => {
    const stepTitles = [
      t('stepTitles.scanForDefects'),
      t('stepTitles.detectedDefects'),
      t('stepTitles.uniqueness'),
      t('stepTitles.marketFactors'),
      t('stepTitles.addToCollection')
    ];

    return (
        <View style={styles.stepContainer}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepTitle} numberOfLines={1} ellipsizeMode="tail">
              {stepTitles[currentStep]}
            </Text>

            <View style={styles.navigationContainer}>
              {currentStep > 0 ? (
                  <TouchableOpacity onPress={goToPrevStep} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={24} color={colors.primary}/>
                  </TouchableOpacity>
              ) : (
                  <View style={{width: 24}} />
              )}

              <View style={styles.progressDots}>
                {Array.from({length: totalSteps}).map((_, i) => (
                    <View
                        key={i}
                        style={[
                          styles.dot,
                          i === currentStep ? styles.activeDot : styles.inactiveDot
                        ]}
                    />
                ))}
              </View>

              {currentStep < totalSteps - 1 ? (
                  <TouchableOpacity onPress={goToNextStep} activeOpacity={0.7}>
                    <Ionicons name="chevron-forward" size={24} color={colors.primary}/>
                  </TouchableOpacity>
              ) : (
                  <View style={{width: 24}} />
              )}
            </View>
          </View>

          <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{translateX: slideAnim}],
                flex: 1
              }}
          >
            {(() => {
              switch (currentStep) {
                case 0:
                  return (
                      <View style={styles.combinedSection}>
                        <BasicInfoSection
                            bookImage={bookImage}
                            title={title}
                            titleInput={titleInput}
                            isbn={isbn}
                            isbnInput={isbnInput}
                            originalPrice={originalPrice}
                            authors={authors}
                            publisher={publisher}
                            description={description}
                            onPickImage={pickImage}
                            onEditPress={openEditModal}
                            onScanPress={startScanning}
                            onClearPress={handleClearPress}
                            formatPrice={(price) => formatCurrency({price, exchangeRate})}
                            isScanning={isScanning}
                        />
                        <EditBookDetailsModal
                            visible={showEditModal}
                            onClose={closeEditModal}
                            bookImage={bookImage}
                            titleInput={titleInput}
                            setTitleInput={setTitleInput}
                            authors={authors}
                            setAuthors={setAuthors}
                            publisher={publisher}
                            setPublisher={setPublisher}
                            isbnInput={isbnInput}
                            setIsbnInput={setIsbnInput}
                            originalPriceInput={originalPriceInput}
                            setOriginalPriceInput={setOriginalPriceInput}
                            description={description}
                            setDescription={setDescription}
                            onPickImage={pickImage}
                            onSave={async () => {
                              const validations = await Promise.all([
                                saveTitle(),
                                saveIsbn(),
                                saveOriginalPrice()
                              ]);

                              if (validations.every(Boolean)) {
                                closeEditModal();
                              }
                            }}
                            onClearFields={handleClearFields}
                        />
                      </View>
                  );
                case 1:
                  return (
                      <DefectsSection
                          defects={defects}
                          onToggleDefect={toggleDefectSelection}
                      />
                  );
                case 2:
                  return (
                      <UniquenessSection
                          uniqueness={uniqueness}
                          onToggleUniqueness={toggleUniquenessSelection}
                      />
                  );
                case 3:
                  return (
                      <MarketFactorsSection
                          marketFactors={MARKET_FACTOR_TOGGLES}
                          includedMarketFactors={includedMarketFactors}
                          onToggleMarketFactor={(id) => setIncludedMarketFactors(prev => ({
                            ...prev,
                            [id]: !prev[id]
                          }))}
                          marketData={marketData}
                      />
                  );
                case 4:
                  return (
                      <CollectionsSection
                          collections={collections}
                          books={books}
                          selectedCollection={selectedCollection}
                          onSelectCollection={setSelectedCollection}
                          onAddCollection={() => setShowAddCollectionModal(true)}
                          searchQuery={searchQuery}
                          onSearchChange={setSearchQuery}
                      />
                  );
                default:
                  return null;
              }
            })()}
          </Animated.View>
        </View>
    );
  };

  if (!permission) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary}/>
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
                  style={styles.closeButtonScanScreen}
                  onPress={stopScanning}
                  activeOpacity={0.7}
              >
                <Ionicons name="close" size={32} color="white"/>
              </TouchableOpacity>

              <Animated.View style={[styles.scanFrame, {transform: [{scale: pulseAnim}]}]}>
                <View style={styles.scanFrameTopLeft}/>
                <View style={styles.scanFrameTopRight}/>
                <View style={styles.scanFrameBottomLeft}/>
                <View style={styles.scanFrameBottomRight}/>
              </Animated.View>

              <View style={styles.bottomControls}>
                <Pressable
                    style={styles.scanButton}
                    onPress={takePictureAndAnalyze}
                >
                  <Ionicons name="scan" size={24} color="white"/>
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

  return (
      <LinearGradient
          colors={[colors.buttonSelected1, colors.buttonSelected2]}
          style={{flex: 1}}
      >
        <View style={{flex: 1}}>
          <ScrollView
              contentContainerStyle={[styles.container, {paddingBottom: 0}]}
              style={styles.backgroundGradient}
              showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity
                onPress={() => router.back()}
                style={{ marginLeft: 10, marginRight: 20, marginBottom: 20 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.blackDark} />
            </TouchableOpacity>
            <RatingSection
                bookRating={bookRating}
                averageUsedPrice={averageUsedPrice}
                finalPrice={priceCalculation.finalPrice}
                expanded={expanded}
                toggleExpanded={toggleExpanded}
                onShowMarketAnalysis={() => setShowMarketModal(true)}
                formatPrice={(price) => formatCurrency({price: price.toString(), exchangeRate})}
            >
              <PriceCalculationDetails
                  calculation={priceCalculation}
                  defects={defects}
                  uniqueness={uniqueness}
                  marketFactors={marketFactors}
                  onShowMarketAnalysis={() => setShowMarketModal(true)}
                  averageUsedPrice={averageUsedPrice}
                  formatPrice={(price) => formatCurrency({price: price.toString(), exchangeRate})}
              />
            </RatingSection>

            <View style={styles.stepContainer}>

              <View style={styles.stepContent}>
                <Animated.View style={{
                  transform: [{translateX: slideAnim}],
                  flex: 1,
                  width: '100%',
                  alignSelf: 'stretch'
                }}>
                  {renderStep()}
                </Animated.View>
              </View>
            </View>
          </ScrollView>

          {currentStep === totalSteps - 1 && (
              <>
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleConfirm}
                    activeOpacity={0.7}
                >
                  <LinearGradient
                      colors={[colors.primary, colors.primary]}
                      style={styles.saveButtonGradient}
                  >
                    <Text style={styles.saveButtonText}>
                      {editMode ? t('buttons.save') : t('buttons.add')}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={showConfirmModal}
                    onRequestClose={() => setShowConfirmModal(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                      <View style={styles.modalContent}>
                        <View style={styles.iconPreviewContainer}>
                          <View style={styles.iconPreviewCircle}>
                            <MaterialIcons
                                name="book"
                                size={62}
                                color={colors.primary}
                            />
                          </View>
                        </View>

                        <Text style={styles.modalTitle}>
                          {t('modals.addToCollectionTitle')}
                        </Text>
                        <Text style={styles.modalText}>
                          {t('modals.addToCollectionConfirm', {
                            collection: selectedCollection
                          })}
                        </Text>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowConfirmModal(false)}
                            activeOpacity={0.7}
                        >
                          <View style={styles.closeButtonCircle}>
                            <Text style={styles.closeButtonText}>×</Text>
                          </View>
                        </TouchableOpacity>

                        <View style={styles.buttonRow}>
                          <TouchableOpacity
                              style={[styles.actionButton, styles.confirmButton]}
                              onPress={handleAddConfirmed}
                              activeOpacity={0.7}
                          >
                            <LinearGradient
                                colors={[colors.primary, colors.primary]}
                                style={styles.buttonGradient}
                            >
                              <Text style={styles.confirmButtonText}>
                                {t('buttons.confirm')}
                              </Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </Modal>
              </>
          )}

          <CustomAlertModal
              visible={showErrorModal}
              title={errorModalTitle}
              message={errorModalMessage}
              type="error"
              onConfirm={() => setShowErrorModal(false)}
          />

          <CustomAlertModal
              visible={showSuccessModal}
              title={successModalTitle}
              message={successModalMessage}
              type="success"
              onConfirm={() => {
                setShowSuccessModal(false);
                if (successModalTitle === t('alerts.success') && successModalMessage.includes(t('alerts.bookAdded'))) {
                  router.back();
                }
              }}
          />

          <AddCollectionModal
              visible={showAddCollectionModal}
              onClose={() => setShowAddCollectionModal(false)}
              onConfirm={handleAddCollection}
          />
        </View>
      </LinearGradient>
  );
}

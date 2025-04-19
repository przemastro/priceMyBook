import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  Animated,
  Easing,
  FlatList,
  TextInput
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useAppContext } from '@/context/AppContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, typography, responsive } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

interface BookDefect {
  id: string;
  selected: boolean;
  priceReduction: number;
  count: number;
  confidence?: number;
  icon: string;
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

const getDefaultReduction = (id: string): number => {
  const reductions: Record<string, number> = {
    tornPages: 20, brokenSpine: 30, waterDamage: 40,
    missingPages: 50, heavyWear: 25, stainedPages: 15,
    looseBinding: 20, writtingMarks: 10, foldedCorners: 5,
    fadedCover: 10
  };
  return reductions[id] || 10;
};

export default function TabThreeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const {
    collections,
    addBookToCollection,
    removeBookFromCollection,
    exchangeRate,
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

  const isbn = params.isbn?.toString() || '';
  const originalPriceParam = params.originalPrice?.toString() || '0';
  const averagePrice = params.averagePrice?.toString() || originalPriceParam;
  const title = params.title?.toString() || t('bookInfo.unknownTitle');
  const authors = params.authors?.toString() || t('bookInfo.unknown');
  const editMode = params.editMode === 'true';
  const collectionName = params.collectionName?.toString();
  const bookIndex = params.bookIndex ? parseInt(params.bookIndex.toString()) : null;

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

  const calculateFinalPrice = (): number => {
    const basePrice = parseFloat(originalPrice) || 0;
    const totalReduction = defects
        .filter((defect) => defect.selected)
        .reduce((sum, defect) => {
          const reduction = defect.priceReduction * Math.min(defect.count, 5);
          return sum + reduction;
        }, 0);

    const maxReduction = 0.9 * basePrice;
    const reducedPrice = basePrice * (1 - totalReduction / 100);

    return Math.max(reducedPrice, basePrice - maxReduction);
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

  const handleSaveBook = () => {
    const selectedDefects = defects.filter(d => d.selected);
    const priceValue = finalPrice.toFixed(2);
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
      rating: bookRating
    };

    if (editMode && collectionName && bookIndex !== null) {
      if (selectedCollection !== collectionName) {
        removeBookFromCollection(collectionName, bookIndex);
      }
      addBookToCollection(selectedCollection, bookData);
      Alert.alert(t('alerts.success'), t('alerts.bookUpdated'));
    } else {
      if (!selectedCollection && collections.length > 0) {
        Alert.alert(t('alerts.error'), t('alerts.selectCollection'));
        return;
      }
      addBookToCollection(selectedCollection, bookData);
      Alert.alert(t('alerts.success'), `${t('alerts.bookAdded')}: ${selectedCollection}`);
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

  const renderDefectItem = ({ item }: { item: BookDefect }) => (
      <TouchableOpacity
          style={[
            styles.defectItemContainer,
            item.selected && styles.selectedDefect
          ]}
          onPress={() => toggleDefectSelection(item.id)}
          activeOpacity={0.7}
      >
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

        {item.selected && (
            <>
              <View style={styles.sliderRow}>
                <Slider
                    value={item.priceReduction}
                    onValueChange={(value) => {
                      const updatedDefects = defects.map(d =>
                          d.id === item.id ? { ...d, priceReduction: value } : d
                      );
                      setDefects(updatedDefects);
                    }}
                    minimumValue={0}
                    maximumValue={100}
                    step={1}
                    style={styles.slider}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor="#e0e3e7"
                    thumbTintColor={colors.primary}
                />
                <Text style={styles.reductionText}>
                  {item.priceReduction.toFixed(0)}%
                </Text>
              </View>
            </>
        )}
      </TouchableOpacity>
  );

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
          {editMode ? t('titles.editBook') : t('titles.analyzeCondition')}
        </Text>

        <View style={styles.ratingContainer}>
          <Text style={styles.ratingLabel}>{t('labels.bookCondition')}:</Text>
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
                        name="pencil"
                        size={16}
                        color={colors.primary}
                        style={styles.editIcon}
                    />
                  </TouchableOpacity>
              )}
            </View>

            {averagePrice !== originalPrice && (
                <Text style={typography.body}>
                  {t('bookInfo.discountedPrice')}: {formatCurrency(averagePrice)}
                </Text>
            )}
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

        <Text style={styles.sectionHeader}>{t('labels.selectDefects')}</Text>
        <View style={styles.defectsGrid}>
          <FlatList
              data={defects}
              renderItem={renderDefectItem}
              keyExtractor={item => item.id}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              scrollEnabled={false}
          />
        </View>

        <Text style={styles.sectionHeader}>{t('labels.selectCollection')}</Text>
        <View style={styles.collectionSection}>
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
                    {getBookCount(selectedCollection)} {t('labels.books')}
                  </Text>
                </View>
            )}
          </View>

          <View style={styles.horizontalLine} />

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
      </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: 50,
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
    borderRadius: 5,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  scanButtonText: {
    color: colors.white,
    marginLeft: 10,
  },
  scanIcon: {
    marginRight: 10,
  },
  progressContainer: {
    width: '80%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    backgroundColor: colors.gray,
    height: 5,
    borderRadius: 5,
    marginBottom: 5,
    overflow: 'hidden'
  },
  scanningText: {
    color: 'white',
    textAlign: 'center',
  },
  container: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 6,
    backgroundColor: '#f8f9fa',
  },
  header: {
    marginBottom: 24,
    marginTop: responsive.largeMargin,
    textAlign: 'left',
    color: colors.black,
  },
  reductionLevelContainer: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 16,
    marginBottom: 16,
  },
  reductionLevelLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: colors.black,
  },
  reductionLevelButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reductionLevelButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.gray,
    alignItems: 'center',
  },
  reductionLevelButtonActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(74,108,247,0.1)',
  },
  reductionLevelButtonText: {
    color: colors.black,
  },
  reductionLevelButtonTextActive: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  ratingContainer: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
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
    borderRadius: 5,
    padding: 16,
    marginBottom: 24,
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
    borderRadius: 5,
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
    borderRadius: 5,
    backgroundColor: 'rgba(74,108,247,0.08)',
  },
  priceIcon: {
    marginRight: 10,
  },
  collectionSection: {
    marginBottom: 24,
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  collectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  collectionPickerContainer: {
    flex: 1,
    marginRight: 12,
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
  picker: {
    height: 50,
    width: '100%',
  },
  pickerContainer: {
    borderWidth: 0,
    borderRadius: 5,
    overflow: 'hidden',
  },
  saveButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
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
  defectsGrid: {
    marginBottom: 16,
    marginTop: 16,
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
    borderRadius: 5,
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
    borderRadius: 50,
    padding: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 4,
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
  totalReductionText: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
    textAlign: 'center',
  },
  createCollectionButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  createCollectionText: {
    color: colors.primary,
    fontWeight: '500',
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
  startScanButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
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
  sectionHeader: {
    color: colors.black,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
    paddingLeft: 4,
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
    borderRadius: 5,
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
});
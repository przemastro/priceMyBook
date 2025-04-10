import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  Animated,
  Easing
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
  confidence?: number;
}

const DEFECT_TYPES = [
  'tornPages', 'brokenSpine', 'waterDamage', 'missingPages',
  'heavyWear', 'stainedPages', 'looseBinding',
  'writtingMarks', 'foldedCorners', 'fadedCover'
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
    formatCurrency
  } = useAppContext();

  // States
  const [defects, setDefects] = useState<BookDefect[]>(DEFECT_TYPES.map(id => ({
    id,
    selected: false,
    priceReduction: getDefaultReduction(id),
  })));
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedDefect, setScannedDefect] = useState<BookDefect | null>(null);
  const [showDefectModal, setShowDefectModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState('');

  // Get params
  const isbn = params.isbn?.toString() || '';
  const originalPrice = params.originalPrice?.toString() || '0';
  const averagePrice = params.averagePrice?.toString() || originalPrice;
  const title = params.title?.toString() || t('bookInfo.unknownTitle');
  const authors = params.authors?.toString() || t('bookInfo.unknown');
  const editMode = params.editMode === 'true';
  const collectionName = params.collectionName?.toString();
  const bookIndex = params.bookIndex ? parseInt(params.bookIndex.toString()) : null;


  // Set selected collection
  useEffect(() => {
    if (collections.length > 0) {
      setSelectedCollection(editMode && collectionName ? collectionName : collections[0]);
    }
  }, [collections, editMode, collectionName]);

  // Request camera permission on mount
  useEffect(() => {
    const requestCameraPermission = async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
    };
    requestCameraPermission();
  }, []);

  // Animation effect
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
        .reduce((sum, defect) => sum + (defect.priceReduction || 0), 0);
    return basePrice * (1 - totalReduction / 100);
  };

  const finalPrice = calculateFinalPrice();

  const startScanning = () => {
    setIsScanning(true);
    setScanProgress(0);
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
          const defect = defects.find(d => d.id === randomDefect);
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
        d.id === scannedDefect.id ? { ...d, selected: true } : d
    ));
    setShowDefectModal(false);
  };

  const rejectDefect = () => {
    setShowDefectModal(false);
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
        [defect.id]: { selected: true, reduction: defect.priceReduction }
      }), {})
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

  if (!permission) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );
  }

  if (!permission.granted) {
    return (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>{t('status.noCameraAccess')}</Text>
          <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>
              {t('buttons.requestPermission')}
            </Text>
          </TouchableOpacity>
        </View>
    );
  }

  // Full-screen scanner view
  if (isScanning) {
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
              {/* Close button - top left */}
              <TouchableOpacity
                  style={styles.closeButton}
                  onPress={stopScanning}
              >
                <Ionicons name="close" size={32} color="white" />
              </TouchableOpacity>

              {/* Centered scan frame */}
              <Animated.View style={[styles.scanFrame, { transform: [{ scale: pulseAnim }] }]}>
                <View style={styles.scanFrameTopLeft} />
                <View style={styles.scanFrameTopRight} />
                <View style={styles.scanFrameBottomLeft} />
                <View style={styles.scanFrameBottomRight} />
              </Animated.View>

              {/* Bottom controls */}
              <View style={styles.bottomControls}>
                <Pressable
                    style={styles.scanButton}
                    onPress={takePictureAndAnalyze}
                >
                  <Text style={styles.scanButtonText}>
                    {t('labels.scanningDefects')}
                  </Text>
                </Pressable>

                {/* Progress indicator when analyzing */}
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

          {/* Defect modal */}
          <Modal
              visible={showDefectModal}
              transparent={true}
              animationType="slide"
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                {scannedDefect && (
                    <>
                      <Text style={styles.modalTitle}>
                        {t('labels.defectDetected')}: {t(`defects.${scannedDefect.id}`)}
                      </Text>
                      <Text style={styles.modalText}>
                        {t('labels.confidence')}: {scannedDefect.confidence}%
                      </Text>
                      <Text style={[typography.h2, { color: colors.primary }]}>
                        {t('labels.priceReduction')}: {scannedDefect.priceReduction}%
                      </Text>

                      <View style={styles.modalButtonsContainer}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.rejectButton]}
                            onPress={rejectDefect}
                        >
                          <Text style={styles.buttonText}>
                            {t('buttons.reject')}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.acceptButton]}
                            onPress={acceptDefect}
                        >
                          <Text style={styles.buttonText}>
                            {t('buttons.confirmDefect')}
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

  // Normal view when not scanning
  return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[typography.h1, styles.header]}>
          {editMode ? t('titles.editBook') : t('titles.analyzeCondition')}
        </Text>

        <View style={styles.priceSection}>
          <Text style={typography.body}>{t('bookInfo.isbn')}: {isbn || t('bookInfo.noISBN')}</Text>
          <Text style={typography.body}>
            {t('bookInfo.originalPrice')}: {formatCurrency(originalPrice)}
          </Text>
          {averagePrice !== originalPrice && (
              <Text style={typography.body}>
                {t('bookInfo.discountedPrice')}: {formatCurrency(averagePrice)}
              </Text>
          )}
          <View style={styles.finalPriceContainer}>
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

        <TouchableOpacity
            style={styles.startScanButton}
            onPress={startScanning}
        >
          <Text style={styles.startScanButtonText}>
            {t('buttons.startScanning')}
          </Text>
        </TouchableOpacity>

        <Text style={typography.h2}>{t('labels.selectCollection')}:</Text>
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

        <Text style={typography.h2}>{t('labels.selectDefects')}:</Text>
        {defects.map((defect, index) => (
            <View key={defect.id} style={styles.defectContainer}>
              <View style={styles.defectInfo}>
                <Switch
                    value={defect.selected}
                    onValueChange={(value) => {
                      const updatedDefects = [...defects];
                      updatedDefects[index].selected = value;
                      setDefects(updatedDefects);
                    }}
                    trackColor={{ false: colors.gray, true: colors.primary }}
                    thumbColor={colors.white}
                />
                <Text style={typography.body}>
                  {t(`defects.${defect.id}`)}
                  {defect.confidence && ` (${defect.confidence}%)`}
                </Text>
              </View>
              {defect.selected && (
                  <View style={styles.sliderContainer}>
                    <Slider
                        value={defect.priceReduction}
                        onValueChange={(value) => {
                          const updatedDefects = [...defects];
                          updatedDefects[index].priceReduction = value;
                          setDefects(updatedDefects);
                        }}
                        minimumValue={0}
                        maximumValue={100}
                        step={1}
                        style={styles.slider}
                        minimumTrackTintColor={colors.primary}
                        maximumTrackTintColor={colors.gray}
                        thumbTintColor={colors.primary}
                    />
                    <Text style={[typography.caption, { color: colors.error }]}>
                      {defect.priceReduction.toFixed(0)}%
                    </Text>
                  </View>
              )}
            </View>
        ))}

        <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveBook}
            disabled={isLoading}
        >
          {isLoading ? (
              <ActivityIndicator color="white" />
          ) : (
              <Text style={styles.saveButtonText}>
                {editMode ? t('buttons.saveChanges') : t('buttons.addToCollection')}
              </Text>
          )}
        </TouchableOpacity>
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
  },
  scanFrame: {
    position: 'absolute',
    top: '35%',
    alignSelf: 'center',
    width: 250,
    height: 350,
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
    borderRadius: 1,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonText: {
    color: colors.white,
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
    ...typography.body,
    color: 'white',
    textAlign: 'center',
  },
  container: {
    flexGrow: 1,
    padding: responsive.mediumMargin,
    backgroundColor: colors.background,
    marginTop: responsive.largeMargin,
    paddingBottom: 50,
  },
  header: {
    marginBottom: responsive.mediumMargin,
    textAlign: 'center',
  },
  priceSection: {
    marginBottom: responsive.mediumMargin,
    padding: responsive.smallMargin,
    backgroundColor: colors.white,
    borderRadius: 1,
  },
  finalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 1,
    marginBottom: responsive.mediumMargin,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: colors.white,
  },
  defectContainer: {
    marginBottom: responsive.smallMargin,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 1,
    backgroundColor: colors.white,
  },
  defectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    marginRight: responsive.smallMargin,
  },
  createCollectionButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.black,
    borderRadius: 1,
    marginBottom: responsive.mediumMargin,
  },
  createCollectionText: {
    color: colors.black,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsive.largeMargin,
    backgroundColor: colors.background,
  },
  permissionText: {
    ...typography.body,
    marginBottom: responsive.mediumMargin,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: colors.primary,
    padding: responsive.mediumMargin,
    borderRadius: 5,
  },
  permissionButtonText: {
    ...typography.body,
    color: colors.white,
  },
  startScanButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 1,
    borderWidth: 2,
    borderColor: colors.black,
    marginBottom: responsive.mediumMargin,
    minWidth: 100,
  },
  startScanButtonText: {
    ...typography.h2,
    color: colors.black,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: colors.background,
    borderRadius: 1,
    padding: 20,
  },
  modalTitle: {
    ...typography.h3,
    marginBottom: responsive.smallMargin,
  },
  modalText: {
    ...typography.body,
    marginBottom: responsive.smallMargin,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: responsive.mediumMargin,
    width: '100%',
  },
  modalButton: {
    justifyContent: 'space-between',
    borderRadius: 1,
    alignItems: 'center',
    marginHorizontal: responsive.smallMargin,
    marginVertical: responsive.mediumMargin,
  },
  acceptButton: {
    ...typography.body,
    backgroundColor: colors.background,
  },
  rejectButton: {
    ...typography.body,
    backgroundColor: colors.background,
  },
  buttonText: {
    ...typography.body,
    color: colors.black,
  },
  saveButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.black,
    paddingHorizontal: 20,
    borderRadius: 1,
    minWidth: 100,
  },
  saveButtonText: {
    ...typography.h2,
    color: colors.black,
  },
});
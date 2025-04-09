import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Switch, ScrollView, Alert, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import { useAppContext } from '@/context/AppContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, typography, responsive } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import i18n from "i18next";
import {ActivityIndicator} from "react-native"

interface BookDefect {
  id: string;
  selected: boolean;
  priceReduction: number;
}

export default function TabThreeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Deklaracje zmiennych z params
  const isbn = params.isbn?.toString() || '';
  const originalPrice = params.originalPrice?.toString() || '0';
  const averagePrice = params.averagePrice?.toString() || originalPrice;
  const title = params.title?.toString() || t('bookInfo.unknown');
  const authors = params.authors?.toString() || t('bookInfo.unknown');
  const editMode = params.editMode === 'true';
  const collectionName = params.collectionName?.toString();
  const bookIndex = params.bookIndex ? parseInt(params.bookIndex.toString()) : null;

  const {
    collections,
    addBookToCollection,
    removeBookFromCollection,
    exchangeRate,
    exchangeRateError,
    lastRateUpdate
  } = useAppContext();

  const defectTypes = [
    'tornPages', 'brokenSpine', 'waterDamage', 'missingPages',
    'heavyWear', 'stainedPages', 'looseBinding',
    'writtingMarks', 'foldedCorners', 'fadedCover'
  ];

  const [defects, setDefects] = useState<BookDefect[]>(() =>
      defectTypes.map((id) => ({
        id,
        selected: false,
        priceReduction: getDefaultReduction(id),
      }))
  );

  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    setIsLoading(true);
    await handleAddToCollection();
    setIsLoading(false);
  };

  const [selectedCollection, setSelectedCollection] = useState('');

  useEffect(() => {
    if (collections.length > 0) {
      setSelectedCollection(editMode && collectionName ? collectionName : collections[0]);
    }
  }, [collections, editMode, collectionName]);

  function getDefaultReduction(id: string): number {
    const reductions: Record<string, number> = {
      tornPages: 20, brokenSpine: 30, waterDamage: 40,
      missingPages: 50, heavyWear: 25, stainedPages: 15,
      looseBinding: 20, writtingMarks: 10, foldedCorners: 5,
      fadedCover: 10
    };
    return reductions[id] || 10;
  }

  const formatPrice = (price: number): string => {
    const priceNumber = Number(price) || 0;
    if (i18n.language === 'pl') {
      return `${priceNumber.toFixed(2)} PLN`;
    }
    const usdPrice = priceNumber / exchangeRate;
    return `$${usdPrice.toFixed(2)}`;
  };

  const calculateFinalPrice = (): number => {
    const basePrice = parseFloat(originalPrice) || 0;
    const totalReduction = defects
        .filter((defect) => defect.selected)
        .reduce((sum, defect) => sum + (defect.priceReduction || 0), 0);

    return basePrice * (1 - totalReduction / 100);
  };

  const finalPrice = calculateFinalPrice();

  const handleCollectionPress = () => {
    if (collections.length === 0) {
      Alert.alert(
          t('alerts.noCollectionsTitle'),
          t('alerts.noCollectionsMessage'),
          [
            { text: t('buttons.cancel'), style: 'cancel' },
            { text: t('buttons.createCollection'), onPress: () => router.push('/tabFour') }
          ]
      );
    }
  };

  const handleAddToCollection = () => {
    if (!isbn) {
      Alert.alert(t('alerts.error'), t('alerts.noISBN'));
      return;
    }

    const priceValue = finalPrice.toFixed(2);
    const bookData = {
      isbn,
      title,
      authors,
      price: priceValue,
      displayPrice: formatPrice(finalPrice),
      foundInApi: params.fromHistory !== 'true',
      originalPrice: originalPrice
    };

    if (editMode && collectionName && bookIndex !== null) {
      // Usuń książkę ze starej kolekcji jeśli zmieniono kolekcję
      if (selectedCollection !== collectionName) {
        removeBookFromCollection(collectionName, bookIndex);
      }
      addBookToCollection(selectedCollection, bookData);
      Alert.alert(t('alerts.success'), t('alerts.bookUpdated'));
      // Nie wykonujemy router.back() - pozostajemy na tabThree
    } else {
      if (!selectedCollection && collections.length > 0) {
        Alert.alert(t('alerts.error'), t('alerts.selectCollection'));
        return;
      }
      addBookToCollection(selectedCollection, bookData);
      Alert.alert(t('alerts.success'), `${t('alerts.bookAdded')}: ${selectedCollection}`);
      // Tutaj też nie przekierowujemy - pozostajemy na tabThree
    }
  };

  return (
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 50 }]}>
        <Text style={[typography.h1, styles.header]}>
          {editMode ? t('titles.editBook') : t('titles.analyzeCondition')}
        </Text>

        <View style={styles.priceSection}>
          <Text style={typography.body}>{t('bookInfo.isbn')}: {isbn || t('bookInfo.noISBN')}</Text>
          <Text style={typography.body}>
            {t('bookInfo.originalPrice')}: {formatPrice(parseFloat(originalPrice))}
          </Text>
          {averagePrice !== originalPrice && (
              <Text style={typography.body}>
                {t('bookInfo.discountedPrice')}: {formatPrice(parseFloat(averagePrice))}
              </Text>
          )}
          <View style={styles.finalPriceContainer}>
            <Text style={[typography.h2, { color: colors.primary }]}>
              {t('bookInfo.finalPrice')}: {formatPrice(finalPrice)}
            </Text>
            {i18n.language === 'en' && (
                <Text style={[typography.caption, { color: colors.gray, marginLeft: 10 }]}>
                  (1 USD = {exchangeRate.toFixed(2)} PLN)
                </Text>
            )}
          </View>
          {exchangeRateError && (
              <Text style={[typography.caption, { color: colors.error }]}>
                {t('alerts.exchangeRateError')}
              </Text>
          )}
        </View>

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
                onPress={handleCollectionPress}
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
            style={styles.createCollectionButton}
            onPress={handlePress}
            disabled={isLoading}
        >
          {isLoading ? (
              <ActivityIndicator color="white" />
          ) : (
              <Text style={styles.createCollectionText}>
                {editMode ? t('buttons.saveChanges') : t('buttons.addToCollection')}
              </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: responsive.mediumMargin,
    backgroundColor: colors.background,
    marginTop: responsive.largeMargin,
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
});
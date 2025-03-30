import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Switch, ScrollView, Alert, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import { useAppContext } from '@/context/AppContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, typography, responsive } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import i18n from "i18next";

interface BookDefect {
  id: string;
  selected: boolean;
  priceReduction: number;
}

export default function TabTwoScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    collections,
    addBookToCollection,
    exchangeRate,
    exchangeRateError,
    lastRateUpdate
  } = useAppContext();

  const params = useLocalSearchParams();
  const isbn = params.isbn?.toString() || '';
  const averagePrice = params.averagePrice?.toString() || '0';
  const title = params.title?.toString() || t('bookInfo.unknown');
  const authors = params.authors?.toString() || t('bookInfo.unknown');

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

  const [selectedCollection, setSelectedCollection] = useState('');

  useEffect(() => {
    if (collections.length > 0) {
      setSelectedCollection(collections[0]);
    }
  }, [collections]);

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
    const basePrice = parseFloat(averagePrice) || 0;
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
            { text: t('buttons.createCollection'), onPress: () => router.push('/three') }
          ]
      );
    }
  };

  const handleAddToCollection = () => {
    if (!isbn) {
      Alert.alert(t('alerts.error'), t('alerts.noISBN'));
      return;
    }

    if (!selectedCollection && collections.length > 0) {
      Alert.alert(t('alerts.error'), t('alerts.selectCollection'));
      return;
    }

    if (collections.length === 0) {
      handleCollectionPress();
      return;
    }

    const priceValue = finalPrice.toFixed(2);
    const bookData = {
      isbn,
      title,
      authors,
      price: priceValue,
      displayPrice: formatPrice(parseFloat(priceValue))
    };

    addBookToCollection(selectedCollection, bookData);
    Alert.alert(t('alerts.success'), `${t('alerts.bookAdded')}: ${selectedCollection}`);
  };

  return (
      <ScrollView contentContainerStyle={styles.container}>
        {exchangeRateError && (
            <Text style={[typography.caption, { color: colors.error }]}>
              {t('alerts.exchangeRateError')} (1 USD = {exchangeRate.toFixed(2)} PLN)
            </Text>
        )}

        {lastRateUpdate && (
            <Text style={[typography.caption, { color: colors.gray }]}>
              {t('labels.lastRateUpdate')}: {lastRateUpdate.toLocaleTimeString()}
            </Text>
        )}

        <Text style={typography.h1}>{t('titles.analyzeCondition')}</Text>
        <Text style={typography.body}>{t('bookInfo.isbn')}: {isbn || t('bookInfo.noISBN')}</Text>
        <Text style={typography.body}>
          {t('bookInfo.basePrice')}: {formatPrice(parseFloat(averagePrice))}
        </Text>
        <Text style={typography.h2}>
          {t('bookInfo.finalPrice')}: {formatPrice(finalPrice)}
        </Text>

        <Text style={typography.h2}>{t('labels.selectCollection')}:</Text>
        {collections.length > 0 ? (
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

        <Button
            title={t('buttons.addToCollection')}
            onPress={handleAddToCollection}
            color={colors.primary}
        />
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: responsive.mediumMargin,
    backgroundColor: colors.background,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: responsive.mediumMargin,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderColor: colors.gray,
    borderWidth: 1,
  },
  defectContainer: {
    marginBottom: responsive.smallMargin,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 10,
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
    backgroundColor: colors.primary,
    borderRadius: 10,
    marginBottom: responsive.mediumMargin,
  },
  createCollectionText: {
    color: colors.white,
    fontWeight: 'bold',
  },
});
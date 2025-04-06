import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Modal,
  Button,
  View,
  Text,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useAppContext } from '@/context/AppContext';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, responsive, modal, globalStyles } from '@/styles/styles';

const fetchBookInfoFromGoogleAPI = async (isbn: string) => {
  const API_KEY = ''; // Replace with your actual API key
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
        price: null,
        image: book.imageLinks?.thumbnail || null,
      };
    }
    throw new Error('No book found');
  } catch (error) {
    console.error('Error fetching book info:', error);
    throw error;
  }
};

export default function TabOneScreen() {
  const { t, i18n } = useTranslation();
  const {
    isbn,
    setISBN,
    addToScanHistory
  } = useAppContext();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [bookInfo, setBookInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [manualPrice, setManualPrice] = useState('');
  const [useManualPrice, setUseManualPrice] = useState(false);
  const router = useRouter();

  // Language change handling
  const [currentLang, setCurrentLang] = useState(i18n.language);
  useEffect(() => {
    const handleLanguageChange = () => setCurrentLang(i18n.language);
    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, [i18n]);

  // Camera permission
  const getBarCodeScannerPermissions = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  useFocusEffect(
      useCallback(() => {
        getBarCodeScannerPermissions();
        return () => {
          setScanned(false);
          setModalVisible(false);
          setBookInfo(null);
          setManualPrice('');
          setUseManualPrice(false);
        };
      }, [])
  );

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    setISBN(data);
    setLoading(true);
    setModalVisible(true);

    // Najpierw dodaj z foundInApi: false
    addToScanHistory({
      isbn: data,
      title: 'Searching in database...',
      authors: 'Please wait',
      price: '0',
      displayPrice: 'N/A',
      foundInApi: false,
      originalPrice: '0'
    });

    try {
      const book = await fetchBookInfoFromGoogleAPI(data);
      setBookInfo(book);

      // Aktualizuj z foundInApi: true
      addToScanHistory({
        isbn: data,
        title: book.title || 'Not Found',
        authors: book.authors || 'Unknown',
        price: book.price ? book.price : '0',
        displayPrice: book.price ? `$${book.price}` : 'N/A',
        foundInApi: !!book.title,
        originalPrice: book.price ? book.price : '0' // Zachowujemy oryginalną cenę
      });
    } catch (error) {
      console.error('Error:', error);
      // Aktualizuj status na nie znaleziony
      addToScanHistory({
        isbn: data,
        title: 'Not Found in database',
        authors: 'Unknown',
        price: '0',
        displayPrice: 'N/A',
        foundInApi: false,
        originalPrice: '0'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrice = () => {
    let averagePrice: string;

    if (useManualPrice && manualPrice) {
      averagePrice = parseFloat(manualPrice).toFixed(2);
    } else if (bookInfo?.price) {
      averagePrice = bookInfo.price.toFixed(2);
    } else {
      Alert.alert(t('alerts.error'), t('alerts.enterPrice'));
      return;
    }

    setModalVisible(false);
    router.push({
      pathname: '/tabThree',
      params: {
        isbn,
        averagePrice,
        title: bookInfo?.title || t('bookInfo.unknown'),
        authors: bookInfo?.authors || t('bookInfo.unknown'),
        fromHistory: 'false' // Jawnie oznaczamy źródło
      }
    });
  };

  const handleCancel = () => {
    setModalVisible(false);
    setScanned(false);
    setISBN(null);
    setBookInfo(null);
    setManualPrice('');
    setUseManualPrice(false);
  };

  if (hasPermission === null) {
    return <Text>{t('status.requestingPermission')}</Text>;
  }

  if (hasPermission === false) {
    return (
        <View style={globalStyles.container}>
          <Text>{t('status.noCameraAccess')}</Text>
          <Button
              title={t('buttons.requestPermission')}
              onPress={getBarCodeScannerPermissions}
          />
        </View>
    );
  }

  return (
      <View style={globalStyles.container}>
        {!scanned && (
            <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
            />
        )}

        <Modal
            animationType="slide"
            transparent
            visible={modalVisible}
            onRequestClose={handleCancel}
            key={currentLang}
        >
          <View style={modal.container}>
            <ScrollView contentContainerStyle={modal.content}>
              <Text style={typography.h1}>
                {t('bookInfo.scannedISBN')}: {isbn}
              </Text>

              {loading ? (
                  <ActivityIndicator size="large" color={colors.primary} />
              ) : (
                  <>
                    {bookInfo && !useManualPrice && (
                        <View>
                          <Text style={typography.body}>
                            {t('bookInfo.title')}: {bookInfo.title}
                          </Text>
                          <Text style={typography.body}>
                            {t('bookInfo.authors')}: {bookInfo.authors}
                          </Text>
                          {bookInfo.publisher && (
                              <Text style={typography.body}>
                                {t('bookInfo.publisher')}: {bookInfo.publisher}
                              </Text>
                          )}
                          {bookInfo.description && (
                              <Text style={typography.body}>
                                {t('bookInfo.description')}: {bookInfo.description}
                              </Text>
                          )}
                          <Text style={typography.h2}>
                            {t('bookInfo.averagePrice')}: {bookInfo.price ? `$${bookInfo.price.toFixed(2)}` : 'N/A'}
                          </Text>
                          {bookInfo.image && (
                              <Image
                                  source={{ uri: bookInfo.image }}
                                  style={styles.bookImage}
                              />
                          )}
                        </View>
                    )}

                    {useManualPrice && (
                        <View style={styles.manualPriceContainer}>
                          <TextInput
                              style={styles.input}
                              placeholder={t('placeholders.enterPrice')}
                              keyboardType="numeric"
                              value={manualPrice}
                              onChangeText={setManualPrice}
                          />
                        </View>
                    )}

                    <View style={styles.optionsContainer}>
                      <TouchableOpacity
                          style={[
                            styles.optionButton,
                            !useManualPrice && styles.selectedOption
                          ]}
                          onPress={() => setUseManualPrice(false)}
                      >
                        <Text style={typography.caption}>
                          {t('buttons.useAPIPrices')}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                          style={[
                            styles.optionButton,
                            useManualPrice && styles.selectedOption
                          ]}
                          onPress={() => setUseManualPrice(true)}
                      >
                        <Text style={typography.caption}>
                          {t('buttons.enterPriceManually')}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.buttonContainer}>
                      <Button
                          title={t('buttons.price')}
                          onPress={handlePrice}
                      />
                      <Button
                          title={t('buttons.cancel')}
                          onPress={handleCancel}
                      />
                    </View>
                  </>
              )}
            </ScrollView>
          </View>
        </Modal>
      </View>
  );
}

const styles = StyleSheet.create({
  manualPriceContainer: {
    width: '100%',
    marginBottom: responsive.mediumMargin,
  },
  input: {
    height: 50,
    borderColor: colors.gray,
    borderWidth: 1,
    paddingLeft: 15,
    width: '100%',
    borderRadius: 10,
    backgroundColor: colors.white,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: responsive.mediumMargin,
  },
  optionButton: {
    padding: 15,
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: responsive.smallMargin,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: responsive.mediumMargin,
  },
  bookImage: {
    width: 100,
    height: 150,
    marginTop: responsive.smallMargin,
    resizeMode: 'contain',
    borderRadius: 10,
  },
});
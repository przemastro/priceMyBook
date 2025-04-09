import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAppContext } from '@/context/AppContext';
import { colors, typography, responsive } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';

export default function TabFourScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [collectionName, setCollectionName] = useState('');
  const {
    collections,
    addCollection,
    books,
    removeBookFromCollection,
    removeCollection,
    exchangeRate,
    exchangeRateError,
    lastRateUpdate
  } = useAppContext();

  const formatCurrency = (price: string) => {
    const priceNumber = parseFloat(price) || 0;
    if (i18n.language === 'pl') {
      return `${priceNumber.toFixed(2)} PLN`;
    }
    const usdPrice = priceNumber / exchangeRate;
    return `$${usdPrice.toFixed(2)}`;
  };

  const handleEditBook = (collectionName: string, bookIndex: number) => {
    const book = books[collectionName][bookIndex];
    router.push({
      pathname: '/tabThree',
      params: {
        isbn: book.isbn,
        title: book.title,
        authors: book.authors,
        averagePrice: book.price,
        fromHistory: 'false',
        editMode: 'true',
        collectionName,
        bookIndex: bookIndex.toString()
      }
    });
  };

  const calculateCollectionTotal = (collectionName: string) => {
    const booksInCollection = books[collectionName] || [];
    return booksInCollection.reduce((total, book) => {
      return total + parseFloat(book.price || '0');
    }, 0);
  };

  const handleAddCollection = () => {
    if (!collectionName.trim()) {
      Alert.alert(t('alerts.error'), t('alerts.enterCollectionName'));
      return;
    }
    addCollection(collectionName);
    setCollectionName('');
  };

  const handleDeleteCollection = (collectionName: string) => {
    const bookCount = books[collectionName]?.length || 0;

    Alert.alert(
        t('alerts.confirmDeleteTitle'),
        bookCount > 0
            ? t('alerts.confirmDeleteMessage', {
              collectionName: collectionName,
              bookCount: bookCount
            })
            : t('alerts.confirmEmptyDeleteMessage', { collectionName: collectionName }),
        [
          {
            text: t('buttons.cancel'),
            style: 'cancel',
          },
          {
            text: t('buttons.confirm'),
            onPress: () => removeCollection(collectionName),
            style: 'destructive',
          },
        ],
        { cancelable: true }
    );
  };

  const handleExportCSV = async (collectionName: string) => {
    const booksInCollection = books[collectionName] || [];

    let csvContent = "Title,Authors,ISBN,Price (PLN),Found in API\n";

    booksInCollection.forEach(book => {
      csvContent += `"${book.title?.replace(/"/g, '""') || ''}","${book.authors?.replace(/"/g, '""') || ''}",${book.isbn},${book.price},${book.foundInApi ? 'Yes' : 'No'}\n`;
    });

    try {
      const fileUri = FileSystem.cacheDirectory + `${collectionName}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(t('alerts.error'), t('alerts.sharingNotAvailable'));
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: t('alerts.exportTitle', { collectionName }),
        UTI: 'public.comma-separated-values-text'
      });
    } catch (error) {
      Alert.alert(t('alerts.error'), t('alerts.exportError'));
      console.error('CSV Export failed:', error);
    }
  };

  return (
      <ScrollView contentContainerStyle={styles.container}>
        {exchangeRateError && (
            <Text style={[typography.caption, { color: colors.error, textAlign: 'center' }]}>
              {t('alerts.exchangeRateError')} (1 USD = {exchangeRate.toFixed(2)} PLN)
            </Text>
        )}

        <View style={styles.headerContainer}>
          <Text style={[typography.h1, styles.headerText]}>
            {t('titles.manageCollections')}
          </Text>
        </View>

        <View style={styles.addCollectionContainer}>
          <TextInput
              style={styles.input}
              placeholder={t('placeholders.enterCollectionName')}
              value={collectionName}
              onChangeText={setCollectionName}
              maxLength={50}
          />
          <TouchableOpacity
              style={[styles.addButton, !collectionName.trim() && styles.disabledButton]}
              onPress={handleAddCollection}
              disabled={!collectionName.trim()}
          >
            <Text style={styles.addButtonText}>{t('buttons.addCollection')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={typography.h2}>{t('labels.collections')}:</Text>

        {collections.length === 0 ? (
            <Text style={styles.noCollectionsText}>{t('labels.noCollections')}</Text>
        ) : (
            collections.map((collection) => {
              const total = calculateCollectionTotal(collection);
              return (
                  <View key={collection} style={styles.collectionContainer}>
                    <View style={styles.collectionHeader}>
                      <Text style={styles.collectionName}>{collection}</Text>
                      <View style={styles.collectionActions}>
                        <Text style={styles.totalText}>
                          {t('labels.total')}: {formatCurrency(total.toString())}
                        </Text>
                        <TouchableOpacity
                            onPress={() => handleExportCSV(collection)}
                            style={styles.exportButton}
                        >
                          <FontAwesome name="file-excel-o" size={18} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleDeleteCollection(collection)}
                            style={styles.deleteCollectionButton}
                        >
                          <FontAwesome name="trash" size={18} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {books[collection]?.length === 0 ? (
                        <Text style={styles.noBooksText}>{t('labels.noBooksInCollection')}</Text>
                    ) : (
                        books[collection]?.map((book, index) => (
                            <TouchableOpacity
                                key={`${collection}-${index}`}
                                onPress={() => handleEditBook(collection, index)}
                                style={styles.bookContainer}
                            >
                              <View style={styles.bookInfo}>
                                <Text style={styles.bookTitle}>{book.title}</Text>
                                <Text style={styles.bookAuthors}>{book.authors}</Text>
                                <Text style={styles.bookIsbn}>ISBN: {book.isbn}</Text>
                                <Text style={styles.bookPrice}>
                                  {t('bookInfo.finalPrice')}: {book.displayPrice}
                                </Text>
                                <Text style={[
                                  styles.bookStatus,
                                  { color: book.foundInApi ? colors.success : colors.error }
                                ]}>
                                  {book.foundInApi ? t('status.found') : t('status.notFound')}
                                </Text>
                              </View>
                              <TouchableOpacity
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    removeBookFromCollection(collection, index);
                                  }}
                                  style={styles.deleteButton}
                              >
                                <FontAwesome name="trash" size={18} color={colors.error} />
                              </TouchableOpacity>
                            </TouchableOpacity>
                        ))
                    )}
                  </View>
              );
            })
        )}
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: responsive.mediumMargin,
    backgroundColor: colors.background,
    marginTop: responsive.largeMargin
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: responsive.mediumMargin,
  },
  headerText: {
    textAlign: 'center',
    width: '100%',
  },
  addCollectionContainer: {
    flexDirection: 'row',
    marginBottom: responsive.largeMargin,
  },
  bookIsbn: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 4,
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: colors.gray,
    borderWidth: 1,
    paddingLeft: 15,
    borderRadius: 1,
    backgroundColor: colors.white,
    marginRight: responsive.smallMargin,
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.black,
    paddingHorizontal: 20,
    borderRadius: 1,
    minWidth: 100,
  },
  disabledButton: {
    opacity: 0.3,
  },
  addButtonText: {
    color: colors.black,
    fontWeight: 'bold',
  },
  collectionContainer: {
    marginBottom: responsive.largeMargin,
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 1,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: colors.gray,
  },
  collectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collectionName: {
    ...typography.h2,
    flex: 1,
  },
  totalText: {
    ...typography.h2,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  deleteCollectionButton: {
    marginLeft: 15,
    padding: 8,
  },
  exportButton: {
    marginLeft: 10,
    padding: 8,
  },
  bookContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: colors.gray,
  },
  bookInfo: {
    flex: 1,
    marginRight: 10,
  },
  bookTitle: {
    ...typography.body,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bookAuthors: {
    ...typography.caption,
    marginBottom: 4,
  },
  bookPrice: {
    ...typography.caption,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  noCollectionsText: {
    ...typography.body,
    textAlign: 'center',
    marginTop: 20,
    color: colors.gray,
  },
  noBooksText: {
    ...typography.body,
    textAlign: 'center',
    padding: 15,
    color: colors.gray,
  },
  bookStatus: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 4
  },
  price: {
    color: colors.primary,
    marginTop: 4
  }
});
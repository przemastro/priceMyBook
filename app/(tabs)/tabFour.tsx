import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAppContext } from '@/context/AppContext';
import {colors, responsive, typography} from '@/styles/styles';
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
            <Text style={[typography.caption, styles.rateError]}>
              {t('alerts.exchangeRateError')} (1 USD = {exchangeRate.toFixed(2)} PLN)
            </Text>
        )}

        <Text style={[typography.h1, styles.header]}>
          {t('titles.manageCollections')}
        </Text>

        <View style={styles.addCollectionContainer}>
          <TextInput
              style={styles.input}
              placeholder={t('placeholders.enterCollectionName')}
              placeholderTextColor="#888"
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

        <Text style={styles.sectionHeader}>{t('labels.collections')}:</Text>

        {collections.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('labels.noCollections')}</Text>
            </View>
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
                        <View style={styles.emptyBookContainer}>
                          <Text style={styles.emptyText}>{t('labels.noBooksInCollection')}</Text>
                        </View>
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
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    marginBottom: 24,
    textAlign: 'center',
    color: colors.black,
    marginTop: responsive.largeMargin,
  },
  sectionHeader: {
    color: colors.black,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
    paddingLeft: 4,
  },
  addCollectionContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: 'rgba(0,0,0,0.1)',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    marginRight: 12,
    color: colors.black,
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 5,
    paddingHorizontal: 20,
    minWidth: 100,
    height: 50,
  },
  disabledButton: {
    opacity: 0.5,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  collectionContainer: {
    marginBottom: 24,
    backgroundColor: colors.white,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
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
    ...typography.body,
    color: colors.primary,
    marginRight: 12,
  },
  deleteCollectionButton: {
    marginLeft: 12,
    padding: 8,
  },
  exportButton: {
    padding: 8,
  },
  bookContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  bookInfo: {
    flex: 1,
    marginRight: 12,
  },
  bookTitle: {
    ...typography.body,
    fontWeight: '500',
    marginBottom: 4,
  },
  bookAuthors: {
    ...typography.caption,
    marginBottom: 4,
    color: colors.gray,
  },
  bookIsbn: {
    ...typography.caption,
    color: colors.gray,
    marginBottom: 4,
  },
  bookPrice: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  emptyBookContainer: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
    color: colors.gray,
  },
  bookStatus: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  rateError: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  }
});
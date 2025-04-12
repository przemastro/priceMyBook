import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/context/AppContext';
import { colors, responsive, typography } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';
import Collapsible from 'react-native-collapsible';
import * as DocumentPicker from 'expo-document-picker';
import Papa from 'papaparse';
import { DocumentPickerResult, DocumentPickerSuccessResult } from 'expo-document-picker';

export default function TabFourScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [collectionName, setCollectionName] = useState('');
  const [collapsedCollections, setCollapsedCollections] = useState<Record<string, boolean>>({});
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

  const toggleCollapse = (collectionName: string) => {
    setCollapsedCollections(prev => ({
      ...prev,
      [collectionName]: !prev[collectionName]
    }));
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

  const calculateTotalBooks = () => {
    return collections.reduce((total, collection) => {
      return total + (books[collection]?.length || 0);
    }, 0);
  };

  const calculateTotalValue = () => {
    return collections.reduce((total, collection) => {
      return total + calculateCollectionTotal(collection);
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

  const handleImportCollection = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets?.[0];
      if (!file) {
        Alert.alert(t('alerts.error'), t('alerts.importError'));
        return;
      }

      const csvContent = await FileSystem.readAsStringAsync(file.uri);

      Papa.parse(csvContent, {
        header: true,
        complete: async (results) => {
          const data = results.data as Array<{
            Title: string;
            Authors: string;
            ISBN: string;
            'Price (PLN)': string;
            'Found in API': string;
          }>;

          if (data.length === 0) {
            Alert.alert(t('alerts.error'), t('alerts.importError'));
            return;
          }

          Alert.prompt(
              t('alerts.createCollection'),
              t('alerts.enterCollectionName'),
              [
                {
                  text: t('buttons.cancel'),
                  style: 'cancel',
                },
                {
                  text: t('buttons.confirm'),
                  onPress: (collectionName) => {
                    if (!collectionName?.trim()) {
                      Alert.alert(t('alerts.error'), t('alerts.enterCollectionName'));
                      return;
                    }

                    const booksToAdd = data.map(book => ({
                      title: book.Title || t('bookInfo.unknownTitle'),
                      authors: book.Authors || t('bookInfo.unknown'),
                      isbn: book.ISBN || '',
                      price: book['Price (PLN)'] || '0',
                      displayPrice: `${book['Price (PLN)'] || '0'} PLN`,
                      foundInApi: book['Found in API'] === 'Yes',
                      originalPrice: book['Price (PLN)'] || '0', // Dodane wymagane pole
                      defects: {}, // Dodane wymagane pole
                      averagePrice: book['Price (PLN)'] || '0' // Dodane wymagane pole
                    }));

                    // Dodaj nową kolekcję
                    addCollection(collectionName);

                    // Dodaj książki do kontekstu
                    booksToAdd.forEach(book => {
                      if (!books[collectionName]) {
                        books[collectionName] = [];
                      }
                      books[collectionName].push(book);
                    });

                    Alert.alert(t('alerts.success'), t('status.importSuccess'));
                  },
                },
              ],
              'plain-text'
          );
        },
        error: () => {
          Alert.alert(t('alerts.error'), t('alerts.importError'));
        },
      });
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert(t('alerts.error'), t('alerts.importError'));
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

        {/* Summary Section */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Ionicons name="library-outline" size={24} color={colors.primary} />
            <Text style={styles.summaryText}>
              {t('labels.totalCollections')} {collections.length}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="book-outline" size={24} color={colors.primary} />
            <Text style={styles.summaryText}>
              {t('labels.totalBooks')} {calculateTotalBooks()}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="pricetag-outline" size={24} color={colors.primary} />
            <Text style={styles.summaryText}>
              {t('labels.totalValue')} {formatCurrency(calculateTotalValue().toString())}
            </Text>
          </View>
        </View>

        {/* Add/Import Collection Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>{t('labels.manageCollections')}</Text>
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
          <TouchableOpacity
              style={styles.importButton}
              onPress={handleImportCollection}
          >
            <Ionicons name="cloud-upload-outline" size={20} color={colors.primary} />
            <Text style={styles.importButtonText}>{t('buttons.importCollection')}</Text>
          </TouchableOpacity>
        </View>

        {/* Collections List */}
        <Text style={styles.sectionHeader}>{t('labels.yourCollections')}:</Text>

        {collections.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('labels.noCollections')}</Text>
            </View>
        ) : (
            collections.map((collection) => {
              const total = calculateCollectionTotal(collection);
              const isCollapsed = collapsedCollections[collection];

              return (
                  <View key={collection} style={styles.collectionContainer}>
                    <TouchableOpacity
                        style={styles.collectionHeader}
                        onPress={() => toggleCollapse(collection)}
                        activeOpacity={0.8}
                    >
                      <View style={styles.collectionHeaderLeft}>
                        <Ionicons
                            name={isCollapsed ? "chevron-forward" : "chevron-down"}
                            size={20}
                            color={colors.primary}
                        />
                        <Text style={styles.collectionName}>{collection}</Text>
                      </View>
                      <View style={styles.collectionActions}>
                        <Text style={styles.totalText}>
                          {formatCurrency(total.toString())}
                        </Text>
                        <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation();
                              handleExportCSV(collection);
                            }}
                            style={styles.exportButton}
                        >
                          <FontAwesome name="file-excel-o" size={18} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation();
                              handleDeleteCollection(collection);
                            }}
                            style={styles.deleteCollectionButton}
                        >
                          <FontAwesome name="trash" size={18} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>

                    <Collapsible collapsed={isCollapsed}>
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
                                  <View style={styles.bookTitleRow}>
                                    <Ionicons
                                        name="arrow-forward"
                                        size={16}
                                        color={colors.primary}
                                        style={styles.bookArrowIcon}
                                    />
                                    <Text style={styles.bookTitle}>{book.title}</Text>
                                  </View>
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
                    </Collapsible>
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
  summaryContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryText: {
    marginTop: 8,
    ...typography.body,
    textAlign: 'center',
  },
  sectionContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
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
    marginBottom: 12,
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
  importButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 5,
    backgroundColor: 'rgba(74,108,247,0.05)',
  },
  importButtonText: {
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  collectionContainer: {
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 10,
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
  collectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  collectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collectionName: {
    ...typography.h2,
    marginLeft: 8,
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
  bookTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookArrowIcon: {
    marginRight: 8,
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
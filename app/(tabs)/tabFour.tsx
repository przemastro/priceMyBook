import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { colors, responsive, typography } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';
import Collapsible from 'react-native-collapsible';
import * as DocumentPicker from 'expo-document-picker';
import Papa from 'papaparse';
import { useAppContext } from '@/context/AppContext';

interface BookDefect {
  selected: boolean;
  reduction: number;
  count: number;
}

interface BookData {
  title: string;
  authors: string;
  isbn: string;
  price: string;
  displayPrice: string;
  foundInApi: boolean;
  originalPrice: string;
  defects: Record<string, BookDefect>;
  rating: number;
  averagePrice: string;
}

export default function TabFourScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [collectionName, setCollectionName] = useState('');
  const [collapsedCollections, setCollapsedCollections] = useState<Record<string, boolean>>({});
  const [isImporting, setIsImporting] = useState(false);

  const {
    collections,
    books,
    addCollection,
    removeCollection,
    addBooksToCollection,
    removeBookFromCollection,
    formatCurrency,
  } = useAppContext();

  const [importPreview, setImportPreview] = useState<{
    collectionName: string;
    books: BookData[];
    showPreview: boolean;
  } | null>(null);

  const handleAddCollection = () => {
    if (!collectionName.trim()) return;
    addCollection(collectionName);
    setCollectionName('');
  };

  const handleImportCollection = async () => {
    try {
      setIsImporting(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        setIsImporting(false);
        return;
      }

      const file = result.assets[0];
      const csvContent = await FileSystem.readAsStringAsync(file.uri);

      const parseResult = await new Promise<any[]>((resolve) => {
        Papa.parse(csvContent, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data)
        });
      });

      const validBooks = parseResult
          .filter(book => book.Title && book.ISBN && book['Price (PLN)'])
          .map(book => {
            const defects: Record<string, BookDefect> = {};
            try {
              if (book.Defects) {
                const parsedDefects = JSON.parse(book.Defects);
                Object.keys(parsedDefects).forEach(defectId => {
                  defects[defectId] = {
                    selected: true,
                    reduction: parsedDefects[defectId].reduction || 0,
                    count: parsedDefects[defectId].count || 0
                  };
                });
              }
            } catch (e) {
              console.error('Error parsing defects:', e);
            }

            return {
              title: book.Title.trim(),
              authors: (book.Authors || t('bookInfo.unknown')).toString().trim(),
              isbn: book.ISBN.trim(),
              price: book['Price (PLN)'].trim(),
              displayPrice: `${book['Price (PLN)']} PLN`,
              foundInApi: book['Found in API'] === 'Yes',
              originalPrice: book['Original Price'] || book['Price (PLN)'].trim(),
              defects: defects,
              rating: parseInt(book['Condition Rating'] || '10'),
              averagePrice: book['Average Price'] || book['Price (PLN)'].trim()
            } as BookData;
          });

      if (validBooks.length === 0) {
        Alert.alert(t('alerts.error'), t('alerts.noValidBooks'));
        setIsImporting(false);
        return;
      }

      const newCollectionName = file.name.replace('.csv', '').slice(0, 30);

      setImportPreview({
        collectionName: newCollectionName,
        books: validBooks,
        showPreview: true
      });

    } catch (error) {
      Alert.alert(t('alerts.error'), t('alerts.importError'));
      console.error('Import failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const confirmImport = async () => {
    if (!importPreview) return;

    try {
      addCollection(importPreview.collectionName);
      await addBooksToCollection(importPreview.collectionName, importPreview.books);

      Alert.alert(
          t('alerts.success'),
          t('status.importSuccess', {
            count: importPreview.books.length,
            name: importPreview.collectionName
          })
      );

      setImportPreview(null);
    } catch (error) {
      Alert.alert(t('alerts.error'), t('alerts.importSaveError'));
      console.error('Failed to save import:', error);
    }
  };

  const cancelImport = () => {
    setImportPreview(null);
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
    const booksToExport = books[collectionName] || [];

    let csvContent = "Title,Authors,ISBN,Original Price,Price (PLN),Average Price,Condition Rating,Found in API,Defects\n";

    booksToExport.forEach(book => {
      const defectsString = JSON.stringify(book.defects || {});

      csvContent += `"${book.title.replace(/"/g, '""')}",` +
          `"${book.authors.replace(/"/g, '""')}",` +
          `${book.isbn},` +
          `${book.originalPrice},` +
          `${book.price},` +
          `${book.averagePrice},` +
          `${book.rating},` +
          `${book.foundInApi ? 'Yes' : 'No'},` +
          `"${defectsString.replace(/"/g, '""')}"\n`;
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
      });
    } catch (error) {
      Alert.alert(t('alerts.error'), t('alerts.exportError'));
    }
  };

  const toggleCollapse = (collection: string) => {
    setCollapsedCollections(prev => ({
      ...prev,
      [collection]: !prev[collection]
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
        averagePrice: book.averagePrice,
        originalPrice: book.originalPrice,
        fromHistory: 'false',
        editMode: 'true',
        collectionName,
        bookIndex: bookIndex.toString()
      }
    });
  };

  const calculateCollectionTotal = (collection: string) => {
    return (books[collection] || []).reduce(
        (sum, book) => sum + parseFloat(book.price || '0'),
        0
    );
  };

  const calculateTotalBooks = () => {
    return collections.reduce(
        (total, collection) => total + (books[collection]?.length || 0),
        0
    );
  };

  const calculateTotalValue = () => {
    return collections.reduce(
        (total, collection) => total + calculateCollectionTotal(collection),
        0
    );
  };

  const formatDefectsSummary = (defects: Record<string, BookDefect> | undefined) => {
    if (!defects) return t('labels.noDefects');

    const defectList = Object.keys(defects)
        .filter(key => defects[key].selected)
        .map(key => `${t(`defects.${key}`)} (${defects[key].count}x)`);

    return defectList.length > 0
        ? defectList.join(', ')
        : t('labels.noDefects');
  };

  const ImportPreviewModal = () => {
    if (!importPreview) return null;

    return (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {t('labels.importPreview')} ({importPreview.books.length} {t('labels.books')})
            </Text>
            <Text style={styles.modalText}>
              {t('labels.collectionName')}: {importPreview.collectionName}
            </Text>

            <ScrollView style={styles.previewScroll}>
              {importPreview.books.slice(0, 5).map((book, index) => (
                  <View key={index} style={styles.previewBook}>
                    <Text style={styles.previewBookTitle}>{book.title}</Text>
                    <Text style={styles.previewBookIsbn}>ISBN: {book.isbn}</Text>
                    <Text style={styles.previewBookRating}>
                      {t('labels.condition')}: {book.rating}/10
                    </Text>
                    <Text style={styles.previewBookDefects}>
                      {t('labels.defects')}: {formatDefectsSummary(book.defects)}
                    </Text>
                  </View>
              ))}
              {importPreview.books.length > 5 && (
                  <Text style={styles.previewMore}>
                    + {importPreview.books.length - 5} {t('labels.moreBooks')}...
                  </Text>
              )}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={cancelImport}
              >
                <Text style={styles.cancelButtonText}>{t('buttons.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={confirmImport}
              >
                <Text style={styles.confirmButtonText}>{t('buttons.confirmImport')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
    );
  };

  return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[typography.h1, styles.header]}>
          {t('titles.manageCollections')}
        </Text>

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
              disabled={isImporting}
          >
            {isImporting ? (
                <ActivityIndicator color={colors.primary} />
            ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={20} color={colors.primary} />
                  <Text style={styles.importButtonText}>{t('buttons.importCollection')}</Text>
                </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeader}>{t('labels.yourCollections')}</Text>

        {collections.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('labels.noCollections')}</Text>
            </View>
        ) : (
            collections.map(collection => {
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
                          {formatCurrency(calculateCollectionTotal(collection).toString())}
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
                                  style={styles.bookContainer}
                                  onPress={() => handleEditBook(collection, index)}
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
                                  <Text style={styles.bookCondition}>
                                    {t('labels.condition')}: {book.rating}/10
                                  </Text>
                                  <Text style={styles.bookDefects}>
                                    {t('labels.defects')}: {formatDefectsSummary(book.defects)}
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

        <ImportPreviewModal />
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
    marginBottom: 24,
    textAlign: 'left',
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
    color: colors.grayDark,
  },
  bookIsbn: {
    ...typography.caption,
    color: colors.grayDark,
    marginBottom: 4,
  },
  bookPrice: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  bookCondition: {
    ...typography.caption,
    color: colors.primary,
    marginBottom: 4,
  },
  bookDefects: {
    ...typography.caption,
    color: colors.grayDark,
    marginBottom: 4,
    fontStyle: 'italic',
    fontSize: 12,
  },
  bookStatus: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 2,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.black,
  },
  modalText: {
    marginBottom: 10,
    color: colors.black,
  },
  previewScroll: {
    maxHeight: 200,
    marginVertical: 10,
  },
  previewBook: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  previewBookTitle: {
    fontWeight: '500',
    color: colors.black,
  },
  previewBookIsbn: {
    fontSize: 12,
    color: colors.grayDark,
  },
  previewBookRating: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
  },
  previewBookDefects: {
    fontSize: 12,
    color: colors.grayDark,
    marginTop: 4,
    fontStyle: 'italic',
  },
  previewMore: {
    textAlign: 'center',
    marginTop: 5,
    color: colors.gray,
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: colors.white,
  },
  confirmButton: {
    backgroundColor: colors.white,
  },
  cancelButtonText: {
    color: colors.primary,
  },
  confirmButtonText: {
    color: colors.primary,
  },
});
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator, Dimensions, Modal, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { colors, responsive, typography } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import Papa from 'papaparse';
import { useAppContext } from '@/context/AppContext';
import { FlashList } from '@shopify/flash-list';
import { FontAwesome5 } from '@expo/vector-icons';

const { width: viewportWidth } = Dimensions.get('window');

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
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

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
    setShowAddModal(false);
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
            onPress: () => {
              removeCollection(collectionName);
              if (selectedCollection === collectionName) {
                setSelectedCollection(null);
              }
            },
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

  const toggleCollection = (collection: string) => {
    setSelectedCollection(prev => prev === collection ? null : collection);
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
        bookIndex: bookIndex.toString(),
        defects: JSON.stringify(book.defects || {})
      }
    });
  };

  const calculateCollectionTotal = (collection: string) => {
    return (books[collection] || []).reduce(
        (sum, book) => sum + parseFloat(book.price || '0'),
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

  const renderCarouselItem = ({ item }: { item: string }) => {
    const bookCount = books[item]?.length || 0;
    const collectionTotal = calculateCollectionTotal(item);

    return (
        <TouchableOpacity
            style={[
              styles.carouselItem,
              selectedCollection === item && styles.selectedCarouselItem
            ]}
            onPress={() => toggleCollection(item)}
            activeOpacity={0.8}
        >
          <View style={styles.carouselContent}>
            <Text style={styles.carouselCollectionName} numberOfLines={1}>
              {item}
            </Text>
            <Text style={styles.carouselCollectionValue}>
              {formatCurrency(collectionTotal.toString())}
            </Text>
            <Text style={styles.carouselBookCount}>
              {bookCount} {t('labels.books')}
            </Text>
          </View>
        </TouchableOpacity>
    );
  };

  const AddCollectionModal = () => {
    const [localCollectionName, setLocalCollectionName] = useState('');

    const handleConfirm = () => {
      if (!localCollectionName.trim()) return;
      addCollection(localCollectionName);
      setLocalCollectionName('');
      setShowAddModal(false);
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={showAddModal}
            onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{t('labels.addNewCollection')}</Text>
              <TextInput
                  style={styles.modalInput}
                  placeholder={t('placeholders.enterCollectionName')}
                  placeholderTextColor="#888"
                  value={localCollectionName}
                  onChangeText={setLocalCollectionName}
                  autoFocus
                  onSubmitEditing={handleConfirm}
                  returnKeyType="done"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancelButtonText}>{t('buttons.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleConfirm}
                    disabled={!localCollectionName.trim()}
                >
                  <Text style={styles.confirmButtonText}>{t('buttons.add')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
    );
  };

  const ImportPreviewModal = () => {
    if (!importPreview) return null;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={!!importPreview}
            onRequestClose={cancelImport}
        >
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
        </Modal>
    );
  };

  return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[typography.h1, styles.header]}>
          {t('titles.manageCollections')}
        </Text>

        <View style={styles.totalValueContainer}>
          <Text style={styles.totalValueLabel}>{t('labels.totalValue')}</Text>
          <View style={styles.valueRow}>
            <View style={styles.coinIconContainer}>
              <FontAwesome5
                  name="coins"
                  size={20}
                  color={colors.primary}
              />
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.totalValueAmount}>
                {formatCurrency(calculateTotalValue().toString())}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.collectionActionsContainer}>
            <TouchableOpacity
                style={styles.subtleActionButton}
                onPress={() => setShowAddModal(true)}
                activeOpacity={0.6}
            >
              <Ionicons
                  name="add"
                  size={18}
                  color={colors.primary}
              />
              <Text style={styles.subtleActionText}>
                {t('buttons.addCollection')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.subtleActionButton}
                onPress={handleImportCollection}
                disabled={isImporting}
                activeOpacity={0.6}
            >
              {isImporting ? (
                  <ActivityIndicator
                      size="small"
                      color={colors.primary}
                  />
              ) : (
                  <Ionicons
                      name="cloud-upload"
                      size={18}
                      color={colors.primary}
                  />
              )}
              <Text style={styles.subtleActionText}>
                {t('buttons.importCollection')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.yourCollectionsContainer}>
            <Text style={styles.yourCollectionsLabel}>{t('labels.yourCollections')}</Text>
          </View>

          <View style={styles.carouselContainer}>
            <FlashList
                data={collections}
                renderItem={renderCarouselItem}
                horizontal
                estimatedItemSize={viewportWidth * 0.6}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.toString()}
            />
          </View>

          {collections.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('labels.noCollections')}</Text>
              </View>
          ) : selectedCollection && (
              <View style={styles.collectionDetails}>
                <View style={styles.collectionHeader}>
                  <Text style={styles.collectionName}>{selectedCollection}</Text>
                  <View style={styles.collectionActions}>
                    <TouchableOpacity
                        onPress={() => handleExportCSV(selectedCollection)}
                        style={styles.exportButton}
                    >
                      <FontAwesome name="file-excel-o" size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleDeleteCollection(selectedCollection)}
                        style={styles.deleteCollectionButton}
                    >
                      <FontAwesome name="trash" size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>

                {books[selectedCollection]?.length === 0 ? (
                    <View style={styles.emptyBookContainer}>
                      <Text style={styles.emptyText}>{t('labels.noBooksInCollection')}</Text>
                    </View>
                ) : (
                    books[selectedCollection]?.map((book, index) => (
                        <TouchableOpacity
                            key={`${selectedCollection}-${index}`}
                            style={styles.bookContainer}
                            onPress={() => handleEditBook(selectedCollection, index)}
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
                                removeBookFromCollection(selectedCollection, index);
                              }}
                              style={styles.deleteButton}
                          >
                            <FontAwesome name="trash" size={18} color={colors.error} />
                          </TouchableOpacity>
                        </TouchableOpacity>
                    ))
                )}
              </View>
          )}
        </View>

        <AddCollectionModal />
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
  totalValueContainer: {
    backgroundColor: colors.white,
    borderRadius: 5,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  totalValueLabel: {
    ...typography.body,
    color: colors.black,
    marginBottom: 4,
  },
  totalValueAmount: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
  sectionContainer: {
    backgroundColor: colors.white,
    borderRadius: 5,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  collectionActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
    gap: 10,
  },
  subtleActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.gray,
  },
  subtleActionText: {
    marginLeft: 6,
    color: colors.primary,
    fontSize: 14,
  },
  yourCollectionsContainer: {
    backgroundColor: colors.white,
    borderRadius: 5,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yourCollectionsLabel: {
    ...typography.body,
    color: colors.black,
    marginBottom: 4,
  },
  carouselContainer: {
    height: 140,
    marginBottom: 10,
  },
  carouselItem: {
    width: viewportWidth * 0.6 - 16,
    backgroundColor: colors.white,
    borderRadius: 5,
    padding: 12,
    height: 110,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.gray,
  },
  selectedCarouselItem: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  carouselContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselCollectionName: {
    ...typography.h3,
    textAlign: 'center',
    marginBottom: 5,
  },
  carouselCollectionValue: {
    ...typography.body,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  carouselBookCount: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.primary,
    color: colors.white,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    textAlign: 'center',
    fontSize: 12,
    overflow: 'hidden',
    minWidth: 24,
  },
  collectionDetails: {
    marginTop: 10,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  collectionName: {
    ...typography.h2,
    flex: 1,
  },
  collectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: colors.white,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
    color: colors.grayDark,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 20,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.black,
    marginBottom: 15,
  },
  modalInput: {
    height: 50,
    borderColor: 'rgba(0,0,0,0.1)',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    marginBottom: 15,
    color: colors.black,
    includeFontPadding: false,
    textAlignVertical: 'center',
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
    marginTop: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    color: colors.black,
  },
  confirmButtonText: {
    color: colors.white,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIconContainer: {
    marginTop: 13,
    backgroundColor: colors.white,
    borderRadius: 50,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    zIndex: 1,
    marginRight: -5,
  },
  priceContainer: {
    marginTop: 13,
    backgroundColor: colors.background,
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 16,
    paddingLeft: 10,
    borderWidth: 1,
    borderColor: colors.background,
    zIndex: 2,
  },
});
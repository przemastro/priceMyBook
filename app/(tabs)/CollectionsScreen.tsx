// app/(tabs)/collections.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Alert,
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Linking,
    TouchableOpacity
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { colors, typography } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import Papa from 'papaparse';
import { useAppContext } from '@/context/AppContext';
import i18n from "i18next";
import CollectionCarousel from '../components/collectionsScreen/CollectionCarousel';
import BooksCarousel from '../components/collectionsScreen/BooksCarousel';
import AddCollectionModal from '../components/collectionsScreen/AddCollectionModal';
import EditCollectionModal from '../components/collectionsScreen/EditCollectionModal';
import ImportPreviewModal from '../components/collectionsScreen/ImportPreviewModal';
import ListingModal from '../components/collectionsScreen/ListingModal';
import StatusChangeModal from '../components/collectionsScreen/StatusChangeModal';
import { BookData, BookDefect, BookUniqueness, MarketFactors, ListingStatus } from '../components/collectionsScreen/types';
import {BookAgeInfo} from "@/app/components/scanScreen/types";

const CollectionsScreen = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const [isImporting, setIsImporting] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
    const [validBooks, setValidBooks] = useState<Omit<BookData, 'createdAt'>[]>([]);
    const [importPreview, setImportPreview] = useState<{
        collectionName: string;
        books: BookData[]; // Zmieniamy z Omit<BookData, 'createdAt'>[] na BookData[]
        showPreview: boolean;
    } | null>(null);
    const [showListingModal, setShowListingModal] = useState(false);
    const [currentListingBook, setCurrentListingBook] = useState<{ collection: string; index: number } | null>(null);
    const [selectedPlatforms, setSelectedPlatforms] = useState<('amazon' | 'allegro' | 'olx')[]>([]);
    const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
    const [editingCollection, setEditingCollection] = useState<string | null>(null);
    const [newCollectionName, setNewCollectionName] = useState('');

    const {
        collections,
        books,
        addCollection,
        removeCollection,
        addBooksToCollection,
        removeBookFromCollection,
        renameCollection,
        updateBooksInCollection,
    } = useAppContext();

    const defaultUniqueness: BookUniqueness = {
        isMassMarket: false,
        isFirstEdition: false,
        isCollectorsEdition: false,
        hasAuthorSignature: false,
        isLimitedEdition: false,
        isPublisherDefunct: false
    };

    const defaultMarketFactors: MarketFactors = { demand: 'medium', supply: 'medium' };
    const defaultAgeInfo: BookAgeInfo = { years: 0 };
    const defaultListingStatus: ListingStatus = { status: 'notListed', platforms: [] };

    const handleAddCollection = (name: string) => {
        if (!name.trim()) return;
        addCollection(name);
        setShowAddModal(false);
    };

    const formatCurrency = (value: string): string => {
        try {
            const number = parseFloat(value);
            if (isNaN(number)) return value;

            return new Intl.NumberFormat(i18n.language, {
                style: 'currency',
                currency: 'PLN',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(number);
        } catch (error) {
            console.error('Error formatting currency:', error);
            return value;
        }
    };

    const handleEditCollection = async (oldName: string, newName: string): Promise<void> => {
        if (newName.trim() && newName.trim() !== oldName) {
            try {
                await renameCollection(oldName, newName.trim());
                if (selectedCollection === oldName) {
                    setSelectedCollection(newName.trim());
                }
                setShowEditModal(false);
            } catch (error) {
                Alert.alert(t('alerts.error'), t('alerts.renameError'));
            }
        }
    };

    const handleImportCollection = async () => {
        try {
            setIsImporting(true);
            const result = await DocumentPicker.getDocumentAsync({ type: 'text/csv', copyToCacheDirectory: true });
            if (result.canceled || !result.assets?.[0]) {
                setIsImporting(false);
                return;
            }

            const file = result.assets[0];
            const csvContent = await FileSystem.readAsStringAsync(file.uri);
            const parseResult = await new Promise<any[]>((resolve) => {
                Papa.parse(csvContent, { header: true, skipEmptyLines: true, complete: (results) => resolve(results.data) });
            });

            const importedBooks: BookData[] = parseResult
                .filter(book => book.Title && book.ISBN && book['Price (PLN)'])
                .map(book => ({
                    title: book.Title.trim(),
                    authors: (book.Authors || t('bookInfo.unknown')).toString().trim(),
                    isbn: book.ISBN.trim(),
                    price: book['Price (PLN)'].trim(),
                    displayPrice: `${book['Price (PLN)']} PLN`,
                    foundInApi: book['Found in API'] === 'Yes',
                    originalPrice: book['Original Price'] || book['Price (PLN)'].trim(),
                    defects: book.Defects ? JSON.parse(book.Defects) : {},
                    rating: parseInt(book['Condition Rating'] || '10'),
                    uniqueness: book.Uniqueness ? JSON.parse(book.Uniqueness) : defaultUniqueness,
                    marketFactors: book['Market Factors'] ? JSON.parse(book['Market Factors']) : defaultMarketFactors,
                    ageInfo: book['Age Info'] ? JSON.parse(book['Age Info']) : defaultAgeInfo,
                    listingStatus: book['Listing Status'] ? JSON.parse(book['Listing Status']) : defaultListingStatus,
                    createdAt: new Date().toISOString() // Dodaj to pole
                }));

            setImportPreview({
                collectionName: file.name.replace('.csv', '').slice(0, 30),
                books: importedBooks,
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
            await addBooksToCollection(importPreview.collectionName, importPreview.books); // Użyj importPreview.books zamiast validBooks
            Alert.alert(t('alerts.success'), t('status.importSuccess', { count: importPreview.books.length, name: importPreview.collectionName }));
            setImportPreview(null);
        } catch (error) {
            Alert.alert(t('alerts.error'), t('alerts.importSaveError'));
            console.error('Failed to save import:', error);
        }
    };

    const cancelImport = () => {
        setImportPreview(null);
        setValidBooks([]);
    };

    const handleDeleteCollection = (collectionName: string) => {
        const bookCount = books[collectionName]?.length || 0;
        Alert.alert(
            t('alerts.confirmDeleteTitle'),
            bookCount > 0 ?
                t('alerts.confirmDeleteMessage', { collectionName, bookCount }) :
                t('alerts.confirmEmptyDeleteMessage', { collectionName }),
            [
                { text: t('buttons.cancel'), style: 'cancel' },
                {
                    text: t('buttons.confirm'),
                    onPress: () => {
                        removeCollection(collectionName);
                        if (selectedCollection === collectionName) setSelectedCollection(null);
                    },
                    style: 'destructive'
                },
            ],
            { cancelable: true }
        );
    };

    const handleExportCSV = async (collectionName: string) => {
        const booksToExport = books[collectionName] || [];
        let csvContent = "Title,Authors,ISBN,Original Price,Price (PLN),Condition Rating,Found in API,Defects,Uniqueness,Market Factors,Age Info,Listing Status\n";

        booksToExport.forEach(book => {
            const defectsString = JSON.stringify(book.defects || {});
            const uniquenessString = JSON.stringify(book.uniqueness || defaultUniqueness);
            const marketFactorsString = JSON.stringify(book.marketFactors || defaultMarketFactors);
            const ageInfoString = JSON.stringify(book.ageInfo || defaultAgeInfo);
            const listingStatus = book.listingStatus || defaultListingStatus;
            const listingStatusString = JSON.stringify({
                status: listingStatus.status || 'notListed',
                platforms: listingStatus.platforms || [],
                listedDate: listingStatus.listedDate,
                soldDate: listingStatus.soldDate
            });

            csvContent += `"${book.title.replace(/"/g, '""')}","${book.authors.replace(/"/g, '""')}",${book.isbn},${book.originalPrice},${book.price},${book.rating},${book.foundInApi ? 'Yes' : 'No'},"${defectsString.replace(/"/g, '""')}","${uniquenessString.replace(/"/g, '""')}","${marketFactorsString.replace(/"/g, '""')}","${ageInfoString.replace(/"/g, '""')}","${listingStatusString.replace(/"/g, '""')}"\n`;
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
                dialogTitle: t('alerts.exportTitle', { collectionName })
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
            pathname: '/AnalysisScreen',
            params: {
                isbn: book.isbn,
                title: book.title,
                authors: book.authors,
                originalPrice: book.originalPrice,
                fromHistory: 'false',
                editMode: 'true',
                collectionName,
                bookIndex: bookIndex.toString(),
                defects: JSON.stringify(book.defects || {}),
                uniqueness: JSON.stringify(book.uniqueness || defaultUniqueness),
                marketFactors: JSON.stringify(book.marketFactors || defaultMarketFactors),
                ageInfo: JSON.stringify(book.ageInfo || defaultAgeInfo),
                listingStatus: JSON.stringify(book.listingStatus || defaultListingStatus)
            }
        });
    };

    const calculateCollectionTotal = (collection: string) => {
        return (books[collection] || []).reduce((sum, book) => sum + parseFloat(book.price || '0'), 0);
    };

    const calculateTotalValue = () => {
        return collections.reduce((total, collection) => total + calculateCollectionTotal(collection), 0);
    };

    const formatDefectsSummary = (defects: Record<string, BookDefect> | undefined) => {
        if (!defects) return t('labels.noDefects');
        const defectList = Object.keys(defects).filter(key => defects[key].selected).map(key => `${t(`defects.${key}`)} (${defects[key].count}x)`);
        return defectList.length > 0 ? defectList.join(', ') : t('labels.noDefects');
    };

    const formatUniquenessSummary = (uniqueness: BookUniqueness | undefined) => {
        if (!uniqueness) return t('labels.standardEdition');
        const uniqueFeatures = [];
        if (uniqueness.isFirstEdition) uniqueFeatures.push(t('labels.firstEdition'));
        if (uniqueness.isCollectorsEdition) uniqueFeatures.push(t('labels.collectorsEdition'));
        if (uniqueness.hasAuthorSignature) uniqueFeatures.push(t('labels.authorSignature'));
        if (uniqueness.isLimitedEdition) uniqueFeatures.push(t('labels.limitedEdition'));
        if (uniqueness.isPublisherDefunct) uniqueFeatures.push(t('labels.defunctPublisher'));
        return uniqueFeatures.length > 0 ? uniqueFeatures.join(', ') : t('labels.standardEdition');
    };

    const formatMarketFactorsSummary = (marketFactors: MarketFactors | undefined) => {
        if (!marketFactors) return '';
        return `${t(`labels.${marketFactors.demand}`)} ${t('labels.demand')}, ${t(`labels.${marketFactors.supply}`)} ${t('labels.supply')}`;
    };

    const formatListingStatus = (status?: ListingStatus): string => {
        if (!status) return t('listingStatus.notListed', 'Not listed');
        switch (status.status) {
            case 'listed':
                return t('listingStatus.listed', 'Listed on {{platforms}}', {
                    platforms: (status.platforms || []).map(p => t(`platforms.${p}`, p)).join(', ')
                });
            case 'sold':
                return t('listingStatus.sold', 'Sold');
            default:
                return t('listingStatus.notListed', 'Not listed');
        }
    };

    const handleListBook = (collection: string, index: number) => {
        const book = books[collection][index];
        setCurrentListingBook({collection, index});
        if (book.listingStatus?.status === 'notListed') {
            setSelectedPlatforms([]);
            setShowListingModal(true);
        } else if (book.listingStatus?.status === 'listed') {
            setShowStatusChangeModal(true);
        } else if (book.listingStatus?.status === 'sold') {
            setShowStatusChangeModal(true);
        }
    };

    const confirmListing = () => {
        if (!currentListingBook || selectedPlatforms.length === 0) return;
        const { collection, index } = currentListingBook;
        const book = books[collection][index];

        selectedPlatforms.forEach(platform => {
            let url = '';
            switch (platform) {
                case 'amazon': url = `https://sellercentral.amazon.com/listing/create?title=${encodeURIComponent(book.title)}`; break;
                case 'allegro': url = `https://allegro.pl/myaccount/offer/new?title=${encodeURIComponent(book.title)}`; break;
                case 'olx': url = `https://www.olx.pl/dodaj-ogloszenie/?query=${encodeURIComponent(book.title)}`; break;
            }
            Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
        });

        const updatedBooks = [...books[collection]];
        updatedBooks[index] = {
            ...updatedBooks[index],
            listingStatus: {
                status: 'listed',
                platforms: selectedPlatforms,
                listedDate: new Date().toISOString()
            }
        };
        updateBooksInCollection(collection, updatedBooks);
        setShowListingModal(false);
        setCurrentListingBook(null);
        setSelectedPlatforms([]);
        Alert.alert(t('alerts.success'), t('status.listedRedirect'));
    };

    const changeListingStatus = (newStatus: 'notListed' | 'listed' | 'sold') => {
        if (!currentListingBook) return;
        const {collection, index} = currentListingBook;
        const updatedBooks = [...books[collection]];
        const currentListingStatus = updatedBooks[index].listingStatus || defaultListingStatus;
        updatedBooks[index] = {
            ...updatedBooks[index],
            listingStatus: {
                ...currentListingStatus,
                status: newStatus,
                ...(newStatus === 'sold' ? {soldDate: new Date().toISOString()} : {})
            }
        };
        updateBooksInCollection(collection, updatedBooks);
        setShowStatusChangeModal(false);
        setCurrentListingBook(null);
    };

    const togglePlatform = (platform: 'amazon' | 'allegro' | 'olx') => {
        setSelectedPlatforms(prev =>
            prev.includes(platform)
                ? prev.filter(p => p !== platform)
                : [...prev, platform]
        );
    };

    const calculateActiveValue = () => {
        return collections.reduce((total, collection) => {
            return total + (books[collection] || []).reduce((sum, book) => {
                const status = book.listingStatus?.status || 'notListed';
                return status !== 'sold' ? sum + parseFloat(book.price || '0') : sum;
            }, 0);
        }, 0);
    };

    const calculateSoldValue = () => {
        return collections.reduce((total, collection) => {
            return total + (books[collection] || []).reduce((sum, book) => {
                const status = book.listingStatus?.status || 'notListed';
                return status === 'sold' ? sum + parseFloat(book.price || '0') : sum;
            }, 0);
        }, 0);
    };

    const getBookWord = (count: number, language: string) => {
        if (language === 'pl') {
            if (count === 1) return t('labels.book_one');
            if (count % 100 >= 12 && count % 100 <= 14) return t('labels.book_many');
            if ([2, 3, 4].includes(count % 10)) return t('labels.book_few');
            return t('labels.book_many');
        } else {
            return count === 1 ? t('labels.book_one') : t('labels.book_other');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={[typography.h1, styles.header]}></Text>
            <View style={styles.totalValueContainer}>
                <Text style={styles.totalValueLabel}>{t('labels.totalValue')}</Text>
                <View style={styles.valueRow}>
                    <TouchableOpacity
                        style={styles.coinIconContainer}
                        onPress={() => router.push({ pathname: '/settings', params: {initialTab: 'algorithm'} })}
                        activeOpacity={0.7}
                    >
                        <FontAwesome5 name="coins" size={20} color={colors.primary}/>
                    </TouchableOpacity>
                    <View style={styles.priceContainer}>
                        <Text style={styles.totalValueAmount}>{formatCurrency(calculateTotalValue().toString())}</Text>
                    </View>
                </View>
                <View style={styles.valueBreakdownContainer}>
                    <View style={styles.valueBreakdownRow}>
                        <Text style={styles.valueBreakdownLabel}>{t('labels.activeValue')}:</Text>
                        <Text style={[styles.valueBreakdownAmount, styles.activeValue]}>{formatCurrency(calculateActiveValue().toString())}</Text>
                    </View>
                    <View style={styles.valueBreakdownRow}>
                        <Text style={styles.valueBreakdownLabel}>{t('labels.soldValue')}:</Text>
                        <Text style={[styles.valueBreakdownAmount, styles.soldValue]}>{formatCurrency(calculateSoldValue().toString())}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.sectionContainer}>
                <View style={styles.topActionsRow}>
                    <View style={styles.actionButtonContainer}>
                        <TouchableOpacity
                            style={styles.addCollectionButton}
                            onPress={() => setShowAddModal(true)}
                            activeOpacity={0.6}
                        >
                            <Ionicons name="add-circle" size={24} color={colors.primary}/>
                            <Text style={styles.addCollectionText}>{t('buttons.addCollection')}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.actionButtonContainer}>
                        <TouchableOpacity
                            style={styles.importButton}
                            onPress={handleImportCollection}
                            disabled={isImporting}
                            activeOpacity={0.6}
                        >
                            {isImporting ? (
                                <ActivityIndicator size="small" color={colors.primary}/>
                            ) : (
                                <Ionicons name="cloud-upload" size={24} color={colors.primary}/>
                            )}
                            <Text style={styles.importButtonText}>{t('buttons.importCollection')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {collections.length > 0 ? (
                    <>
                        <View style={styles.divider}/>
                        <View style={styles.titleContainer}>
                            <Text style={styles.collectionsTitle}>{t('labels.yourCollections')}</Text>
                        </View>
                        <CollectionCarousel
                            collections={collections}
                            books={books}
                            selectedCollection={selectedCollection}
                            onSelectCollection={toggleCollection}
                            calculateCollectionTotal={calculateCollectionTotal}
                            onEditCollection={async (collection, newName) => {
                                await handleEditCollection(collection, newName);
                            }}
                            onDeleteCollection={handleDeleteCollection}
                            onExportCollection={handleExportCSV}
                            getBookWord={getBookWord}
                            formatCurrency={formatCurrency}
                        />
                        {selectedCollection && (
                            <View style={styles.collectionDetails}>
                                {books[selectedCollection]?.length === 0 ? (
                                    <View style={styles.emptyBookContainer}>
                                        <Text style={styles.emptyText}>{t('labels.noBooksInCollection')}</Text>
                                    </View>
                                ) : (
                                    <BooksCarousel
                                        books={books[selectedCollection]}
                                        collectionName={selectedCollection}
                                        onEditBook={(index) => handleEditBook(selectedCollection, index)}
                                        onDeleteBook={(index) => removeBookFromCollection(selectedCollection, index)}
                                        onListBook={(index) => handleListBook(selectedCollection, index)}
                                        formatDefectsSummary={formatDefectsSummary}
                                        formatUniquenessSummary={formatUniquenessSummary}
                                        formatMarketFactorsSummary={formatMarketFactorsSummary}
                                        formatListingStatus={formatListingStatus}
                                    />
                                )}
                            </View>
                        )}
                    </>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>{t('labels.noCollections')}</Text>
                    </View>
                )}
            </View>
            <AddCollectionModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onConfirm={handleAddCollection}
            />
            <EditCollectionModal
                visible={showEditModal}
                onClose={() => setShowEditModal(false)}
                onConfirm={(newName) => editingCollection && handleEditCollection(editingCollection, newName)}
                currentName={editingCollection || ''}
            />
            <ImportPreviewModal
                importPreview={importPreview}
                onCancel={cancelImport}
                onConfirm={confirmImport}
                formatDefectsSummary={formatDefectsSummary}
                formatUniquenessSummary={formatUniquenessSummary}
                formatMarketFactorsSummary={formatMarketFactorsSummary}
                formatListingStatus={formatListingStatus}
            />
            <ListingModal
                visible={showListingModal}
                onClose={() => setShowListingModal(false)}
                selectedPlatforms={selectedPlatforms}
                onTogglePlatform={togglePlatform}
                onConfirm={confirmListing}
            />
            <StatusChangeModal
                visible={showStatusChangeModal}
                onClose={() => setShowStatusChangeModal(false)}
                currentStatus={currentListingBook ? books[currentListingBook.collection][currentListingBook.index].listingStatus?.status || 'notListed' : 'notListed'}
                onChangeStatus={changeListingStatus}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        paddingTop: 6,
        backgroundColor: '#f8f9fa',
    },
    header: {
        marginBottom: 4,
        textAlign: 'left',
        color: colors.black,
        marginTop: 20,
    },
    totalValueContainer: {
        backgroundColor: colors.white,
        borderRadius: 2,
        padding: 20,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    totalValueLabel: {
        fontSize: 16,
        color: colors.black,
        marginBottom: 4,
    },
    totalValueAmount: {
        fontSize: 18,
        color: colors.primary,
        fontWeight: 'bold',
    },
    sectionContainer: {
        backgroundColor: colors.white,
        borderRadius: 2,
        padding: 16,
        marginBottom: 0,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    collectionsTitle: {
        fontSize: 16,
        color: colors.black,
        marginTop: 0,
        marginBottom: 0,
    },
    collectionDetails: {
        marginTop: 10,
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: colors.white,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        marginTop: 20
    },
    emptyBookContainer: {
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        color: colors.grayDark,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    coinIconContainer: {
        marginTop: 13,
        backgroundColor: colors.white,
        borderRadius: 20,
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
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 16,
        paddingLeft: 10,
        borderWidth: 1,
        borderColor: colors.background,
        zIndex: 2,
    },
    divider: {
        height: 1,
        backgroundColor: colors.gray,
        marginBottom: 12,
    },
    titleContainer: {
        height: 50,
        marginBottom: 10,
        alignItems: 'center'
    },
    valueBreakdownContainer: {
        width: '100%',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    valueBreakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    valueBreakdownLabel: {
        fontSize: 14,
        color: colors.grayDark,
    },
    valueBreakdownAmount: {
        fontSize: 14,
        fontWeight: '500',
    },
    activeValue: {
        color: colors.primary,
    },
    soldValue: {
        color: colors.success,
    },
    topActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    actionButtonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    addCollectionButton: {
        alignItems: 'center',
        padding: 8,
    },
    addCollectionText: {
        marginTop: 4,
        color: colors.primary,
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    importButton: {
        alignItems: 'center',
        padding: 8,
    },
    importButtonText: {
        marginTop: 4,
        color: colors.primary,
        fontSize: 14,
        textAlign: 'center',
    },
});

export default CollectionsScreen;
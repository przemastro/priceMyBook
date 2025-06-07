import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    Image,
    ActivityIndicator,
    Alert
} from 'react-native';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import Animated, { interpolate, useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { BookData, BookDefect, BookUniqueness, MarketFactors, ListingStatus } from '../types';
import { CustomAlertModal } from '../../alerts/CustomAlertModal';
import Carousel from "react-native-reanimated-carousel";
import ExportToPDFButton from "@/app/components/collectionsScreen/buttons/ExportToPDFButton";


const BOOK_CARD_WIDTH = Dimensions.get('window').width * 0.8;
const BOOK_CARD_HEIGHT = Dimensions.get('window').height * 0.58;
const ACTION_BUTTONS_WIDTH = 60;
const SCROLL_BUTTON_HEIGHT = 24;

interface BooksCarouselProps {
    books: BookData[];
    collectionName: string;
    onEditBook: (bookIndex: number) => void;
    onDeleteBook: (bookIndex: number) => void;
    onListBook: (bookIndex: number) => void;
    formatDefectsSummary: (defects: Record<string, BookDefect> | undefined) => string;
    formatUniquenessSummary: (uniqueness: BookUniqueness | undefined) => string;
    formatMarketFactorsSummary: (marketFactors: MarketFactors | undefined) => string;
    formatListingStatus: (status?: ListingStatus) => string;
}

interface BookItemProps {
    book: BookData;
    index: number;
    animationValue: SharedValue<number>;
    onEdit: () => void;
    onDelete: () => void;
    onList: () => void;
    formatDefectsSummary: (defects: Record<string, BookDefect> | undefined) => string;
    formatUniquenessSummary: (uniqueness: BookUniqueness | undefined) => string;
    formatMarketFactorsSummary: (marketFactors: MarketFactors | undefined) => string;
    formatListingStatus: (status?: ListingStatus) => string;
}

const BookItem: React.FC<BookItemProps> = ({
                                               book,
                                               animationValue,
                                               onEdit,
                                               onDelete,
                                               onList,
                                               formatDefectsSummary,
                                               formatUniquenessSummary,
                                               formatMarketFactorsSummary,
                                               formatListingStatus
                                           }) => {
    const { t } = useTranslation();
    const scrollViewRef = useRef<ScrollView>(null);
    const [exporting, setExporting] = useState(false);

    const animatedStyle = useAnimatedStyle(() => {
        const scale = interpolate(animationValue.value, [-1, 0, 1], [0.9, 1, 0.9]);
        return { transform: [{ scale }] };
    });

    const scrollContentUp = () => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    };

    const scrollContentDown = () => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    };

    const handleExportToCSV = async () => {
        setExporting(true);
        try {
            const headers = [
                'Title', 'Authors', 'ISBN', 'Original Price', 'Price',
                'Condition Rating', 'Image URI', 'Defects', 'Uniqueness',
                'Market Factors', 'Age Info', 'Listing Status'
            ].join(',');

            const row = [
                `"${book.title.replace(/"/g, '""')}"`,
                `"${book.authors.replace(/"/g, '""')}"`,
                book.isbn,
                book.originalPrice,
                book.price,
                book.rating,
                book.imageUri || '',
                `"${JSON.stringify(book.defects || {}).replace(/"/g, '""')}"`,
                `"${JSON.stringify(book.uniqueness || {}).replace(/"/g, '""')}"`,
                `"${JSON.stringify(book.marketFactors || {}).replace(/"/g, '""')}"`,
                `"${JSON.stringify(book.ageInfo || {}).replace(/"/g, '""')}"`,
                `"${JSON.stringify(book.listingStatus || {}).replace(/"/g, '""')}"`
            ].join(',');

            const csvContent = `${headers}\n${row}`;
            const fileUri = FileSystem.cacheDirectory + `${book.isbn}_export.csv`;

            await FileSystem.writeAsStringAsync(fileUri, csvContent);

            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert(t('alerts.error'), t('alerts.sharingNotAvailable'));
                return;
            }

            await Sharing.shareAsync(fileUri, {
                mimeType: 'text/csv',
                dialogTitle: `${book.title} - Export`
            });
        } catch (error) {
            Alert.alert(t('alerts.error'), t('alerts.exportError'));
            console.error('Export failed:', error);
        } finally {
            setExporting(false);
        }
    };

    const renderListingButton = () => {
        const listingStatus = book.listingStatus || { status: 'notListed', platforms: [] };
        const buttonConfig = {
            notListed: { icon: 'upload', color: colors.primary, text: t('buttons.list') },
            listed: { icon: 'check', color: colors.success, text: t('listingStatus.listed') },
            sold: { icon: 'check-double', color: colors.grayDark, text: t('buttons.sold') }
        };
        const {icon, color, text} = buttonConfig[listingStatus.status] || buttonConfig.notListed;

        return (
            <TouchableOpacity
                style={styles.actionButton}
                onPress={onList}
                disabled={exporting}
            >
                <LinearGradient
                    colors={[`${color}`, `${color}`]}
                    style={styles.actionIconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <FontAwesome5 name={icon} size={20} color={colors.white} />
                </LinearGradient>
                <Text style={styles.actionButtonText}>{text}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.bookItemContainer}>
            <Animated.View style={[styles.bookCard, animatedStyle]}>
                <LinearGradient
                    colors={[colors.buttonSelected1, colors.buttonSelected2]}
                    style={styles.bookCardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={onDelete}
                        activeOpacity={0.5}
                        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                    >
                        <MaterialIcons name="close" size={18} color={colors.primary} />
                    </TouchableOpacity>

                    <View style={styles.imageContainer}>
                        {book.imageUri ? (
                            <Image
                                source={{ uri: book.imageUri }}
                                style={styles.bookImage}
                                resizeMode="contain"
                            />
                        ) : (
                            <LinearGradient
                                colors={['rgba(0,0,0,0.03)', 'rgba(0,0,0,0.05)']}
                                style={styles.bookImagePlaceholder}
                            >
                                <MaterialIcons name="book" size={50} color={colors.primary} />
                            </LinearGradient>
                        )}
                    </View>

                    <View style={styles.scrollButtonsContainer}>
                        <TouchableOpacity
                            style={styles.scrollButton}
                            onPress={scrollContentUp}
                        >
                            <MaterialIcons name="keyboard-arrow-up" size={20} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.bookCardContent}>
                            <View style={styles.bookCardHeader}>
                                <Text style={styles.bookCardTitle} numberOfLines={2}>{book.title}</Text>
                                <Text style={styles.bookCardAuthors} numberOfLines={1}>{book.authors}</Text>
                            </View>

                            <View style={styles.bookDetails}>
                                <Text style={styles.bookCardIsbn}>ISBN: {book.isbn}</Text>
                                {book.publisher && (
                                    <Text style={styles.bookCardPublisher}>
                                        {t('bookInfo.publisher')}: {book.publisher}
                                    </Text>
                                )}
                                <Text style={styles.bookCardPrice}>{t('bookInfo.finalPrice')}: {book.displayPrice}</Text>
                                <Text style={styles.bookCardCondition}>{t('labels.condition')}: {book.rating}/10</Text>

                                {book.description && (
                                    <Text style={styles.bookCardDescription}>
                                        {t('bookInfo.description')}: {book.description}
                                    </Text>
                                )}

                                <Text style={styles.bookCardDefects}>
                                    {t('labels.defects')}: {formatDefectsSummary(book.defects)}
                                </Text>

                                <Text style={styles.bookCardUniqueness}>
                                    {t('labels.uniqueness')}: {formatUniquenessSummary(book.uniqueness)}
                                </Text>

                                {book.marketFactors && (
                                    <Text style={styles.bookCardMarket}>
                                        {t('labels.marketFactors')}: {formatMarketFactorsSummary(book.marketFactors)}
                                    </Text>
                                )}

                                {book.ageInfo && (
                                    <Text style={styles.bookCardAge}>
                                        {t('labels.age')}: {book.ageInfo.years} {t('labels.years')}
                                    </Text>
                                )}

                                <Text style={styles.bookCardListingStatus}>
                                    {t('labels.listingStatus')}: {formatListingStatus(book.listingStatus)}
                                </Text>
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.scrollButtonsContainer}>
                        <TouchableOpacity
                            style={styles.scrollButton}
                            onPress={scrollContentDown}
                        >
                            <MaterialIcons name="keyboard-arrow-down" size={20} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </Animated.View>

            <View style={styles.actionsColumn}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => e.stopPropagation()}
                >
                    {/* Zastąp obecny kod tym: */}
                    <View style={styles.actionButton}>
                        <LinearGradient
                            colors={[`${colors.primary}20`, `${colors.primary}10`]}
                            style={styles.actionIconContainer}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <ExportToPDFButton
                                book={book}
                                formatDefectsSummary={formatDefectsSummary}
                                formatUniquenessSummary={formatUniquenessSummary}
                                formatMarketFactorsSummary={formatMarketFactorsSummary}
                                formatListingStatus={formatListingStatus}
                            />
                        </LinearGradient>
                        <Text style={styles.actionButtonText}>{t('buttons.exportPDF')}</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onEdit}
                >
                    <LinearGradient
                        colors={[`${colors.primary}20`, `${colors.primary}10`]}
                        style={styles.actionIconContainer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name="create" size={20} color={colors.primary} />
                    </LinearGradient>
                    <Text style={styles.actionButtonText}>{t('buttons.edit')}</Text>
                </TouchableOpacity>

                {renderListingButton()}
            </View>
        </View>
    );
};

const BooksCarousel: React.FC<BooksCarouselProps> = ({
                                                         books,
                                                         collectionName,
                                                         onEditBook,
                                                         onDeleteBook,
                                                         onListBook,
                                                         formatDefectsSummary,
                                                         formatUniquenessSummary,
                                                         formatMarketFactorsSummary,
                                                         formatListingStatus
                                                     }) => {
    const { t } = useTranslation();
    const carouselRef = useRef<any>(null);
    const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);
    const [bookToDeleteIndex, setBookToDeleteIndex] = useState<number | null>(null);

    const handleConfirmDelete = () => {
        if (bookToDeleteIndex !== null) {
            onDeleteBook(bookToDeleteIndex);
        }
        setDeleteAlertVisible(false);
        setBookToDeleteIndex(null);
    };

    const handleGoToStart = () => {
        carouselRef.current?.scrollTo({ index: 0, animated: true });
    };

    const handleGoToEnd = () => {
        carouselRef.current?.scrollTo({ index: books.length - 1, animated: true });
    };

    const handlePrev = () => {
        carouselRef.current?.prev();
    };

    const handleNext = () => {
        carouselRef.current?.next();
    };

    return (
        <View style={styles.booksCarouselContainer}>
            <Carousel
                ref={carouselRef}
                loop={false}
                style={styles.booksCarousel}
                width={BOOK_CARD_WIDTH + ACTION_BUTTONS_WIDTH}
                height={BOOK_CARD_HEIGHT}
                data={books}
                renderItem={({ item, index, animationValue }) => (
                    <BookItem
                        book={item}
                        index={index}
                        animationValue={animationValue}
                        onEdit={() => onEditBook(index)}
                        onDelete={() => {
                            setBookToDeleteIndex(index);
                            setDeleteAlertVisible(true);
                        }}
                        onList={() => onListBook(index)}
                        formatDefectsSummary={formatDefectsSummary}
                        formatUniquenessSummary={formatUniquenessSummary}
                        formatMarketFactorsSummary={formatMarketFactorsSummary}
                        formatListingStatus={formatListingStatus}
                    />
                )}
                scrollAnimationDuration={800}
            />

            <View style={styles.navigationContainer}>
                <TouchableOpacity
                    onPress={handleGoToStart}
                    style={styles.navButton}
                    disabled={books.length <= 1}
                >
                    <MaterialIcons
                        name="first-page"
                        size={24}
                        color={books.length > 1 ? colors.primary : colors.gray}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handlePrev}
                    style={styles.navButton}
                    disabled={books.length <= 1}
                >
                    <MaterialIcons
                        name="chevron-left"
                        size={30}
                        color={books.length > 1 ? colors.primary : colors.gray}
                    />
                </TouchableOpacity>

                <View style={styles.navSpacer} />

                <TouchableOpacity
                    onPress={handleNext}
                    style={styles.navButton}
                    disabled={books.length <= 1}
                >
                    <MaterialIcons
                        name="chevron-right"
                        size={30}
                        color={books.length > 1 ? colors.primary : colors.gray}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleGoToEnd}
                    style={styles.navButton}
                    disabled={books.length <= 1}
                >
                    <MaterialIcons
                        name="last-page"
                        size={24}
                        color={books.length > 1 ? colors.primary : colors.gray}
                    />
                </TouchableOpacity>
            </View>

            <CustomAlertModal
                visible={deleteAlertVisible}
                title={t('alerts.deleteBookTitle')}
                message={t('alerts.deleteBookMessage')}
                confirmText={t('buttons.delete')}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteAlertVisible(false)}
                type="warning"
                buttonFullWidth={true}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    booksCarouselContainer: {
        marginTop: 30,
        paddingBottom: 80,
        backgroundColor: colors.grayLight,
        height: BOOK_CARD_HEIGHT + 120,
        position: 'relative',
    },
    booksCarousel: {
        width: '100%',
    },
    bookItemContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '95%',
    },
    bookCard: {
        width: BOOK_CARD_WIDTH - 80,
        height: BOOK_CARD_HEIGHT - 80,
        borderRadius: 12,
        marginLeft: 0,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
    },
    bookCardGradient: {
        flex: 1,
        padding: 16,
    },
    deleteButton: {
        position: 'absolute',
        right: 12,
        top: 12,
        padding: 4,
        borderRadius: 12,
        zIndex: 10,
    },
    imageContainer: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    bookImage: {
        width: 120,
        height: 160,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.grayLight,
    },
    bookImagePlaceholder: {
        width: 120,
        height: 160,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.grayLight,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 16,
    },
    scrollButtonsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: SCROLL_BUTTON_HEIGHT,
    },
    scrollButton: {
        padding: 4,
    },
    bookCardContent: {
        flex: 1,
    },
    bookCardHeader: {
        marginBottom: 12,
    },
    bookCardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
        textAlign: 'center',
    },
    bookCardAuthors: {
        fontSize: 14,
        color: colors.primary,
        textAlign: 'center',
    },
    bookDetails: {
        flex: 1,
    },
    bookCardIsbn: {
        fontSize: 14,
        color: colors.primary,
        marginBottom: 4,
        textAlign: 'center',
    },
    bookCardPrice: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: '600',
        marginBottom: 6,
        textAlign: 'center',
    },
    bookCardCondition: {
        fontSize: 14,
        color: colors.primary,
        marginBottom: 12,
        textAlign: 'center',
    },
    bookCardDefects: {
        fontSize: 12,
        color: colors.black,
        marginBottom: 4,
        textAlign: 'center',
    },
    bookCardUniqueness: {
        fontSize: 12,
        color: colors.black,
        marginBottom: 4,
        textAlign: 'center',
    },
    bookCardMarket: {
        fontSize: 12,
        color: colors.black,
        marginBottom: 4,
        textAlign: 'center',
    },
    bookCardAge: {
        fontSize: 12,
        color: colors.black,
        marginBottom: 4,
        textAlign: 'center',
    },
    bookCardListingStatus: {
        fontSize: 12,
        color: colors.black,
        marginBottom: 4,
        textAlign: 'center',
    },
    actionsColumn: {
        width: ACTION_BUTTONS_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    actionButton: {
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
    },
    actionIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    actionButtonText: {
        fontSize: 12,
        textAlign: 'center',
        color: colors.grayDark,
        fontWeight: '500',
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 100,
        width: '100%',
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: colors.grayLight,
        zIndex: 100,
        elevation: 10,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    navButton: {
        padding: 10,
        marginHorizontal: 5,
        backgroundColor: colors.white,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.gray,
    },
    navSpacer: {
        width: 20,
    },
    bookCardPublisher: {
        fontSize: 12,
        color: colors.black,
        marginBottom: 4,
        textAlign: 'center',
    },
    bookCardDescription: {
        fontSize: 12,
        color: colors.black,
        marginBottom: 8,
        textAlign: 'center',
    },
});

export default BooksCarousel;
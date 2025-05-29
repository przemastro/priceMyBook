import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ScrollView,
} from 'react-native';
import { FontAwesome, Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import { BookData, BookDefect, BookUniqueness, MarketFactors, ListingStatus } from '../types';
import ExportToPDFButton from '../buttons/ExportToPDFButton';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomAlertModal } from '../../alerts/CustomAlertModal';

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
    const scrollViewRefs = useRef<Record<number, ScrollView | null>>({});
    const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);
    const [bookToDeleteIndex, setBookToDeleteIndex] = useState<number | null>(null);

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

    const scrollContentUp = (index: number) => {
        scrollViewRefs.current[index]?.scrollTo({ y: 0, animated: true });
    };

    const scrollContentDown = (index: number) => {
        scrollViewRefs.current[index]?.scrollToEnd({ animated: true });
    };

    const showDeleteAlert = (index: number) => {
        setBookToDeleteIndex(index);
        setDeleteAlertVisible(true);
    };

    const handleConfirmDelete = () => {
        if (bookToDeleteIndex !== null) {
            onDeleteBook(bookToDeleteIndex);
        }
        setDeleteAlertVisible(false);
        setBookToDeleteIndex(null);
    };

    const handleCancelDelete = () => {
        setDeleteAlertVisible(false);
        setBookToDeleteIndex(null);
    };

    const renderListingButton = (bookIndex: number) => {
        const book = books[bookIndex];
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
                onPress={(e) => { e.stopPropagation(); onListBook(bookIndex); }}
            >
                <LinearGradient
                    colors={[`${color}`, `${color}`]}
                    style={styles.actionIconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <FontAwesome5 name={icon} size={20} color={colors.white}/>
                </LinearGradient>
                <Text style={styles.actionButtonText}>{text}</Text>
            </TouchableOpacity>
        );
    };

    const renderActionButtons = (bookIndex: number) => {
        const book = books[bookIndex];
        return (
            <View style={styles.actionsColumn}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => e.stopPropagation()}
                >
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
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        onEditBook(bookIndex);
                    }}
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

                {renderListingButton(bookIndex)}
            </View>
        );
    };

    const BookItem = ({
                          index,
                          animationValue,
                      }: {
        index: number;
        animationValue: Animated.SharedValue<number>;
    }) => {
        const book = books[index];
        const animatedStyle = useAnimatedStyle(() => {
            const scale = interpolate(animationValue.value, [-1, 0, 1], [0.9, 1, 0.9]);
            return { transform: [{ scale }] };
        });

        return (
            <View style={styles.bookItemContainer}>
                <Animated.View style={[styles.bookCard, animatedStyle]}>
                    <LinearGradient
                        colors={[colors.buttonSelected1, colors.buttonSelected2]}
                        style={styles.bookCardGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {/* Delete button */}
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                showDeleteAlert(index);
                            }}
                            activeOpacity={0.5}
                            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                        >
                            <MaterialIcons
                                name="close"
                                size={18}
                                color={colors.primary}
                            />
                        </TouchableOpacity>

                        {/* Book image placeholder */}
                        <View style={styles.bookImagePlaceholder}>
                            <LinearGradient
                                colors={['rgba(0,0,0,0.03)', 'rgba(0,0,0,0.05)']}
                                style={styles.collectionIconContainer}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <MaterialIcons
                                    name="book"
                                    size={50}
                                    color={colors.primary}
                                />
                            </LinearGradient>
                        </View>

                        <View style={styles.scrollButtonsContainer}>
                            <TouchableOpacity
                                style={styles.scrollButton}
                                onPress={() => scrollContentUp(index)}
                            >
                                <MaterialIcons name="keyboard-arrow-up" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            ref={ref => scrollViewRefs.current[index] = ref}
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
                                    <Text style={styles.bookCardPrice}>{t('bookInfo.finalPrice')}: {book.displayPrice}</Text>
                                    <Text style={styles.bookCardCondition}>{t('labels.condition')}: {book.rating}/10</Text>

                                    <Text style={styles.bookCardDefects}>{t('labels.defects')}: {formatDefectsSummary(book.defects)}</Text>
                                    {book.uniqueness && <Text style={styles.bookCardUniqueness}>{t('labels.uniqueness')}: {formatUniquenessSummary(book.uniqueness)}</Text>}
                                    {book.marketFactors && <Text style={styles.bookCardMarket}>{t('labels.marketFactors')}: {formatMarketFactorsSummary(book.marketFactors)}</Text>}
                                    {book.ageInfo && <Text style={styles.bookCardAge}>{t('labels.age')}: {book.ageInfo.years} {t('labels.years')}</Text>}
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.scrollButtonsContainer}>
                            <TouchableOpacity
                                style={styles.scrollButton}
                                onPress={() => scrollContentDown(index)}
                            >
                                <MaterialIcons name="keyboard-arrow-down" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {renderActionButtons(index)}
            </View>
        );
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
                renderItem={({ index, animationValue }) => <BookItem index={index} animationValue={animationValue} />}
                scrollAnimationDuration={800}
            />

            {/* Navigation arrows */}
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

            {/* Delete confirmation alert */}
            <CustomAlertModal
                visible={deleteAlertVisible}
                title={t('alerts.deleteBookTitle')}
                message={t('alerts.deleteBookMessage')}
                confirmText={t('buttons.delete')}
                onConfirm={handleConfirmDelete}
                type="warning"
                buttonFullWidth={true}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    booksCarouselContainer: {
        marginTop: 30,
        paddingTop: 0,
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
    bookImagePlaceholder: {
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 50,
        marginTop: 20,
    },
    collectionIconContainer: {
        width: 150,
        height: 150,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
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
        height: 60,
        width: '100%',
        position: 'absolute',
        bottom: 10,
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
});

export default BooksCarousel;
import React, { useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Image, ViewStyle, TextStyle,
} from 'react-native';
import { FontAwesome, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import { BookData, BookDefect, BookUniqueness, MarketFactors, ListingStatus } from '../types';
import ExportToPDFButton from '../buttons/ExportToPDFButton';

const BOOK_CARD_WIDTH = Dimensions.get('window').width * 0.8;
const BOOK_CARD_HEIGHT = Dimensions.get('window').height * 0.58; // Zwiększona wysokość
const ACTION_BUTTONS_WIDTH = 60;

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
                <View style={[styles.actionIconContainer, { backgroundColor: `${color}20` }]}>
                    <FontAwesome5 name={icon} size={20} color={color}/>
                </View>
                <Text style={styles.actionButtonText}>{text}</Text>
            </TouchableOpacity>
        );
    };

    const renderActionButtons = (bookIndex: number) => {
        const book = books[bookIndex];
        return (
            <View style={styles.actionsColumn}>
                <ExportToPDFButton
                    book={book}
                    formatDefectsSummary={formatDefectsSummary}
                    formatUniquenessSummary={formatUniquenessSummary}
                    formatMarketFactorsSummary={formatMarketFactorsSummary}
                    formatListingStatus={formatListingStatus}
                    style={styles.actionButton as ViewStyle}
                    iconStyle={styles.actionIconContainer as ViewStyle}
                    textStyle={styles.actionButtonText as TextStyle}
                />

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        onEditBook(bookIndex);
                    }}
                >
                    <View style={[styles.actionIconContainer, { backgroundColor: `${colors.primary}20` }]}>
                        <Ionicons name="create" size={20} color={colors.primary} />
                    </View>
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
                    {/* Przycisk usuwania w prawym górnym rogu */}
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            onDeleteBook(index);
                        }}
                        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                    >
                        <FontAwesome name="times" size={20} color={colors.error} />
                    </TouchableOpacity>

                    {/* Placeholder na obrazek książki */}
                    <View style={styles.bookImagePlaceholder}>
                        <Ionicons name="book" size={60} color={colors.grayLight} />
                    </View>

                    <View style={styles.bookCardContent}>
                        <View style={styles.bookCardHeader}>
                            <Text style={styles.bookCardTitle} numberOfLines={2}>{book.title}</Text>
                            <Text style={styles.bookCardAuthors} numberOfLines={1}>{book.authors}</Text>
                        </View>

                        <View style={styles.bookDetails}>
                            <Text style={styles.bookCardIsbn}>ISBN: {book.isbn}</Text>
                            <Text style={styles.bookCardPrice}>{t('bookInfo.finalPrice')}: {book.displayPrice}</Text>
                            <Text style={styles.bookCardCondition}>{t('labels.condition')}: {book.rating}/10</Text>

                            <View style={styles.bookCardDetails}>
                                <Text style={styles.bookCardDefects}>{t('labels.defects')}: {formatDefectsSummary(book.defects)}</Text>
                                {book.uniqueness && <Text style={styles.bookCardUniqueness}>{t('labels.uniqueness')}: {formatUniquenessSummary(book.uniqueness)}</Text>}
                                {book.marketFactors && <Text style={styles.bookCardMarket}>{t('labels.marketFactors')}: {formatMarketFactorsSummary(book.marketFactors)}</Text>}
                                {book.ageInfo && <Text style={styles.bookCardAge}>{t('labels.age')}: {book.ageInfo.years} {t('labels.years')}</Text>}
                            </View>
                        </View>
                    </View>
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
        </View>
    );
};

const styles = StyleSheet.create({
    booksCarouselContainer: {
        marginTop: 0,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: colors.white,
    },
    booksCarousel: {
        width: '100%',
    },
    bookItemContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    bookCard: {
        width: BOOK_CARD_WIDTH - 20,
        height: BOOK_CARD_HEIGHT - 40,
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginLeft: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    deleteButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10,
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookImagePlaceholder: {
        height: '30%',
        backgroundColor: colors.background,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.grayLight,
    },
    bookCardContent: {
        flex: 1,
    },
    bookCardHeader: {
        marginBottom: 8,
    },
    bookCardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.black,
        marginBottom: 4,
    },
    bookCardAuthors: {
        fontSize: 14,
        color: colors.grayDark,
    },
    bookDetails: {
        flex: 1,
    },
    bookCardIsbn: {
        fontSize: 14,
        color: colors.grayDark,
        marginBottom: 4,
    },
    bookCardPrice: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '500',
        marginBottom: 4,
    },
    bookCardCondition: {
        fontSize: 14,
        color: colors.primary,
        marginBottom: 8,
    },
    bookCardDetails: {
        marginTop: 8,
    },
    bookCardDefects: {
        fontSize: 12,
        color: colors.grayDark,
        marginBottom: 4,
        fontStyle: 'italic',
    },
    bookCardUniqueness: {
        fontSize: 12,
        color: colors.grayDark,
        marginBottom: 4,
        fontStyle: 'italic',
    },
    bookCardMarket: {
        fontSize: 12,
        color: colors.grayDark,
        marginBottom: 4,
        fontStyle: 'italic',
    },
    bookCardAge: {
        fontSize: 12,
        color: colors.grayDark,
        marginBottom: 4,
        fontStyle: 'italic',
    },
    actionsColumn: {
        width: ACTION_BUTTONS_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    actionButton: {
        alignItems: 'center',
        marginBottom: 16,
        width: '100%',
    },
    actionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    actionButtonText: {
        fontSize: 12,
        textAlign: 'center',
        color: colors.grayDark,
    },
});

export default BooksCarousel;
import React, { useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ViewStyle, TextStyle,
} from 'react-native';
import { FontAwesome, Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import { BookData, BookDefect, BookUniqueness, MarketFactors, ListingStatus } from '../types';
import ExportToPDFButton from '../buttons/ExportToPDFButton';
import { LinearGradient } from 'expo-linear-gradient';

const BOOK_CARD_WIDTH = Dimensions.get('window').width * 0.8;
const BOOK_CARD_HEIGHT = Dimensions.get('window').height * 0.58;
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
                <LinearGradient
                    colors={[`${color}20`, `${color}10`]}
                    style={styles.actionIconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <FontAwesome5 name={icon} size={20} color={color}/>
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
                                onDeleteBook(index);
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
                                    size={24}
                                    color={colors.primary}
                                />
                            </LinearGradient>
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
        borderRadius: 12,
        marginLeft: 10,
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
        marginBottom: 16,
    },
    collectionIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
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
    },
    bookCardAuthors: {
        fontSize: 14,
        color: colors.primary,
    },
    bookDetails: {
        flex: 1,
    },
    bookCardIsbn: {
        fontSize: 14,
        color: colors.primary,
        marginBottom: 4,
    },
    bookCardPrice: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: '600',
        marginBottom: 6,
    },
    bookCardCondition: {
        fontSize: 14,
        color: colors.primary,
        marginBottom: 12,
    },
    bookCardDetails: {
        marginTop: 8,
    },
    bookCardDefects: {
        fontSize: 12,
        color: colors.black,
        marginBottom: 4,
    },
    bookCardUniqueness: {
        fontSize: 12,
        color: colors.black,
        marginBottom: 4,
    },
    bookCardMarket: {
        fontSize: 12,
        color: colors.black,
        marginBottom: 4,
    },
    bookCardAge: {
        fontSize: 12,
        color: colors.black,
        marginBottom: 4,
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
});

export default BooksCarousel;
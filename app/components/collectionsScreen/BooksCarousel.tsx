// app/components/BooksCarousel.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import {FontAwesome, Ionicons, FontAwesome5} from '@expo/vector-icons';
import {colors} from '@/styles/styles';
import {useTranslation} from 'react-i18next';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import { BookData, BookDefect, BookUniqueness, MarketFactors, ListingStatus } from './types';

const BOOK_CARD_WIDTH = Dimensions.get('window').width * 0.8;

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

    const renderListingButton = (bookIndex: number) => {
        const book = books[bookIndex];
        const listingStatus = book.listingStatus || { status: 'notListed', platforms: [] };
        const buttonConfig = {
            notListed: { icon: 'upload', color: colors.primary, text: t('buttons.list'), bgColor: 'rgba(74, 108, 247, 0.1)' },
            listed: { icon: 'check', color: colors.success, text: t('listingStatus.listed', { platforms: listingStatus.platforms?.map(p => t(`platforms.${p}`)).join(', ') || '' }), bgColor: 'rgba(76, 175, 80, 0.1)' },
            sold: { icon: 'check-double', color: colors.grayDark, text: t('buttons.sold'), bgColor: 'rgba(158, 158, 158, 0.1)' }
        };
        const {icon, color, text, bgColor} = buttonConfig[listingStatus.status] || buttonConfig.notListed;
        return (
            <View style={styles.listingButtonContainer}>
                <TouchableOpacity style={[styles.iconContainer, { backgroundColor: bgColor, borderColor: color, marginLeft: 32 }]} onPress={(e) => { e.stopPropagation(); onListBook(bookIndex); }}>
                    <FontAwesome5 name={icon} size={20} color={color}/>
                </TouchableOpacity>
                <Text style={[styles.listingButtonText]} numberOfLines={2} ellipsizeMode="tail">{text}</Text>
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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Animated.View style={[styles.bookCard, animatedStyle]}>
                    <View style={styles.bookCardHeader}>
                        <Text style={styles.bookCardTitle} numberOfLines={2}>{book.title}</Text>
                        <Text style={styles.bookCardAuthors} numberOfLines={1}>{book.authors}</Text>
                    </View>

                    <View style={styles.bookCardContent}>
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

                    <View style={styles.bookCardFooter}>
                        {renderListingButton(index)}
                        <View style={styles.bookCardActions}>
                            <TouchableOpacity onPress={(e) => { e.stopPropagation(); onEditBook(index); }} style={styles.editButton}>
                                <Ionicons name="create" size={18} color={colors.primary}/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={(e) => { e.stopPropagation(); onDeleteBook(index); }} style={styles.deleteButton}>
                                <FontAwesome name="trash" size={18} color={colors.error}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </View>
        );
    };

    return (
        <View style={styles.booksCarouselContainer}>
            <Text style={styles.booksCarouselTitle}></Text>
            <Carousel
                loop={false}
                style={styles.booksCarousel}
                width={BOOK_CARD_WIDTH}
                height={400}
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
    booksCarouselTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.black,
        marginBottom: 10,
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.gray
    },
    booksCarousel: {
        width: '100%',
    },
    bookCard: {
        width: BOOK_CARD_WIDTH - 40,
        backgroundColor: colors.white,
        borderRadius: 8,
        padding: 16,
        marginHorizontal: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    bookCardHeader: {
        marginBottom: 12,
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
    bookCardContent: {
        marginBottom: 12,
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
    bookCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    bookCardActions: {
        flexDirection: 'row',
    },
    listingButtonContainer: {
        width: 100,
        minHeight: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listingButtonText: {
        fontSize: 12,
        textAlign: 'center',
        width: '100%',
        paddingHorizontal: 2,
        lineHeight: 16,
        flexWrap: 'wrap',
        marginLeft: 32,
        color: colors.primary
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        marginBottom: 4,
    },
    editButton: {
        padding: 8,
        marginRight: 4,
    },
    deleteButton: {
        padding: 8,
    },
});

export default BooksCarousel;
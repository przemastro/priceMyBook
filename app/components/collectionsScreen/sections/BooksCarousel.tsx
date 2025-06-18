import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import { BookData, BookDefect, BookUniqueness, MarketFactors, ListingStatus } from '../types';
import Carousel from "react-native-reanimated-carousel";
import BookItem from '../items/BookItem';

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

const BOOK_CARD_WIDTH = Dimensions.get('window').width * 0.9;
const BOOK_CARD_HEIGHT = Dimensions.get('window').height * 0.35;
const ACTION_BUTTONS_HEIGHT = 80;

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
                width={BOOK_CARD_WIDTH}
                height={BOOK_CARD_HEIGHT + ACTION_BUTTONS_HEIGHT}
                data={books}
                renderItem={({ item, index }) => (
                    <BookItem
                        book={item}
                        index={index}
                        onEdit={() => onEditBook(index)}
                        onDelete={() => onDeleteBook(index)}
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
        </View>
    );
};

const styles = StyleSheet.create({
    booksCarouselContainer: {
        marginTop: 10,
        paddingBottom: 80,
        backgroundColor: colors.grayLight,
        height: BOOK_CARD_HEIGHT + 180,
        position: 'relative',
    },
    booksCarousel: {
        width: '100%',
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 60,
        width: '100%',
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
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
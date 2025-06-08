import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Image } from 'react-native';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import Animated, { interpolate, useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BookData, BookDefect, BookUniqueness, MarketFactors, ListingStatus } from '../types';
import { CustomAlertModal } from '../../alerts/CustomAlertModal';
import Carousel from "react-native-reanimated-carousel";
import ExportToPDFButton from "@/app/components/collectionsScreen/buttons/ExportToPDFButton";

const BOOK_CARD_WIDTH = Dimensions.get('window').width * 0.9;
const BOOK_CARD_HEIGHT = Dimensions.get('window').height * 0.3;
const ACTION_BUTTONS_HEIGHT = 80;
const IMAGE_SIZE = 120;
const CARD_PADDING = 15;
const SCROLL_BUTTON_HEIGHT = 24;

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
    const [exporting, setExporting] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

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

    const renderListingButton = () => {
        const listingStatus = book.listingStatus || { status: 'notListed', platforms: [] };
        const buttonConfig = {
            notListed: { icon: 'upload', color: colors.primary, text: t('buttons.list') },
            listed: { icon: 'check', color: colors.success, text: t('listingStatus.listed') },
            sold: { icon: 'check-double', color: colors.grayDark, text: t('buttons.sold') }
        };
        const {icon, color, text} = buttonConfig[listingStatus.status] || buttonConfig.notListed;

        return (
            <TouchableOpacity style={styles.actionButton} onPress={onList} disabled={exporting}>
                <LinearGradient colors={[`${color}`, `${color}`]} style={styles.actionIconContainer} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <FontAwesome5 name={icon} size={20} color={colors.white} />
                </LinearGradient>
                <Text style={styles.actionButtonText}>{text}</Text>
            </TouchableOpacity>
        );
    };

    const renderDetailItem = (label: string, value: string, isMultiline = false) => {
        return (
            <View style={styles.detailItem}>
                <Text style={styles.detailLabel} numberOfLines={2}>{label}:</Text>
                <Text style={styles.detailValue} numberOfLines={isMultiline ? 3 : 2}>{value}</Text>
            </View>
        );
    };

    return (
        <View style={styles.bookItemContainer}>
            <Animated.View style={[styles.bookCard, animatedStyle]}>
                <LinearGradient colors={[colors.buttonSelected1, colors.buttonSelected2]} style={styles.bookCardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <View style={styles.scrollButtonsContainer}>
                        <TouchableOpacity style={styles.scrollButton} onPress={scrollContentUp}>
                            <MaterialIcons name="keyboard-arrow-up" size={20} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.cardContent}>
                        {/* Left Column - Book Image */}
                        <View style={styles.bookImageContainer}>
                            {book.imageUri ? (
                                <Image
                                    source={{ uri: book.imageUri }}
                                    style={styles.bookImage}
                                    resizeMode="contain"
                                />
                            ) : (
                                <LinearGradient colors={['rgba(0,0,0,0.03)', 'rgba(0,0,0,0.05)']} style={styles.bookImagePlaceholder}>
                                    <MaterialIcons name="book" size={50} color={colors.primary} />
                                </LinearGradient>
                            )}
                        </View>

                        {/* Right Column - Book Details */}
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.bookDetailsScroll}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.bookDetails}>
                                <Text style={styles.bookTitle} numberOfLines={2}>
                                    {book.title || t('bookInfo.noTitle')}
                                </Text>

                                {renderDetailItem(t('bookInfo.isbn'), book.isbn || t('bookInfo.noIsbn'))}
                                {renderDetailItem(t('bookInfo.price'), book.displayPrice)}
                                {renderDetailItem(t('labels.condition'), `${book.rating}/10`)}

                                {book.authors && renderDetailItem(t('bookInfo.authors'), book.authors)}
                                {book.publisher && renderDetailItem(t('bookInfo.publisher'), book.publisher)}
                                {book.description && renderDetailItem(t('bookInfo.description'), book.description, true)}

                                {renderDetailItem(t('labels.defects'), formatDefectsSummary(book.defects))}
                                {renderDetailItem(t('labels.uniqueness'), formatUniquenessSummary(book.uniqueness))}

                                {book.marketFactors && renderDetailItem(t('labels.marketFactors'), formatMarketFactorsSummary(book.marketFactors))}
                                {book.ageInfo && renderDetailItem(t('labels.age'), `${book.ageInfo.years} ${t('labels.years')}`)}

                                {renderDetailItem(t('labels.listingStatus'), formatListingStatus(book.listingStatus))}
                            </View>
                        </ScrollView>
                    </View>

                    <View style={styles.scrollButtonsContainer}>
                        <TouchableOpacity style={styles.scrollButton} onPress={scrollContentDown}>
                            <MaterialIcons name="keyboard-arrow-down" size={20} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </Animated.View>

            {/* Action Buttons Row */}
            <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionButton} onPress={(e) => e.stopPropagation()}>
                    <LinearGradient colors={[`${colors.primary}20`, `${colors.primary}10`]} style={styles.actionIconContainer} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <ExportToPDFButton book={book} formatDefectsSummary={formatDefectsSummary} formatUniquenessSummary={formatUniquenessSummary} formatMarketFactorsSummary={formatMarketFactorsSummary} formatListingStatus={formatListingStatus} />
                    </LinearGradient>
                    <Text style={styles.actionButtonText}>{t('buttons.exportPDF')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
                    <LinearGradient colors={[`${colors.primary}20`, `${colors.primary}10`]} style={styles.actionIconContainer} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <Ionicons name="create" size={20} color={colors.primary} />
                    </LinearGradient>
                    <Text style={styles.actionButtonText}>{t('buttons.edit')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
                    <LinearGradient colors={[`${colors.error}20`, `${colors.error}10`]} style={styles.actionIconContainer} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <Ionicons name="trash" size={20} color={colors.error} />
                    </LinearGradient>
                    <Text style={[styles.actionButtonText, {color: colors.error}]}>{t('buttons.delete')}</Text>
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

    const showDeleteAlert = (index: number) => {
        setBookToDeleteIndex(index);
        setDeleteAlertVisible(true);
    };

    const confirmDelete = () => {
        if (bookToDeleteIndex !== null) {
            onDeleteBook(bookToDeleteIndex);
        }
        setDeleteAlertVisible(false);
    };

    const cancelDelete = () => {
        setDeleteAlertVisible(false);
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
                width={BOOK_CARD_WIDTH}
                height={BOOK_CARD_HEIGHT + ACTION_BUTTONS_HEIGHT}
                data={books}
                renderItem={({ item, index, animationValue }) => (
                    <BookItem
                        book={item}
                        index={index}
                        animationValue={animationValue}
                        onEdit={() => onEditBook(index)}
                        onDelete={() => showDeleteAlert(index)}
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
                <TouchableOpacity onPress={handleGoToStart} style={styles.navButton} disabled={books.length <= 1}>
                    <MaterialIcons name="first-page" size={24} color={books.length > 1 ? colors.primary : colors.gray} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePrev} style={styles.navButton} disabled={books.length <= 1}>
                    <MaterialIcons name="chevron-left" size={30} color={books.length > 1 ? colors.primary : colors.gray} />
                </TouchableOpacity>
                <View style={styles.navSpacer} />
                <TouchableOpacity onPress={handleNext} style={styles.navButton} disabled={books.length <= 1}>
                    <MaterialIcons name="chevron-right" size={30} color={books.length > 1 ? colors.primary : colors.gray} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleGoToEnd} style={styles.navButton} disabled={books.length <= 1}>
                    <MaterialIcons name="last-page" size={24} color={books.length > 1 ? colors.primary : colors.gray} />
                </TouchableOpacity>
            </View>

            <CustomAlertModal
                visible={deleteAlertVisible}
                title={t('alerts.deleteBookTitle')}
                message={t('alerts.deleteBookMessage')}
                confirmText={t('buttons.delete')}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                type="warning"
                buttonFullWidth={true}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    booksCarouselContainer: {
        marginTop: 10,
        paddingBottom: 80,
        backgroundColor: colors.grayLight,
        height: BOOK_CARD_HEIGHT + 200,
        position: 'relative',
    },
    booksCarousel: {
        width: '100%',
    },
    bookItemContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    bookCard: {
        width: BOOK_CARD_WIDTH - 20,
        height: BOOK_CARD_HEIGHT - 70,
        borderRadius: 12,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
        marginBottom: 35,
    },
    bookCardGradient: {
        flex: 1,
        padding: CARD_PADDING,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        height: '100%',
    },
    bookImageContainer: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: CARD_PADDING,
        backgroundColor: colors.whiteBlue,
    },
    bookImage: {
        width: '100%',
        height: '100%',
    },
    bookImagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookDetailsScroll: {
        flex: 1,
        height: '80%',
    },
    bookDetails: {
        flex: 1,
    },
    bookTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 10,
    },
    detailItem: {
        flexDirection: 'row',
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    detailLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.primary,
        marginRight: 5,
        width: 110,
    },
    detailValue: {
        fontSize: 13,
        color: colors.primary,
        flex: 1,
        flexShrink: 1,
    },
    priceValue: {
        fontWeight: '600',
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: BOOK_CARD_WIDTH - 20,
        paddingHorizontal: 10,
    },
    actionButton: {
        alignItems: 'center',
        width: '23%',
    },
    actionIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
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
    scrollButtonsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: SCROLL_BUTTON_HEIGHT,
    },
    scrollButton: {
        padding: 4,
    },
});

export default BooksCarousel;
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Image, ActivityIndicator, Modal } from 'react-native';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { BookData, BookDefect, BookUniqueness, MarketFactors, ListingStatus } from '../types';
import { CustomAlertModal } from '../../alerts/CustomAlertModal';
import Carousel from "react-native-reanimated-carousel";
import ExportToPDFButton from "../buttons/ExportToPDFButton";
import { SharedValue } from 'react-native-reanimated';

const BOOK_CARD_WIDTH = Dimensions.get('window').width * 0.9;
const BOOK_CARD_HEIGHT = Dimensions.get('window').height * 0.35;
const ACTION_BUTTONS_HEIGHT = 80;
const IMAGE_SIZE = 80;
const CARD_PADDING = 12;

interface BookItemProps {
    book: BookData;
    index: number;
    animationValue?: SharedValue<number>;
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

const BookDetailsModal: React.FC<{
    visible: boolean;
    onClose: () => void;
    book: BookData;
    onEdit: () => void;
    formatDefectsSummary: (defects: Record<string, BookDefect> | undefined) => string;
    formatUniquenessSummary: (uniqueness: BookUniqueness | undefined) => string;
    formatMarketFactorsSummary: (marketFactors: MarketFactors | undefined) => string;
    formatListingStatus: (status?: ListingStatus) => string;
}> = ({ visible, onClose, book, onEdit, formatDefectsSummary, formatUniquenessSummary, formatMarketFactorsSummary, formatListingStatus }) => {
    const { t } = useTranslation();

    const renderDetailItem = (label: string, value: string, isMultiline = false) => {
        return (
            <View style={modalStyles.detailRow}>
                <Text style={modalStyles.detailLabel}>{label}:</Text>
                <Text
                    style={[modalStyles.detailValue, isMultiline && modalStyles.multilineValue]}
                    numberOfLines={isMultiline ? 3 : 1}
                    ellipsizeMode="tail"
                >
                    {value}
                </Text>
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={modalStyles.modalOverlay}>
                <LinearGradient
                    colors={[colors.buttonSelected1, colors.buttonSelected2]}
                    style={modalStyles.modalContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <TouchableOpacity
                        style={modalStyles.closeButton}
                        onPress={onClose}
                        activeOpacity={0.7}
                    >
                        <View style={modalStyles.closeButtonCircle}>
                            <Text style={modalStyles.closeButtonText}>×</Text>
                        </View>
                    </TouchableOpacity>

                    <ScrollView contentContainerStyle={modalStyles.scrollContent}>
                        <View style={modalStyles.bookCoverSection}>
                            {book.imageUri ? (
                                <Image
                                    source={{
                                        uri: book.imageUri.startsWith('file://') ?
                                            book.imageUri :
                                            `file://${book.imageUri}`
                                    }}
                                    style={modalStyles.bookCoverImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={modalStyles.bookCoverPlaceholder}>
                                    <MaterialIcons name="book" size={48} color={colors.primary} />
                                </View>
                            )}
                        </View>

                        <View style={modalStyles.detailsSection}>
                            <Text style={modalStyles.bookTitle}>{book.title || t('bookInfo.noTitle')}</Text>

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

                    <View style={modalStyles.footer}>
                        <View style={modalStyles.footerButtons}>
                            <ExportToPDFButton
                                book={book}
                                formatDefectsSummary={formatDefectsSummary}
                                formatUniquenessSummary={formatUniquenessSummary}
                                formatMarketFactorsSummary={formatMarketFactorsSummary}
                                formatListingStatus={formatListingStatus}
                                style={modalStyles.pdfButton}
                            />
                            <TouchableOpacity
                                style={modalStyles.editButton}
                                onPress={() => {
                                    onClose();
                                    onEdit();
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={modalStyles.editButtonText}>{t('buttons.edit')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>
            </View>
        </Modal>
    );
};

const BookItem: React.FC<BookItemProps> = ({
                                               book,
                                               index,
                                               onEdit,
                                               onDelete,
                                               onList,
                                               formatDefectsSummary,
                                               formatUniquenessSummary,
                                               formatMarketFactorsSummary,
                                               formatListingStatus
                                           }) => {
    const { t } = useTranslation();
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const scrollContentUp = () => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    };

    const scrollContentDown = () => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    };

    const handleImageLoadStart = () => {
        setImageLoading(true);
        setImageError(false);
    };

    const handleImageLoadEnd = () => {
        setImageLoading(false);
    };

    const handleImageError = () => {
        setImageLoading(false);
        setImageError(true);
    };

    const handleDeletePress = () => {
        setShowDeleteAlert(true);
    };

    const confirmDelete = () => {
        setShowDeleteAlert(false);
        onDelete();
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

    const renderDetailItem = (label: string, value: string, isMultiline = false) => {
        return (
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{label}:</Text>
                <Text
                    style={[styles.detailValue, isMultiline && styles.multilineValue]}
                    numberOfLines={isMultiline ? 3 : 1}
                    ellipsizeMode="tail"
                >
                    {value}
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.bookItemContainer}>
            <CustomAlertModal
                visible={showDeleteAlert}
                title={t('alerts.deleteBookTitle')}
                message={t('alerts.deleteBookMessage')}
                confirmText={t('buttons.delete')}
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteAlert(false)}
                type="warning"
                buttonFullWidth={true}
            />

            <BookDetailsModal
                visible={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                book={book}
                onEdit={onEdit}
                formatDefectsSummary={formatDefectsSummary}
                formatUniquenessSummary={formatUniquenessSummary}
                formatMarketFactorsSummary={formatMarketFactorsSummary}
                formatListingStatus={formatListingStatus}
            />

            <View style={styles.bookCard}>
                <LinearGradient
                    colors={[colors.buttonSelected1, colors.buttonSelected2]}
                    style={styles.bookCardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={handleDeletePress}
                    >
                        <Ionicons name="close" size={20} color={colors.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cardContent}
                        onPress={() => setShowDetailsModal(true)}
                        activeOpacity={0.9}
                    >
                        <View style={styles.bookImageContainer}>
                            {book.imageUri ? (
                                <>
                                    <Image
                                        source={{
                                            uri: book.imageUri.startsWith('file://') ?
                                                book.imageUri :
                                                `file://${book.imageUri}`
                                        }}
                                        style={styles.bookImage}
                                        resizeMode="cover"
                                        onLoadStart={handleImageLoadStart}
                                        onLoad={handleImageLoadEnd}
                                        onError={handleImageError}
                                    />
                                    {imageLoading && (
                                        <View style={styles.loadingOverlay}>
                                            <ActivityIndicator size="small" color={colors.primary} />
                                        </View>
                                    )}
                                    {imageError && (
                                        <View style={styles.errorOverlay}>
                                            <MaterialIcons name="image" size={24} color={colors.grayDark} />
                                        </View>
                                    )}
                                </>
                            ) : (
                                <View style={styles.bookImagePlaceholder}>
                                    <MaterialIcons name="book" size={32} color={colors.primary} />
                                </View>
                            )}
                        </View>

                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.bookDetailsScroll}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.bookDetails}>
                                <Text style={styles.bookTitle} numberOfLines={1}>
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
                    </TouchableOpacity>
                </LinearGradient>
            </View>

            <View style={styles.actionsRow}>
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

const modalStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        width: '90%',
        borderRadius: 12,
        overflow: 'hidden',
        maxHeight: '85%',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 80,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
    },
    closeButtonCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.buttonSelected1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(74,108,247,0.1)',
    },
    closeButtonText: {
        fontSize: 20,
        color: colors.primary,
        lineHeight: 24,
    },
    bookCoverSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    bookCoverImage: {
        width: 150,
        height: 200,
        borderRadius: 8,
    },
    bookCoverPlaceholder: {
        width: 150,
        height: 200,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.whiteBlue,
    },
    detailsSection: {
        width: '100%',
    },
    bookTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 16,
        textAlign: 'center',
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'flex-start',
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.primary,
        marginRight: 8,
        minWidth: 100,
    },
    detailValue: {
        fontSize: 14,
        color: colors.primary,
        flex: 1,
    },
    multilineValue: {
        flex: 1,
        flexWrap: 'wrap',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: 'transparent',
        borderTopWidth: 1,
        borderTopColor: colors.grayLight,
    },
    footerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 8, // Dodaj odstęp między przyciskami
    },
    pdfButton: {
        flex: 1, // Oba przyciski będą miały taką samą szerokość
    },
    editButton: {
        flex: 1, // Oba przyciski będą miały taką samą szerokość
        backgroundColor: colors.primary,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    editButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

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
    bookItemContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    bookCard: {
        width: BOOK_CARD_WIDTH - 20,
        height: BOOK_CARD_HEIGHT - 110,
        borderRadius: 12,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
        marginBottom: 20,
    },
    bookCardGradient: {
        flex: 1,
        padding: CARD_PADDING,
        justifyContent: 'space-between',
    },
    clearButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10,
        backgroundColor: colors.buttonSelected1,
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
        marginTop: 10,
        marginBottom: 10,
    },
    bookImageContainer: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        borderRadius: IMAGE_SIZE / 2,
        overflow: 'hidden',
        marginRight: 12,
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
    loadingOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.7)',
    },
    errorOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.whiteBlue,
    },
    bookDetailsScroll: {
        flex: 1,
        maxHeight: BOOK_CARD_HEIGHT - 140,
    },
    bookDetails: {
        flex: 1,
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 8,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 4,
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.primary,
        marginRight: 6,
        minWidth: 70,
    },
    detailValue: {
        fontSize: 13,
        color: colors.primary,
        flex: 1,
    },
    multilineValue: {
        flex: 1,
        flexWrap: 'wrap',
    },
    priceValue: {
        fontWeight: '600',
    },
    topScrollButton: {
        alignItems: 'center',
        paddingVertical: 4,
    },
    bottomScrollButton: {
        alignItems: 'center',
        paddingVertical: 4,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: BOOK_CARD_WIDTH - 20,
        paddingHorizontal: 10,
        marginTop: 12,
    },
    actionButton: {
        alignItems: 'center',
        width: '48%',
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
});

export default BooksCarousel;
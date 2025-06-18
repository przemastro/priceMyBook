import React, { useRef, useState } from 'react';
import {View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator} from 'react-native';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import { BookData, BookDefect, BookUniqueness, MarketFactors, ListingStatus } from '../types';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomAlertModal } from '../../alerts/CustomAlertModal';
import BookDetailsModal from '../modals/BookDetailsModal';
import { styles } from './styles'

interface BookItemProps {
    book: BookData;
    index: number;
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

export default BookItem;
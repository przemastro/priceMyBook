import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import { BookData, BookDefect, BookUniqueness, MarketFactors, ListingStatus } from '../types';
import ExportToPDFButton from "../buttons/ExportToPDFButton";
import { styles } from './styles'

interface BookDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    book: BookData;
    onEdit: () => void;
    formatDefectsSummary: (defects: Record<string, BookDefect> | undefined) => string;
    formatUniquenessSummary: (uniqueness: BookUniqueness | undefined) => string;
    formatMarketFactorsSummary: (marketFactors: MarketFactors | undefined) => string;
    formatListingStatus: (status?: ListingStatus) => string;
}

const BookDetailsModal: React.FC<BookDetailsModalProps> = ({
                                                               visible,
                                                               onClose,
                                                               book,
                                                               onEdit,
                                                               formatDefectsSummary,
                                                               formatUniquenessSummary,
                                                               formatMarketFactorsSummary,
                                                               formatListingStatus
                                                           }) => {
    const { t } = useTranslation();

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
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={localStyles.modalOverlay}>
                <LinearGradient
                    colors={[colors.buttonSelected1, colors.buttonSelected2]}
                    style={localStyles.modalContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <TouchableOpacity
                        style={localStyles.closeButton}
                        onPress={onClose}
                        activeOpacity={0.7}
                    >
                        <View style={localStyles.closeButtonCircle}>
                            <Text style={localStyles.closeButtonText}>×</Text>
                        </View>
                    </TouchableOpacity>

                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.bookCoverSection}>
                            {book.imageUri ? (
                                <Image
                                    source={{
                                        uri: book.imageUri.startsWith('file://') ?
                                            book.imageUri :
                                            `file://${book.imageUri}`
                                    }}
                                    style={styles.bookCoverImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={styles.bookCoverPlaceholder}>
                                    <MaterialIcons name="book" size={48} color={colors.primary} />
                                </View>
                            )}
                        </View>

                        <View style={styles.detailsSection}>
                            <Text style={localStyles.bookTitle}>{book.title || t('bookInfo.noTitle')}</Text>

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

                    <View style={styles.footer}>
                        <View style={styles.footerButtons}>
                            <ExportToPDFButton
                                book={book}
                                formatDefectsSummary={formatDefectsSummary}
                                formatUniquenessSummary={formatUniquenessSummary}
                                formatMarketFactorsSummary={formatMarketFactorsSummary}
                                formatListingStatus={formatListingStatus}
                                style={styles.pdfButton}
                            />
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => {
                                    onClose();
                                    onEdit();
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.editButtonText}>{t('buttons.edit')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>
            </View>
        </Modal>
    );
};

const localStyles = StyleSheet.create({
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
        borderColor: colors.transparentLightPrimary,
    },
    closeButtonText: {
        fontSize: 20,
        color: colors.primary,
        lineHeight: 24,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.transparentBlack,
    },
    modalContainer: {
        width: '90%',
        borderRadius: 12,
        overflow: 'hidden',
        maxHeight: '85%',
    },
    bookTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 16,
        textAlign: 'center',
    },
});

export default BookDetailsModal;
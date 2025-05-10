// app/components/modals/ImportPreviewModal.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import { BookData } from './types';

interface ImportPreviewModalProps {
    importPreview: {
        collectionName: string;
        books: BookData[]; // Zmiana z Omit<BookData, 'createdAt'>[] na BookData[]
        showPreview: boolean;
    } | null;
    onCancel: () => void;
    onConfirm: () => void;
    formatDefectsSummary: (defects: any) => string;
    formatUniquenessSummary: (uniqueness: any) => string;
    formatMarketFactorsSummary: (marketFactors: any) => string;
    formatListingStatus: (status: any) => string;
}

const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({
                                                                   importPreview,
                                                                   onCancel,
                                                                   onConfirm,
                                                                   formatDefectsSummary,
                                                                   formatUniquenessSummary,
                                                                   formatMarketFactorsSummary,
                                                                   formatListingStatus
                                                               }) => {
    const { t } = useTranslation();

    if (!importPreview) return null;

    return (
        <Modal animationType="slide" transparent={true} visible={!!importPreview} onRequestClose={onCancel}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>{t('labels.importPreview')} ({importPreview.books.length} {t('labels.books')})</Text>
                    <Text style={styles.modalText}>{t('labels.collectionName')}: {importPreview.collectionName}</Text>
                    <ScrollView style={styles.previewScroll}>
                        {importPreview.books.slice(0, 5).map((book, index) => (
                            <View key={index} style={styles.previewBook}>
                                <Text style={styles.previewBookTitle}>{book.title}</Text>
                                <Text style={styles.previewBookIsbn}>ISBN: {book.isbn}</Text>
                                <Text style={styles.previewBookRating}>{t('labels.condition')}: {book.rating}/10</Text>
                                <Text style={styles.previewBookDefects}>{t('labels.defects')}: {formatDefectsSummary(book.defects)}</Text>
                                {book.uniqueness && <Text style={styles.previewBookUniqueness}>{t('labels.uniqueness')}: {formatUniquenessSummary(book.uniqueness)}</Text>}
                                {book.marketFactors && <Text style={styles.previewBookMarket}>{t('labels.marketFactors')}: {formatMarketFactorsSummary(book.marketFactors)}</Text>}
                                {book.ageInfo && <Text style={styles.previewBookAge}>{t('labels.age')}: {book.ageInfo.years} {t('labels.years')}</Text>}
                                {book.listingStatus && <Text style={styles.previewBookListing}>{t('labels.listingStatus')}: {formatListingStatus(book.listingStatus)}</Text>}
                            </View>
                        ))}
                        {importPreview.books.length > 5 && <Text style={styles.previewMore}>+ {importPreview.books.length - 5} {t('labels.moreBooks')}...</Text>}
                    </ScrollView>
                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onCancel}>
                            <Text style={styles.cancelButtonText}>{t('buttons.cancel')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={onConfirm}>
                            <Text style={styles.confirmButtonText}>{t('buttons.confirmImport')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 2,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.black,
        marginBottom: 15,
    },
    modalText: {
        marginBottom: 10,
        color: colors.black,
    },
    previewScroll: {
        maxHeight: 200,
        marginVertical: 10,
    },
    previewBook: {
        padding: 10,
    },
    previewBookTitle: {
        fontWeight: '500',
        color: colors.black,
    },
    previewBookIsbn: {
        fontSize: 12,
        color: colors.grayDark,
    },
    previewBookRating: {
        fontSize: 12,
        color: colors.primary,
        marginTop: 4,
    },
    previewBookDefects: {
        fontSize: 12,
        color: colors.grayDark,
        marginTop: 4,
        fontStyle: 'italic',
    },
    previewBookUniqueness: {
        fontSize: 12,
        color: colors.grayDark,
        marginTop: 4,
        fontStyle: 'italic',
    },
    previewBookMarket: {
        fontSize: 12,
        color: colors.grayDark,
        marginTop: 4,
        fontStyle: 'italic',
    },
    previewBookAge: {
        fontSize: 12,
        color: colors.grayDark,
        marginTop: 4,
        fontStyle: 'italic',
    },
    previewBookListing: {
        fontSize: 12,
        color: colors.grayDark,
        marginTop: 4,
        fontStyle: 'italic',
    },
    previewMore: {
        textAlign: 'center',
        marginTop: 5,
        color: colors.gray,
        fontStyle: 'italic',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 2,
        marginLeft: 10,
    },
    cancelButton: {
        backgroundColor: colors.white,
    },
    confirmButton: {
        backgroundColor: colors.white,
    },
    cancelButtonText: {
        color: colors.primary,
    },
    confirmButtonText: {
        color: colors.primary,
    },
});

export default ImportPreviewModal;
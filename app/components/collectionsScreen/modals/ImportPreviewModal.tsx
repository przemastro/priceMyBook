import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import { BookData } from '../types';
import { LinearGradient } from 'expo-linear-gradient';

interface ImportPreviewModalProps {
    importPreview: {
        collectionName: string;
        books: BookData[];
        categories: string[];
        showPreview: boolean;
        collectionCreatedAt?: string;
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
        <Modal
            animationType="fade"
            transparent={true}
            visible={importPreview.showPreview}
            onRequestClose={onCancel}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Close button */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onCancel}
                        activeOpacity={0.7}
                    >
                        <View style={styles.closeButtonCircle}>
                            <Text style={styles.closeButtonText}>×</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.modalContent}>
                        {/* Icon preview */}
                        <View style={styles.iconPreviewContainer}>
                            <View style={styles.iconPreviewCircle}>
                                <Ionicons
                                    name="document-text-outline"
                                    size={42}
                                    color={colors.primary}
                                />
                            </View>
                        </View>

                        <Text style={styles.modalTitle}>
                            {t('labels.importPreview')}
                        </Text>

                        <View style={styles.infoContainer}>
                            <Text style={styles.infoText}>
                                {t('labels.collectionName')}:
                                <Text style={styles.infoValue}> {importPreview.collectionName}</Text>
                            </Text>
                            <Text style={styles.infoText}>
                                {t('labels.categories')}:
                                <Text style={styles.infoValue}> {importPreview.categories.join(', ') || t('labels.none')}</Text>
                            </Text>
                            <Text style={styles.infoText}>
                                {t('labels.booksToImport')}:
                                <Text style={styles.infoValue}> {importPreview.books.length}</Text>
                            </Text>
                        </View>

                        {/* Preview list */}
                        <ScrollView
                            style={styles.previewScroll}
                            contentContainerStyle={styles.previewScrollContent}
                        >
                            {importPreview.books.slice(0, 5).map((book, index) => {
                                try {
                                    return (
                                        <View key={index} style={styles.bookPreview}>
                                            <Text style={styles.bookTitle} numberOfLines={1}>
                                                {book.title || t('labels.noTitle')}
                                            </Text>
                                            <Text style={styles.bookDetails}>
                                                ISBN: {book.isbn} • {t('labels.condition')}: {book.rating}/10
                                            </Text>
                                            <Text style={styles.bookDetails}>
                                                {t('labels.price')}: {book.displayPrice}
                                            </Text>
                                            <Text style={styles.bookMeta}>
                                                {t('labels.defects')}: {formatDefectsSummary(book.defects)}
                                            </Text>
                                            {/* Reszta szczegółów książki */}
                                        </View>
                                    );
                                } catch (e) {
                                    console.error('Error rendering book preview', e);
                                    return null;
                                }
                            })}
                            {importPreview.books.length > 5 && (
                                <Text style={styles.moreItemsText}>
                                    + {importPreview.books.length - 5} {t('labels.moreBooks')}...
                                </Text>
                            )}
                        </ScrollView>

                        {/* Action buttons */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.confirmButton]}
                                onPress={onConfirm}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={[colors.primary, colors.primary]}
                                    style={styles.buttonGradient}
                                >
                                    <Text style={styles.confirmButtonText}>
                                        {t('buttons.confirmImport')}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
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
        maxHeight: '80%',
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    modalContent: {
        padding: 24,
        paddingTop: 32,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1,
    },
    closeButtonCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.white,
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
    iconPreviewContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconPreviewCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.whiteBlue,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(74,108,247,0.1)',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.black,
        marginBottom: 16,
        textAlign: 'center',
    },
    infoContainer: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: colors.whiteBlue,
        borderRadius: 8,
    },
    infoText: {
        fontSize: 16,
        color: colors.grayDark,
        marginBottom: 4,
    },
    infoValue: {
        fontWeight: '600',
        color: colors.primary,
    },
    previewScroll: {
        maxHeight: 200,
        marginBottom: 16,
    },
    previewScrollContent: {
        paddingRight: 8,
    },
    bookPreview: {
        padding: 12,
        marginBottom: 8,
        backgroundColor: colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.gray,
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.black,
        marginBottom: 4,
    },
    bookDetails: {
        fontSize: 14,
        color: colors.grayDark,
        marginBottom: 4,
    },
    bookMeta: {
        fontSize: 12,
        color: colors.grayDark,
        marginTop: 4,
        fontStyle: 'italic',
    },
    moreItemsText: {
        fontSize: 14,
        color: colors.grayDark,
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 16,
    },
    actionButton: {
        borderRadius: 10,
        overflow: 'hidden',
        width: '100%',
        height: 50,
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    confirmButton: {
        backgroundColor: colors.primary,
    },
    buttonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    confirmButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ImportPreviewModal;
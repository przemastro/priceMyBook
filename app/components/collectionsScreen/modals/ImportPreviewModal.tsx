import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import { BookData } from '../types';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './styles'

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
            <View style={localStyles.modalOverlay}>
                <View style={localStyles.modalContainer}>
                    {/* Close button */}
                    <TouchableOpacity
                        style={localStyles.closeButton}
                        onPress={onCancel}
                        activeOpacity={0.7}
                    >
                        <View style={localStyles.closeButtonCircle}>
                            <Text style={localStyles.closeButtonText}>×</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={localStyles.modalContent}>
                        {/* Icon preview */}
                        <View style={localStyles.iconPreviewContainer}>
                            <View style={localStyles.iconPreviewCircle}>
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
                            {importPreview.books.slice(0, 5).map((book) => {
                                try {
                                    return (
                                        <View
                                            key={`${book.isbn || 'no-isbn'}-${book.title || 'no-title'}`}
                                            style={styles.bookPreview}
                                        >
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
                                style={[styles.actionButton, localStyles.confirmButton]}
                                onPress={onConfirm}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={[colors.primary, colors.primary]}
                                    style={localStyles.buttonGradient}
                                >
                                    <Text style={localStyles.confirmButtonText}>
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

const localStyles = StyleSheet.create({
    confirmButton: {
        backgroundColor: colors.primary,
    },
    buttonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.transparentBlack,
    },
    modalContainer: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: colors.blackDark,
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
        borderColor: colors.transparentLightPrimary,
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
        borderColor: colors.transparentLightPrimary,
    },
});

export default ImportPreviewModal;
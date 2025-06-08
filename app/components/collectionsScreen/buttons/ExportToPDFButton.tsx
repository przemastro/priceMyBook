// app/components/ExportToPDFButton.tsx
import React from 'react';
import {TouchableOpacity, Alert, StyleSheet} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { BookData, BookDefect, BookUniqueness, MarketFactors, ListingStatus } from '../types';
import * as Print from 'expo-print';

interface ExportToPDFButtonProps {
    book: BookData;
    formatDefectsSummary: (defects: Record<string, BookDefect> | undefined) => string;
    formatUniquenessSummary: (uniqueness: BookUniqueness | undefined) => string;
    formatMarketFactorsSummary: (marketFactors: MarketFactors | undefined) => string;
    formatListingStatus: (status?: ListingStatus) => string;
}

const ExportToPDFButton: React.FC<ExportToPDFButtonProps> = ({
                                                                 book,
                                                                 formatDefectsSummary,
                                                                 formatUniquenessSummary,
                                                                 formatMarketFactorsSummary,
                                                                 formatListingStatus,
                                                             }) => {
    const { t } = useTranslation();

    const generatePDF = async () => {
        try {
            // Create HTML content with all fields
            const htmlContent = `
            <html>
            <head>
                <style>
                body { font-family: Arial; padding: 20px; }
                h1 { color: #4a6cf7; font-size: 20px; margin-bottom: 10px; }
                .section { margin-bottom: 15px; }
                .label { font-weight: bold; color: #333; min-width: 150px; display: inline-block; }
                .value { margin-left: 10px; }
                .row { margin-bottom: 8px; }
                hr { border: 0.5px solid #eee; margin: 15px 0; }
                .header { text-align: center; margin-bottom: 20px; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
                .image-container { text-align: center; margin-bottom: 15px; }
                .book-image { max-width: 150px; max-height: 200px; }
                .two-columns { display: flex; flex-wrap: wrap; }
                .column { flex: 1; min-width: 250px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${book.title}</h1>
                    <p>${t('bookInfo.authors')}: ${book.authors}</p>
                </div>

                ${book.imageUri ? `
                <div class="image-container">
                    <img src="${book.imageUri}" class="book-image" />
                </div>
                ` : ''}

                <div class="two-columns">
                    <div class="column">
                        <div class="section">
                            <div class="row"><span class="label">ISBN:</span> <span class="value">${book.isbn}</span></div>
                            ${book.publisher ? `<div class="row"><span class="label">${t('bookInfo.publisher')}:</span> <span class="value">${book.publisher}</span></div>` : ''}
                            <div class="row"><span class="label">${t('bookInfo.originalPrice')}:</span> <span class="value">${book.originalPrice} PLN</span></div>
                            <div class="row"><span class="label">${t('bookInfo.finalPrice')}:</span> <span class="value">${book.displayPrice}</span></div>
                            <div class="row"><span class="label">${t('labels.condition')}:</span> <span class="value">${book.rating}/10</span></div>
                            ${book.createdAt ? `<div class="row"><span class="label">${t('labels.addedDate')}:</span> <span class="value">${new Date(book.createdAt).toLocaleDateString()}</span></div>` : ''}
                        </div>

                        <div class="section">
                            <div class="row"><span class="label">${t('labels.defects')}:</span> <span class="value">${formatDefectsSummary(book.defects)}</span></div>
                            <div class="row"><span class="label">${t('labels.uniqueness')}:</span> <span class="value">${formatUniquenessSummary(book.uniqueness)}</span></div>
                        </div>
                    </div>

                    <div class="column">
                        <div class="section">
                            ${book.description ? `<div class="row"><span class="label">${t('bookInfo.description')}:</span> <span class="value">${book.description}</span></div>` : ''}
                            <div class="row"><span class="label">${t('labels.marketFactors')}:</span> <span class="value">${formatMarketFactorsSummary(book.marketFactors)}</span></div>
                            ${book.ageInfo ? `<div class="row"><span class="label">${t('labels.age')}:</span> <span class="value">${book.ageInfo.years} ${t('labels.years')}</span></div>` : ''}
                            <div class="row"><span class="label">${t('labels.listingStatus')}:</span> <span class="value">${formatListingStatus(book.listingStatus)}</span></div>
                            ${book.listingStatus?.listedDate ? `<div class="row"><span class="label">${t('labels.listedDate')}:</span> <span class="value">${new Date(book.listingStatus.listedDate).toLocaleDateString()}</span></div>` : ''}
                            ${book.listingStatus?.soldDate ? `<div class="row"><span class="label">${t('labels.soldDate')}:</span> <span class="value">${new Date(book.listingStatus.soldDate).toLocaleDateString()}</span></div>` : ''}
                            ${book.source ? `<div class="row"><span class="label">${t('labels.source')}:</span> <span class="value">${book.source}</span></div>` : ''}
                            ${book.priceSource ? `<div class="row"><span class="label">${t('labels.priceSource')}:</span> <span class="value">${book.priceSource}</span></div>` : ''}
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <p>${t('labels.generatedBy')} BookScout • ${new Date().toLocaleDateString()}</p>
                </div>
            </body>
            </html>
        `;

            // Generate PDF
            const { uri } = await Print.printToFileAsync({
                html: htmlContent,
                width: 612,
                height: 792,
                base64: false
            });

            // Share the PDF file
            await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: t('alerts.exportBookTitle', { title: book.title }),
                UTI: 'com.adobe.pdf'
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
            Alert.alert(t('alerts.error'), t('alerts.pdfExportError'));
        }
    };

    return (
        <TouchableOpacity onPress={generatePDF} style={styles.button}>
            <FontAwesome5 name="file-pdf" size={20} color={colors.primary} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        padding: 8, // Dodajemy padding dla lepszego dotarcia
    }
});

export default ExportToPDFButton;
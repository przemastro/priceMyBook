import React from 'react';
import { TouchableOpacity, Alert, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { BookData, BookDefect, BookUniqueness, MarketFactors, ListingStatus } from '../types';
import * as Print from 'expo-print';
import { styles } from './styles'

interface ExportToPDFButtonProps {
    book: BookData;
    formatDefectsSummary: (defects: Record<string, BookDefect> | undefined) => string;
    formatUniquenessSummary: (uniqueness: BookUniqueness | undefined) => string;
    formatMarketFactorsSummary: (marketFactors: MarketFactors | undefined) => string;
    formatListingStatus: (status?: ListingStatus) => string;
    style?: object;
}

const ExportToPDFButton: React.FC<ExportToPDFButtonProps> = ({
                                                                 book,
                                                                 formatDefectsSummary,
                                                                 formatUniquenessSummary,
                                                                 formatMarketFactorsSummary,
                                                                 formatListingStatus,
                                                                 style,
                                                             }) => {
    const { t, i18n } = useTranslation();

    const escapeHtml = (unsafe?: string): string => {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    const getImageBase64 = async (imageUri: string): Promise<string> => {
        try {
            const uri = imageUri.startsWith('file://') ? imageUri : `file://${imageUri}`;
            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (!fileInfo.exists) return '';

            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64
            });
            return `data:image/jpeg;base64,${base64}`;
        } catch (error) {
            console.warn('Failed to convert image to base64:', error);
            return '';
        }
    };

    const generatePDF = async () => {
        try {
            let imageBase64 = '';
            if (book.imageUri) {
                imageBase64 = await getImageBase64(book.imageUri);
            }

            const htmlContent = `
<!DOCTYPE html>
<html lang="${i18n.language}">
<head>
    <meta charset="UTF-8">
    <title>${escapeHtml(book.title)} - ${t('labels.bookDetails')}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
        }
        h1 { color: #4a6cf7; font-size: 20px; margin-bottom: 10px; }
        .section { margin-bottom: 15px; }
        .label { font-weight: bold; color: #333; min-width: 150px; display: inline-block; }
        .value { margin-left: 10px; }
        .row { margin-bottom: 8px; }
        hr { border: 0.5px solid #eee; margin: 15px 0; }
        .header { text-align: center; margin-bottom: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
        .image-container { text-align: center; margin-bottom: 15px; }
        .book-image { max-width: 150px; max-height: 200px; border-radius: 4px; }
        .two-columns { display: flex; flex-wrap: wrap; }
        .column { flex: 1; min-width: 250px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${escapeHtml(book.title)}</h1>
        <p>${t('bookInfo.authors')}: ${escapeHtml(book.authors)}</p>
    </div>

    ${imageBase64 ? `
    <div class="image-container">
        <img src="${imageBase64}" class="book-image" alt="${t('labels.bookCover')}" />
    </div>
    ` : ''}

    <div class="two-columns">
        <div class="column">
            <div class="section">
                <div class="row"><span class="label">ISBN:</span> <span class="value">${escapeHtml(book.isbn)}</span></div>
                ${book.publisher ? `<div class="row"><span class="label">${t('bookInfo.publisher')}:</span> <span class="value">${escapeHtml(book.publisher)}</span></div>` : ''}
                <div class="row"><span class="label">${t('bookInfo.originalPrice')}:</span> <span class="value">${book.originalPrice} PLN</span></div>
                <div class="row"><span class="label">${t('bookInfo.finalPrice')}:</span> <span class="value">${escapeHtml(book.displayPrice)}</span></div>
                <div class="row"><span class="label">${t('labels.condition')}:</span> <span class="value">${book.rating}/10</span></div>
                ${book.createdAt ? `<div class="row"><span class="label">${t('labels.addedDate')}:</span> <span class="value">${new Date(book.createdAt).toLocaleDateString()}</span></div>` : ''}
            </div>

            <div class="section">
                <div class="row"><span class="label">${t('labels.defects')}:</span> <span class="value">${escapeHtml(formatDefectsSummary(book.defects))}</span></div>
                <div class="row"><span class="label">${t('labels.uniqueness')}:</span> <span class="value">${escapeHtml(formatUniquenessSummary(book.uniqueness))}</span></div>
            </div>
        </div>

        <div class="column">
            <div class="section">
                ${book.description ? `<div class="row"><span class="label">${t('bookInfo.description')}:</span> <span class="value">${escapeHtml(book.description)}</span></div>` : ''}
                <div class="row"><span class="label">${t('labels.marketFactors')}:</span> <span class="value">${escapeHtml(formatMarketFactorsSummary(book.marketFactors))}</span></div>
                ${book.ageInfo ? `<div class="row"><span class="label">${t('labels.age')}:</span> <span class="value">${book.ageInfo.years} ${t('labels.years')}</span></div>` : ''}
                <div class="row"><span class="label">${t('labels.listingStatus')}:</span> <span class="value">${escapeHtml(formatListingStatus(book.listingStatus))}</span></div>
                ${book.listingStatus?.listedDate ? `<div class="row"><span class="label">${t('labels.listedDate')}:</span> <span class="value">${new Date(book.listingStatus.listedDate).toLocaleDateString()}</span></div>` : ''}
                ${book.listingStatus?.soldDate ? `<div class="row"><span class="label">${t('labels.soldDate')}:</span> <span class="value">${new Date(book.listingStatus.soldDate).toLocaleDateString()}</span></div>` : ''}
                ${book.source ? `<div class="row"><span class="label">${t('labels.source')}:</span> <span class="value">${escapeHtml(book.source)}</span></div>` : ''}
                ${book.priceSource ? `<div class="row"><span class="label">${t('labels.priceSource')}:</span> <span class="value">${escapeHtml(book.priceSource)}</span></div>` : ''}
            </div>
        </div>
    </div>

    <div class="footer">
        <p>${t('labels.generatedBy')} BookScout • ${new Date().toLocaleDateString()}</p>
    </div>
</body>
</html>
            `;

            const { uri } = await Print.printToFileAsync({
                html: htmlContent,
                width: 612,  // 8.5 inches in points (8.5 * 72)
                height: 792, // 11 inches in points (11 * 72)
                base64: false
            });

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
        <TouchableOpacity onPress={generatePDF} style={[styles.button, style]}>
            <Text style={styles.buttonText}>{t('buttons.exportPDF')}</Text>
        </TouchableOpacity>
    );
};

export default ExportToPDFButton;
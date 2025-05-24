// app/components/ExportToPDFButton.tsx
import React from 'react';
import {TouchableOpacity, Alert, StyleSheet, ViewStyle, TextStyle} from 'react-native';
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
    style?: ViewStyle;
    iconStyle?: ViewStyle;
    textStyle?: TextStyle;
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
            // Create HTML content
            const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial; padding: 20px; }
              h1 { color: #4a6cf7; font-size: 20px; margin-bottom: 10px; }
              .section { margin-bottom: 15px; }
              .label { font-weight: bold; color: #333; min-width: 120px; display: inline-block; }
              .value { margin-left: 10px; }
              .row { margin-bottom: 8px; }
              hr { border: 0.5px solid #eee; margin: 15px 0; }
              .header { text-align: center; margin-bottom: 20px; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${book.title}</h1>
              <p>${t('bookInfo.authors')}: ${book.authors}</p>
            </div>
            
            <div class="section">
              <div class="row"><span class="label">ISBN:</span> <span class="value">${book.isbn}</span></div>
              <div class="row"><span class="label">${t('bookInfo.originalPrice')}:</span> <span class="value">${book.originalPrice} PLN</span></div>
              <div class="row"><span class="label">${t('bookInfo.finalPrice')}:</span> <span class="value">${book.displayPrice}</span></div>
              <div class="row"><span class="label">${t('labels.condition')}:</span> <span class="value">${book.rating}/10</span></div>
            </div>
            
            <hr/>
            
            <div class="section">
              <div class="row"><span class="label">${t('labels.defects')}:</span> <span class="value">${formatDefectsSummary(book.defects)}</span></div>
              <div class="row"><span class="label">${t('labels.uniqueness')}:</span> <span class="value">${formatUniquenessSummary(book.uniqueness)}</span></div>
              <div class="row"><span class="label">${t('labels.marketFactors')}:</span> <span class="value">${formatMarketFactorsSummary(book.marketFactors)}</span></div>
              ${book.ageInfo ? `<div class="row"><span class="label">${t('labels.age')}:</span> <span class="value">${book.ageInfo.years} ${t('labels.years')}</span></div>` : ''}
            </div>
            
            <hr/>
            
            <div class="section">
              <div class="row"><span class="label">${t('labels.listingStatus')}:</span> <span class="value">${formatListingStatus(book.listingStatus)}</span></div>
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
                width: 612,  // 8.5 inches in points (standard letter width)
                height: 792, // 11 inches in points (standard letter height)
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
        <TouchableOpacity
            style={styles.container}
            onPress={generatePDF}
            accessibilityLabel={t('buttons.exportToPDF')}
        >
            <FontAwesome5 name="file-pdf" size={20} color={colors.error} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        borderWidth: 2,
        borderColor: colors.error,
        marginLeft: 8,
    },
});

export default ExportToPDFButton;
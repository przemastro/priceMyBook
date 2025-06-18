import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import { useTranslation } from 'react-i18next';
import { BookInfo } from './types';
import { colors } from '@/styles/styles';
import { styles } from './styles'

interface BookInfoDisplayProps {
    bookInfo: BookInfo | null;
    isbn: string | null;
}

export const BookInfoDisplay = ({ bookInfo, isbn }: BookInfoDisplayProps) => {
    const { t } = useTranslation();

    if (!bookInfo) return null;

    return (
        <View style={styles.bookInfoContainer}>
            <Text style={styles.isbnText}>
                {t('bookInfo.scannedISBN')}: {isbn}
            </Text>

            {bookInfo.image && (
                <Image
                    source={{ uri: bookInfo.image }}
                    style={styles.bookImage}
                    resizeMode="contain"
                />
            )}
            <Text style={styles.bookInfoText}>
                {t('bookInfo.title')}: {bookInfo.title || t('bookInfo.unknown')}
            </Text>
            <Text style={styles.bookInfoText}>
                {t('bookInfo.authors')}: {bookInfo.authors || t('bookInfo.unknown')}
            </Text>
            {bookInfo.publisher && bookInfo.publisher !== 'Unknown' && (
                <Text style={styles.bookInfoText}>
                    {t('bookInfo.publisher')}: {bookInfo.publisher}
                </Text>
            )}
            {bookInfo.source === 'amazon' && (
                <Text style={styles.bookInfoText}>
                    Source: Amazon ({bookInfo.amazonData?.marketplace})
                </Text>
            )}
        </View>
    );
};

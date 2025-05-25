import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import { useTranslation } from 'react-i18next';
import { BookInfo } from './types';
import { colors } from '@/styles/styles';

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

const styles = StyleSheet.create({
    bookInfoContainer: {
        marginBottom: 16,
        alignItems: 'center',
    },
    isbnText: {
        fontSize: 18,
        color: colors.primary,
        marginBottom: 40,
        marginTop: 40,
        textAlign: 'center',
    },
    bookInfoText: {
        fontSize: 16,
        color: colors.black,
        marginBottom: 8,
        textAlign: 'center',
    },
    bookImage: {
        width: 120,
        height: 180,
        marginBottom: 16,
        borderRadius: 8,
    },
});
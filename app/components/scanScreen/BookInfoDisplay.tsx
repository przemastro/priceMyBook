import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import { useTranslation } from 'react-i18next';
import { BookInfo } from './types';
import { colors, typography } from '@/styles/styles';

interface BookInfoDisplayProps {
    bookInfo: BookInfo | null;
    isbn: string | null;
}

export const BookInfoDisplay = ({ bookInfo, isbn }: BookInfoDisplayProps) => {
    const { t } = useTranslation();

    if (!bookInfo) return null;

    return (
        <View style={styles.bookInfoContainer}>
            <Text style={styles.modalTitle}>
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
    modalTitle: {
        ...typography.h1,
        marginBottom: 16,
        textAlign: 'left',
        color: colors.black,
    },
    bookInfoText: {
        ...typography.body,
        marginBottom: 8,
        textAlign: 'center',
    },
    bookImage: {
        width: 120,
        height: 180,
        marginBottom: 16,
        borderRadius: 2,
    },
});
import React, {useState} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import { CustomAlertModal } from '../../alerts/CustomAlertModal';
import { styles } from './styles'

const IMAGE_SIZE = 80; // Zmniejszony rozmiar dla okrągłego obrazka
const CARD_PADDING = 16;

interface BasicBookInfoProps {
    bookImage: string | null;
    title: string;
    titleInput: string;
    isbn: string;
    isbnInput: string;
    originalPrice: string;
    onPickImage: () => Promise<void>;
    onEditPress: () => void;
    onScanPress: () => void;
    onClearPress: () => void;
    formatPrice: (price: string) => string;
    isScanning?: boolean;
    authors?: string;
    publisher?: string;
    description?: string;
}

export const BasicInfoSection: React.FC<BasicBookInfoProps> = ({
                                                                   bookImage,
                                                                   title,
                                                                   titleInput,
                                                                   isbn,
                                                                   isbnInput,
                                                                   originalPrice,
                                                                   onPickImage,
                                                                   onEditPress,
                                                                   onScanPress,
                                                                   onClearPress,
                                                                   formatPrice,
                                                                   isScanning = false,
                                                                   authors,
                                                                   publisher,
                                                                   description,
                                                               }) => {
    const { t } = useTranslation();
    const [showClearAlert, setShowClearAlert] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleClearPress = () => {
        setShowClearAlert(true);
    };

    const handleConfirmClear = () => {
        setShowClearAlert(false);
        onClearPress();
    };

    const handleImageLoadStart = () => {
        setImageLoading(true);
        setImageError(false);
    };

    const handleImageLoadEnd = () => {
        setImageLoading(false);
    };

    const handleImageError = () => {
        setImageLoading(false);
        setImageError(true);
    };

    return (
        <View style={localStyles.container}>
            <CustomAlertModal
                visible={showClearAlert}
                title={t('confirmation.title')}
                message={t('confirmation.clearAllFields')}
                confirmText={t('buttons.clear')}
                onConfirm={handleConfirmClear}
                type="warning"
                buttonFullWidth={true}
            />

            {/* Book card - clickable for edit */}
            <TouchableOpacity
                style={styles.bookCard}
                onPress={onEditPress}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={[colors.buttonSelected1, colors.buttonSelected2]}
                    style={localStyles.bookCardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {/* Clear button in top right corner */}
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={handleClearPress}
                    >
                        <Ionicons name="close" size={20} color={colors.primary} />
                    </TouchableOpacity>

                    <View style={styles.cardContent}>
                        {/* Book Image - Circular */}
                        <TouchableOpacity
                            style={localStyles.bookImageContainer}
                            onPress={onPickImage}
                            activeOpacity={0.8}
                        >
                            {bookImage ? (
                                <>
                                    <Image
                                        source={{
                                            uri: bookImage.startsWith('file://') ?
                                                bookImage :
                                                `file://${bookImage}`
                                        }}
                                        style={styles.bookImage}
                                        resizeMode="cover"
                                        onLoadStart={handleImageLoadStart}
                                        onLoad={handleImageLoadEnd}
                                        onError={handleImageError}
                                    />
                                    {imageLoading && (
                                        <View style={styles.loadingOverlay}>
                                            <ActivityIndicator size="small" color={colors.primary} />
                                        </View>
                                    )}
                                    {imageError && (
                                        <View style={styles.errorOverlay}>
                                            <Ionicons name="image-outline" size={24} color={colors.grayDark} />
                                        </View>
                                    )}
                                </>
                            ) : (
                                <View style={styles.bookImagePlaceholder}>
                                    <Ionicons name="book" size={32} color={colors.primary} />
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Book Details */}
                        <View style={styles.bookDetails}>
                            <Text style={styles.bookTitle} numberOfLines={1}>
                                {titleInput || title || t('bookInfo.noTitle')}
                            </Text>

                            <View style={styles.detailItem}>
                                <Text style={localStyles.detailLabel}>{t('bookInfo.isbn')}:</Text>
                                <Text style={localStyles.detailValue} numberOfLines={1}>
                                    {isbnInput || isbn || t('bookInfo.noIsbn')}
                                </Text>
                            </View>

                            <View style={styles.detailItem}>
                                <Text style={localStyles.detailLabel}>{t('bookInfo.price')}:</Text>
                                <Text style={[localStyles.detailValue, localStyles.priceValue]}>
                                    {formatPrice(originalPrice)}
                                </Text>
                            </View>

                            {authors && (
                                <View style={styles.detailItem}>
                                    <Text style={localStyles.detailLabel}>{t('bookInfo.authors')}:</Text>
                                    <Text style={localStyles.detailValue} numberOfLines={1}>
                                        {authors}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Additional details that don't fit in the main row */}
                    {(publisher || description) && (
                        <View style={styles.additionalDetails}>
                            {publisher && (
                                <View style={styles.detailItem}>
                                    <Text style={localStyles.detailLabel}>{t('bookInfo.publisher')}:</Text>
                                    <Text style={localStyles.detailValue} numberOfLines={1}>
                                        {publisher}
                                    </Text>
                                </View>
                            )}
                            {description && (
                                <View style={styles.detailItem}>
                                    <Text style={localStyles.detailLabel}>{t('bookInfo.description')}:</Text>
                                    <Text style={localStyles.detailValue} numberOfLines={2}>
                                        {description}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </LinearGradient>
            </TouchableOpacity>

            {/* Single Scan Button */}
            <TouchableOpacity
                style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
                onPress={onScanPress}
                disabled={isScanning}
            >
                <LinearGradient
                    colors={isScanning
                        ? [colors.gray, colors.gray]
                        : [colors.primary, colors.primary]}
                    style={styles.scanButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Ionicons
                        name="scan"
                        size={24}
                        color={colors.white}
                        style={styles.scanIcon}
                    />
                    <Text style={styles.scanButtonText}>
                        {t(isScanning ? 'buttons.scanning' : 'buttons.scanDefects')}
                    </Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};

const localStyles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    bookCardGradient: {
        padding: CARD_PADDING,
    },
    bookImageContainer: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        borderRadius: IMAGE_SIZE / 2,
        backgroundColor: colors.whiteBlue,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        overflow: 'hidden',
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.primary,
        marginRight: 8,
        minWidth: 80,
    },
    detailValue: {
        fontSize: 14,
        color: colors.primary,
        flex: 1,
    },
    priceValue: {
        fontWeight: '600',
    },
});

export default BasicInfoSection;
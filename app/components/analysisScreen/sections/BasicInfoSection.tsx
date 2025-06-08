import React, {useRef, useState} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import { CustomAlertModal } from '../../alerts/CustomAlertModal';

const IMAGE_SIZE = 120;
const CARD_PADDING = 15;

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

    const handleClearPress = () => {
        setShowClearAlert(true);
    };

    const handleConfirmClear = () => {
        setShowClearAlert(false);
        onClearPress();
    };

    const renderActionButtons = () => {
        return (
            <View style={styles.actionsRow}>
                {/* Edit Button */}
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onEditPress}
                >
                    <LinearGradient
                        colors={[`${colors.primary}20`, `${colors.primary}10`]}
                        style={styles.actionIconContainer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name="create" size={20} color={colors.primary} />
                    </LinearGradient>
                    <Text style={styles.actionButtonText}>{t('buttons.edit')}</Text>
                </TouchableOpacity>

                {/* Clear Button */}
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleClearPress}
                >
                    <LinearGradient
                        colors={[`${colors.primary}20`, `${colors.primary}10`]}
                        style={styles.actionIconContainer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <MaterialIcons name="delete" size={20} color={colors.primary} />
                    </LinearGradient>
                    <Text style={styles.actionButtonText}>{t('buttons.clear')}</Text>
                </TouchableOpacity>

                {/* Scan Button */}
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onScanPress}
                    disabled={isScanning}
                >
                    <LinearGradient
                        colors={isScanning
                            ? [`${colors.gray}20`, `${colors.gray}10`]
                            : [`${colors.primary}`, `${colors.primary}`]}
                        style={styles.actionIconContainer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons
                            name="scan"
                            size={20}
                            color={isScanning ? colors.gray : colors.white}
                        />
                    </LinearGradient>
                    <Text style={styles.actionButtonText}>
                        {t(isScanning ? 'buttons.scanning' : 'buttons.startScanning')}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <CustomAlertModal
                visible={showClearAlert}
                title={t('confirmation.title')}
                message={t('confirmation.clearAllFields')}
                confirmText={t('buttons.clear')}
                onConfirm={handleConfirmClear}
                type="warning"
                buttonFullWidth={true}
            />

            <View style={styles.bookCard}>
                <LinearGradient
                    colors={[colors.buttonSelected1, colors.buttonSelected2]}
                    style={styles.bookCardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.cardContent}>
                        {/* Left Column - Book Image */}
                        <TouchableOpacity
                            style={styles.bookImageContainer}
                            onPress={onPickImage}
                            activeOpacity={0.8}
                        >
                            {bookImage ? (
                                <Image
                                    source={{ uri: bookImage }}
                                    style={styles.bookImage}
                                    resizeMode="contain"
                                    onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                                />
                            ) : (
                                <LinearGradient
                                    colors={['rgba(0,0,0,0.03)', 'rgba(0,0,0,0.05)']}
                                    style={styles.bookImagePlaceholder}
                                >
                                    <Ionicons
                                        name="book"
                                        size={50}
                                        color={colors.primary}
                                    />
                                </LinearGradient>
                            )}
                        </TouchableOpacity>

                        {/* Right Column - Book Details */}
                        <View style={styles.bookDetails}>
                            <Text style={styles.bookTitle} numberOfLines={2}>
                                {titleInput || title || t('bookInfo.noTitle')}
                            </Text>

                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>{t('bookInfo.isbn')}:</Text>
                                <Text style={styles.detailValue}>{isbnInput || isbn || t('bookInfo.noIsbn')}</Text>
                            </View>

                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>{t('bookInfo.price')}:</Text>
                                <Text style={[styles.detailValue, styles.priceValue]}>
                                    {formatPrice(originalPrice)}
                                </Text>
                            </View>

                            {authors && (
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>{t('bookInfo.authors')}:</Text>
                                    <Text style={styles.detailValue} numberOfLines={2}>{authors}</Text>
                                </View>
                            )}

                            {publisher && (
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>{t('bookInfo.publisher')}:</Text>
                                    <Text style={styles.detailValue}>{publisher}</Text>
                                </View>
                            )}

                            {description && (
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>{t('bookInfo.description')}:</Text>
                                    <Text style={styles.detailValue} numberOfLines={3}>{description}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </LinearGradient>
            </View>

            {/* Action Buttons Row */}
            {renderActionButtons()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    bookCard: {
        width: '100%',
        borderRadius: 12,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
        marginBottom: 15,
    },
    bookCardGradient: {
        padding: CARD_PADDING,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    bookImageContainer: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: CARD_PADDING,
        backgroundColor: colors.whiteBlue,
    },
    bookImage: {
        width: '100%',
        height: '100%',
    },
    bookImagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookDetails: {
        flex: 1,
        flexShrink: 1,
    },
    bookTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 10,
    },
    detailItem: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.primary,
        marginRight: 5,
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
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
        paddingTop: 20
    },
    actionButton: {
        alignItems: 'center',
        width: '30%',
    },
    actionIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    actionButtonText: {
        fontSize: 12,
        textAlign: 'center',
        color: colors.grayDark,
        fontWeight: '500',
    },
});

export default BasicInfoSection;
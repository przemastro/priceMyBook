import React, {useRef, useState} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import { CustomAlertModal } from '../../alerts/CustomAlertModal';

const CARD_WIDTH = Dimensions.get('window').width * 0.8;
const CARD_HEIGHT = 400;
const ACTION_BUTTONS_WIDTH = 60;
const SCROLL_BUTTON_HEIGHT = 24;

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
    const scrollViewRef = useRef<ScrollView>(null);

    const handleClearPress = () => {
        setShowClearAlert(true);
    };

    const handleConfirmClear = () => {
        setShowClearAlert(false);
        onClearPress();
    };

    const scrollContentUp = () => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    };

    const scrollContentDown = () => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    };

    const renderActionButtons = () => {
        return (
            <View style={styles.actionsColumn}>
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
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.imageContainer}>
                            <TouchableOpacity
                                style={styles.bookImageContainer}
                                onPress={onPickImage}
                                activeOpacity={0.8}
                            >
                                {bookImage ? (
                                    <Image
                                        key={bookImage} // Dodane key dla lepszego renderowania
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
                        </View>

                        {/* Scroll up button */}
                        <View style={styles.scrollButtonsContainer}>
                            <TouchableOpacity
                                style={styles.scrollButton}
                                onPress={scrollContentUp}
                            >
                                <MaterialIcons name="keyboard-arrow-up" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.bookDetails}>
                            <View style={styles.detailRow}>
                                <Text style={styles.bookTitle} numberOfLines={2}>
                                    {titleInput || title || t('bookInfo.noTitle')}
                                </Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.bookInfo}>
                                    {t('bookInfo.isbn')}: {isbnInput || isbn || t('bookInfo.noIsbn')}
                                </Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.bookPrice}>
                                    {t('bookInfo.price')}: {formatPrice(originalPrice)}
                                </Text>
                            </View>

                            {authors && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.bookInfo}>
                                        {t('bookInfo.authors')}: {authors}
                                    </Text>
                                </View>
                            )}

                            {publisher && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.bookInfo}>
                                        {t('bookInfo.publisher')}: {publisher}
                                    </Text>
                                </View>
                            )}

                            {description && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.bookInfo}>
                                        {t('bookInfo.description')}: {description}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    {/* Scroll down button */}
                    <View style={styles.scrollButtonsContainer}>
                        <TouchableOpacity
                            style={styles.scrollButton}
                            onPress={scrollContentDown}
                        >
                            <MaterialIcons name="keyboard-arrow-down" size={20} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>

            {renderActionButtons()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginVertical: 0,
    },
    bookCard: {
        width: CARD_WIDTH - 80,
        height: CARD_HEIGHT,
        borderRadius: 12,
        marginLeft: 10,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
    },
    bookCardGradient: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 4,
        paddingBottom: 20,
    },
    scrollButtonsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: SCROLL_BUTTON_HEIGHT,
    },
    scrollButton: {
        padding: 4,
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    bookImageContainer: {
        width: 150,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 0,
        marginTop: 10,
        borderRadius: 75,
        overflow: 'hidden',
    },
    bookImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookImagePlaceholder: {
        width: 150,
        height: 150,
        borderRadius: 75,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookDetails: {
        flex: 1,
    },
    detailRow: {
        marginBottom: 6,
    },
    bookTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    bookInfo: {
        fontSize: 14,
        color: colors.primary,
        textAlign: 'center',
    },
    bookPrice: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: '600',
        textAlign: 'center',
    },
    actionsColumn: {
        width: ACTION_BUTTONS_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    actionButton: {
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
    },
    actionIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    actionButtonText: {
        fontSize: 12,
        textAlign: 'center',
        color: colors.grayDark,
        fontWeight: '500',
    },
});

export default BasicInfoSection;
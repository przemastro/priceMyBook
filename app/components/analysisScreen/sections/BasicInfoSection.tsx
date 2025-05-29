import React, {useState} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';

const CARD_WIDTH = Dimensions.get('window').width * 0.8;
const CARD_HEIGHT = 400; // Stała wysokość karty
const ACTION_BUTTONS_WIDTH = 60;

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
                                                                   formatPrice,
                                                                   isScanning = false,
                                                                   authors,
                                                                   publisher,
                                                                   description,
                                                               }) => {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(false);

    const toggleExpanded = () => {
        setExpanded(!expanded);
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
            <View style={styles.bookCard}>
                <LinearGradient
                    colors={[colors.buttonSelected1, colors.buttonSelected2]}
                    style={styles.bookCardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {/* Główny ScrollView obejmujący całą zawartość karty */}
                    <ScrollView
                        style={styles.mainScrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={true}
                    >
                        {/* Book Cover - Centered */}
                        <View style={styles.imageContainer}>
                            <TouchableOpacity
                                style={styles.bookImageContainer}
                                onPress={onPickImage}
                                activeOpacity={0.8}
                            >
                                {bookImage ? (
                                    <Image
                                        source={{ uri: bookImage }}
                                        style={styles.bookImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <LinearGradient
                                        colors={['rgba(0,0,0,0.03)', 'rgba(0,0,0,0.05)']}
                                        style={styles.bookImagePlaceholder}
                                    >
                                        <Ionicons
                                            name="book"
                                            size={40}
                                            color={colors.primary}
                                        />
                                    </LinearGradient>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Book Details */}
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

                            <TouchableOpacity
                                onPress={toggleExpanded}
                                style={styles.moreButton}
                            >
                                <Text style={styles.moreButtonText}>
                                    {expanded ? t('buttons.less') : t('buttons.more')}
                                </Text>
                            </TouchableOpacity>

                            {expanded && (
                                <View style={styles.additionalInfo}>
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
                            )}
                        </View>
                    </ScrollView>
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
    mainScrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 4,
        paddingBottom: 20, // Dodatkowe miejsce na dole
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    bookImageContainer: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    bookImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    bookImagePlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
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
    moreButton: {
        marginTop: 8,
        paddingVertical: 4,
        alignItems: 'center',
    },
    moreButtonText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    additionalInfo: {
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
        paddingTop: 8,
        width: '100%',
    },
});
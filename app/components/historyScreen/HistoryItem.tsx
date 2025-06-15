import React, { useState, useEffect } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, ImageSourcePropType} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/styles';

interface BookUniqueness {
    isMassMarket: boolean;
    isFirstEdition: boolean;
    isCollectorsEdition: boolean;
    hasAuthorSignature: boolean;
    isLimitedEdition: boolean;
    isPublisherDefunct: boolean;
}

interface MarketFactors {
    demand: 'veryHigh' | 'high' | 'medium' | 'low' | 'veryLow';
    supply: 'veryLow' | 'low' | 'medium' | 'high' | 'flooded';
    publicationYear?: number;
}

interface MarketData {
    demand: MarketFactors['demand'];
    supply: MarketFactors['supply'];
    priceRange: [number, number];
    priceHistory: { date: string; price: number }[];
    lastUpdated: Date;
    source: 'google' | 'amazon' | 'openLibrary' | 'simulated';
}

interface HistoryItemProps {
    item: {
        isbn: string;
        title?: string;
        authors?: string;
        price?: string;
        originalPrice?: string;
        createdAt?: string;
        marketFactors?: MarketFactors;
        uniqueness?: BookUniqueness;
        marketData?: MarketData;
        publisher?: string;
        description?: string;
        imageUri?: string;
    };
}

const defaultUniqueness: BookUniqueness = {
    isMassMarket: false,
    isFirstEdition: false,
    isCollectorsEdition: false,
    hasAuthorSignature: false,
    isLimitedEdition: false,
    isPublisherDefunct: false
};

const defaultMarketFactors: MarketFactors = {
    demand: 'medium',
    supply: 'medium'
};

const HistoryItem = ({ item }: HistoryItemProps) => {
    const router = useRouter();
    const { t } = useTranslation();
    const [isPressed, setIsPressed] = useState(false);
    const [imageSource, setImageSource] = useState<ImageSourcePropType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (item.imageUri) {
            setIsLoading(true);
            setHasError(false);

            if (item.imageUri.startsWith('http')) {
                setImageSource({ uri: item.imageUri });
            } else {
                setImageSource({ uri: `file://${item.imageUri}` });
            }
        } else {
            setImageSource(null);
        }
    }, [item.imageUri]);

    const handleImageError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    const handleImageLoad = () => {
        setIsLoading(false);
        setHasError(false);
    };

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            onPress={() => {
                router.push({
                    pathname: '/AnalysisScreen',
                    params: {
                        isbn: item.isbn,
                        title: item.title,
                        authors: item.authors,
                        fromHistory: 'true',
                        editMode: 'true',
                        marketFactors: JSON.stringify(item.marketFactors || defaultMarketFactors),
                        uniqueness: JSON.stringify(item.uniqueness || defaultUniqueness),
                        marketData: item.marketData ? JSON.stringify(item.marketData) : undefined,
                        bookInfo: JSON.stringify({
                            title: item.title,
                            authors: item.authors,
                            publisher: item.publisher,
                            description: item.description,
                            imageUri: item.imageUri,
                            amazonData: item.marketData ? {
                                data: {
                                    marketFactors: item.marketFactors,
                                    priceRange: item.marketData.priceRange
                                }
                            } : undefined
                        })
                    }
                });
            }}
            style={styles.touchable}
        >
            <LinearGradient
                colors={isPressed ? [colors.buttonSelected1, colors.buttonSelected2] : ['white', 'white']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <View style={styles.content}>
                    <View style={[styles.imageContainer, isPressed && styles.pressedImage]}>
                        {imageSource ? (
                            <>
                                <Image
                                    source={imageSource}
                                    style={styles.bookImage}
                                    resizeMode="cover"
                                    onLoadStart={() => setIsLoading(true)}
                                    onLoad={handleImageLoad}
                                    onError={handleImageError}
                                />
                                {isLoading && (
                                    <View style={styles.loadingOverlay}>
                                        <ActivityIndicator size="small" color={colors.primary} />
                                    </View>
                                )}
                                {hasError && (
                                    <View style={styles.errorOverlay}>
                                        <Ionicons
                                            name="image-outline"
                                            size={24}
                                            color={colors.grayDark}
                                        />
                                    </View>
                                )}
                            </>
                        ) : (
                            <Ionicons
                                name="image-outline"
                                size={28}
                                color={isPressed ? colors.white : colors.primary}
                            />
                        )}
                    </View>

                    <View style={styles.textContainer}>
                        <Text
                            style={[styles.title, isPressed && styles.pressedText]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {item.title || t('bookInfo.unknownTitle')}
                        </Text>
                        {item.authors && (
                            <Text
                                style={[styles.authors, isPressed && styles.pressedText]}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {item.authors}
                            </Text>
                        )}
                        <Text style={[styles.isbn, isPressed && styles.pressedText]}>
                            ISBN: {item.isbn}
                        </Text>
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={isPressed ? colors.white : colors.grayDark}
                    />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    touchable: {
        borderRadius: 12,
        marginBottom: 12,
        marginHorizontal: 16,
        overflow: 'hidden',
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    gradient: {
        padding: 16,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    imageContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.whiteBlue,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    pressedImage: {
        backgroundColor: colors.primary,
    },
    bookImage: {
        width: '100%',
        height: '100%',
    },
    loadingOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.7)',
    },
    errorOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.whiteBlue,
    },
    textContainer: {
        flex: 1,
        marginRight: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.black,
        marginBottom: 4,
    },
    pressedText: {
        color: colors.white,
    },
    isbn: {
        fontSize: 14,
        color: colors.grayDark,
    },
    authors: {
        fontSize: 14,
        color: colors.grayDark,
        fontStyle: 'italic',
        marginBottom: 4,
    },
});

export default HistoryItem;
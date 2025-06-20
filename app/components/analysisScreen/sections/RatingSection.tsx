import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/styles/styles';
import Animated from 'react-native-reanimated';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';

interface RatingSectionProps {
    bookRating: number;
    averageUsedPrice: number | null;
    finalPrice: number;
    expanded: boolean;
    toggleExpanded: () => void;
    formatPrice: (price: number) => string;
    children: React.ReactNode;
}

export const RatingSection: React.FC<RatingSectionProps> = ({
                                                                bookRating,
                                                                averageUsedPrice,
                                                                finalPrice,
                                                                expanded,
                                                                toggleExpanded,
                                                                formatPrice,
                                                                children,
                                                            }) => {
    const { t } = useTranslation();

    const getRatingLabel = (rating: number) => {
        if (rating >= 8) return t('ratings.excellent');
        if (rating >= 6) return t('ratings.good');
        if (rating >= 4) return t('ratings.average');
        return t('ratings.poor');
    };

    return (
        <View style={localStyles.container}>
            <LinearGradient
                colors={[colors.buttonSelected1, colors.buttonSelected2]}
                style={styles.card}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <View style={styles.headerRow}>
                    <Text style={styles.sectionTitle}>{t('bookInfo.condition')}</Text>
                    <View style={styles.stars}>
                        {[...Array(10)].map((_, i) => (
                            <Ionicons
                                key={`star-${i}-${bookRating}`}
                                name={i < bookRating ? 'star' : 'star-outline'}
                                size={16}
                                color={i < bookRating ? colors.primary : colors.grayLight}
                            />
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.infoBox}
                    onPress={toggleExpanded}
                    activeOpacity={0.8}
                >
                    <View style={styles.row}>
                        <Ionicons name="book-outline" size={14} color={colors.secondary} />
                        <Text style={styles.label}>{t('labels.condition')}:</Text>
                        <Text style={styles.value}>{`${bookRating}/10 - ${getRatingLabel(bookRating)}`}</Text>
                    </View>

                    <View style={localStyles.separator} />

                    <View style={styles.row}>
                        <Ionicons name="pricetag-outline" size={14} color={colors.secondary} />
                        <Text style={styles.label}>{t('bookInfo.usedPrice')}:</Text>
                        <Text style={styles.value}>
                            {averageUsedPrice ? formatPrice(averageUsedPrice) : t('bookInfo.noData')}
                        </Text>
                    </View>

                    <View style={localStyles.separator} />

                    <View style={styles.row}>
                        <Ionicons name="cash-outline" size={14} color={colors.primary} />
                        <Text style={[styles.label, { fontWeight: '600' }]}>{t('bookInfo.estimatedValue')}:</Text>
                        <View style={styles.estimatedRow}>
                            <Text style={[styles.value, { fontWeight: '600' }]}>{formatPrice(finalPrice)}</Text>
                            <Ionicons
                                name={expanded ? 'chevron-up' : 'chevron-down'}
                                size={14}
                                color={colors.primary}
                            />
                        </View>
                    </View>
                </TouchableOpacity>

                <Animated.View
                    style={[
                        styles.expandedContainer,
                        {
                            opacity: expanded ? 1 : 0,
                            display: expanded ? 'flex' : 'none',
                        },
                    ]}
                >
                    {children}
                </Animated.View>
            </LinearGradient>
        </View>
    );
};

const localStyles = StyleSheet.create({
    container: {
        marginBottom: 20,
        paddingHorizontal: 0,
    },
    separator: {
        height: 1,
        backgroundColor: colors.grayLight,
        marginVertical: 6,
        opacity: 0.3,
    },
});
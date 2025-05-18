// components/analysisScreen/BasicInfoSection.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { styles } from './styles';

interface BasicBookInfoProps {
    bookImage: string | null;
    title: string;
    titleInput: string;
    isbn: string;
    isbnInput: string;
    originalPrice: string;
    onPickImage: () => Promise<void>;
    onEditPress: () => void;
    formatPrice: (price: string) => string;
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
                                                                formatPrice
                                                            }) => {
    return (
        <View style={styles.detailsRowContainer}>
            <TouchableOpacity
                style={styles.bookCoverContainer}
                onPress={onPickImage}
                activeOpacity={0.8}
            >
                {bookImage ? (
                    <Image
                        source={{ uri: bookImage }}
                        style={styles.bookCoverImage}
                        resizeMode="cover"
                    />
                ) : (
                    <LinearGradient
                        colors={[colors.buttonSelected1, colors.buttonSelected2]}
                        style={styles.bookCoverPlaceholder}
                    >
                        <Ionicons
                            name="image-outline"
                            size={32}
                            color={colors.primary}
                        />
                    </LinearGradient>
                )}
            </TouchableOpacity>

            <View style={styles.bookDetailsColumn}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailValue} numberOfLines={2} ellipsizeMode="tail">
                        Tytuł: {titleInput || title}
                    </Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailValue}>
                        ISBN: {isbnInput || isbn || 'Brak ISBN'}
                    </Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailValue}>
                        Cena oryginalna: {formatPrice(originalPrice)}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.editButton}
                    onPress={onEditPress}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={[colors.buttonSelected1, colors.buttonSelected2]}
                        style={styles.editButtonGradient}
                    >
                        <Ionicons
                            name="create-outline"
                            size={16}
                            color={colors.primary}
                        />
                        <Text style={styles.editButtonText}>Edytuj</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

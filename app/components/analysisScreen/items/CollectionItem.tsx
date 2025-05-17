import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';

type CollectionItemProps = {
    collection: string;
    bookCount: number;
    selected: boolean;
    onPress: () => void;
};

const CollectionItem = ({ collection, bookCount, selected, onPress }: CollectionItemProps) => {
    const { t, i18n } = useTranslation();

    const getBookWord = (count: number, language: string) => {
        if (language === 'pl') {
            if (count === 1) return 'labels.book_one';
            if (count % 100 >= 12 && count % 100 <= 14) return 'labels.book_many';
            if ([2,3,4].includes(count % 10)) return 'labels.book_few';
            return 'labels.book_many';
        }
        return count === 1 ? 'labels.book_one' : 'labels.book_other';
    };

    return (
        <TouchableOpacity
            style={[
                styles.collectionButton,
                selected && styles.selectedCollectionButton
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <LinearGradient
                colors={selected
                    ? [colors.buttonSelected1, colors.buttonSelected2]
                    : [colors.white, colors.whiteBlue]}
                style={styles.collectionButtonGradient}
            >
                <View style={styles.collectionIconContainer}>
                    <MaterialIcons
                        name="collections-bookmark"
                        size={24}
                        color={selected ? colors.primary : colors.secondary}
                    />
                </View>
                <Text
                    style={[
                        styles.collectionName,
                        selected && styles.selectedCollectionName
                    ]}
                    numberOfLines={2}
                >
                    {collection}
                </Text>
                <Text style={styles.collectionBookCount}>
                    {bookCount} {t(getBookWord(bookCount, i18n.language))}
                </Text>
            </LinearGradient>
        </TouchableOpacity>
    );
};

export default React.memo(CollectionItem);
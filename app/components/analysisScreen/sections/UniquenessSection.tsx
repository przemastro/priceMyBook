import React from 'react';
import {View, Text, FlatList, Dimensions, StyleSheet} from 'react-native';
import { useTranslation } from 'react-i18next';
import UniquenessItem from '../items/UniquenessItem';
import { colors } from '@/styles/styles';
import { UNIQUENESS_TYPES } from '../types';

const COLUMNS = 3;
const BUTTON_MARGIN = 15;
const { width } = Dimensions.get('window');
const buttonSize = (width - 40 - (BUTTON_MARGIN * (COLUMNS - 1) * 2.7)) / COLUMNS;

type UniquenessSectionProps = {
    uniqueness: Record<string, boolean>;
    onToggleUniqueness: (id: string) => void;
};

const UniquenessSection = ({ uniqueness, onToggleUniqueness }: UniquenessSectionProps) => {
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <FlatList
                data={UNIQUENESS_TYPES}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        <UniquenessItem
                            item={item}
                            selected={uniqueness[item.id as keyof typeof uniqueness]}
                            onPress={() => onToggleUniqueness(item.id)}
                            buttonSize={buttonSize}
                        />
                        <Text
                            style={styles.uniquenessName}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                        >
                            {t(`uniqueness.${item.id}`)}
                        </Text>
                    </View>
                )}
                keyExtractor={item => item.id}
                numColumns={COLUMNS}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                scrollEnabled={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background,
        padding: 10,
        borderRadius: 15,
        marginBottom: 20,
    },
    listContent: {
        justifyContent: 'center',
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    itemContainer: {
        alignItems: 'center',
        width: buttonSize,
        marginHorizontal: BUTTON_MARGIN / 2,
    },
    uniquenessName: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.black,
        marginTop: 12,
        textAlign: 'center',
        width: '100%',
        paddingHorizontal: 4,
    },
});

export default UniquenessSection;
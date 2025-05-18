import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import UniquenessItem from '../items/UniquenessItem';
import { styles } from './styles';
import { UNIQUENESS_TYPES } from '../types';

type UniquenessSectionProps = {
    uniqueness: Record<string, boolean>;
    onToggleUniqueness: (id: string) => void;
};

const UniquenessSection = ({ uniqueness, onToggleUniqueness }: UniquenessSectionProps) => {
    const { t } = useTranslation();

    return (
        <View style={styles.combinedSection}>
            <Text style={styles.stepTitle}>{t('stepTitles.uniqueness')}</Text>
            <FlatList
                data={UNIQUENESS_TYPES}
                renderItem={({ item }) => (
                    <UniquenessItem
                        item={item}
                        selected={uniqueness[item.id as keyof typeof uniqueness]}
                        onPress={() => onToggleUniqueness(item.id)}
                    />
                )}
                keyExtractor={item => item.id}
                numColumns={3}
                columnWrapperStyle={styles.columnWrapper}
                scrollEnabled={false}
            />
        </View>
    );
};

export default UniquenessSection;
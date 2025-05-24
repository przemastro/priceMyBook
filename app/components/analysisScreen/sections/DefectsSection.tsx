import React from 'react';
import {View, Text, FlatList, Dimensions} from 'react-native';
import { useTranslation } from 'react-i18next';
import DefectItem from '../items/DefectItem';
import { styles } from './styles';
import { BookDefect } from '../types';

type DefectsSectionProps = {
    defects: BookDefect[];
    onToggleDefect: (id: string) => void;
};

const DefectsSection = ({ defects, onToggleDefect }: DefectsSectionProps) => {
    const { t } = useTranslation();

    return (
        <View style={styles.combinedSection}>
            <Text style={styles.stepTitle}>{t('stepTitles.detectedDefects')}</Text>
            <View style={styles.defectsGrid}>
                <FlatList
                    data={defects}
                    renderItem={({ item }) => (
                        <DefectItem
                            item={item}
                            onPress={() => onToggleDefect(item.id)}
                        />
                    )}
                    keyExtractor={item => item.id}
                    numColumns={3}
                    columnWrapperStyle={styles.columnWrapper}
                    scrollEnabled={false}
                />
            </View>
        </View>
    );
};

export default DefectsSection;
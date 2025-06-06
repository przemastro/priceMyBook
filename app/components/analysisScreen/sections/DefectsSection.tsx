import React from 'react';
import {View, Text, FlatList, Dimensions, StyleSheet} from 'react-native';
import { useTranslation } from 'react-i18next';
import DefectItem from '../items/DefectItem';
import { BookDefect, DEFECT_TYPES } from '../types';
import { colors } from '@/styles/styles';

type DefectsSectionProps = {
    defects: BookDefect[];
    onToggleDefect: (id: string) => void;
};

const COLUMNS = 3;
const BUTTON_MARGIN = 20;
const { width } = Dimensions.get('window');
const buttonSize = (width - 40 - (BUTTON_MARGIN * (COLUMNS - 1) * 2)) / COLUMNS;

const DefectsSection = ({ defects, onToggleDefect }: DefectsSectionProps) => {
    const { t } = useTranslation();

    // Wzbogacenie defektów o kolory z DEFECT_TYPES
    const enhancedDefects = defects.map(defect => {
        const defectType = DEFECT_TYPES.find(dt => dt.id === defect.id);
        return {
            ...defect,
            color: defectType?.color || '#f39c12' // Domyślny kolor jeśli nie znaleziono
        };
    });

    return (
        <View style={styles.container}>
            <FlatList
                data={enhancedDefects}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        <DefectItem
                            item={item}
                            onPress={() => onToggleDefect(item.id)}
                            buttonSize={buttonSize}
                        />
                        <Text
                            style={styles.defectName}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                        >
                            {t(`defects.${item.id}`)}
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
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.blackDark,
        marginBottom: 25,
        textAlign: 'center',
    },
    listContent: {
        justifyContent: 'center',
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    itemContainer: {
        alignItems: 'center',
        width: buttonSize,
        marginHorizontal: BUTTON_MARGIN / 2,
    },
    defectName: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.black,
        marginTop: 12,
        textAlign: 'center',
        width: '100%',
        paddingHorizontal: 4,
    },
});

export default DefectsSection;
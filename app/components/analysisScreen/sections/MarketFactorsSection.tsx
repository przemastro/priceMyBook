import React from 'react';
import {View, Text, FlatList, Dimensions, StyleSheet} from 'react-native';
import { useTranslation } from 'react-i18next';
import MarketFactorItem from '../items/MarketFactorItem';
import MarketChart from '../charts/MarketChart';
import { colors } from '@/styles/styles';
import { MarketData, MarketFactorToggle, IncludedMarketFactors } from '../types';
import { styles } from './styles'

const COLUMNS = 3;
const BUTTON_MARGIN = 15;
const { width } = Dimensions.get('window');
const buttonSize = (width - 40 - (BUTTON_MARGIN * (COLUMNS - 1) * 2.7)) / COLUMNS;

type MarketFactorsSectionProps = {
    marketFactors: MarketFactorToggle[];
    includedMarketFactors: IncludedMarketFactors;
    onToggleMarketFactor: (id: keyof IncludedMarketFactors) => void;
    marketData: MarketData | null;
};

const MarketFactorsSection = ({
                                  marketFactors,
                                  includedMarketFactors,
                                  onToggleMarketFactor,
                                  marketData,
                              }: MarketFactorsSectionProps) => {
    const { t } = useTranslation();

    return (
        <View style={localStyles.container}>
            <FlatList
                data={marketFactors}
                renderItem={({ item }) => (
                    <View style={localStyles.itemContainer}>
                        <MarketFactorItem
                            item={item}
                            selected={includedMarketFactors[item.id]}
                            onPress={() => onToggleMarketFactor(item.id)}
                            buttonSize={buttonSize}
                        />
                        <Text
                            style={styles.factorName}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                        >
                            {t(`marketFactors.${item.id}`)}
                        </Text>
                    </View>
                )}
                keyExtractor={item => item.id}
                numColumns={COLUMNS}
                contentContainerStyle={localStyles.listContent}
                columnWrapperStyle={localStyles.columnWrapper}
                scrollEnabled={false}
            />
            <MarketChart marketData={marketData} />
        </View>
    );
};

const localStyles = StyleSheet.create({
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
});

export default MarketFactorsSection;
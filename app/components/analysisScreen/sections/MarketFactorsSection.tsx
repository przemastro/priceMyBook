import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import MarketFactorItem from '../items/MarketFactorItem';
import MarketChart from '../charts/MarketChart';
import { styles } from './styles';
import { MarketData, MarketFactorToggle, IncludedMarketFactors } from '../types';

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
        <View style={styles.combinedSection}>
            <Text style={styles.stepTitle}>{t('stepTitles.marketFactors')}</Text>
            <FlatList
                data={marketFactors}
                renderItem={({ item }) => (
                    <MarketFactorItem
                        item={item}
                        selected={includedMarketFactors[item.id]}
                        onPress={() => onToggleMarketFactor(item.id)}
                    />
                )}
                keyExtractor={item => item.id}
                numColumns={3}
                columnWrapperStyle={styles.columnWrapper}
                scrollEnabled={false}
            />
            {marketData && <MarketChart marketData={marketData} />}
        </View>
    );
};

export default MarketFactorsSection;
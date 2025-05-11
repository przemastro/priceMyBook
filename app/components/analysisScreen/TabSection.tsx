import React from 'react';
import { View, FlatList, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import {
    BookDefect,
    BookUniqueness,
    MarketFactorToggle,
    DEFECT_TYPES,
    UNIQUENESS_TYPES,
    MARKET_FACTOR_TOGGLES, MarketFactors
} from './types';
import { colors, typography } from '@/styles/styles';


interface TabSectionProps {
    expandedTabs: Record<string, boolean>;
    defects: BookDefect[];
    uniqueness: BookUniqueness;
    includedMarketFactors: { // Dodajemy nowy prop
        includePublicationYear: boolean;
        includeDemand: boolean;
        includeSupply: boolean;
    };
    collections: string[];
    selectedCollection: string;
    books: Record<string, any[]>;
    editMode: boolean;
    isLoading: boolean;
    onToggleTab: (tabId: string) => void;
    onToggleDefect: (id: string) => void;
    onToggleUniqueness: (id: keyof BookUniqueness) => void;
    onToggleMarketFactor: (id: 'includePublicationYear' | 'includeDemand' | 'includeSupply') => void; // Poprawiamy typ
    onSelectCollection: (collection: string) => void; // Zmieniamy nazwę z onSetSelectedCollection dla spójności
    onSaveBook: () => void;
}

const TabSection: React.FC<TabSectionProps> = ({
                                                   expandedTabs,
                                                   defects,
                                                   uniqueness,
                                                   includedMarketFactors,
                                                   collections,
                                                   selectedCollection,
                                                   books,
                                                   isLoading,
                                                   editMode,
                                                   onToggleTab,
                                                   onToggleDefect,
                                                   onToggleUniqueness,
                                                   onToggleMarketFactor,
                                                   onSelectCollection,
                                                   onSaveBook
                                               }) => {
    const { t } = useTranslation();
    const router = useRouter();

    const slides = [
        { id: 'defects', title: t('labels.selectDefects'), icon: 'warning-outline' },
        { id: 'uniqueness', title: t('labels.uniqueness'), icon: 'sparkles-outline' },
        { id: 'market', title: t('labels.marketFactors'), icon: 'trending-up-outline' },
        { id: 'collection', title: t('labels.collection'), icon: 'library-outline' }
    ];

    const getBookWord = (count: number) => {
        return count === 1 ? t('labels.book_one') : t('labels.book_other');
    };

    const renderDefectItem = ({ item }: { item: BookDefect }) => (
        <TouchableOpacity
            style={[
                styles.defectItemContainer,
                item.selected && styles.selectedDefect
            ]}
            onPress={() => onToggleDefect(item.id)}
            activeOpacity={0.7}
        >
            {item.selected && (
                <>
                    <View style={styles.sliderRow}>
                        <Text style={styles.reductionText}>
                            {item.priceReduction.toFixed(0)}%
                        </Text>
                    </View>
                </>
            )}
            {item.selected && item.count > 0 && (
                <View style={styles.defectCountBadge}>
                    <Text style={styles.defectCountBadgeText}>{item.count}</Text>
                </View>
            )}

            <View style={styles.defectIconContainer}>
                <Ionicons
                    name={item.icon as any}
                    size={28}
                    color={item.selected ? colors?.primary : '#5c6b7e'}
                />
            </View>
            <Text style={[
                styles.defectName,
                item.selected && styles.selectedDefectName
            ]}>
                {t(`defects.${item.id}`)}
            </Text>
        </TouchableOpacity>
    );

    const renderUniquenessItem = ({ item }: { item: typeof UNIQUENESS_TYPES[number] }) => (
        <TouchableOpacity
            style={[
                styles.defectItemContainer,
                uniqueness[item.id] && styles.selectedDefect
            ]}
            onPress={() => onToggleUniqueness(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.defectIconContainer}>
                <Ionicons
                    name={item.icon as any}
                    size={28}
                    color={uniqueness[item.id] ? colors?.primary : '#5c6b7e'}
                />
            </View>
            <Text style={[
                styles.defectName,
                uniqueness[item.id] && styles.selectedDefectName
            ]}>
                {t(item.label)}
            </Text>
        </TouchableOpacity>
    );

    const renderMarketFactorToggle = ({ item }: { item: MarketFactorToggle }) => (
        <TouchableOpacity
            style={[
                styles.defectItemContainer,
                includedMarketFactors[item.id] && styles.selectedDefect
            ]}
            onPress={() => onToggleMarketFactor(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.defectIconContainer}>
                <Ionicons
                    name={item.icon as any}
                    size={28}
                    color={includedMarketFactors[item.id] ? colors?.primary : '#5c6b7e'}
                />
            </View>
            <Text style={[
                styles.defectName,
                includedMarketFactors[item.id] && styles.selectedDefectName
            ]}>
                {t(item.label)}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.tabSectionContainer}>
            <View style={styles.tabsContainer}>
                {slides.map((slide) => (
                    <TouchableOpacity
                        key={slide.id}
                        style={[
                            styles.tabButton,
                            expandedTabs[slide.id] && styles.activeTabButton
                        ]}
                        onPress={() => onToggleTab(slide.id)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.tabContent}>
                            <Ionicons
                                name={slide.icon as any}
                                size={20}
                                color={expandedTabs[slide.id] ? colors?.primary : colors?.grayDark}
                                style={styles.tabIcon}
                            />
                            <Text style={[
                                styles.tabText,
                                expandedTabs[slide.id] && styles.activeTabText
                            ]}>
                                {slide.title}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.tabContentWrapper}>
                {expandedTabs.defects && (
                    <View style={styles.slideContent}>
                        <FlatList
                            data={defects}
                            renderItem={renderDefectItem}
                            keyExtractor={item => item.id}
                            numColumns={2}
                            columnWrapperStyle={styles.columnWrapper}
                            scrollEnabled={false}
                        />
                    </View>
                )}

                {expandedTabs.uniqueness && (
                    <View style={styles.slideContent}>
                        <FlatList
                            data={UNIQUENESS_TYPES}
                            renderItem={renderUniquenessItem}
                            keyExtractor={item => item.id}
                            numColumns={2}
                            columnWrapperStyle={styles.columnWrapper}
                            scrollEnabled={false}
                        />
                    </View>
                )}

                {expandedTabs.market && (
                    <View style={styles.slideContent}>
                        <FlatList
                            data={MARKET_FACTOR_TOGGLES}
                            renderItem={renderMarketFactorToggle}
                            keyExtractor={item => item.id}
                            numColumns={2}
                            columnWrapperStyle={styles.columnWrapper}
                            scrollEnabled={false}
                        />
                    </View>
                )}

                {expandedTabs.collection && (
                    <View style={styles.slideContent}>
                        <View style={styles.collectionRow}>
                            <View style={styles.collectionPickerContainer}>
                                {collections.length > 0 ? (
                                    <View style={styles.pickerContainer}>
                                        <Picker
                                            selectedValue={selectedCollection}
                                            onValueChange={onSelectCollection}
                                            style={styles.picker}
                                            dropdownIconColor={colors?.primary}
                                        >
                                            {collections.map((collection) => (
                                                <Picker.Item
                                                    key={collection}
                                                    label={collection}
                                                    value={collection}
                                                />
                                            ))}
                                        </Picker>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.createCollectionButton}
                                        onPress={() => router.push('/CollectionsScreen')}
                                    >
                                        <Text style={styles.createCollectionText}>
                                            {t('buttons.createFirstCollection')}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {collections.length > 0 && (
                                <View style={styles.bookCountContainer}>
                                    <Ionicons name="book" size={20} color={colors?.primary} />
                                    <Text style={styles.bookCountText}>
                                        {books[selectedCollection]?.length || 0} {getBookWord(books[selectedCollection]?.length || 0)}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={onSaveBook}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <View style={styles.saveButtonContent}>
                                    <Ionicons
                                        name={editMode ? "save-outline" : "add-circle-outline"}
                                        size={24}
                                        color="white"
                                        style={styles.saveButtonIcon}
                                    />
                                    <Text style={styles.saveButtonText}>
                                        {editMode ? t('buttons.saveChanges') : t('buttons.addToCollection')}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

export default React.memo(TabSection);
import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    FlatList,
    ActivityIndicator
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '@/context/AppContext';
import { colors, typography } from '@/styles/styles';
import {
    BookDefect,
    BookUniqueness,
    MARKET_FACTOR_TOGGLES,
    MarketFactorToggle,
    PriceCalculation,
    UNIQUENESS_TYPES
} from './types';
import { formatCurrency } from '../../utils/currency';
import {useRouter} from "expo-router";
import {Picker} from "@react-native-picker/picker";

const { width: viewportWidth } = Dimensions.get('window');

interface TabSectionProps {
    expandedTabs: Record<string, boolean>;
    defects: BookDefect[];
    uniqueness: BookUniqueness;
    includedMarketFactors: {
        includePublicationYear: boolean;
        includeDemand: boolean;
        includeSupply: boolean;
    };
    collections: string[];
    selectedCollection: string;
    books: Record<string, any[]>;
    editMode: boolean;
    isLoading: boolean;
    currentStep: number;
    totalSteps: number;
    onToggleTab: (tabId: string) => void;
    onToggleDefect: (id: string) => void;
    onToggleUniqueness: (id: keyof BookUniqueness) => void;
    onToggleMarketFactor: (id: 'includePublicationYear' | 'includeDemand' | 'includeSupply') => void;
    onSelectCollection: (collection: string) => void;
    onSaveBook: () => void;
    onNextStep: () => void;
    onPrevStep: () => void;
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
                                                   currentStep,
                                                   totalSteps,
                                                   onToggleTab,
                                                   onToggleDefect,
                                                   onToggleUniqueness,
                                                   onToggleMarketFactor,
                                                   onSelectCollection,
                                                   onSaveBook,
                                                   onNextStep,
                                                   onPrevStep
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

    const styles = StyleSheet.create({
        tabSectionContainer: {
            marginTop: 16,
        },
        progressContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            paddingHorizontal: 8,
        },
        progressText: {
            fontSize: 14,
            color: colors.grayDark,
        },
        progressBarContainer: {
            flex: 1,
            height: 4,
            backgroundColor: colors.grayLight,
            borderRadius: 2,
            marginHorizontal: 8,
            overflow: 'hidden',
        },
        progressBar: {
            height: '100%',
            backgroundColor: colors.primary,
            width: `${(currentStep / totalSteps) * 100}%`,
        },
        tabsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8,
        },
        tabButton: {
            flex: 1,
            paddingVertical: 12,
            alignItems: 'center',
            borderBottomWidth: 2,
            borderBottomColor: 'transparent',
        },
        activeTabButton: {
            borderBottomColor: colors.primary,
        },
        tabContent: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        tabIcon: {
            marginRight: 8,
        },
        tabText: {
            fontSize: 14,
            color: colors.grayDark,
        },
        activeTabText: {
            color: colors.primary,
            fontWeight: '500',
        },
        tabContentWrapper: {
            backgroundColor: 'white',
            borderRadius: 8,
            padding: 16,
        },
        slideContent: {
            paddingVertical: 8,
        },
        defectItemContainer: {
            padding: 8,
            borderWidth: 1,
            borderColor: colors.gray,
            borderRadius: 8,
            backgroundColor: 'white',
            marginBottom: 12,
            alignItems: 'center',
            height: 120,
            position: 'relative',
        },
        selectedDefect: {
            borderColor: colors.primary,
            backgroundColor: 'rgba(74,108,247,0.05)',
        },
        defectIconContainer: {
            marginBottom: 4,
            backgroundColor: 'rgba(0,0,0,0.03)',
            borderRadius: 20,
            padding: 8,
        },
        defectName: {
            color: '#2c3e50',
            textAlign: 'center',
            fontSize: 12,
            lineHeight: 14,
            height: 28,
            marginBottom: 4,
        },
        selectedDefectName: {
            color: colors.primary,
            fontWeight: '500',
        },
        defectCountBadge: {
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: colors.primary,
            borderRadius: 10,
            width: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
        },
        defectCountBadgeText: {
            color: 'white',
            fontSize: 12,
            fontWeight: 'bold',
        },
        sliderRow: {
            position: 'absolute',
            top: 8,
            left: -5,
            width: 20,
            height: 20,
            flexDirection: 'row',
            alignItems: 'flex-start',
            paddingHorizontal: 0,
        },
        reductionText: {
            color: colors.primary,
            width: 40,
            textAlign: 'right',
            fontWeight: '500',
        },
        collectionRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
        },
        collectionPickerContainer: {
            flex: 1,
            marginRight: 12,
        },
        picker: {
            height: 50,
            width: '100%',
        },
        pickerContainer: {
            borderWidth: 0,
            borderRadius: 8,
            overflow: 'hidden',
        },
        bookCountContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.03)',
            borderRadius: 15,
            paddingVertical: 5,
            paddingHorizontal: 10,
        },
        bookCountText: {
            marginLeft: 5,
            color: colors.primary,
        },
        createCollectionButton: {
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.1)',
        },
        createCollectionText: {
            color: colors.primary,
            fontWeight: '500',
        },
        saveButton: {
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.primary,
            borderRadius: 8,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 3,
            marginTop: 16,
        },
        saveButtonContent: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        saveButtonIcon: {
            marginRight: 10,
        },
        saveButtonText: {
            color: 'white',
            fontWeight: '600',
        },
        navigationButtons: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 16,
        },
        navButton: {
            flex: 1,
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 8,
            flexDirection: 'row',
        },
        backButton: {
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: colors.primary,
            marginRight: 8,
        },
        backButtonText: {
            color: colors.primary,
            fontWeight: '500',
            marginLeft: 8,
        },
    });

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
                    size={22}
                    color={item.selected ? colors.primary : '#5c6b7e'}
                />
            </View>
            <Text
                style={[
                    styles.defectName,
                    item.selected && styles.selectedDefectName
                ]}
                numberOfLines={2}
            >
                {t(`defects.${item.id}`)}
            </Text>
        </TouchableOpacity>
    );

    const renderUniquenessItem = ({ item }: { item: typeof UNIQUENESS_TYPES[number] }) => (
        <TouchableOpacity
            style={[
                styles.defectItemContainer,
                uniqueness[item.id as keyof BookUniqueness] && styles.selectedDefect
            ]}
            onPress={() => onToggleUniqueness(item.id as keyof BookUniqueness)}
            activeOpacity={0.7}
        >
            <View style={styles.defectIconContainer}>
                <Ionicons
                    name={item.icon as any}
                    size={22}
                    color={uniqueness[item.id as keyof BookUniqueness] ? colors.primary : '#5c6b7e'}
                />
            </View>
            <Text
                style={[
                    styles.defectName,
                    uniqueness[item.id as keyof BookUniqueness] && styles.selectedDefectName
                ]}
                numberOfLines={2}
            >
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
                    size={22}
                    color={includedMarketFactors[item.id] ? colors.primary : '#5c6b7e'}
                />
            </View>
            <Text
                style={[
                    styles.defectName,
                    includedMarketFactors[item.id] && styles.selectedDefectName
                ]}
                numberOfLines={2}
            >
                {t(item.label)}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.tabSectionContainer}>
            {/* Progress indicator */}
            <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                    {t('labels.step')} {currentStep}/{totalSteps}
                </Text>
                <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar} />
                </View>
            </View>

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
                                color={expandedTabs[slide.id] ? colors.primary : colors.grayDark}
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
                            numColumns={3}
                            columnWrapperStyle={{ justifyContent: 'space-between' }}
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
                            numColumns={3}
                            columnWrapperStyle={{ justifyContent: 'space-between' }}
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
                            numColumns={3}
                            columnWrapperStyle={{ justifyContent: 'space-between' }}
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
                                            dropdownIconColor={colors.primary}
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
                                    <Ionicons name="book" size={20} color={colors.primary} />
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
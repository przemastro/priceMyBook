// app/components/CollectionCarousel.tsx
import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    Easing
} from 'react-native';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import Carousel from 'react-native-reanimated-carousel';
import { CollectionCarouselProps } from './types';

const { width: viewportWidth } = Dimensions.get('window');

const CollectionCarousel: React.FC<CollectionCarouselProps> = ({
                                                                   collections,
                                                                   books,
                                                                   selectedCollection,
                                                                   onSelectCollection,
                                                                   calculateCollectionTotal,
                                                                   onEditCollection,
                                                                   onDeleteCollection,
                                                                   onExportCollection,
                                                                   getBookWord,
                                                                   formatCurrency,
                                                                   onImportCollection
                                                               }) => {
    const { t, i18n } = useTranslation();
    const [editingCollection, setEditingCollection] = useState<string | null>(null);
    const [newCollectionName, setNewCollectionName] = useState('');
    const carouselRef = useRef<any>(null);

    const handleSaveEdit = async (collection: string) => {
        if (newCollectionName.trim() && newCollectionName.trim() !== collection) {
            await onEditCollection(collection, newCollectionName.trim());
        }
        setEditingCollection(null);
        setNewCollectionName('');
    };

    const renderItem = ({ item, index }: { item: string | 'actions', index: number }) => {
        if (item === 'actions') {
            return (
                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                        style={styles.addCollectionButton}
                        onPress={() => {
                            onSelectCollection('new');
                        }}
                    >
                        <Ionicons name="add-circle" size={24} color={colors.primary} />
                        <Text style={styles.actionButtonText}>{t('buttons.addCollection')}</Text>
                    </TouchableOpacity>

                    <View style={styles.horizontalDivider} />

                    <TouchableOpacity
                        style={styles.importButton}
                        onPress={onImportCollection}
                    >
                        <Ionicons name="cloud-upload" size={24} color={colors.primary} />
                        <Text style={styles.actionButtonText}>{t('buttons.importCollection')}</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        const collection = item;
        const bookCount = books[collection]?.length || 0;
        const collectionTotal = calculateCollectionTotal(collection);
        const isSelected = selectedCollection === collection;
        const isEditing = editingCollection === collection;

        return (
            <View style={[
                styles.carouselItem,
                isSelected && styles.selectedCarouselItem
            ]}>
                {isEditing ? (
                    <View style={styles.editContainer}>
                        <TextInput
                            style={styles.editInput}
                            value={newCollectionName}
                            onChangeText={setNewCollectionName}
                            autoFocus
                            defaultValue={collection}
                            onSubmitEditing={() => handleSaveEdit(collection)}
                        />
                        <TouchableOpacity
                            style={styles.saveEditButton}
                            onPress={() => handleSaveEdit(collection)}
                        >
                            <Ionicons name="checkmark" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={() => onSelectCollection(collection)}
                        style={styles.carouselContent}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons
                            name="collections-bookmark"
                            size={24}
                            color={isSelected ? colors.primary : colors.grayDark}
                            style={styles.collectionIcon}
                        />
                        <Text
                            style={[styles.carouselCollectionName, isSelected && styles.selectedText]}
                            numberOfLines={2}
                        >
                            {collection}
                        </Text>
                        <Text style={[styles.carouselCollectionValue, isSelected && styles.selectedText]}>
                            {formatCurrency(collectionTotal.toString())}
                        </Text>
                        <Text style={[styles.carouselBookCount, isSelected && styles.selectedBadge]}>
                            {bookCount} {getBookWord(bookCount, i18n.language)}
                        </Text>
                    </TouchableOpacity>
                )}

                {!isEditing && (
                    <View style={styles.carouselActions}>
                        <TouchableOpacity
                            onPress={() => {
                                setEditingCollection(collection);
                                setNewCollectionName(collection);
                            }}
                            style={styles.carouselActionButton}
                        >
                            <Ionicons name="create" size={16} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onExportCollection(collection)}
                            style={styles.carouselActionButton}
                        >
                            <FontAwesome name="file-excel-o" size={16} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onDeleteCollection(collection)}
                            style={styles.carouselActionButton}
                        >
                            <FontAwesome name="trash" size={16} color={colors.error} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    const data = [...collections, 'actions' as const];

    return (
        <View style={styles.carouselContainer}>
            <Carousel
                ref={carouselRef}
                loop={false}
                style={styles.carousel}
                width={viewportWidth / 2}
                height={220}
                data={data}
                onSnapToItem={(index) => {
                    if (data[index] !== 'actions') {
                        onSelectCollection(data[index]);
                    }
                }}
                renderItem={renderItem}
                scrollAnimationDuration={300}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    carouselContainer: {
        height: 240,
        marginBottom: 20,
    },
    carousel: {
        width: '100%',
        height: '100%',
    },
    carouselItem: {
        width: viewportWidth / 2 - 30,
        backgroundColor: 'rgba(74,108,247,0.05)',
        borderRadius: 22,
        padding: 16,
        marginHorizontal: 8,
        borderWidth: 1,
        borderColor: colors.grayLight,
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'rgba(74,108,247,0.05)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    selectedCarouselItem: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(74,108,247,0.2)',
    },
    actionButtonsContainer: {
        width: viewportWidth / 2 - 30,
        backgroundColor: 'rgba(74,108,247,0.05)',
        borderRadius: 22,
        padding: 16,
        marginHorizontal: 8,
        borderWidth: 1,
        borderColor: colors.primary,
        borderStyle: 'dashed',
        height: 220,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addCollectionButton: {
        alignItems: 'center',
        padding: 12,
        width: '100%',
    },
    importButton: {
        alignItems: 'center',
        padding: 12,
        width: '100%',
    },
    horizontalDivider: {
        width: '120%',
        height: 1,
        borderBottomWidth: 1,
        borderBottomColor: colors.primary,
        borderStyle: 'dashed',
    },
    actionButtonText: {
        marginTop: 8,
        color: colors.primary,
        fontWeight: '500',
        textAlign: 'center',
    },
    collectionIcon: {
        marginBottom: 8,
    },
    carouselContent: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    carouselCollectionName: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 8,
        color: colors.secondary,
    },
    selectedText: {
        color: colors.primary,
    },
    carouselCollectionValue: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
        marginTop: 8,
    },
    carouselBookCount: {
        marginTop: 8,
        fontSize: 14,
        color: colors.secondary,
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    selectedBadge: {
        backgroundColor: colors.primary,
        color: 'white',
    },
    editContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        width: '100%',
    },
    editInput: {
        flex: 1,
        borderBottomWidth: 1,
        borderColor: colors.primary,
        paddingVertical: 4,
        marginRight: 8,
        color: colors.black,
    },
    saveEditButton: {
        backgroundColor: colors.primary,
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    carouselActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        width: '100%',
    },
    carouselActionButton: {
        padding: 6,
        marginHorizontal: 4,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
});

export default CollectionCarousel;
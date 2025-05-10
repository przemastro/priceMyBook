// app/components/CollectionCarousel.tsx
import React, {useState} from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity, Dimensions,
} from 'react-native';
import {FontAwesome, Ionicons, MaterialIcons} from '@expo/vector-icons';
import {colors} from '@/styles/styles';
import {useTranslation} from 'react-i18next';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import { BlurView } from 'expo-blur';
import { CollectionCarouselProps } from './types';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
const PAGE_WIDTH = Dimensions.get('window').width / 2;

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
                                                                   formatCurrency
                                                               }) => {
    const { i18n } = useTranslation();
    const [editingCollection, setEditingCollection] = useState<string | null>(null);
    const [newCollectionName, setNewCollectionName] = useState('');

    const handleSaveEdit = async (collection: string) => {
        if (newCollectionName.trim() && newCollectionName.trim() !== collection) {
            await onEditCollection(collection, newCollectionName.trim());
        }
        setEditingCollection(null);
        setNewCollectionName('');
    };

    const CustomItem = ({
                            index,
                            animationValue,
                        }: {
        index: number;
        animationValue: Animated.SharedValue<number>;
    }) => {
        const collection = collections[index];
        const bookCount = books[collection]?.length || 0;
        const collectionTotal = calculateCollectionTotal(collection);
        const isSelected = selectedCollection === collection;
        const isEditing = editingCollection === collection;

        const maskStyle = useAnimatedStyle(() => {
            const opacity = interpolate(animationValue.value, [-1, 0, 1], [1, 0, 1]);
            return { opacity };
        }, [animationValue]);

        const animatedStyle = useAnimatedStyle(() => {
            const scale = interpolate(animationValue.value, [-1, 0, 1], [0.8, 1, 0.8]);
            return { transform: [{ scale }] };
        });

        return (
            <View style={{ flex: 1, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderRadius: 10 }}>
                <Animated.View style={[styles.carouselItem, isSelected && styles.selectedCarouselItem, !isSelected && styles.unselectedCarouselItem, animatedStyle]}>
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
                        >
                            <MaterialIcons name="collections-bookmark" size={24} color={isSelected ? colors.primary : colors.grayDark} style={styles.collectionIcon} />
                            <Text style={[styles.carouselCollectionName, isSelected && styles.selectedText]} numberOfLines={2}>{collection}</Text>
                            <Text style={[styles.carouselCollectionValue, isSelected && styles.selectedText]}>{formatCurrency(collectionTotal.toString())}</Text>
                            <Text style={[styles.carouselBookCount, isSelected && styles.selectedBadge]}>{bookCount} {getBookWord(bookCount, i18n.language)}</Text>
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
                            <TouchableOpacity onPress={() => onExportCollection(collection)} style={styles.carouselActionButton}>
                                <FontAwesome name="file-excel-o" size={16} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onDeleteCollection(collection)} style={styles.carouselActionButton}>
                                <FontAwesome name="trash" size={16} color={colors.error} />
                            </TouchableOpacity>
                        </View>
                    )}
                </Animated.View>
                <AnimatedBlurView intensity={50} pointerEvents="none" style={[StyleSheet.absoluteFill, maskStyle]} />
            </View>
        );
    };

    return (
        <View style={styles.carouselContainer}>
            <Carousel
                {...({
                    panGestureHandlerProps: { activeOffsetX: [-150, 150] }
                } as any)}
                loop={false}
                style={styles.carousel}
                width={PAGE_WIDTH}
                height={180}
                data={collections}
                onSnapToItem={(index) => onSelectCollection(collections[index])}
                renderItem={({ index, animationValue }) => <CustomItem index={index} animationValue={animationValue} />}
                scrollAnimationDuration={800}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    carouselContainer: {
        height: 160,
        paddingBottom: 10,
    },
    carouselItem: {
        width: PAGE_WIDTH - 20,
        backgroundColor: colors.white,
        borderRadius: 5,
        padding: 12,
        height: 140,
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    selectedCarouselItem: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(74,108,247,0.05)',
    },
    unselectedCarouselItem: {
        borderColor: colors.gray,
    },
    collectionIcon: {
        marginBottom: 8,
    },
    carouselContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,
    },
    carouselCollectionName: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 0,
        color: colors.black,
    },
    selectedText: {
        color: colors.primary,
    },
    carouselCollectionValue: {
        position: 'absolute',
        top: -5,
        left: -5,
        fontSize: 16,
        fontWeight: '600',
    },
    carouselBookCount: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: colors.grayDark,
        color: colors.white,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        textAlign: 'center',
        fontSize: 12,
        overflow: 'hidden',
        minWidth: 24,
    },
    selectedBadge: {
        backgroundColor: colors.primary,
    },
    editContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
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
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    carouselActionButton: {
        padding: 6,
        marginHorizontal: 4,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    carousel: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CollectionCarousel;
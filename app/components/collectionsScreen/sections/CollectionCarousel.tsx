import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, FlatList, ScrollView, Dimensions, Modal } from 'react-native';
import { MaterialIcons, Ionicons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import { CustomAlertModal } from '../../alerts/CustomAlertModal';

interface CollectionCarouselProps {
    collections: { name: string; icon: string }[];
    books: Record<string, any[]>;
    selectedCollection: string | null;
    onSelectCollection: (collectionName: string) => void;
    calculateCollectionTotal: (collectionName: string) => number;
    onEditCollection: (collectionName: string, newName: string) => Promise<void>;
    onDeleteCollection: (collectionName: string) => void;
    onExportCollection: (collectionName: string) => void;
    getBookWord: (count: number, lang: string) => string;
    formatCurrency: (price: string) => string;
    onNavigateToBooks: () => void;
}

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
                                                                   onNavigateToBooks,
                                                               }) => {
    const { t, i18n } = useTranslation();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [menuVisible, setMenuVisible] = useState<string | null>(null);
    const [menuPosition, setMenuPosition] = useState({
        x: 0,
        y: 0,
        opensUpward: false
    });
    const { width, height } = Dimensions.get('window');

    // Alert state
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState<() => void>(() => {});

    const filteredCollections = useMemo(() => {
        if (!searchQuery) return collections;
        return collections.filter(collection =>
            collection.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [collections, searchQuery]);

    const showDeleteConfirmation = (collectionName: string) => {
        setAlertTitle(t('alerts.confirmDeleteTitle'));
        setAlertMessage(t('alerts.confirmDeleteMessage', {
            collectionName,
            bookCount: books[collectionName]?.length || 0
        }));
        setConfirmAction(() => () => {
            onDeleteCollection(collectionName);
            setMenuVisible(null);
        });
        setAlertVisible(true);
    };

    const showMenu = (collectionName: string, event: any) => {
        const { pageX, pageY } = event.nativeEvent;
        const opensUpward = pageY > height * 0.6;

        setMenuPosition({
            x: pageX,
            y: pageY,
            opensUpward
        });
        setMenuVisible(collectionName);
    };

    const hideMenu = () => {
        setMenuVisible(null);
    };

    const renderItem = ({ item }: { item: { name: string; icon: string } }) => {
        const bookCount = books[item.name]?.length || 0;
        const isSelected = selectedCollection === item.name;

        return (
            <View style={styles.itemContainer}>
                <TouchableOpacity
                    style={[
                        styles.collectionCard,
                        isSelected && styles.selectedCollectionCard,
                    ]}
                    onPress={() => onSelectCollection(item.name)}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={isSelected
                            ? [colors.buttonSelected1, colors.buttonSelected2]
                            : [colors.white, colors.whiteBlue]}
                        style={styles.cardGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.cardContent}>
                            <View style={[
                                styles.collectionIcon,
                                isSelected && styles.selectedCollectionIcon
                            ]}>
                                <MaterialIcons
                                    name={item.icon as any}
                                    size={24}
                                    color={isSelected ? colors.primary : colors.secondary}
                                />
                            </View>

                            <View style={styles.textContainer}>
                                <Text style={[
                                    styles.collectionName,
                                    isSelected && styles.selectedCollectionName
                                ]} numberOfLines={1}>
                                    {item.name}
                                </Text>
                                <Text style={styles.collectionBookCount}>
                                    {bookCount} {t(getBookWord(bookCount, i18n.language))}
                                </Text>
                                <Text style={styles.collectionValue}>
                                    {formatCurrency(calculateCollectionTotal(item.name).toString())}
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={styles.menuButton}
                                onPress={(e) => showMenu(item.name, e)}
                                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                            >
                                <Ionicons
                                    name="ellipsis-vertical"
                                    size={20}
                                    color={isSelected ? colors.primary : colors.grayDark}
                                />
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Collections list */}
            <ScrollView
                style={styles.listContainer}
                nestedScrollEnabled={true}
            >
                {filteredCollections.length > 0 ? (
                    <FlatList
                        scrollEnabled={false}
                        data={filteredCollections}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.name}
                        contentContainerStyle={styles.listContent}
                    />
                ) : (
                    <View style={styles.noCollectionsContainer}>
                        <Text style={styles.noCollectionsText}>{t('labels.noCollectionsFound')}</Text>
                    </View>
                )}
            </ScrollView>

            {/* Menu Modal */}
            <Modal
                visible={!!menuVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={hideMenu}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={hideMenu}
                >
                    <View style={[
                        styles.menuContainer,
                        {
                            top: menuPosition.opensUpward
                                ? menuPosition.y - 180
                                : menuPosition.y + 10,
                            left: Math.max(10, Math.min(menuPosition.x - 80, width - 170))
                        }
                    ]}>
                        <View style={[
                            styles.menuTriangle,
                            menuPosition.opensUpward
                                ? styles.menuTriangleBottom
                                : styles.menuTriangleTop
                        ]} />

                        <View style={styles.menuContent}>
                            <TouchableOpacity
                                style={styles.menuOption}
                                onPress={() => {
                                    if (menuVisible) {
                                        onEditCollection(menuVisible, menuVisible);
                                        hideMenu();
                                    }
                                }}
                            >
                                <Ionicons name="create-outline" size={18} color={colors.blackDark} />
                                <Text style={styles.menuOptionText}>{t('buttons.edit')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.menuOption}
                                onPress={() => {
                                    if (menuVisible) {
                                        onExportCollection(menuVisible);
                                        hideMenu();
                                    }
                                }}
                            >
                                <FontAwesome5 name="file-export" size={16} color={colors.blackDark} />
                                <Text style={styles.menuOptionText}>{t('buttons.export')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.menuOption}
                                onPress={() => {
                                    onNavigateToBooks();
                                    hideMenu();
                                }}
                            >
                                <Feather name="book-open" size={16} color={colors.blackDark} />
                                <Text style={styles.menuOptionText}>{t('buttons.books')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.menuOption, styles.deleteOption]}
                                onPress={() => {
                                    if (menuVisible) {
                                        showDeleteConfirmation(menuVisible);
                                    }
                                }}
                            >
                                <MaterialIcons name="delete-outline" size={18} color={colors.blackDark} />
                                <Text style={[styles.menuOptionText, styles.deleteText]}>{t('buttons.delete')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            <CustomAlertModal
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                type="warning"
                onConfirm={() => {
                    confirmAction();
                    setAlertVisible(false);
                }}
                closeButtonStyle={styles.closeButton}
                closeButtonTextStyle={styles.closeButtonText}
                buttonFullWidth={true}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.grayLight,
    },
    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: colors.buttonSelected1,
        marginRight: 5,
        marginLeft: 5
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: colors.black,
    },
    headerButtons: {
        flexDirection: 'row',
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    headerButtonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemContainer: {
        marginBottom: 12,
    },
    collectionCard: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginRight: 5,
        marginLeft: 5
    },
    selectedCollectionCard: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    cardGradient: {
        flex: 1,
        padding: 12,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    collectionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0,0,0,0.03)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    selectedCollectionIcon: {
        backgroundColor: 'rgba(74,108,247,0.1)',
    },
    textContainer: {
        flex: 1,
    },
    collectionName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.secondary,
        marginBottom: 4,
    },
    selectedCollectionName: {
        color: colors.primary,
    },
    collectionBookCount: {
        fontSize: 13,
        color: colors.grayDark,
    },
    collectionValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
        marginTop: 2,
    },
    menuButton: {
        padding: 8,
        marginLeft: 8,
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    listContent: {
        paddingBottom: 20,
    },
    noCollectionsContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noCollectionsText: {
        fontSize: 14,
        color: colors.grayDark,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0)',
    },
    menuContainer: {
        position: 'absolute',
        backgroundColor: colors.white,
        borderRadius: 8,
        shadowColor: colors.blackDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 10,
        minWidth: 160,
    },
    menuTriangle: {
        position: 'absolute',
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: colors.white,
    },
    menuTriangleTop: {
        top: -8,
        right: 12,
    },
    menuTriangleBottom: {
        bottom: -8,
        right: 12,
        transform: [{ rotate: '180deg' }],
    },
    menuContent: {
        paddingVertical: 4,
    },
    menuOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    menuOptionText: {
        fontSize: 14,
        marginLeft: 8,
        color: colors.blackDark,
    },
    deleteOption: {
        borderTopWidth: 1,
        borderTopColor: colors.grayLight,
    },
    deleteText: {
        fontSize: 14,
        marginLeft: 8,
        color: colors.blackDark,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1,
    },
    closeButtonText: {
        fontSize: 20,
        color: colors.primary,
        lineHeight: 24,
    },
    confirmButton: {
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 16,
    },
    confirmButtonGradient: {
        padding: 15,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default CollectionCarousel;
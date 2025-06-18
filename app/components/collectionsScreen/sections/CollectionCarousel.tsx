import React, {useEffect, useMemo, useState} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, Modal, ActivityIndicator } from 'react-native';
import { MaterialIcons, Ionicons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';
import { CustomAlertModal } from '../../alerts/CustomAlertModal';
import { useAppContext } from '@/context/AppContext';
import { styles } from './styles'

interface CollectionCarouselProps {
    collections: { name: string; icon: string }[];
    books: Record<string, any[]>;
    selectedCollection: string | null;
    onSelectCollection: (collectionName: string) => void;
    calculateCollectionTotal: (collectionName: string) => number;
    onEditCollection: (collectionName: string) => void;
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
    const [menuVisible, setMenuVisible] = useState<string | null>(null);
    const [menuPosition, setMenuPosition] = useState({
        x: 0,
        y: 0,
        opensUpward: false
    });
    useEffect(() => {
        if (collections.length > 0 && !selectedCollection) {
            onSelectCollection(collections[0].name);
        }
    }, [collections]);
    const [isProcessing, setIsProcessing] = useState(false);
    const { width, height } = Dimensions.get('window');
    const { collectionCategories } = useAppContext();

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState<() => void>(() => { });

    const filteredCollections = useMemo(() => {
        if (!collections) return [];
        return collections;
    }, [collections]);

    const showDeleteConfirmation = (collectionName: string) => {
        const bookCount = books[collectionName]?.length || 0;
        setAlertTitle(t('alerts.confirmDeleteTitle'));
        setAlertMessage(bookCount > 0
            ? t('alerts.confirmDeleteMessage', { collectionName, bookCount })
            : t('alerts.confirmEmptyDeleteMessage', { collectionName }));
        setConfirmAction(() => () => {
            onDeleteCollection(collectionName);
            setMenuVisible(null);
            setAlertTitle(t('alerts.success'));
            setAlertMessage(t('alerts.collectionDeleted', { collectionName }));
            setAlertVisible(true);
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

    const handleEditPress = (collectionName: string) => {
        setIsProcessing(true);
        try {
            onEditCollection(collectionName);
            hideMenu();
        } finally {
            setIsProcessing(false);
        }
    };

    const renderItem = ({ item }: { item: { name: string; icon: string } }) => {
        const bookCount = books[item.name]?.length || 0;
        const isSelected = selectedCollection === item.name;
        const categories = collectionCategories[item.name] || [];

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
                                    {categories.length > 0 && ` • ${categories.length} ${t('labels.categories')}`}
                                </Text>
                                <Text style={styles.collectionValue}>
                                    {formatCurrency(calculateCollectionTotal(item.name).toString())}
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={styles.menuButton}
                                onPress={(e) => showMenu(item.name, e)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
        <View style={localStyles.container}>
            <View style={[styles.listContainer, { maxHeight: height * 0.35 }]}>
                <FlatList
                    data={filteredCollections}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.name}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={true}
                />
            </View>

            <CustomAlertModal
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                type={alertTitle === t('alerts.confirmDeleteTitle') ? 'warning' : 'success'}
                onConfirm={() => {
                    confirmAction();
                    setAlertVisible(false);
                }}
                confirmText={t('buttons.confirm')}
                closeButtonStyle={styles.closeButton}
                closeButtonTextStyle={styles.closeButtonText}
                buttonFullWidth={true}
            />

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
                                onPress={() => menuVisible && handleEditPress(menuVisible)}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator size="small" color={colors.primary} />
                                ) : (
                                    <>
                                        <Ionicons name="create-outline" size={18} color={colors.blackDark} />
                                        <Text style={styles.menuOptionText}>{t('buttons.edit')}</Text>
                                    </>
                                )}
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
        </View>
    );
};

const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.grayLight,
    },
});

export default CollectionCarousel;
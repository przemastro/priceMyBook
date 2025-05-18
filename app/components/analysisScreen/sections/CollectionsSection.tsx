import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Modal, Pressable } from 'react-native';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';

interface Collection {
    name: string;
    icon: string;
}

type CollectionsSectionProps = {
    collections: Collection[];
    books: Record<string, any[]>;
    selectedCollection: string;
    onSelectCollection: (collection: string) => void;
    onAddCollection: () => void;
    onAddToCollection: (collection: string) => void;
    searchQuery: string;
    onSearchChange: (text: string) => void;
};

const CollectionsSection = ({
                                collections,
                                books,
                                selectedCollection,
                                onSelectCollection,
                                onAddCollection,
                                onAddToCollection,
                                searchQuery,
                                onSearchChange,
                            }: CollectionsSectionProps) => {
    const { t, i18n } = useTranslation();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCollectionForModal, setSelectedCollectionForModal] = useState('');

    const getBookWord = (count: number, lang: string) => {
        if (lang === 'pl') {
            if (count === 1) return 'labels.book_one';
            if (count % 100 >= 12 && count % 100 <= 14) return 'labels.book_many';
            if ([2,3,4].includes(count % 10)) return 'labels.book_few';
            return 'labels.book_many';
        }
        return count === 1 ? 'labels.book_one' : 'labels.book_other';
    };

    const filteredCollections = useMemo(() => {
        if (!searchQuery) return collections;
        return collections.filter(collection =>
            collection.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [collections, searchQuery]);

    const handleCollectionPress = (collectionName: string) => {
        setSelectedCollectionForModal(collectionName);
        setModalVisible(true);
    };

    const confirmAddToCollection = () => {
        onAddToCollection(selectedCollectionForModal);
        setModalVisible(false);
    };

    return (
        <View style={styles.combinedSection}>
            <Text style={styles.stepTitle}>{t('stepTitles.addToCollection')}</Text>

            <View style={localStyles.searchHeader}>
                <View style={[localStyles.searchContainer, { borderColor: colors.gray, borderWidth: 1 }]}>
                    <Feather name="search" size={20} color={colors.secondary} style={localStyles.searchIcon} />
                    <TextInput
                        style={localStyles.searchInput}
                        placeholder={t('placeholders.searchCollections')}
                        placeholderTextColor={colors.blackDark}
                        value={searchQuery}
                        onChangeText={onSearchChange}
                    />
                </View>
                <TouchableOpacity onPress={onAddCollection} style={localStyles.addButton}>
                    <Ionicons name="add" size={28} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredCollections}
                keyExtractor={(item) => item.name}
                renderItem={({ item: collection }) => {
                    const bookCount = books[collection.name]?.length || 0;
                    return (
                        <TouchableOpacity
                            style={[
                                localStyles.collectionItem,
                                selectedCollection === collection.name && localStyles.selectedCollectionItem
                            ]}
                            onPress={() => handleCollectionPress(collection.name)}
                        >
                            <View style={localStyles.collectionIcon}>
                                <MaterialIcons
                                    name={collection.icon as any}
                                    size={24}
                                    color={selectedCollection === collection.name ? colors.primary : colors.secondary}
                                />
                            </View>
                            <View style={localStyles.collectionTextContainer}>
                                <Text style={localStyles.collectionName}>{collection.name}</Text>
                                <Text style={localStyles.collectionBookCount}>
                                    {bookCount} {t(getBookWord(bookCount, i18n.language))}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={localStyles.modalOverlay}>
                    <View style={localStyles.modalContainer}>
                        <Text style={localStyles.modalTitle}>
                            {t('modals.addToCollectionTitle')}
                        </Text>
                        <Text style={localStyles.modalText}>
                            {t('modals.addToCollectionText', { collection: selectedCollectionForModal })}
                        </Text>
                        <View style={localStyles.modalButtons}>
                            <Pressable
                                style={[localStyles.modalButton, localStyles.modalButtonCancel]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={localStyles.modalButtonTextCancel}>{t('buttons.cancel')}</Text>
                            </Pressable>
                            <Pressable
                                style={[localStyles.modalButton, localStyles.modalButtonConfirm]}
                                onPress={confirmAddToCollection}
                            >
                                <Text style={localStyles.modalButtonTextConfirm}>{t('buttons.confirm')}</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const localStyles = StyleSheet.create({
    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 10,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: colors.black,
    },
    addButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    collectionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.grayLight,
    },
    selectedCollectionItem: {
        borderColor: colors.primary,
        backgroundColor: colors.whiteBlue,
    },
    collectionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.whiteBlue,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    collectionTextContainer: {
        flex: 1,
    },
    collectionName: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.grayDark,
        marginBottom: 2,
    },
    collectionBookCount: {
        fontSize: 14,
        color: colors.grayDark,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: colors.white,
        borderRadius: 10,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.black,
        marginBottom: 10,
        textAlign: 'center',
    },
    modalText: {
        fontSize: 16,
        color: colors.grayDark,
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
    },
    modalButtonCancel: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray,
        marginRight: 10,
    },
    modalButtonConfirm: {
        backgroundColor: colors.primary,
    },
    modalButtonTextCancel: {
        color: colors.grayDark,
        fontWeight: '500',
    },
    modalButtonTextConfirm: {
        color: colors.white,
        fontWeight: '500',
    },
});

const styles = StyleSheet.create({
    combinedSection: {
        backgroundColor: 'white',
        borderRadius: 0,
        paddingTop: 20,
        marginBottom: 0,
    },
    stepTitle: {
        color: colors.primary,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
    },
});

export default CollectionsSection;
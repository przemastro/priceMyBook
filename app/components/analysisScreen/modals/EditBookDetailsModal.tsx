import React, {useState} from 'react';
import {
    Modal,
    View,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import {t} from "i18next";
import {styles} from "./styles"

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface EditBookDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    bookImage: string | null;
    titleInput: string;
    setTitleInput: (text: string) => void;
    authors: string;
    setAuthors: (text: string) => void;
    publisher: string;
    setPublisher: (text: string) => void;
    isbnInput: string;
    setIsbnInput: (text: string) => void;
    originalPriceInput: string;
    setOriginalPriceInput: (text: string) => void;
    description: string;
    setDescription: (text: string) => void;
    onPickImage: () => Promise<void>;
    onSave: () => Promise<void>;
    onClearFields: () => void;
}

export const EditBookDetailsModal: React.FC<EditBookDetailsModalProps> = ({
                                                                              visible,
                                                                              onClose,
                                                                              bookImage,
                                                                              titleInput,
                                                                              setTitleInput,
                                                                              authors,
                                                                              setAuthors,
                                                                              publisher,
                                                                              setPublisher,
                                                                              isbnInput,
                                                                              setIsbnInput,
                                                                              originalPriceInput,
                                                                              setOriginalPriceInput,
                                                                              description,
                                                                              setDescription,
                                                                              onPickImage,
                                                                              onSave,
                                                                              onClearFields
                                                                          }) => {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateFields = () => {
        const newErrors: Record<string, string> = {};

        if (!titleInput.trim()) {
            newErrors.title = t('errors.titleRequired');
        }

        if (!isbnInput.trim()) {
            newErrors.isbn = t('errors.isbnRequired');
        } else if (!/^\d{10}(\d{3})?$/.test(isbnInput)) {
            newErrors.isbn = t('errors.invalidIsbn');
        }

        if (!originalPriceInput.trim()) {
            newErrors.price = t('errors.priceRequired');
        } else if (isNaN(parseFloat(originalPriceInput)) || parseFloat(originalPriceInput) <= 0) {
            newErrors.price = t('errors.invalidPrice');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        const isValid = validateFields();

        if (!isValid) {
            return;
        }

        try {
            await onSave();
            setErrors({});
            onClose();
        } catch (error) {
            console.error('Error saving:', error);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={localStyles.modalOverlay}>
                <View style={[localStyles.modalContainer, { maxHeight: SCREEN_HEIGHT * 0.85 }]}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        activeOpacity={0.7}
                    >
                        <View style={styles.closeButtonCircle}>
                            <Text style={styles.closeButtonText}>×</Text>
                        </View>
                    </TouchableOpacity>

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.bookCoverSection}>
                            <TouchableOpacity onPress={onPickImage} activeOpacity={0.8}>
                                {bookImage ? (
                                    <Image
                                        source={{ uri: bookImage }}
                                        style={styles.bookCoverImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <LinearGradient
                                        colors={[colors.buttonSelected1, colors.buttonSelected2]}
                                        style={styles.bookCoverPlaceholder}
                                    >
                                        <Ionicons
                                            name="image-outline"
                                            size={48}
                                            color={colors.primary}
                                        />
                                        <Text style={styles.bookCoverPlaceholderText}>
                                            {t('buttons.addCover')}
                                        </Text>
                                    </LinearGradient>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formSection}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>{t('bookInfo.title')}*</Text>
                                <TextInput
                                    style={[styles.editableInput, errors.title ? styles.errorInput : null]}
                                    value={titleInput}
                                    onChangeText={(text) => {
                                        setTitleInput(text);
                                        if (errors.title) setErrors(prev => ({...prev, title: ''}));
                                    }}
                                    placeholder={t('placeholders.enterTitle')}
                                    placeholderTextColor={colors.grayDark}
                                />
                                {!!errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>{t('bookInfo.authors')}</Text>
                                <TextInput
                                    style={styles.editableInput}
                                    value={authors}
                                    onChangeText={setAuthors}
                                    placeholder={t('placeholders.enterAuthors')}
                                    placeholderTextColor={colors.grayDark}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>{t('bookInfo.publisher')}</Text>
                                <TextInput
                                    style={styles.editableInput}
                                    value={publisher}
                                    onChangeText={setPublisher}
                                    placeholder={t('placeholders.enterPublisher')}
                                    placeholderTextColor={colors.grayDark}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>{t('bookInfo.isbn')}*</Text>
                                <TextInput
                                    style={[styles.editableInput, errors.isbn ? styles.errorInput : null]}
                                    value={isbnInput}
                                    onChangeText={(text) => {
                                        setIsbnInput(text);
                                        if (errors.isbn) setErrors(prev => ({...prev, isbn: ''}));
                                    }}
                                    placeholder={t('placeholders.enterIsbn')}
                                    placeholderTextColor={colors.grayDark}
                                    keyboardType="numeric"
                                />
                                {!!errors.isbn && <Text style={styles.errorText}>{errors.isbn}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>{t('bookInfo.originalPrice')}*</Text>
                                <TextInput
                                    style={[styles.editableInput, errors.price ? styles.errorInput : null]}
                                    value={originalPriceInput}
                                    onChangeText={(text) => {
                                        setOriginalPriceInput(text);
                                        if (errors.price) setErrors(prev => ({...prev, price: ''}));
                                    }}
                                    placeholder={t('placeholders.enterPrice')}
                                    placeholderTextColor={colors.grayDark}
                                    keyboardType="numeric"
                                />
                                {!!errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>{t('bookInfo.description')}</Text>
                                <TextInput
                                    style={[styles.editableInput, { height: 100, textAlignVertical: 'top' }]}
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder={t('placeholders.enterDescription')}
                                    placeholderTextColor={colors.grayDark}
                                    multiline
                                />
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.actionButton, localStyles.saveButton]}
                                onPress={handleSave}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={[colors.primary, colors.primary]}
                                    style={styles.buttonGradient}
                                >
                                    <Text style={localStyles.saveButtonText}>{t('buttons.save')}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const localStyles = StyleSheet.create({
    saveButton: {
        backgroundColor: colors.primary,
    },
    saveButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.transparentBlack,
    },
    modalContainer: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        maxHeight: '85%',
    },
});

export default EditBookDetailsModal;
// components/analysisScreen/EditBookDetailsModal.tsx
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
    onSave: () => void;
    onClearFields: () => void; // Dodaj tę prop
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

    React.useEffect(() => {
        if (visible) {
            onClearFields();
            setErrors({});
        }
    }, [visible]);
    const validateFields = () => {
        const newErrors: Record<string, string> = {};

        if (!titleInput.trim()) {
            newErrors.title = 'Tytuł jest wymagany';
        }

        if (!isbnInput.trim()) {
            newErrors.isbn = 'ISBN jest wymagany';
        } else if (!/^\d{10}(\d{3})?$/.test(isbnInput)) {
            newErrors.isbn = 'Wprowadź poprawny ISBN (10 lub 13 cyfr)';
        }

        if (!originalPriceInput.trim()) {
            newErrors.price = 'Cena jest wymagana';
        } else if (isNaN(parseFloat(originalPriceInput)) || parseFloat(originalPriceInput) <= 0) {
            newErrors.price = 'Wprowadź poprawną cenę (większą niż 0)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        const isValid = validateFields();

        if (!isValid) {
            return; // Zatrzymaj jeśli walidacja nie przeszła
        }

        try {
            await onSave(); // Wywołaj funkcję zapisu
            setErrors({}); // Wyczyść błędy
            onClose(); // Zamknij modal
        } catch (error) {
            console.error('Błąd podczas zapisywania:', error);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { maxHeight: SCREEN_HEIGHT * 0.85 }]}>
                    {/* Przycisk zamknięcia */}
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
                        {/* Sekcja okładki */}
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
                                            Dodaj okładkę
                                        </Text>
                                    </LinearGradient>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Formularz - wszystkie pola edytowalne */}
                        <View style={styles.formSection}>
                            {/* Tytuł (wymagany) */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Tytuł*</Text>
                                <TextInput
                                    style={[styles.editableInput, errors.title ? styles.errorInput : null]}
                                    value={titleInput}
                                    onChangeText={(text) => {
                                        setTitleInput(text);
                                        if (errors.title) setErrors(prev => ({...prev, title: ''}));
                                    }}
                                    placeholder="Wprowadź tytuł"
                                    placeholderTextColor={colors.grayDark}
                                />
                                {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
                            </View>

                            {/* Autor */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Autor</Text>
                                <TextInput
                                    style={styles.editableInput}
                                    value={authors}
                                    onChangeText={setAuthors}
                                    placeholder="Wprowadź autora/autorów"
                                    placeholderTextColor={colors.grayDark}
                                />
                            </View>

                            {/* Wydawca */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Wydawca</Text>
                                <TextInput
                                    style={styles.editableInput}
                                    value={publisher}
                                    onChangeText={setPublisher}
                                    placeholder="Wprowadź wydawcę"
                                    placeholderTextColor={colors.grayDark}
                                />
                            </View>

                            {/* ISBN (wymagany) */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>ISBN*</Text>
                                <TextInput
                                    style={[styles.editableInput, errors.isbn ? styles.errorInput : null]}
                                    value={isbnInput}
                                    onChangeText={(text) => {
                                        setIsbnInput(text);
                                        if (errors.isbn) setErrors(prev => ({...prev, isbn: ''}));
                                    }}
                                    placeholder="Wprowadź ISBN"
                                    placeholderTextColor={colors.grayDark}
                                    keyboardType="numeric"
                                />
                                {errors.isbn && <Text style={styles.errorText}>{errors.isbn}</Text>}
                            </View>

                            {/* Cena (wymagana) */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Cena oryginalna*</Text>
                                <TextInput
                                    style={[styles.editableInput, errors.price ? styles.errorInput : null]}
                                    value={originalPriceInput}
                                    onChangeText={(text) => {
                                        setOriginalPriceInput(text);
                                        if (errors.price) setErrors(prev => ({...prev, price: ''}));
                                    }}
                                    placeholder="Wprowadź cenę"
                                    placeholderTextColor={colors.grayDark}
                                    keyboardType="numeric"
                                />
                                {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
                            </View>

                            {/* Opis */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Opis</Text>
                                <TextInput
                                    style={[styles.editableInput, { height: 100, textAlignVertical: 'top' }]}
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="Wprowadź opis"
                                    placeholderTextColor={colors.grayDark}
                                    multiline
                                />
                            </View>
                        </View>
                    </ScrollView>

                    {/* Przyciski akcji */}
                    <View style={styles.footer}>
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.saveButton]}
                                onPress={handleSave}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={[colors.primary, colors.primary]}
                                    style={styles.buttonGradient}
                                >
                                    <Text style={styles.saveButtonText}>{t('buttons.save')}</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
                            {errors.isbn && <Text style={styles.errorText}>{errors.isbn}</Text>}
                            {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        maxHeight: '85%',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 50,
        paddingBottom: 90,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
    },
    closeButtonCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(74,108,247,0.1)',
    },
    closeButtonText: {
        fontSize: 20,
        color: colors.primary,
        lineHeight: 24,
    },
    bookCoverSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    bookCoverImage: {
        width: 150,
        height: 200,
        borderRadius: 8,
    },
    bookCoverPlaceholder: {
        width: 150,
        height: 200,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookCoverPlaceholderText: {
        marginTop: 8,
        color: colors.primary,
        fontSize: 14,
    },
    formSection: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        color: colors.secondary,
        marginBottom: 8,
        fontWeight: '500',
    },
    footer: {
        padding: 16,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.grayLight,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        borderRadius: 10,
        overflow: 'hidden',
        width: '100%',
        height: 50,
    },
    saveButton: {
        backgroundColor: colors.primary,
    },
    buttonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: colors.grayDark,
        fontSize: 16,
        fontWeight: '600',
    },
    saveButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    editableInput: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.buttonSelected1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: colors.black,
    },
    errorInput: {
        borderColor: 'red',  // To jest poprawne dla TextInput
    },
});

export default EditBookDetailsModal;
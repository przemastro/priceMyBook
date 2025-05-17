// components/analysisScreen/EditBookDetailsModal.tsx
import React from 'react';
import {
    Modal,
    View,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { styles } from './styles';

interface EditBookDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    bookImage: string | null;
    titleInput: string;
    setTitleInput: (text: string) => void;
    authors: string;
    publisher: string;
    isbnInput: string;
    setIsbnInput: (text: string) => void;
    originalPriceInput: string;
    setOriginalPriceInput: (text: string) => void;
    description: string;
    onPickImage: () => Promise<void>;
    onSave: () => void;
}

export const EditBookDetailsModal: React.FC<EditBookDetailsModalProps> = ({
                                                                              visible,
                                                                              onClose,
                                                                              bookImage,
                                                                              titleInput,
                                                                              setTitleInput,
                                                                              authors,
                                                                              publisher,
                                                                              isbnInput,
                                                                              setIsbnInput,
                                                                              originalPriceInput,
                                                                              setOriginalPriceInput,
                                                                              description,
                                                                              onPickImage,
                                                                              onSave
                                                                          }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <LinearGradient
                        colors={[colors.buttonSelected1, colors.buttonSelected2]}
                        style={styles.modalHeader}
                    >
                        <Text style={styles.modalTitle}>Edytuj szczegóły książki</Text>
                        <TouchableOpacity
                            style={styles.closeModalButton}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="close" size={24} color={colors.primary} />
                        </TouchableOpacity>
                    </LinearGradient>

                    <ScrollView style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.modalBookCoverContainer}
                            onPress={onPickImage}
                            activeOpacity={0.8}
                        >
                            {bookImage ? (
                                <Image
                                    source={{ uri: bookImage }}
                                    style={styles.modalBookCoverImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <LinearGradient
                                    colors={[colors.buttonSelected1, colors.buttonSelected2]}
                                    style={styles.modalBookCoverPlaceholder}
                                >
                                    <Ionicons
                                        name="image-outline"
                                        size={48}
                                        color={colors.primary}
                                    />
                                    <Text style={styles.modalBookCoverPlaceholderText}>
                                        Dodaj okładkę
                                    </Text>
                                </LinearGradient>
                            )}
                        </TouchableOpacity>

                        <View style={styles.modalInputGroup}>
                            <Text style={styles.modalInputLabel}>Tytuł</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={titleInput}
                                onChangeText={setTitleInput}
                                placeholder="Wprowadź tytuł"
                            />
                        </View>

                        <View style={styles.modalInputGroup}>
                            <Text style={styles.modalInputLabel}>Autor</Text>
                            <Text style={styles.modalInput}>
                                {authors || 'Nieznany autor'}
                            </Text>
                        </View>

                        <View style={styles.modalInputGroup}>
                            <Text style={styles.modalInputLabel}>Wydawca</Text>
                            <Text style={styles.modalInput}>
                                {publisher || 'Nieznany wydawca'}
                            </Text>
                        </View>

                        <View style={styles.modalInputGroup}>
                            <Text style={styles.modalInputLabel}>ISBN</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={isbnInput}
                                onChangeText={setIsbnInput}
                                placeholder="Wprowadź ISBN"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.modalInputGroup}>
                            <Text style={styles.modalInputLabel}>Cena oryginalna</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={originalPriceInput}
                                onChangeText={setOriginalPriceInput}
                                keyboardType="numeric"
                                placeholder="Wprowadź cenę"
                            />
                        </View>

                        <View style={styles.modalInputGroup}>
                            <Text style={styles.modalInputLabel}>Opis</Text>
                            <Text style={styles.modalDescriptionText}>
                                {description || 'Brak opisu'}
                            </Text>
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelButtonText}>Anuluj</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={onSave}
                            activeOpacity={0.7}
                        >
                            <LinearGradient
                                colors={[colors.lightPrimary, colors.primary]}
                                style={styles.saveButtonGradient}
                            >
                                <Text style={styles.saveButtonText}>Zapisz</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

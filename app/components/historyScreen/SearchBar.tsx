import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { colors } from '@/styles/styles';
import { Feather } from '@expo/vector-icons';

type SearchBarProps = {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
};

const SearchBar = ({ value, onChangeText, placeholder }: SearchBarProps) => (
    <View style={styles.searchContainer}>
        <Feather name="search" size={20} color={colors.secondary} style={styles.searchIcon} />
        <TextInput
            style={styles.searchInput}
            placeholder={placeholder}
            placeholderTextColor={colors.grayDark}
            value={value}
            onChangeText={onChangeText}
        />
    </View>
);

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.buttonSelected1,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: colors.black,
        height: 40,
    },
});

export default SearchBar;
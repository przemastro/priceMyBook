import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { colors } from '@/styles/styles';
import { Feather } from '@expo/vector-icons';
import { styles } from './styles'

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

export default SearchBar;
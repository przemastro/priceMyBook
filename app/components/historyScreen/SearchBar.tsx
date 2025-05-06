import React from 'react';
import { TextInput } from 'react-native';
import { colors } from '@/styles/styles';

type SearchBarProps = {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
};

const SearchBar = ({ value, onChangeText, placeholder }: SearchBarProps) => (
    <TextInput
        style={{
            height: 50,
            borderColor: 'rgba(0,0,0,0.1)',
            borderWidth: 1,
            borderRadius: 2,
            paddingHorizontal: 16,
            marginBottom: 16,
            backgroundColor: colors.white,
            color: colors.black,
        }}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#888"
    />
);

export default SearchBar;
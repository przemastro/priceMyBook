import { Dimensions, StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

export const { width, height } = Dimensions.get('window');

// Kolory
export const colors = {
    primary: '#0167ae', // Główny kolor (np. przyciski, akcenty)
    primary2: '#4a6cf714',
    secondary: '#2c3e50', // Kolor tekstu i nagłówków
    background: '#f5f5f5', // Kolor tła
    white: '#ffffff', // Kolor tła elementów
    gray: '#eeeded', // Kolor obramowań i nieaktywnych elementów
    grayDark: '#b6b5b5',
    error: '#e74c3c', // Kolor błędów
    success: '#2ecc71', // Kolor sukcesu
    black: '#696767'
};

// Typografia
export const typography = StyleSheet.create({
    h1: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.black,
        marginBottom: 10,
    },
    h1b: {
        fontSize: 20,
        color: colors.black,
        marginBottom: 10,
    },
    h2: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.black,
    },
    h3: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.black,
        marginBottom: 10,
    },
    h4: {
        fontSize: 15,
        color: colors.secondary,
    },
    body: {
        fontSize: 16,
        color: colors.secondary,
        marginBottom: 8,
    },
    caption: {
        fontSize: 14,
        color: colors.grayDark,
    },
});

// Responsywność
export const responsive = {
    smallMargin: width * 0.02, // 2% szerokości ekranu
    mediumMargin: width * 0.05, // 5% szerokości ekranu
    largeMargin: width * 0.1, // 10% szerokości ekranu
    buttonWidth: width * 0.8, // 80% szerokości ekranu
};

// Style przycisków
export const buttons = StyleSheet.create({
    primary: {
        backgroundColor: colors.background,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 1,
        borderWidth: 2,
        borderColor: colors.black,
        alignItems: 'center',
        minWidth: 120, // Minimalna szerokość przycisku
        maxWidth: 200
    },
    secondary: {
        backgroundColor: colors.background,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 1,
        borderWidth: 2,
        borderColor: colors.black,
        alignItems: 'center',
        minWidth: 120, // Minimalna szerokość przycisku
        maxWidth:200
    },
    text: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

// Style okien modalnych
export const modal = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    content: {
        backgroundColor: colors.background,
        padding: 20,
        borderRadius: 1,
        width: width * 0.8,
        maxWidth: 400,
        maxHeight: height * 0.9,
        marginTop: responsive.mediumMargin, // Odstęp od góry
        marginBottom: responsive.mediumMargin, // Odstęp od dołu
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

// Globalne style
export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
});

// Dodatkowe style
export const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: responsive.mediumMargin,
    },
    button: {
        flex: 1, // Przyciski będą miały równą szerokość
        marginHorizontal: responsive.smallMargin, // Odstęp między przyciskami
    },
});
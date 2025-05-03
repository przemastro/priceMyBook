// app/i18n/config.ts
import i18n, { InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './translations/en';
import pl from './translations/pl';

// Obsługiwane języki w aplikacji
const supportedLngs = ['en', 'pl'];

// Określ domyślny język na podstawie regionu urządzenia
const getDefaultLanguage = (): string => {
    try {
        const locale = Localization.locale;
        const languageCode = locale.split('-')[0];

        // Jeśli urządzenie ma język polski lub region Polski
        if (languageCode === 'pl' || Localization.region === 'PL') {
            return 'pl';
        }

        // Dla innych przypadków zwróć język jeśli jest wspierany, inaczej angielski
        return supportedLngs.includes(languageCode) ? languageCode : 'en';
    } catch (error) {
        console.error('Error detecting language:', error);
        return 'en';
    }
};

const resources = {
    en: { translation: en },
    pl: { translation: pl }
};

const i18nOptions: InitOptions = {
    resources,
    lng: getDefaultLanguage(),
    fallbackLng: 'en',
    supportedLngs,
    interpolation: {
        escapeValue: false
    },
    react: {
        useSuspense: false // Important for React Native
    }
};

// Remove the .catch() as init() doesn't return a Promise in this case
i18n
    .use(initReactI18next)
    .init(i18nOptions);

// Opcjonalnie: logowanie informacji o lokalizacji
console.log('Device locale:', Localization.locale);
console.log('Device region:', Localization.region);
console.log('Current language:', i18n.language);

export default i18n;
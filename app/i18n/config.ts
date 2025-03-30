import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './translations/en';
import pl from './translations/pl';

// Rozwiązanie problemu typów dla compatibilityJSON
type CustomInitOptions = {
    compatibilityJSON: 'v3';
    [key: string]: any;
};

const resources = {
    en: { translation: en },
    pl: { translation: pl }
};

const config = {
    resources,
    lng: Localization.locale.split('-')[0] || 'en',
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false
    },
    compatibilityJSON: 'v3' as const
};

i18n
    .use(initReactI18next)
    // @ts-ignore - ignorujemy błąd typów dla compatibilityJSON
    .init(config)
    .catch((err) => console.error('i18n init error:', err));

export default i18n;
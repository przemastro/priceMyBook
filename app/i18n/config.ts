// app/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './translations/en';
import pl from './translations/pl';

const resources = {
    en: { translation: en },
    pl: { translation: pl }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: Localization.locale.split('-')[0] || 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    })
    .catch((err) => console.error('i18n init error:', err));

export default i18n;
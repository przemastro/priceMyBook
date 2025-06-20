// app/i18n/config.ts
import i18n, {InitOptions} from 'i18next';
import {initReactI18next} from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './translations/en';
import pl from './translations/pl';

const supportedLngs = ['en', 'pl'];

const getDefaultLanguage = (): string => {
    try {
        const languageCode = Localization.locale.split('-')[0];

        if (languageCode === 'pl' || Localization.region === 'PL') {
            return 'pl';
        }

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
        useSuspense: false
    }
};

i18n
    .use(initReactI18next)
    .init(i18nOptions);

console.log('Device locale:', Localization.locale);
console.log('Device region:', Localization.region);
console.log('Current language:', i18n.language);

export default i18n;
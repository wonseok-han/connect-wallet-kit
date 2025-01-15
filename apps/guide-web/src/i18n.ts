import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

// const loadTranslations = async (lang: string) => {
//   try {
//     const response = await fetch(`http://localhost:3001/locale/${lang}.json`);
//     if (!response.ok) {
//       throw new Error(`Failed to load ${lang} translations`);
//     }
//     return await response.json();
//   } catch (error) {
//     console.error(`Error loading ${lang} translations:`, error);
//     return {};
//   }
// };

export const initI18n = (initialLang = 'en') => {
  i18n
    .use(HttpBackend)
    .use(initReactI18next)
    .init({
      lng: initialLang,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      backend: {
        loadPath:
          'https://connect-wallet-kit-guide-web.vercel.app/locale/{{lng}}.json',
      },
    });
};

// i18n 객체를 기본으로 내보냄
export default i18n;

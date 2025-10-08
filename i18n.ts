import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as RNLocalize from "react-native-localize";


import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import it from "./locales/it.json";

const locales = RNLocalize.getLocales();
const systemLanguage = locales[0]?.languageCode || "en";

i18n.use(initReactI18next).init({
  lng: systemLanguage,
  fallbackLng: "en",
  resources: {
    en: { translation: en },
    es: { translation: es },
    fr: { translation: fr },
    de: { translation: de },
    it: { translation: it },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

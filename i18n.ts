import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";


import ar from "./locales/ar.json";
import da from "./locales/da.json";
import de from "./locales/de.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import it from "./locales/it.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import nl from "./locales/nl.json";
import no from "./locales/no.json";
import pl from "./locales/pl.json";
import pt from "./locales/pt.json";
import ru from "./locales/ru.json";
import sv from "./locales/sv.json";
import tr from "./locales/tr.json";
import zh from "./locales/zh.json";

const locales = Localization.getLocales();
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
    ar: { translation: ar },
    da: { translation: da },
    ja: { translation: ja },
    ko: { translation: ko },
    nl: { translation: nl },
    no: { translation: no },
    pl: { translation: pl },
    pt: { translation: pt },
    ru: { translation: ru },
    sv: { translation: sv },
    tr: { translation: tr },
    zh: { translation: zh },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

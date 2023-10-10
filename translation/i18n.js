import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import ru from "./ru.json";
import ch from "./ch.json";
import fr from "./fr.json";
import ko from "./ko.json";
import tk from "./tk.json";
import vt from "./vt.json";
import mr from "./mr.json";
// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
    en: { 
        translation: en
    },
    ru: { 
        translation: ru
    }, 
    ch: {
        translation: ch
    },
    fr: {
        translation: fr
    },
    ko: {
        translation: ko
    },
    tk: {
        translation: tk
    },
    vt: {
        translation: vt
    },
    mr: {
        translation: mr
    },
};

i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        compatibilityJSON: 'v3',
        resources,
        fallbackLng: "en", // use en if detected lng is not available
        keySeparator: false, // we do not use keys in form messages.welcome
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });
export default i18n;
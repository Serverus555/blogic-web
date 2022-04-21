import i18next from "i18next";
import detector from "i18next-browser-languagedetector";
import {initReactI18next} from "react-i18next";
import translationEN from "../locales/en.json";
import translationRU from "../locales/ru.json";

i18next
    .use(detector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: translationEN
            },
            ru: {
                translation: translationRU
            }
        },
        fallbackLng: "en"
    }).then(r => {});
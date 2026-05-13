import { useEffect, useMemo, useState } from "react";
import { translations } from "../i18n/translations";
import { LanguageContext } from "./languageContextValue";

const LANGUAGE_STORAGE_KEY = "akm_language";
const DEFAULT_LANGUAGE = "en";
const SUPPORTED_LANGUAGES = ["en", "ar"];

const getNestedValue = (source, key) => {
  return key.split(".").reduce((value, part) => value?.[part], source);
};

const interpolate = (value, variables = {}) => {
  if (typeof value !== "string") return value;

  return value.replace(/\{(\w+)\}/g, (_, variableKey) => {
    return variables[variableKey] ?? "";
  });
};

const getInitialLanguage = () => {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;

  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return SUPPORTED_LANGUAGES.includes(savedLanguage)
    ? savedLanguage
    : DEFAULT_LANGUAGE;
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);

    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

    return () => {
      document.documentElement.lang = DEFAULT_LANGUAGE;
      document.documentElement.dir = "ltr";
    };
  }, [language]);

  const value = useMemo(() => {
    const t = (key, variables = {}) => {
      const translatedValue =
        getNestedValue(translations[language], key) ??
        getNestedValue(translations[DEFAULT_LANGUAGE], key) ??
        key;

      return interpolate(translatedValue, variables);
    };

    return {
      language,
      isArabic: language === "ar",
      setLanguage,
      toggleLanguage: () => {
        setLanguage((currentLanguage) =>
          currentLanguage === "en" ? "ar" : "en"
        );
      },
      t,
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

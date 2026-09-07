import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

// English
import enCommon from "./en/common.json";
import enAuth from "./en/auth.json";
import enSignup from "./en/signup.json";
import enDoctor from "./en/doctor.json";
import enDashboard from "./en/dashboard.json";
import enLab from "./en/lab.json";
import enEnquiry from "./en/enquiry.json";

// // Hindi
// import hiCommon from "./hi/common.json";
// import hiAuth from "./hi/auth.json";
// import hiSignup from "./hi/signup.json";

// Bangla
import bnCommon from "./bn/common.json";
import bnAuth from "./bn/auth.json";
import bnSignup from "./bn/signup.json";
import bnDoctor from "./bn/doctor.json";
import bnDashboard from "./bn/dashboard.json";
import bnLab from "./bn/lab.json";
import bnEnquiry from "./bn/enquiry.json";

export const LANGUAGE_KEY = "APP_LANGUAGE";
export const LANGUAGE_SELECTED = "LANGUAGE_SELECTED";

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    signup: enSignup,
    doctor: enDoctor,
    dashboard: enDashboard,
    lab: enLab,
    enquiry: enEnquiry,
  },

//   hi: {
//     common: hiCommon,
//     auth: hiAuth,
//     signup: hiSignup,
//   },

  bn: {
    common: bnCommon,
    auth: bnAuth,
    signup: bnSignup,
    doctor: bnDoctor,
    dashboard: bnDashboard,
    lab: bnLab,
    enquiry: bnEnquiry,
  },
};

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",

  resources,

  lng: "en",

  fallbackLng: "en",

  defaultNS: "common",

  ns: [
    "common",
    "auth",
    "signup",
    "doctor",
    "dashboard",
    "lab",
    "enquiry",
  ],

  interpolation: {
    escapeValue: false,
  },
});

export const loadLanguage = async () => {
  try {
    const language = await AsyncStorage.getItem(LANGUAGE_KEY);

    if (language) {
      await i18n.changeLanguage(language);
    }
  } catch (error) {
    console.log("Load Language Error:", error);
  }
};

export const changeLanguage = async (
  language: "en" | "hi" | "bn"
) => {
  try {
    await AsyncStorage.setItem(
      LANGUAGE_KEY,
      language
    );

    await i18n.changeLanguage(language);
  } catch (error) {
    console.log("Change Language Error:", error);
  }
};

export const markLanguageSelected = async () => {
  try {
    await AsyncStorage.setItem(
      LANGUAGE_SELECTED,
      "true"
    );
  } catch (error) {
    console.log(error);
  }
};

export const isLanguageSelected = async () => {
  try {
    const value = await AsyncStorage.getItem(
      LANGUAGE_SELECTED
    );

    return value === "true";
  } catch (error) {
    return false;
  }
};

export default i18n;
import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  useNavigation,
} from "@react-navigation/native";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  useTranslation,
} from "react-i18next";

import {
  RootStackParamList,
} from "../../../navigation/AppNavigator";

import { changeLanguage } from "../../../localization/i18n";

type NavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

export default function LanguageScreen() {

  const navigation =
    useNavigation<NavigationProp>();

  const { i18n } =
    useTranslation();

  const [selectedLanguage,
    setSelectedLanguage] =
    useState("en");

  const [loading,
    setLoading] =
    useState(false);

  useEffect(() => {
    setSelectedLanguage(
      i18n.language || "en"
    );
  }, []);
  const languages = [
  {
    code: "en",
    flag: "🇮🇳",
    title: "English",
    subtitle: "App language will be English",
  },
  {
    code: "bn",
    flag: "🇮🇳",
    title: "বাংলা",
    subtitle: "অ্যাপের ভাষা বাংলা হবে",
  },
];

const handleSave = async () => {
  try {
    setLoading(true);

    await changeLanguage(
      selectedLanguage as "en" | "bn"
    );

    navigation.goBack();
  } finally {
    setLoading(false);
  }
};

return (
  <SafeAreaView
    style={styles.container}
    edges={["top"]}
  >
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 40,
      }}
    >
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons
            name="language"
            size={34}
            color="#2563EB"
          />
        </View>

        <Text style={styles.title}>
          Language
        </Text>

        <Text style={styles.subtitle}>
          Choose your preferred language
        </Text>
      </View>

      {languages.map(language => {
        const selected =
          selectedLanguage ===
          language.code;

        return (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.card,
              selected &&
                styles.selectedCard,
            ]}
            activeOpacity={0.8}
            onPress={() =>
              setSelectedLanguage(
                language.code
              )
            }
          >
            <View style={styles.left}>
              <Text style={styles.flag}>
                {language.flag}
              </Text>

              <View>
                <Text
                  style={styles.languageName}
                >
                  {language.title}
                </Text>

                <Text
                  style={
                    styles.languageDesc
                  }
                >
                  {language.subtitle}
                </Text>
              </View>
            </View>

            <Ionicons
              name={
                selected
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              size={28}
              color={
                selected
                  ? "#2563EB"
                  : "#CBD5E1"
              }
            />
          </TouchableOpacity>
        );
      })}

            <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={loading}
      >
        <Ionicons
          name="checkmark-circle"
          size={20}
          color="#FFF"
        />

        <Text
          style={styles.saveButtonText}
        >
          {loading
            ? "Saving..."
            : "Save Language"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>
);
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    alignItems: "center",
    paddingTop: 25,
    paddingHorizontal: 20,
    marginBottom: 30,
  },

  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 8,
    color: "#64748B",
    fontSize: 15,
    textAlign: "center",
  },

  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#E2E8F0",

    elevation: 3,
  },

  selectedCard: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  flag: {
    fontSize: 34,
    marginRight: 16,
  },

  languageName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },

  languageDesc: {
    marginTop: 5,
    fontSize: 14,
    color: "#64748B",
  },
    saveButton: {
    marginHorizontal: 20,
    marginTop: 25,
    height: 56,

    borderRadius: 14,

    backgroundColor: "#2563EB",

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#2563EB",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },

  saveButtonText: {
    marginLeft: 10,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
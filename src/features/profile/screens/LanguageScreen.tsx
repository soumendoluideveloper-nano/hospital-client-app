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

  const { t, i18n } =
    useTranslation("common");

  const [selectedLanguage, setSelectedLanguage] =
    useState("en");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    setSelectedLanguage(
      i18n.language || "en"
    );
  }, [i18n.language]);

  const languages = [
    {
      code: "en",
      flag: "🇮🇳",
      title: "English",
      subtitle: i18n.language === "bn" ? "অ্যাপের ভাষা ইংরেজি হবে" : "App language will be English",
    },
    {
      code: "bn",
      flag: "🇮🇳",
      title: "বাংলা",
      subtitle: i18n.language === "bn" ? "অ্যাপের ভাষা বাংলা হবে" : "App language will be Bengali",
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
      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.navTitle}>
          {t("language")}
        </Text>

        <View style={{ width: 40 }} />
      </View>

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
            {t("choose_language")}
          </Text>

          <Text style={styles.subtitle}>
            {t("choose_preferred_language")}
          </Text>
        </View>

        {languages.map((language) => {
          const selected =
            selectedLanguage === language.code;

          return (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.card,
                selected && styles.selectedCard,
              ]}
              activeOpacity={0.8}
              onPress={() =>
                setSelectedLanguage(language.code)
              }
            >
              <View style={styles.left}>
                <Text style={styles.flag}>
                  {language.flag}
                </Text>

                <View>
                  <Text style={styles.languageName}>
                    {language.title}
                  </Text>

                  <Text style={styles.languageDesc}>
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
          activeOpacity={0.85}
        >
          <Ionicons
            name="checkmark-circle"
            size={20}
            color="#FFF"
          />

          <Text style={styles.saveButtonText}>
            {loading
              ? t("saving")
              : t("save_language")}
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

  navHeader: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  navTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },

  header: {
    alignItems: "center",
    paddingTop: 25,
    paddingHorizontal: 20,
    marginBottom: 25,
  },

  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 24,
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
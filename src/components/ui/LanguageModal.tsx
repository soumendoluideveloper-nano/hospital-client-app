import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

 import {
  changeLanguage,
  markLanguageSelected,
} from "../../localization/i18n";


type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function LanguageModal({
  visible,
  onClose,
}: Props) {
  const [selected, setSelected] = useState<"en" | "hi" | "bn">("en");

  const languages = [
    {
      code: "en",
      name: "English",
    },
    // {
    //   code: "hi",
    //   name: "हिन्दी",
    // },
    {
      code: "bn",
      name: "বাংলা",
    },
  ];


const handleContinue = async () => {
  try {
    console.log("Selected:", selected);

    await changeLanguage(selected);
    await markLanguageSelected();

    onClose();
  } catch (e) {
    console.log(e);
  }
};
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.icon}>🌐</Text>

          <Text style={styles.title}>
            Choose Your Language
          </Text>

          <Text style={styles.subtitle}>
            Select your preferred language
          </Text>

          {languages.map((item) => (
            <TouchableOpacity
              key={item.code}
              style={styles.row}
              onPress={() =>
                setSelected(item.code as any)
              }
            >
              <Text style={styles.language}>
                {item.name}
              </Text>

              <Ionicons
                name={
                  selected === item.code
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={24}
                color="#2563EB"
              />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.button}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
  },

  icon: {
    fontSize: 50,
    textAlign: "center",
  },

  title: {
    marginTop: 15,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: "#0F172A",
  },

  subtitle: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 8,
    marginBottom: 25,
  },

  row: {
    height: 56,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  language: {
    fontSize: 17,
    fontWeight: "600",
    color: "#0F172A",
  },

  button: {
    marginTop: 10,
    backgroundColor: "#2563EB",
    height: 54,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
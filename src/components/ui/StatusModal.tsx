import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type StatusType =
  | "success"
  | "error"
  | "warning";

interface StatusModalProps {
  visible: boolean;
  type?: "success" | "error" | "warning";
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
  onConfirm?: () => void;
}

export default function StatusModal({
  visible,
  type = "success",
  title,
  message,
  buttonText = "OK",
  onClose,
  onConfirm,
}: StatusModalProps) {
  const config = {
    success: {
      icon: "checkmark-circle" as const,
      iconColor: "#16A34A",
      iconBackground: "#DCFCE7",
      buttonColor: "#2563EB",
    },

    error: {
      icon: "close-circle" as const,
      iconColor: "#DC2626",
      iconBackground: "#FEE2E2",
      buttonColor: "#DC2626",
    },

    warning: {
      icon: "warning" as const,
      iconColor: "#D97706",
      iconBackground: "#FEF3C7",
      buttonColor: "#D97706",
    },
  };

  const current = config[type];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>

          {/* Icon */}

          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor:
                  current.iconBackground,
              },
            ]}
          >
            <Ionicons
              name={current.icon}
              size={48}
              color={current.iconColor}
            />
          </View>

          {/* Title */}

          <Text style={styles.title}>
            {title}
          </Text>

          {/* Message */}

          <Text style={styles.message}>
            {message}
          </Text>

          {/* Button */}

         <TouchableOpacity
  style={[
    styles.button,
    {
      backgroundColor:
        current.buttonColor,
    },
  ]}
  onPress={() => {
    onClose();

    if (type === "success") {
      onConfirm?.();
    }
  }}
  activeOpacity={0.8}
>
  <Text style={styles.buttonText}>
    {buttonText}
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
    backgroundColor:
      "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },

  modal: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 25,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 10,
  },

  iconContainer: {
    width: 82,
    height: 82,
    borderRadius: 41,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },

  message: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
    textAlign: "center",
  },

  button: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
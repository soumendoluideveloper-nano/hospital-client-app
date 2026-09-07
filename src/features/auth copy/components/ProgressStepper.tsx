import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useTranslation } from "react-i18next";

type Props = {
  step: number;
};

const steps = [
  "Mobile",
  "Clinic",
  "Address",
  "Security",
];

export default function ProgressStepper({
  step,
}: Props) {
  const { t: signup } =
    useTranslation("signup");

  return (
    <>
      {/* Logo */}

      <View style={styles.logoContainer}>
        <Ionicons
          name="medical"
          size={60}
          color="#2563EB"
        />
      </View>

      {/* Heading */}

      <Text style={styles.title}>
        {signup("signup_title")}
      </Text>

      <Text style={styles.subtitle}>
        {signup("signup_subtitle")}
      </Text>

      {/* Stepper */}

      <View style={styles.progressContainer}>
        {steps.map((item, index) => {
          const active =
            step >= index + 1;

          const completed =
            step > index + 1;

          return (
            <View
              key={item}
              style={styles.stepItem}
            >
              <View
                style={[
                  styles.circle,
                  active &&
                    styles.circleActive,
                ]}
              >
                <Text
                  style={[
                    styles.circleText,
                    active &&
                      styles.circleTextActive,
                  ]}
                >
                  {completed
                    ? "✓"
                    : index + 1}
                </Text>
              </View>

              <Text
                style={[
                  styles.label,
                  active &&
                    styles.activeLabel,
                ]}
              >
                {item}
              </Text>
            </View>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 28,
    textAlign: "center",
    color: "#64748B",
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 12,
  },

  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  stepItem: {
    flex: 1,
    alignItems: "center",
  },

  circle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  circleActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  circleText: {
    fontWeight: "700",
    color: "#64748B",
    fontSize: 15,
  },

  circleTextActive: {
    color: "#FFFFFF",
  },

  label: {
    marginTop: 8,
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
  },

  activeLabel: {
    color: "#2563EB",
    fontWeight: "700",
  },
});
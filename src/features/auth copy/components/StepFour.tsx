import React, { memo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

type Props = {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;

  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;

  confirmPassword: string;
  setConfirmPassword: React.Dispatch<
    React.SetStateAction<string>
  >;

  showPassword: boolean;
  setShowPassword: React.Dispatch<
    React.SetStateAction<boolean>
  >;

  showConfirmPassword: boolean;
  setShowConfirmPassword: React.Dispatch<
    React.SetStateAction<boolean>
  >;

  previousStep: () => void;
  onSubmit: () => void;
};

function StepFour({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  previousStep,
  onSubmit,
}: Props) {

  const { t: common } =
    useTranslation("common");

  const { t: signup } =
    useTranslation("signup");

  const [emailError, setEmailError] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  const [
    confirmPasswordError,
    setConfirmPasswordError,
  ] = useState("");

  const handleSubmit = () => {

    Keyboard.dismiss();

    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    let valid = true;

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      setEmailError(
        signup("email_required")
      );
      valid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError(
        signup("invalid_email")
      );
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError(
        signup("password_required")
      );
      valid = false;
    } else if (password.length < 6) {
      setPasswordError(
        signup("password_min")
      );
      valid = false;
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError(
        signup("confirm_password_required")
      );
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError(
        signup("password_not_match")
      );
      valid = false;
    }

    if (!valid) return;

    onSubmit();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {signup("account_security")}
      </Text>

      <Text style={styles.subtitle}>
        {signup("account_security_subtitle")}
      </Text>

      {/* Email */}

      <Text style={styles.label}>
        {common("email")}
      </Text>

      <View
        style={[
          styles.inputContainer,
          emailError && styles.errorInput,
        ]}
      >
        <Ionicons
          name="mail-outline"
          size={20}
          color="#64748B"
          style={styles.icon}
        />

        <TextInput
          style={styles.input}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder={common("email_placeholder")}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) setEmailError("");
          }}
        />
      </View>

      {!!emailError && (
        <Text style={styles.errorText}>
          {emailError}
        </Text>
      )}

      {/* Password */}

      <Text style={styles.label}>
        {common("password")}
      </Text>

      <View
        style={[
          styles.inputContainer,
          passwordError && styles.errorInput,
        ]}
      >
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color="#64748B"
          style={styles.icon}
        />

        <TextInput
          style={styles.input}
          secureTextEntry={!showPassword}
          value={password}
          placeholder={common("enter_password")}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError)
              setPasswordError("");
          }}
        />

        <TouchableOpacity
          onPress={() =>
            setShowPassword(!showPassword)
          }
        >
          <Ionicons
            name={
              showPassword
                ? "eye-off-outline"
                : "eye-outline"
            }
            size={22}
            color="#64748B"
          />
        </TouchableOpacity>
      </View>

      {!!passwordError && (
        <Text style={styles.errorText}>
          {passwordError}
        </Text>
      )}

      {/* Confirm Password */}

      <Text style={styles.label}>
        {signup("confirm_password")}
      </Text>

      <View
        style={[
          styles.inputContainer,
          confirmPasswordError &&
            styles.errorInput,
        ]}
      >
        <Ionicons
          name="shield-checkmark-outline"
          size={20}
          color="#64748B"
          style={styles.icon}
        />

        <TextInput
          style={styles.input}
          secureTextEntry={
            !showConfirmPassword
          }
          value={confirmPassword}
          placeholder={signup(
            "confirm_password_placeholder"
          )}
          onChangeText={(text) => {
            setConfirmPassword(text);

            if (confirmPasswordError)
              setConfirmPasswordError("");
          }}
        />

        <TouchableOpacity
          onPress={() =>
            setShowConfirmPassword(
              !showConfirmPassword
            )
          }
        >
          <Ionicons
            name={
              showConfirmPassword
                ? "eye-off-outline"
                : "eye-outline"
            }
            size={22}
            color="#64748B"
          />
        </TouchableOpacity>
      </View>

      {!!confirmPasswordError && (
        <Text style={styles.errorText}>
          {confirmPasswordError}
        </Text>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={previousStep}
        >
          <Text style={styles.backText}>
            {common("back")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleSubmit}
        >
          <Text style={styles.createText}>
            {common("create_account")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default memo(StepFour);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 20,
    elevation: 3,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 6,
    marginBottom: 20,
    color: "#64748B",
  },

  label: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "600",
    color: "#334155",
  },

  inputContainer: {
    height: 56,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  icon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
  },

  errorInput: {
    borderColor: "#EF4444",
  },

  errorText: {
    color: "#EF4444",
    marginTop: 5,
    marginLeft: 4,
    fontSize: 13,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },

  backButton: {
    width: "30%",
    height: 52,
    borderWidth: 1,
    borderColor: "#2563EB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  backText: {
    color: "#2563EB",
    fontWeight: "700",
  },

  createButton: {
    width: "65%",
    height: 52,
    borderRadius: 12,
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
  },

  createText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
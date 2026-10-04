import React, { memo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "../../../utils/validation";

type Props = {
  initialEmail?: string;
  initialPassword?: string;
  initialConfirmPassword?: string;

  email?: string;
  setEmail?: (value: string) => void;
  password?: string;
  setPassword?: (value: string) => void;
  confirmPassword?: string;
  setConfirmPassword?: (value: string) => void;
  showPassword?: boolean;
  setShowPassword?: (value: boolean) => void;
  showConfirmPassword?: boolean;
  setShowConfirmPassword?: (value: boolean) => void;

  previousStep: () => void;
  onSubmit: ((data: { email: string; password: string }) => void) | (() => void);
  loading: boolean;
};

function StepFour({
  initialEmail,
  initialPassword,
  initialConfirmPassword,
  email: propEmail,
  setEmail: propSetEmail,
  password: propPassword,
  setPassword: propSetPassword,
  confirmPassword: propConfirmPassword,
  setConfirmPassword: propSetConfirmPassword,
  showPassword: propShowPassword,
  setShowPassword: propSetShowPassword,
  showConfirmPassword: propShowConfirmPassword,
  setShowConfirmPassword: propSetShowConfirmPassword,
  previousStep,
  onSubmit,
  loading,
}: Props) {
  const { t: common } = useTranslation("common");
  const { t: signup } = useTranslation("signup");

  const [email, setEmail] = useState(
    propEmail !== undefined ? propEmail : initialEmail || ""
  );
  const [password, setPassword] = useState(
    propPassword !== undefined ? propPassword : initialPassword || ""
  );
  const [confirmPassword, setConfirmPassword] = useState(
    propConfirmPassword !== undefined ? propConfirmPassword : initialConfirmPassword || ""
  );
  const [showPassword, setShowPassword] = useState(
    propShowPassword !== undefined ? propShowPassword : false
  );
  const [showConfirmPassword, setShowConfirmPassword] = useState(
    propShowConfirmPassword !== undefined ? propShowConfirmPassword : false
  );

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const handleSubmit = () => {
    Keyboard.dismiss();
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    const emailVal = validateEmail(email, true, common);
    if (!emailVal.isValid) {
      setEmailError(emailVal.message);
      return;
    }

    const passwordVal = validatePassword(password, common);
    if (!passwordVal.isValid) {
      setPasswordError(passwordVal.message);
      return;
    }

    const confirmVal = validateConfirmPassword(password, confirmPassword, common);
    if (!confirmVal.isValid) {
      setConfirmPasswordError(confirmVal.message);
      return;
    }

    propSetEmail?.(email.trim());
    propSetPassword?.(password);
    propSetConfirmPassword?.(confirmPassword);

    (onSubmit as any)({
      email: email.trim(),
      password,
    });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{signup("account_security")}</Text>
      <Text style={styles.subtitle}>{signup("account_security_subtitle")}</Text>

      {/* Email */}
      <Text style={styles.label}>{common("email")}</Text>
      <View
        style={[
          styles.inputContainer,
          emailError ? styles.errorInput : null,
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
          placeholderTextColor="#94A3B8"
          onChangeText={(text) => {
            const cleaned = text.replace(/\s/g, "").toLowerCase();
            setEmail(cleaned);
            if (emailError) setEmailError("");
          }}
          onBlur={() => {
            if (email.trim()) {
              const res = validateEmail(email, true, common);
              if (!res.isValid) setEmailError(res.message);
            }
          }}
        />
      </View>
      {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}

      {/* Password */}
      <Text style={styles.label}>{common("password")}</Text>
      <View
        style={[
          styles.inputContainer,
          passwordError ? styles.errorInput : null,
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
          placeholderTextColor="#94A3B8"
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) setPasswordError("");
          }}
          onBlur={() => {
            if (password) {
              const res = validatePassword(password, common);
              if (!res.isValid) setPasswordError(res.message);
            }
          }}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#64748B"
          />
        </TouchableOpacity>
      </View>
      {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

      {/* Confirm Password */}
      <Text style={styles.label}>{signup("confirm_password")}</Text>
      <View
        style={[
          styles.inputContainer,
          confirmPasswordError ? styles.errorInput : null,
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
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          placeholder={signup("confirm_password_placeholder")}
          placeholderTextColor="#94A3B8"
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (confirmPasswordError) setConfirmPasswordError("");
          }}
          onBlur={() => {
            if (confirmPassword) {
              const res = validateConfirmPassword(password, confirmPassword, common);
              if (!res.isValid) setConfirmPasswordError(res.message);
            }
          }}
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#64748B"
          />
        </TouchableOpacity>
      </View>
      {!!confirmPasswordError && (
        <Text style={styles.errorText}>{confirmPasswordError}</Text>
      )}

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={previousStep}
          activeOpacity={0.8}
        >
          <Text style={styles.backText}>{common("back")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.createButton, loading ? styles.disabledButton : null]}
          disabled={loading}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.createText}>{common("create_account")}</Text>
          )}
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
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
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
    fontSize: 14,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "600",
    color: "#334155",
    fontSize: 14,
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
    height: "100%",
  },
  errorInput: {
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    marginTop: 5,
    marginLeft: 4,
    fontSize: 13,
    fontWeight: "500",
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
    fontSize: 15,
  },
  createButton: {
    width: "65%",
    height: 52,
    borderRadius: 12,
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  createText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
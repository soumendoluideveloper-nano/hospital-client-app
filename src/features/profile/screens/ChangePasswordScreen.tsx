import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { changePasswordApi } from "../api/profile.api";
import useAuth from "../../../hooks/useAuth";
import {
  validatePassword,
  validateConfirmPassword,
} from "../../../utils/validation";

export default function ChangePasswordScreen() {
  const { logout } = useAuth();
  const { t: auth } = useTranslation("auth");
  const navigation = useNavigation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");

    let valid = true;

    if (!currentPassword.trim()) {
      setCurrentPasswordError(auth("current_password_required") || "Current password is required");
      valid = false;
    }

    const newPwdVal = validatePassword(newPassword);
    if (!newPwdVal.isValid) {
      setNewPasswordError(newPwdVal.message);
      valid = false;
    } else if (newPassword === currentPassword) {
      setNewPasswordError("New password must be different from current password");
      valid = false;
    }

    const confirmVal = validateConfirmPassword(newPassword, confirmPassword);
    if (!confirmVal.isValid) {
      setConfirmPasswordError(confirmVal.message);
      valid = false;
    }

    return valid;
  };

  const handleChangePassword = async () => {
    if (loading) return;
    if (!validate()) return;

    try {
      setLoading(true);

      const response = await changePasswordApi({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if ((response as any)?.status === 1 || (response as any)?.success) {
        Alert.alert(
          auth("change_password") || "Change Password",
          (response as any)?.message || "Password changed successfully. Please log in again with your new password.",
          [
            {
              text: "OK",
              onPress: async () => {
                await logout();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          auth("change_password") || "Change Password",
          (response as any)?.message || "Failed to change password."
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message || "Failed to change password. Please verify your current password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{auth("change_password")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.subtitle}>
              {auth("change_password_subtitle")}
            </Text>
          </View>

          <View style={styles.card}>
            {/* Current Password */}
            <Text style={styles.label}>{auth("current_password")} *</Text>
            <View
              style={[
                styles.inputContainer,
                currentPasswordError ? styles.errorInput : null,
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
                placeholder={auth("current_password_placeholder")}
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showCurrent}
                value={currentPassword}
                onChangeText={(text) => {
                  setCurrentPassword(text);
                  if (currentPasswordError) setCurrentPasswordError("");
                }}
                onBlur={() => {
                  if (!currentPassword.trim()) {
                    setCurrentPasswordError(auth("current_password_required") || "Current password is required");
                  }
                }}
              />
              <TouchableOpacity
                onPress={() => setShowCurrent(!showCurrent)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showCurrent ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
            {!!currentPasswordError && (
              <Text style={styles.errorText}>{currentPasswordError}</Text>
            )}

            {/* New Password */}
            <Text style={styles.label}>{auth("new_password")} *</Text>
            <View
              style={[
                styles.inputContainer,
                newPasswordError ? styles.errorInput : null,
              ]}
            >
              <Ionicons
                name="key-outline"
                size={20}
                color="#64748B"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder={auth("new_password_placeholder")}
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (newPasswordError) setNewPasswordError("");
                }}
                onBlur={() => {
                  if (newPassword) {
                    const res = validatePassword(newPassword);
                    if (!res.isValid) {
                      setNewPasswordError(res.message);
                    } else if (newPassword === currentPassword) {
                      setNewPasswordError("New password must be different from current password");
                    }
                  }
                }}
              />
              <TouchableOpacity
                onPress={() => setShowNew(!showNew)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showNew ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
            {!!newPasswordError && (
              <Text style={styles.errorText}>{newPasswordError}</Text>
            )}

            {/* Confirm Password */}
            <Text style={styles.label}>{auth("confirm_password")} *</Text>
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
                placeholder={auth("confirm_password_placeholder")}
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (confirmPasswordError) setConfirmPasswordError("");
                }}
                onBlur={() => {
                  if (confirmPassword) {
                    const res = validateConfirmPassword(newPassword, confirmPassword);
                    if (!res.isValid) setConfirmPasswordError(res.message);
                  }
                }}
              />
              <TouchableOpacity
                onPress={() => setShowConfirm(!showConfirm)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showConfirm ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
            {!!confirmPasswordError && (
              <Text style={styles.errorText}>{confirmPasswordError}</Text>
            )}

            {/* Password Requirements Checklist */}
            <View style={styles.strengthCard}>
              <Text style={styles.strengthTitle}>
                {auth("password_requirements")}
              </Text>

              <View style={styles.requirement}>
                <Ionicons
                  name={
                    newPassword.length >= 8
                      ? "checkmark-circle"
                      : "ellipse-outline"
                  }
                  size={18}
                  color={newPassword.length >= 8 ? "#16A34A" : "#CBD5E1"}
                />
                <Text style={styles.requirementText}>
                  At least 8 characters
                </Text>
              </View>

              <View style={styles.requirement}>
                <Ionicons
                  name={
                    /[A-Z]/.test(newPassword)
                      ? "checkmark-circle"
                      : "ellipse-outline"
                  }
                  size={18}
                  color={/[A-Z]/.test(newPassword) ? "#16A34A" : "#CBD5E1"}
                />
                <Text style={styles.requirementText}>
                  {auth("password_uppercase_required")}
                </Text>
              </View>

              <View style={styles.requirement}>
                <Ionicons
                  name={
                    /[a-z]/.test(newPassword)
                      ? "checkmark-circle"
                      : "ellipse-outline"
                  }
                  size={18}
                  color={/[a-z]/.test(newPassword) ? "#16A34A" : "#CBD5E1"}
                />
                <Text style={styles.requirementText}>
                  At least one lowercase letter
                </Text>
              </View>

              <View style={styles.requirement}>
                <Ionicons
                  name={
                    /[0-9]/.test(newPassword)
                      ? "checkmark-circle"
                      : "ellipse-outline"
                  }
                  size={18}
                  color={/[0-9]/.test(newPassword) ? "#16A34A" : "#CBD5E1"}
                />
                <Text style={styles.requirementText}>
                  {auth("password_number_required")}
                </Text>
              </View>

              <View style={styles.requirement}>
                <Ionicons
                  name={
                    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)
                      ? "checkmark-circle"
                      : "ellipse-outline"
                  }
                  size={18}
                  color={
                    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)
                      ? "#16A34A"
                      : "#CBD5E1"
                  }
                />
                <Text style={styles.requirementText}>
                  At least one special character (!@#$%^&*...)
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.updateButton, loading ? styles.disabledButton : null]}
              onPress={handleChangePassword}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="lock-closed" size={20} color="#FFF" />
                  <Text style={styles.updateButtonText}>
                    {auth("update_password")}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 10,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: "#64748B",
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    color: "#334155",
    fontWeight: "600",
    fontSize: 15,
  },
  inputContainer: {
    height: 56,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    backgroundColor: "#FFFFFF",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
  },
  strengthCard: {
    marginTop: 24,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  strengthTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  requirement: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  requirementText: {
    marginLeft: 10,
    color: "#475569",
    fontSize: 14,
  },
  updateButton: {
    marginTop: 30,
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
  disabledButton: {
    opacity: 0.7,
  },
  updateButtonText: {
    marginLeft: 10,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  errorInput: {
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginTop: 5,
    marginLeft: 4,
    fontWeight: "500",
  },
});
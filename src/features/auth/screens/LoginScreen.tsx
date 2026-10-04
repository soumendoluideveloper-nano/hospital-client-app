import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { loginApi } from "../api/auth.api";
import useAuth from "../../../hooks/useAuth";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../../../navigation/AppNavigator";
import { isLanguageSelected } from "../../../localization/i18n";
import LanguageModal from "../../../components/ui/LanguageModal";
import CareSpotBrand from "../../../components/ui/CareSpotBrand";
import { validateMobile } from "../../../utils/validation";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const { t: common } = useTranslation("common");
  const { t: auth } = useTranslation("auth");
  const { t: signup } = useTranslation("signup");

  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mobileError, setMobileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showLanguage, setShowLanguage] = useState(false);

  useEffect(() => {
    const checkLanguage = async () => {
      const selected = await isLanguageSelected();
      if (!selected) {
        setShowLanguage(true);
      }
    };
    checkLanguage();
  }, []);

  const handleLogin = async () => {
    setMobileError("");
    setPasswordError("");

    const mobileVal = validateMobile(mobile, common);
    if (!mobileVal.isValid) {
      setMobileError(mobileVal.message);
      return;
    }

    if (!password.trim()) {
      setPasswordError(signup("password_required") || "Password is required");
      return;
    }

    try {
      setLoading(true);

      const response = await loginApi({
        phone: mobile.trim(),
        password,
      });

      if (!response || !response.data || !response.data.token) {
        throw new Error(auth("login_wrong") || "Invalid login response from server");
      }

      const token = response?.data?.token ?? "";
      const clinic = response?.data?.clinic ?? "";

      await login(token, clinic);
    } catch (err: any) {
      setPasswordError(err.message || auth("login_failed") || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    navigation.navigate("Signup");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ alignItems: "center" }}>
            <View style={styles.logoIconBox}>
              <Image
                source={require("../../../../assets/care_spot_icon.png")}
                style={styles.logoIconImage}
                resizeMode="contain"
              />
            </View>

            <CareSpotBrand fontSize={28} style={{ marginTop: 12 }} />

            <View style={styles.partnerBadge}>
              <Text style={styles.partnerBadgeText}>CLINIC PARTNER</Text>
            </View>

            <Text style={styles.subtitle}>
              {auth("login_subtitle")}
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>
              {common("mobile_number")}
            </Text>

            <View
              style={[
                styles.inputContainer,
                mobileError ? styles.errorInput : null,
              ]}
            >
              <Ionicons
                name="call-outline"
                size={20}
                color="#64748B"
                style={styles.icon}
              />

              <TextInput
                style={styles.input}
                placeholder={common("enter_mobile")}
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                maxLength={10}
                value={mobile}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, "");
                  setMobile(cleaned);
                  if (mobileError) setMobileError("");
                }}
                onBlur={() => {
                  if (mobile.trim()) {
                    const res = validateMobile(mobile, common);
                    if (!res.isValid) setMobileError(res.message);
                  }
                }}
              />
            </View>

            {mobileError ? (
              <Text style={styles.errorText}>{mobileError}</Text>
            ) : null}

            <Text style={styles.label}>
              {common("password")}
            </Text>

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
                placeholder={common("enter_password")}
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError("");
                }}
              />

              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.button, loading ? styles.buttonDisabled : null]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {loading
                  ? common("please_wait")
                  : common("login")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignup}
            >
              <Text style={styles.signupText}>
                {auth("dont_have_account")}{" "}
                <Text style={styles.signupLink}>
                  {common("create_account")}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            {common("footer")}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <LanguageModal
        visible={showLanguage}
        onClose={() => setShowLanguage(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 24,
  },

  logoIconBox: {
    width: 86,
    height: 86,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    shadowColor: "#0284C7",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    marginTop: 8,
  },

  logoIconImage: {
    width: "100%",
    height: "100%",
  },

  partnerBadge: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },

  partnerBadgeText: {
    color: "#2563EB",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  subtitle: {
    marginTop: 8,
    textAlign: "center",
    color: "#64748B",
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 12,
  },

  form: {
    marginTop: 16,
  },

  label: {
    marginBottom: 8,
    marginTop: 14,
    color: "#334155",
    fontWeight: "600",
    fontSize: 15,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
    height: "100%",
  },

  button: {
    marginTop: 24,
    backgroundColor: "#2563EB",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  signupButton: {
    marginTop: 18,
    alignItems: "center",
  },

  signupText: {
    color: "#64748B",
    fontSize: 15,
  },

  signupLink: {
    color: "#2563EB",
    fontWeight: "700",
  },

  footer: {
    textAlign: "center",
    color: "#94A3B8",
    marginTop: 20,
    marginBottom: 10,
    fontSize: 13,
  },

  errorInput: {
    borderColor: "#EF4444",
  },

  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginTop: 5,
    marginLeft: 3,
    fontWeight: "500",
  },

  inputContainer: {
    height: 56,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  icon: {
    marginRight: 10,
  },
});
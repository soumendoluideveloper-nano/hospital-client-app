import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,

} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../../../navigation/AppNavigator";
import { Pressable, Keyboard } from "react-native";
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const { t: common } = useTranslation("common");
  const { t: auth } = useTranslation("auth");
  const { t: signup } = useTranslation("signup");

  const navigation = useNavigation<NavigationProp>();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
const [mobileError, setMobileError] = useState("");
const [passwordError, setPasswordError] = useState("");
  const handleLogin = () => {
  setMobileError("");
  setPasswordError("");

  let isValid = true;

  if (!mobile.trim()) {
    setMobileError(auth("mobile_required"));
    isValid = false;
  } else if (mobile.length !== 10) {
    setMobileError(auth("invalid_mobile"));
    isValid = false;
  }

  if (!password.trim()) {
    setPasswordError(signup("password_required"));
    isValid = false;
  }

  if (!isValid) return;

  navigation.replace("Dashboard");
};

  const handleSignup = () => {
    navigation.navigate("Signup");
  };

  return (
    <SafeAreaView style={styles.container}>
  <Pressable
    style={{ flex: 1 }}
    onPress={Keyboard.dismiss}
  >
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
        <View>
          <Text style={styles.logo}>🏥</Text>

          <Text style={styles.title}>
            {auth("login_title")}
          </Text>

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
    mobileError && styles.errorInput,
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
    keyboardType="phone-pad"
    maxLength={10}
    value={mobile}
    onChangeText={(text) => {
      setMobile(text);
      if (mobileError) setMobileError("");
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
    placeholder={common("enter_password")}
    secureTextEntry
    value={password}
    onChangeText={(text) => {
      setPassword(text);
      if (passwordError) setPasswordError("");
    }}
  />
</View>

{passwordError ? (
  <Text style={styles.errorText}>{passwordError}</Text>
) : null}

<TouchableOpacity
  style={styles.button}
  onPress={handleLogin}
>
  <Text style={styles.buttonText}>
    {common("login")}
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

</KeyboardAvoidingView>
</Pressable>
</SafeAreaView>
);
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  wrapper: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  logo: {
    fontSize: 70,
    textAlign: "center",
    marginTop: 30,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginTop: 10,
  },

  subtitle: {
    marginTop: 10,
    textAlign: "center",
    color: "#64748B",
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 12,
  },

  form: {
    marginTop: 20,
  },

  label: {
    marginBottom: 8,
    marginTop: 16,
    color: "#334155",
    fontWeight: "600",
    fontSize: 15,
  },

  // input: {
  //   height: 56,
  //   borderWidth: 1,
  //   borderColor: "#CBD5E1",
  //   borderRadius: 12,
  //   paddingHorizontal: 16,
  //   backgroundColor: "#FFFFFF",
  //   fontSize: 16,
  //   color: "#0F172A",
  // },
  input: {
  flex: 1,
  fontSize: 16,
  color: "#0F172A",
},

  button: {
    marginTop: 28,
    backgroundColor: "#2563EB",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  signupButton: {
    marginTop: 20,
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
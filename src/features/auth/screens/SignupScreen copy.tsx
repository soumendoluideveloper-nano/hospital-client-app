import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SignupScreen() {
  const { t: common } = useTranslation("common");
  const { t: auth } = useTranslation("auth");
  const { t: signup } = useTranslation("signup");

  const navigation = useNavigation<NavigationProp>();

  const [clinicName, setClinicName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const handleSignup = () => {
    if (!clinicName.trim()) {
      Alert.alert(signup("clinic_name_required"));
      return;
    }

    if (!ownerName.trim()) {
      Alert.alert(signup("owner_name_required"));
      return;
    }

    if (mobile.length !== 10) {
      Alert.alert(auth("invalid_mobile"));
      return;
    }

    if (!email.trim()) {
      Alert.alert(signup("email_required"));
      return;
    }

    if (!password) {
      Alert.alert(signup("password_required"));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(signup("password_not_match"));
      return;
    }

    Alert.alert(signup("account_created"));

    // TODO:
    // API Call Here
  };

  const goToLogin = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logo}>
          <Ionicons
            name="medical"
            size={50}
            color="#2563EB"
          />
        </View>

        <Text style={styles.title}>
          {signup("signup_title")}
        </Text>

        <Text style={styles.subtitle}>
          {signup("signup_subtitle")}
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>
  {signup("clinic_name")}
</Text>
<TextInput
  style={styles.input}
  placeholder={signup("clinic_name_placeholder")}
  value={clinicName}
  onChangeText={setClinicName}
/>

<Text style={styles.label}>
  {signup("owner_name")}
</Text>
<TextInput
  style={styles.input}
  placeholder={signup("owner_name_placeholder")}
  value={ownerName}
  onChangeText={setOwnerName}
/>

<Text style={styles.label}>
  {common("mobile_number")}
</Text>
<TextInput
  style={styles.input}
  placeholder={common("enter_mobile")}
  keyboardType="phone-pad"
  maxLength={10}
  value={mobile}
  onChangeText={setMobile}
/>

<Text style={styles.label}>
  {common("email")}
</Text>
<TextInput
  style={styles.input}
  placeholder={common("email_placeholder")}
  keyboardType="email-address"
  autoCapitalize="none"
  value={email}
  onChangeText={setEmail}
/>

<Text style={styles.label}>
  {common("password")}
</Text>
<TextInput
  style={styles.input}
  placeholder={common("enter_password")}
  secureTextEntry
  value={password}
  onChangeText={setPassword}
/>

<Text style={styles.label}>
  {signup("confirm_password")}
</Text>
<TextInput
  style={styles.input}
  placeholder={signup("confirm_password_placeholder")}
  secureTextEntry
  value={confirmPassword}
  onChangeText={setConfirmPassword}
/>

<Text style={styles.label}>
  {common("address")}
</Text>
<TextInput
  style={[styles.input, { height: 90 }]}
  placeholder={common("address_placeholder")}
  multiline
  numberOfLines={3}
  textAlignVertical="top"
  value={address}
  onChangeText={setAddress}
/>

<Text style={styles.label}>
  {common("city")}
</Text>
<TextInput
  style={styles.input}
  placeholder={common("city_placeholder")}
  value={city}
  onChangeText={setCity}
/>

<Text style={styles.label}>
  {common("state")}
</Text>
<TextInput
  style={styles.input}
  placeholder={common("state_placeholder")}
  value={state}
  onChangeText={setState}
/>

<Text style={styles.label}>
  {common("pincode")}
</Text>
<TextInput
  style={styles.input}
  placeholder={common("pincode_placeholder")}
  keyboardType="number-pad"
  maxLength={6}
  value={pincode}
  onChangeText={setPincode}
/>

<Text style={styles.label}>
  {signup("referral_code")}
</Text>
<TextInput
  style={styles.input}
  placeholder={signup("referral_code_placeholder")}
  value={referralCode}
  onChangeText={setReferralCode}
/>

<TouchableOpacity
  style={styles.button}
  onPress={handleSignup}
>
  <Text style={styles.buttonText}>
    {common("create_account")}
  </Text>
</TouchableOpacity>

<TouchableOpacity onPress={goToLogin}>
  <Text style={styles.loginText}>
    {signup("already_have_account")}{" "}
    <Text style={styles.loginLink}>
      {common("login")}
    </Text>
  </Text>
</TouchableOpacity>

</View>
</ScrollView>
</SafeAreaView>
);
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#E0ECFF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 25,
    lineHeight: 22,
    paddingHorizontal: 10,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
    marginTop: 15,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: "#FFFFFF",
    fontSize: 15,
    color: "#0F172A",
  },

  button: {
    height: 55,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  loginText: {
    textAlign: "center",
    marginTop: 22,
    color: "#64748B",
    fontSize: 15,
  },

  loginLink: {
    color: "#2563EB",
    fontWeight: "700",
  },
});
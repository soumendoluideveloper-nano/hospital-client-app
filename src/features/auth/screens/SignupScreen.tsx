import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
   Modal,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { SafeAreaView } from "react-native-safe-area-context";

import { useNavigation } from "@react-navigation/native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../../navigation/AppNavigator";

import ProgressStepper from "../components/ProgressStepper";
import StepOne from "../components/StepOne";
import StepTwo from "../components/StepTwo";
import StepThree from "../components/StepThree";
import StepFour from "../components/StepFour";

import useSignupForm from "../hooks/useSignupForm";
import { signupApi } from "../api/auth.api";
type NavigationProp =
  NativeStackNavigationProp<RootStackParamList>;
  export default function SignupScreen() {
  const { t: signup } =
    useTranslation("signup");
  const navigation =
    useNavigation<NavigationProp>();

  const scrollRef =
    useRef<ScrollView>(null);

  const [step, setStep] =
    useState(1);
  const [creatingAccount, setCreatingAccount] =
  useState(false);

  const [showError, setShowError] =
  useState(false);

const [errorMessage, setErrorMessage] =
  useState("");
  const {
    form,
    updateField,
    resetForm,
  } = useSignupForm();
    const changeStep = useCallback(
    (value: number) => {

      Keyboard.dismiss();

      requestAnimationFrame(() => {

        setStep(prev => prev + value);

        scrollRef.current?.scrollTo({
          y: 0,
          animated: false,
        });

      });

    },
    []
  );
const handlers = useMemo(
  () => ({
    setMobile: (value: string) =>
      updateField("mobile", value),

    setOtp: (value: string) =>
      updateField("otp", value),

    setOtpSent: (value: boolean) =>
      updateField("otpSent", value),

    setOtpVerified: (value: boolean) =>
      updateField("otpVerified", value),

    setClinicName: (value: string) =>
      updateField("clinicName", value),

    setOwnerName: (value: string) =>
      updateField("ownerName", value),

    setReferralCode: (value: string) =>
      updateField("referralCode", value),

    setAddress: (value: string) =>
      updateField("address", value),

    setCity: (value: string) =>
      updateField("city", value),

    setStateName: (value: string) =>
      updateField("stateName", value),

    setPincode: (value: string) =>
      updateField("pincode", value),

    setEmail: (value: string) =>
      updateField("email", value),

    setPassword: (value: string) =>
      updateField("password", value),

    setConfirmPassword: (
      value: string
    ) =>
      updateField(
        "confirmPassword",
        value
      ),

    setShowPassword: (
      value: boolean
    ) =>
      updateField(
        "showPassword",
        value
      ),

    setShowConfirmPassword: (
      value: boolean
    ) =>
      updateField(
        "showConfirmPassword",
        value
      ),
  }),
  [updateField]
);
const [showSuccess, setShowSuccess] =
  useState(false);
  const nextStep =
    useCallback(() => {

      changeStep(1);

    }, [changeStep]);

  const previousStep =
    useCallback(() => {

      changeStep(-1);

    }, [changeStep]);
     const handleSubmit = useCallback(async () => {
  if (creatingAccount) return;

  try {
    setCreatingAccount(true);

    const payload = {
      phone: form.mobile,

      name: form.clinicName,
      owner_name: form.ownerName,

      referral_code:
        form.referralCode || undefined,

      address: form.address,
      city: form.city,
      state: form.stateName,
      pincode: form.pincode,

      email: form.email,
      password: form.password,
    };

    console.log(payload);

    const response =
      await signupApi(payload);
    if (response.status==1) {
      setShowSuccess(true);
       resetForm();
    } else {
      setErrorMessage(
        response.message ||
          signup("something_went_wrong")
      );

      setShowError(true);
    }
    

  } catch (error: any) {

  setErrorMessage(
    error?.message ||
    signup("something_went_wrong")
  );

  setShowError(true);

} finally {
  setCreatingAccount(false);
}
}, [
  form,
  creatingAccount,
  navigation,
  resetForm,
]);
const handleContinueLogin =
  useCallback(() => {

    setShowSuccess(false);

    resetForm();

    navigation.replace("Login");

  }, [
    navigation,
    resetForm,
  ]);
     
      const isScrollable =
    step === 2 || step === 3;
    const renderStep = useMemo(() => {
  switch (step) {
    case 1:
      return (
       <StepOne
  mobile={form.mobile}
  setMobile={handlers.setMobile}
  otp={form.otp}
  setOtp={handlers.setOtp}
  otpSent={form.otpSent}
  setOtpSent={handlers.setOtpSent}
  otpVerified={form.otpVerified}
  setOtpVerified={handlers.setOtpVerified}
  nextStep={nextStep}
/>
      );

    case 2:
      return (
       <StepTwo
  clinicName={form.clinicName}
  setClinicName={handlers.setClinicName}
  ownerName={form.ownerName}
  setOwnerName={handlers.setOwnerName}
  referralCode={form.referralCode}
  setReferralCode={handlers.setReferralCode}
  nextStep={nextStep}
  previousStep={previousStep}
/>
      );

    case 3:
      return (
       <StepThree
  address={form.address}
  setAddress={handlers.setAddress}
  city={form.city}
  setCity={handlers.setCity}
  stateName={form.stateName}
  setStateName={handlers.setStateName}
  pincode={form.pincode}
  setPincode={handlers.setPincode}
  nextStep={nextStep}
  previousStep={previousStep}
/>
      );

    case 4:
      return (
       <StepFour
  email={form.email}
  setEmail={handlers.setEmail}
  password={form.password}
  setPassword={handlers.setPassword}
  confirmPassword={form.confirmPassword}
  setConfirmPassword={handlers.setConfirmPassword}
  showPassword={form.showPassword}
  setShowPassword={handlers.setShowPassword}
  showConfirmPassword={form.showConfirmPassword}
  setShowConfirmPassword={handlers.setShowConfirmPassword}
  previousStep={previousStep}
  onSubmit={handleSubmit}
  loading={creatingAccount}
/>
      );

    default:
      return null;
  }
}, [
  step,
  form,
  handlers,
  nextStep,
  previousStep,
  handleSubmit,
]);
return (
  
  <SafeAreaView style={styles.container}>
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
    >
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ProgressStepper step={step} />

        {isScrollable ? (
      <ScrollView
  ref={scrollRef}
  removeClippedSubviews={false}
  keyboardShouldPersistTaps="always"
  keyboardDismissMode="none"
  showsVerticalScrollIndicator={false}
  contentContainerStyle={styles.content}
>
            {renderStep}
          </ScrollView>
        ) : (
          <View style={styles.content}>
            {renderStep}
          </View>
        )}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
    <Modal
  visible={showSuccess}
  transparent
  animationType="fade"
>
  <View style={styles.modalOverlay}>
    <View style={styles.successModal}>

      <View style={styles.successCircle}>
        <Ionicons
          name="checkmark"
          size={60}
          color="#FFFFFF"
        />
      </View>

      <Text style={styles.successTitle}>
        {signup(
          "registration_successful"
        )}
      </Text>

      <Text style={styles.successMessage}>
        {signup(
          "registration_success_message"
        )}
      </Text>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={
          handleContinueLogin
        }
      >
        <Text
          style={
            styles.loginButtonText
          }
        >
          {signup(
            "continue_login"
          )}
        </Text>
      </TouchableOpacity>

    </View>
  </View>
</Modal>
<Modal
  visible={showError}
  transparent
  animationType="fade"
>
  <View style={styles.modalOverlay}>
    <View style={styles.errorModal}>

      <View style={styles.errorCircle}>
        <Ionicons
          name="close"
          size={60}
          color="#FFF"
        />
      </View>

      <Text style={styles.errorTitle}>
        {signup("registration_failed")}
      </Text>

      <Text style={styles.errorMessage}>
        {errorMessage}
      </Text>

      <TouchableOpacity
        style={styles.retryButton}
        onPress={() =>
          setShowError(false)
        }
      >
        <Text style={styles.retryButtonText}>
          {signup("try_again")}
        </Text>
      </TouchableOpacity>

    </View>
  </View>
</Modal>
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
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.45)",
  justifyContent: "center",
  alignItems: "center",
},

successModal: {
  width: "88%",
  backgroundColor: "#FFF",
  borderRadius: 24,
  paddingVertical: 35,
  paddingHorizontal: 25,
  alignItems: "center",

  elevation: 12,

  shadowColor: "#000",
  shadowOpacity: 0.15,
  shadowRadius: 15,
  shadowOffset: {
    width: 0,
    height: 5,
  },
},

successCircle: {
  width: 95,
  height: 95,
  borderRadius: 48,
  backgroundColor: "#22C55E",

  justifyContent: "center",
  alignItems: "center",
},

successTitle: {
  marginTop: 22,
  fontSize: 24,
  fontWeight: "700",
  color: "#0F172A",
},

successMessage: {
  marginTop: 12,
  fontSize: 15,
  color: "#64748B",
  textAlign: "center",
  lineHeight: 23,
},

loginButton: {
  marginTop: 30,

  width: "100%",
  height: 56,

  backgroundColor: "#2563EB",

  borderRadius: 14,

  justifyContent: "center",
  alignItems: "center",
},

loginButtonText: {
  color: "#FFF",
  fontWeight: "700",
  fontSize: 16,
},
errorModal: {
  width: "88%",
  backgroundColor: "#FFF",
  borderRadius: 24,
  paddingVertical: 35,
  paddingHorizontal: 25,
  alignItems: "center",

  elevation: 12,

  shadowColor: "#000",
  shadowOpacity: 0.15,
  shadowRadius: 15,
  shadowOffset: {
    width: 0,
    height: 5,
  },
},

errorCircle: {
  width: 100,
  height: 100,
  borderRadius: 50,
  backgroundColor: "#EF4444",
  justifyContent: "center",
  alignItems: "center",
},

errorTitle: {
  marginTop: 22,
  fontSize: 24,
  fontWeight: "700",
  color: "#0F172A",
},

errorMessage: {
  marginTop: 10,
  textAlign: "center",
  color: "#64748B",
  fontSize: 15,
  lineHeight: 22,
},

retryButton: {
  marginTop: 30,
  width: "100%",
  height: 55,
  backgroundColor: "#EF4444",
  borderRadius: 14,
  justifyContent: "center",
  alignItems: "center",
},

retryButtonText: {
  color: "#FFF",
  fontWeight: "700",
  fontSize: 16,
},
});
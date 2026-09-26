import React, {
  useCallback,
  useRef,
  useState,
} from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SignupScreen() {
  const { t: signup } = useTranslation("signup");
  const navigation = useNavigation<NavigationProp>();

  const scrollRef = useRef<ScrollView>(null);

  const [step, setStep] = useState(1);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const { form, updateField, resetForm } = useSignupForm();

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  const goToStep = useCallback(
    (targetStep: number) => {
      setStep(targetStep);
      scrollToTop();
    },
    [scrollToTop]
  );

  const previousStep = useCallback(() => {
    setStep((prev) => Math.max(1, prev - 1));
    scrollToTop();
  }, [scrollToTop]);

  // Step 1: Mobile & OTP handlers
  const handleStepOneNext = useCallback(() => {
    goToStep(2);
  }, [goToStep]);

  // Step 2: Clinic & Owner details
  const handleStepTwoNext = useCallback(
    (data: { clinicName: string; ownerName: string; referralCode: string }) => {
      updateField("clinicName", data.clinicName);
      updateField("ownerName", data.ownerName);
      updateField("referralCode", data.referralCode);
      goToStep(3);
    },
    [updateField, goToStep]
  );

  // Step 3: Address details
  const handleStepThreeNext = useCallback(
    (data: { address: string; city: string; stateName: string; pincode: string }) => {
      updateField("address", data.address);
      updateField("city", data.city);
      updateField("stateName", data.stateName);
      updateField("pincode", data.pincode);
      goToStep(4);
    },
    [updateField, goToStep]
  );

  // Step 4: Final submission
  const handleSubmit = useCallback(
    async (securityData: { email: string; password: string }) => {
      if (creatingAccount) return;

      try {
        setCreatingAccount(true);

        const payload = {
          phone: form.mobile,
          name: form.clinicName,
          owner_name: form.ownerName,
          referral_code: form.referralCode || undefined,
          address: form.address,
          city: form.city,
          state: form.stateName,
          pincode: form.pincode,
          email: securityData.email,
          password: securityData.password,
        };

        const response = await signupApi(payload);
        if (response.status == 1 || (response as any).success) {
          setShowSuccess(true);
          resetForm();
        } else {
          setErrorMessage(
            response.message || signup("something_went_wrong")
          );
          setShowError(true);
        }
      } catch (error: any) {
        setErrorMessage(
          error?.message || signup("something_went_wrong")
        );
        setShowError(true);
      } finally {
        setCreatingAccount(false);
      }
    },
    [form, creatingAccount, signup, resetForm]
  );

  const handleContinueLogin = useCallback(() => {
    setShowSuccess(false);
    resetForm();
    navigation.replace("Login");
  }, [navigation, resetForm]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (step > 1) {
              previousStep();
            } else {
              navigation.goBack();
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{signup("signup_title")}</Text>
        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <ProgressStepper step={step} />

          {step === 1 && (
            <StepOne
              mobile={form.mobile}
              setMobile={(val) => updateField("mobile", val)}
              otp={form.otp}
              setOtp={(val) => updateField("otp", val)}
              otpSent={form.otpSent}
              setOtpSent={(val) => updateField("otpSent", val)}
              otpVerified={form.otpVerified}
              setOtpVerified={(val) => updateField("otpVerified", val)}
              nextStep={handleStepOneNext}
            />
          )}

          {step === 2 && (
            <StepTwo
              initialClinicName={form.clinicName}
              initialOwnerName={form.ownerName}
              initialReferralCode={form.referralCode}
              onNext={handleStepTwoNext}
              previousStep={previousStep}
            />
          )}

          {step === 3 && (
            <StepThree
              initialAddress={form.address}
              initialCity={form.city}
              initialStateName={form.stateName}
              initialPincode={form.pincode}
              onNext={handleStepThreeNext}
              previousStep={previousStep}
            />
          )}

          {step === 4 && (
            <StepFour
              initialEmail={form.email}
              initialPassword={form.password}
              initialConfirmPassword={form.confirmPassword}
              onSubmit={handleSubmit}
              previousStep={previousStep}
              loading={creatingAccount}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={60} color="#FFFFFF" />
            </View>

            <Text style={styles.successTitle}>
              {signup("registration_successful")}
            </Text>

            <Text style={styles.successMessage}>
              {signup("registration_success_message")}
            </Text>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleContinueLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>
                {signup("continue_login")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal visible={showError} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.errorModal}>
            <View style={styles.errorCircle}>
              <Ionicons name="close" size={60} color="#FFF" />
            </View>

            <Text style={styles.errorTitle}>
              {signup("registration_failed")}
            </Text>

            <Text style={styles.errorMessage}>{errorMessage}</Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => setShowError(false)}
              activeOpacity={0.8}
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

  topBar: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },

  topBarTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
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
    shadowOffset: { width: 0, height: 5 },
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
    shadowOffset: { width: 0, height: 5 },
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
import React, { useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../../navigation/AppNavigator";

import ProgressStepper from "../components/ProgressStepper";
import StepOne from "../components/StepOne";
import StepTwo from "../components/StepTwo";
import StepThree from "../components/StepThree";
import StepFour from "../components/StepFour";

type NavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

export default function SignupScreen() {
  const navigation =
    useNavigation<NavigationProp>();

  const scrollRef =
    useRef<ScrollView>(null);

  const [step, setStep] =
    useState(1);

  // Mobile

  const [mobile, setMobile] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [otpSent, setOtpSent] =
    useState(false);

  const [otpVerified, setOtpVerified] =
    useState(false);

  // Clinic

  const [clinicName, setClinicName] =
    useState("");

  const [ownerName, setOwnerName] =
    useState("");

  const [referralCode, setReferralCode] =
    useState("");

  // Address

  const [address, setAddress] =
    useState("");

  const [city, setCity] =
    useState("");

  const [stateName, setStateName] =
    useState("");

  const [pincode, setPincode] =
    useState("");

  // Account

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const scrollTop = () => {
    scrollRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };

  const nextStep = () => {
    Keyboard.dismiss();

    setStep((prev) => prev + 1);

    setTimeout(scrollTop, 100);
  };

  const previousStep = () => {
    Keyboard.dismiss();

    setStep((prev) => prev - 1);

    setTimeout(scrollTop, 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        style={{ flex: 1 }}
        onPress={Keyboard.dismiss}
      >
        <KeyboardAvoidingView
          style={styles.wrapper}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : "height"
          }
        >
          <ScrollView
            ref={scrollRef}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              styles.content
            }
          >
            <ProgressStepper step={step} />

            {step === 1 && (
              <StepOne
                mobile={mobile}
                setMobile={setMobile}
                otp={otp}
                setOtp={setOtp}
                otpSent={otpSent}
                setOtpSent={setOtpSent}
                otpVerified={otpVerified}
                setOtpVerified={setOtpVerified}
                nextStep={nextStep}
              />
            )}

            {step === 2 && (
              <StepTwo
                clinicName={clinicName}
                setClinicName={setClinicName}
                ownerName={ownerName}
                setOwnerName={setOwnerName}
                referralCode={referralCode}
                setReferralCode={setReferralCode}
                nextStep={nextStep}
                previousStep={previousStep}
              />
            )}

            {step === 3 && (
              <StepThree
                address={address}
                setAddress={setAddress}
                city={city}
                setCity={setCity}
                stateName={stateName}
                setStateName={setStateName}
                pincode={pincode}
                setPincode={setPincode}
                nextStep={nextStep}
                previousStep={previousStep}
              />
            )}

            {step === 4 && (
              <StepFour
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                loading={false}
                confirmPassword={
                  confirmPassword
                }
                setConfirmPassword={
                  setConfirmPassword
                }
                showPassword={
                  showPassword
                }
                setShowPassword={
                  setShowPassword
                }
                showConfirmPassword={
                  showConfirmPassword
                }
                setShowConfirmPassword={
                  setShowConfirmPassword
                }
                previousStep={
                  previousStep
                }
                onSubmit={() =>
                  navigation.replace("Login")
                }
              />
            )}
          </ScrollView>
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
  },

  content: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 60,
  },
});
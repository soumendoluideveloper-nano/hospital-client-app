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
  mobile: string;
  setMobile: React.Dispatch<React.SetStateAction<string>>;
  otp: string;
  setOtp: React.Dispatch<React.SetStateAction<string>>;
  otpSent: boolean;
  setOtpSent: React.Dispatch<React.SetStateAction<boolean>>;
  otpVerified: boolean;
  setOtpVerified: React.Dispatch<React.SetStateAction<boolean>>;
  nextStep: () => void;
};

function StepOne({
  mobile,
  setMobile,
  otp,
  setOtp,
  otpSent,
  setOtpSent,
  otpVerified,
  setOtpVerified,
  nextStep,
}: Props) {
  const { t: common } = useTranslation("common");
  const { t: auth } = useTranslation("auth");
  const { t: signup } = useTranslation("signup");

  const [mobileError, setMobileError] = useState("");
  const [otpError, setOtpError] = useState("");

  const sendOtp = () => {
    setMobileError("");

    if (!mobile.trim()) {
      setMobileError(auth("mobile_required"));
      return;
    }

    if (mobile.length !== 10) {
      setMobileError(auth("invalid_mobile"));
      return;
    }

    Keyboard.dismiss();
    setOtpSent(true);
  };

  const verifyOtp = () => {
    setOtpError("");

    if (!otp.trim()) {
      setOtpError(auth("otp_required"));
      return;
    }

    if (otp.length !== 6) {
      setOtpError(auth("invalid_otp"));
      return;
    }

    Keyboard.dismiss();

    setOtpVerified(true);

    setTimeout(() => {
      nextStep();
    }, 500);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {signup("step_mobile")}
      </Text>

      <Text style={styles.subtitle}>
        {signup("step_mobile_subtitle")}
      </Text>

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
          editable={!otpSent}
          value={mobile}
          onChangeText={(text) => {
            setMobile(text);

            if (mobileError) {
              setMobileError("");
            }
          }}
        />
      </View>

      {!!mobileError && (
        <Text style={styles.errorText}>
          {mobileError}
        </Text>
      )}

      {!otpSent && (
        <TouchableOpacity
          style={styles.button}
          onPress={sendOtp}
        >
          <Text style={styles.buttonText}>
            {signup("send_otp")}
          </Text>
        </TouchableOpacity>
      )}

      {otpSent && (
        <>
          <Text style={styles.label}>
            OTP
          </Text>

          <View
            style={[
              styles.inputContainer,
              otpError && styles.errorInput,
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
              placeholder="Enter OTP"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={(text) => {
                setOtp(text);

                if (otpError) {
                  setOtpError("");
                }
              }}
            />
          </View>

          {!!otpError && (
            <Text style={styles.errorText}>
              {otpError}
            </Text>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={verifyOtp}
          >
            <Text style={styles.buttonText}>
              {signup("verify_otp")}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {otpVerified && (
        <View style={styles.successBox}>
          <Ionicons
            name="checkmark-circle"
            size={22}
            color="#16A34A"
          />

          <Text style={styles.successText}>
            {signup("mobile_verified")}
          </Text>
        </View>
      )}
    </View>
  );
}

export default memo(StepOne);

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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    backgroundColor: "#FFF",
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
  },

  icon: {
    marginRight: 10,
  },

  button: {
    marginTop: 24,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },

  errorInput: {
    borderColor: "#EF4444",
  },

  errorText: {
    marginTop: 5,
    marginLeft: 4,
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "500",
  },

  successBox: {
    marginTop: 20,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#DCFCE7",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  successText: {
    marginLeft: 8,
    color: "#166534",
    fontWeight: "600",
  },
});
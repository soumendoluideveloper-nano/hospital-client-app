import React, {
  memo,
  useCallback,
  useState,
  useEffect,
} from "react";
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
import { sendOtpApi, verifyOtpApi } from "../api/auth.api";
import { validateMobile, validateOtp as validateOtpUtil } from "../../../utils/validation";

type Props = {
  mobile: string;
  setMobile: (value: string) => void;
  otp: string;
  setOtp: (value: string) => void;
  otpSent: boolean;
  setOtpSent: (value: boolean) => void;
  otpVerified: boolean;
  setOtpVerified: (value: boolean) => void;
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
  const { t: signup } = useTranslation("signup");

  const [mobileError, setMobileError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSuccessMessage, setOtpSuccessMessage] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const sendOtp = useCallback(async () => {
    setMobileError("");
    setOtpSuccessMessage("");

    const cleanMobile = mobile.trim();
    const mobileValidation = validateMobile(cleanMobile, common);
    if (!mobileValidation.isValid) {
      setMobileError(mobileValidation.message);
      return;
    }

    if (sendingOtp) return;

    try {
      Keyboard.dismiss();
      setSendingOtp(true);

      const response = await sendOtpApi({
        phone: cleanMobile,
      });

      console.log("SEND OTP RESPONSE:", response);

      setOtpSent(true);
      setCountdown(120);
      setOtpSuccessMessage(signup("otp_sent_successfully") || "OTP sent successfully.");
    } catch (error: any) {
      setOtpSuccessMessage("");
      setMobileError(error?.message || "Unable to send OTP. Please check your mobile number.");
    } finally {
      setSendingOtp(false);
    }
  }, [mobile, sendingOtp, setOtpSent, signup, common]);

  const resendOtp = useCallback(async () => {
    const cleanMobile = mobile.trim();
    const mobileValidation = validateMobile(cleanMobile, common);
    if (!mobileValidation.isValid) {
      setMobileError(mobileValidation.message);
      return;
    }

    if (sendingOtp) return;

    try {
      Keyboard.dismiss();
      setSendingOtp(true);
      setOtpError("");
      setMobileError("");
      setOtpSuccessMessage("");
      setOtp("");
      setOtpVerified(false);

      await sendOtpApi({
        phone: cleanMobile,
      });

      setOtpSent(true);
      setCountdown(120);
      setOtpSuccessMessage(signup("otp_resent_successfully") || "OTP resent successfully.");
    } catch (error: any) {
      setOtpError(error?.message || "Unable to resend OTP.");
    } finally {
      setSendingOtp(false);
    }
  }, [mobile, sendingOtp, setOtp, setOtpSent, setOtpVerified, signup, common]);

  const verifyOtp = useCallback(async () => {
    setOtpError("");

    const cleanOtp = otp.trim();
    const otpValidation = validateOtpUtil(cleanOtp, 6, common);
    if (!otpValidation.isValid) {
      setOtpError(otpValidation.message);
      return;
    }

    if (verifyingOtp) return;

    try {
      Keyboard.dismiss();
      setVerifyingOtp(true);

      await verifyOtpApi({
        phone: mobile.trim(),
        otp: cleanOtp,
      });

      setOtpVerified(true);
      setTimeout(() => {
        nextStep();
      }, 400);
    } catch (error: any) {
      setOtpVerified(false);
      setOtpError(error?.message || "OTP verification failed. Please check the code.");
    } finally {
      setVerifyingOtp(false);
    }
  }, [mobile, otp, verifyingOtp, setOtpVerified, nextStep]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleMobileChange = useCallback(
    (text: string) => {
      const value = text.replace(/[^0-9]/g, "");
      setMobile(value);
      if (mobileError) setMobileError("");
    },
    [setMobile, mobileError]
  );

  const handleOtpChange = useCallback(
    (text: string) => {
      const value = text.replace(/[^0-9]/g, "");
      setOtp(value);
      if (otpError) setOtpError("");
    },
    [setOtp, otpError]
  );

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{signup("step_mobile")}</Text>
      <Text style={styles.subtitle}>{signup("step_mobile_subtitle")}</Text>

      {/* Mobile Input */}
      <Text style={styles.label}>{common("mobile_number")}</Text>
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
          editable={!otpSent && !sendingOtp}
          value={mobile}
          onChangeText={handleMobileChange}
          onBlur={() => {
            if (mobile.trim()) {
              const res = validateMobile(mobile, common);
              if (!res.isValid) setMobileError(res.message);
            }
          }}
        />
      </View>

      {!!mobileError && <Text style={styles.errorText}>{mobileError}</Text>}

      {/* Send OTP Button */}
      {!otpSent && (
        <TouchableOpacity
          style={[
            styles.button,
            sendingOtp && styles.disabledButton,
          ]}
          activeOpacity={0.8}
          disabled={sendingOtp}
          onPress={sendOtp}
        >
          {sendingOtp ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.loadingText}>Sending...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>{signup("send_otp")}</Text>
          )}
        </TouchableOpacity>
      )}

      {/* OTP Section */}
      {otpSent && (
        <>
          {!!otpSuccessMessage && (
            <View style={styles.otpSuccessBox}>
              <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
              <Text style={styles.otpSuccessText}>{otpSuccessMessage}</Text>
            </View>
          )}

          <View style={styles.otpHeader}>
            <Text style={styles.label}>OTP</Text>
            {!otpVerified && (
              <>
                {countdown > 0 ? (
                  <Text style={styles.timerText}>{formattedTime}</Text>
                ) : (
                  <TouchableOpacity disabled={sendingOtp} onPress={resendOtp}>
                    <Text style={styles.resendText}>
                      {sendingOtp ? "Sending..." : signup("resend_otp")}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          <View
            style={[
              styles.inputContainer,
              otpError ? styles.errorInput : null,
              otpVerified ? styles.successInput : null,
            ]}
          >
            <Ionicons
              name={
                otpVerified
                  ? "checkmark-circle-outline"
                  : "shield-checkmark-outline"
              }
              size={20}
              color={otpVerified ? "#16A34A" : "#64748B"}
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit OTP"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={6}
              editable={!otpVerified && !verifyingOtp}
              value={otp}
              onChangeText={handleOtpChange}
              onBlur={() => {
                if (otp.trim()) {
                  const res = validateOtpUtil(otp, 6, common);
                  if (!res.isValid) setOtpError(res.message);
                }
              }}
            />
          </View>

          {!!otpError && <Text style={styles.errorText}>{otpError}</Text>}

          {/* Verify Button */}
          {!otpVerified && (
            <TouchableOpacity
              style={[
                styles.button,
                verifyingOtp && styles.disabledButton,
              ]}
              activeOpacity={0.8}
              disabled={verifyingOtp}
              onPress={verifyOtp}
            >
              {verifyingOtp ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.loadingText}>Verifying...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>{signup("verify_otp")}</Text>
              )}
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Verified status banner */}
      {otpVerified && (
        <View style={styles.successBox}>
          <Ionicons name="checkmark-circle" size={22} color="#16A34A" />
          <Text style={styles.successText}>{signup("mobile_verified")}</Text>
        </View>
      )}

      {otpVerified && (
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => {
            Keyboard.dismiss();
            nextStep();
          }}
        >
          <Text style={styles.buttonText}>{common("next")}</Text>
          <Ionicons
            name="arrow-forward"
            size={18}
            color="#FFFFFF"
            style={styles.nextIcon}
          />
        </TouchableOpacity>
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    backgroundColor: "#FFF",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
    height: "100%",
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
    flexDirection: "row",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  nextIcon: {
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.65,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFF",
    marginLeft: 10,
    fontWeight: "600",
    fontSize: 15,
  },
  errorInput: {
    borderColor: "#EF4444",
  },
  successInput: {
    borderColor: "#16A34A",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginTop: 5,
    marginLeft: 3,
    fontWeight: "500",
  },
  otpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  timerText: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 14,
  },
  resendText: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 14,
  },
  otpSuccessBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 14,
  },
  otpSuccessText: {
    color: "#15803D",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 8,
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  successText: {
    color: "#15803D",
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 10,
  },
});
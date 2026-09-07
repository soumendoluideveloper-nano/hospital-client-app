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

import {
  sendOtpApi,
  verifyOtpApi,
} from "../api/auth.api";

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
  const { t: common } =
    useTranslation("common");

  const { t: auth } =
    useTranslation("auth");

  const { t: signup } =
    useTranslation("signup");

  /* =========================
     ERROR STATE
  ========================= */

  const [
    mobileError,
    setMobileError,
  ] = useState("");

  const [
    otpError,
    setOtpError,
  ] = useState("");
const [
  otpSuccessMessage,
  setOtpSuccessMessage,
] = useState("");
  /* =========================
     LOADING STATE
  ========================= */

  const [
    sendingOtp,
    setSendingOtp,
  ] = useState(false);

  const [
    verifyingOtp,
    setVerifyingOtp,
  ] = useState(false);

  const [countdown, setCountdown] =
  useState(0);
  /* =========================
     SEND OTP
  ========================= */

 const sendOtp = useCallback(
  async () => {
    setMobileError("");
    setOtpSuccessMessage("");

    const cleanMobile = mobile.trim();

    if (!cleanMobile) {
      setMobileError(
        auth("mobile_required")
      );
      return;
    }

    if (!/^[0-9]{10}$/.test(cleanMobile)) {
      setMobileError(
        auth("invalid_mobile")
      );
      return;
    }

    if (sendingOtp) {
      return;
    }

    try {
      Keyboard.dismiss();

      setSendingOtp(true);

      const response = await sendOtpApi({
        phone: cleanMobile,
      });

      console.log(
        "SEND OTP RESPONSE:",
        response
      );

      setOtpSent(true);
      setCountdown(120);

      setOtpSuccessMessage(
       
          signup("otp_sent_successfully")
      );

    } catch (error: any) {
      console.log(
        "SEND OTP ERROR:",
        error?.message
      );

      setOtpSuccessMessage("");

      setMobileError(
        error?.message ||
          "Unable to send OTP."
      );
    } finally {
      setSendingOtp(false);
    }
  },
  [
    mobile,
    sendingOtp,
    setOtpSent,
    auth,
    signup,
  ]
);

const resendOtp = useCallback(
  async () => {
    if (sendingOtp) {
      return;
    }

    try {
      Keyboard.dismiss();

      setSendingOtp(true);
      setOtpError("");
      setMobileError("");
      setOtpSuccessMessage("");

      // পুরনো OTP clear
      setOtp("");

      // resend করলে previous verification invalid
      setOtpVerified(false);

      const response = await sendOtpApi({
        phone: mobile.trim(),
      });

      console.log(
        "RESEND OTP RESPONSE:",
        response
      );

      setOtpSent(true);
      setCountdown(120);
      setOtpSuccessMessage(
      
          signup("otp_resent_successfully")
      );
    } catch (error: any) {
      console.log(
        "RESEND OTP ERROR:",
        error?.message
      );

      setOtpError(
        error?.message ||
          "Unable to resend OTP."
      );
    } finally {
      setSendingOtp(false);
    }
  },
  [
    mobile,
    sendingOtp,
    setOtp,
    setOtpSent,
    setOtpVerified,
    signup,
  ]
);

  /* =========================
     VERIFY OTP
  ========================= */

  const verifyOtp = useCallback(
    async () => {
      setOtpError("");

      const cleanOtp =
        otp.trim();

      if (!cleanOtp) {
        setOtpError(
          auth("otp_required")
        );

        return;
      }

      if (
        !/^[0-9]{6}$/.test(
          cleanOtp
        )
      ) {
        setOtpError(
          auth("invalid_otp")
        );

        return;
      }

      if (verifyingOtp) {
        return;
      }

      try {
        Keyboard.dismiss();

        setVerifyingOtp(true);

        const response =
          await verifyOtpApi({
            phone: mobile.trim(),
            otp: cleanOtp,
          });

        console.log(
          "VERIFY OTP RESPONSE:",
          response
        );

        /*
         * Verification successful
         */

        setOtpVerified(true);

        /*
         * Success দেখিয়ে
         * তারপর Step 2
         */

        setTimeout(() => {
          nextStep();
        }, 500);
      } catch (error: any) {
        console.log(
          "VERIFY OTP ERROR:",
          error
        );

        setOtpVerified(false);

        setOtpError(
          error?.message ||
            "OTP verification failed."
        );
      } finally {
        setVerifyingOtp(false);
      }
    },
    [
      mobile,
      otp,
      verifyingOtp,
      setOtpVerified,
      nextStep,
      auth,
    ]
  );

  useEffect(() => {
  if (countdown <= 0) {
    return;
  }

  const timer = setInterval(() => {
    setCountdown((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(timer);
}, [countdown]);
  /* =========================
     MOBILE CHANGE
  ========================= */

  const handleMobileChange =
    useCallback(
      (text: string) => {
        /*
         * শুধু number রাখবে
         */

        const value =
          text.replace(
            /[^0-9]/g,
            ""
          );

        setMobile(value);

        if (mobileError) {
          setMobileError("");
        }
      },
      [
        setMobile,
        mobileError,
      ]
    );

  /* =========================
     OTP CHANGE
  ========================= */

  const handleOtpChange =
    useCallback(
      (text: string) => {
        const value =
          text.replace(
            /[^0-9]/g,
            ""
          );

        setOtp(value);

        if (otpError) {
          setOtpError("");
        }
      },
      [
        setOtp,
        otpError,
      ]
    );
const minutes = Math.floor(countdown / 60);

const seconds = countdown % 60;

const formattedTime = `${minutes}:${seconds
  .toString()
  .padStart(2, "0")}`;
  return (
    <View style={styles.card}>
      {/* Title */}

      <Text style={styles.title}>
        {signup("step_mobile")}
      </Text>

      <Text style={styles.subtitle}>
        {signup(
          "step_mobile_subtitle"
        )}
      </Text>

      {/* Mobile */}

      <Text style={styles.label}>
        {common("mobile_number")}
      </Text>

      <View
        style={[
          styles.inputContainer,

          mobileError
            ? styles.errorInput
            : null,
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
          placeholder={common(
            "enter_mobile"
          )}
          placeholderTextColor="#94A3B8"
          keyboardType="number-pad"
          maxLength={10}
          editable={
            !otpSent &&
            !sendingOtp
          }
          value={mobile}
          onChangeText={
            handleMobileChange
          }
        />
      </View>

      {/* Mobile Error */}

      {!!mobileError && (
        <Text
          style={styles.errorText}
        >
          {mobileError}
        </Text>
      )}

      {/* Send OTP */}

      {!otpSent && (
        <TouchableOpacity
          style={[
            styles.button,

            sendingOtp &&
              styles.disabledButton,
          ]}
          activeOpacity={0.8}
          disabled={sendingOtp}
          onPress={sendOtp}
        >
          {sendingOtp ? (
            <View
              style={
                styles.loadingRow
              }
            >
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.loadingText
                }
              >
                Sending...
              </Text>
            </View>
          ) : (
            <Text
              style={
                styles.buttonText
              }
            >
              {signup(
                "send_otp"
              )}
            </Text>
          )}
        </TouchableOpacity>
      )}

      {/* OTP */}

      {otpSent && (
        <>
        {!!otpSuccessMessage && (
  <View style={styles.otpSuccessBox}>
    <Ionicons
      name="checkmark-circle"
      size={20}
      color="#16A34A"
    />

    <Text style={styles.otpSuccessText}>
      {otpSuccessMessage}
    </Text>
  </View>
)}
          <View
            style={
              styles.otpHeader
            }
          >
            <Text
              style={styles.label}
            >
              OTP
            </Text>

         {!otpVerified && (
  <>
    {countdown > 0 ? (
      <Text style={styles.timerText}>
        {formattedTime}
      </Text>
    ) : (
      <TouchableOpacity
        disabled={sendingOtp}
        onPress={resendOtp}
      >
        <Text style={styles.resendText}>
          {sendingOtp
            ? "Sending..."
            : signup("resend_otp")}
        </Text>
      </TouchableOpacity>
    )}
  </>
)}
          </View>

          <View
            style={[
              styles.inputContainer,

              otpError
                ? styles.errorInput
                : null,

              otpVerified
                ? styles.successInput
                : null,
            ]}
          >
            <Ionicons
              name={
                otpVerified
                  ? "checkmark-circle-outline"
                  : "shield-checkmark-outline"
              }
              size={20}
              color={
                otpVerified
                  ? "#16A34A"
                  : "#64748B"
              }
              style={styles.icon}
            />

            <TextInput
              style={styles.input}
              placeholder="Enter OTP"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={6}
              editable={
                !otpVerified &&
                !verifyingOtp
              }
              value={otp}
              onChangeText={
                handleOtpChange
              }
            />
          </View>

          {/* OTP Error */}

          {!!otpError && (
            <Text
              style={
                styles.errorText
              }
            >
              {otpError}
            </Text>
          )}

          {/* Verify Button */}

          {!otpVerified && (
            <TouchableOpacity
              style={[
                styles.button,

                verifyingOtp &&
                  styles.disabledButton,
              ]}
              activeOpacity={0.8}
              disabled={
                verifyingOtp
              }
              onPress={verifyOtp}
            >
              {verifyingOtp ? (
                <View
                  style={
                    styles.loadingRow
                  }
                >
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.loadingText
                    }
                  >
                    Verifying...
                  </Text>
                </View>
              ) : (
                <Text
                  style={
                    styles.buttonText
                  }
                >
                  {signup(
                    "verify_otp"
                  )}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Verified */}

      {otpVerified && (
        <View
          style={styles.successBox}
        >
          <Ionicons
            name="checkmark-circle"
            size={22}
            color="#16A34A"
          />

          <Text
            style={
              styles.successText
            }
          >
            {signup(
              "mobile_verified"
            )}
          </Text>
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
    <Text style={styles.buttonText}>
      {common("next")}
    </Text>

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

/* =========================
   STYLES
========================= */

const styles =
  StyleSheet.create({
    card: {
      backgroundColor: "#FFF",
      borderRadius: 18,
      padding: 20,
      elevation: 3,

      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 3,
      },
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

  flexDirection: "row",
},

nextIcon: {
  marginLeft: 8,
},

resendDisabled: {
  opacity: 0.5,
},
    disabledButton: {
      opacity: 0.65,
    },

    buttonText: {
      color: "#FFF",
      fontSize: 16,
      fontWeight: "700",
    },

    loadingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    loadingText: {
      marginLeft: 10,
      color: "#FFFFFF",
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

    successInput: {
      borderColor: "#22C55E",
      backgroundColor: "#F0FDF4",
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

    otpHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },

    resendText: {
      marginBottom: 8,
      color: "#2563EB",
      fontSize: 13,
      fontWeight: "700",
    },
    otpSuccessBox: {
  marginTop: 16,
  paddingHorizontal: 14,
  paddingVertical: 12,
  borderRadius: 10,

  backgroundColor: "#F0FDF4",

  borderWidth: 1,
  borderColor: "#BBF7D0",

  flexDirection: "row",
  alignItems: "center",
},

otpSuccessText: {
  flex: 1,
  marginLeft: 8,

  color: "#166534",
  fontSize: 13,
  fontWeight: "600",
},
timerText: {
  marginBottom: 8,
  color: "#F59E0B",
  fontWeight: "700",
  fontSize: 14,
},
  });
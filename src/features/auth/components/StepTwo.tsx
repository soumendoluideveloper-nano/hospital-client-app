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
import {
  validateClinicName,
  validateOwnerName,
  validateReferralCode,
} from "../../../utils/validation";

type Props = {
  initialClinicName?: string;
  initialOwnerName?: string;
  initialReferralCode?: string;

  clinicName?: string;
  setClinicName?: (value: string) => void;
  ownerName?: string;
  setOwnerName?: (value: string) => void;
  referralCode?: string;
  setReferralCode?: (value: string) => void;

  previousStep: () => void;
  nextStep?: () => void;
  onNext?: (data: {
    clinicName: string;
    ownerName: string;
    referralCode: string;
  }) => void;
};

function StepTwo({
  initialClinicName,
  initialOwnerName,
  initialReferralCode,
  clinicName: propClinicName,
  setClinicName: propSetClinicName,
  ownerName: propOwnerName,
  setOwnerName: propSetOwnerName,
  referralCode: propReferralCode,
  setReferralCode: propSetReferralCode,
  previousStep,
  nextStep,
  onNext,
}: Props) {
  const { t: signup } = useTranslation("signup");
  const { t: common } = useTranslation("common");

  const [clinicName, setClinicName] = useState(
    propClinicName !== undefined ? propClinicName : initialClinicName || ""
  );
  const [ownerName, setOwnerName] = useState(
    propOwnerName !== undefined ? propOwnerName : initialOwnerName || ""
  );
  const [referralCode, setReferralCode] = useState(
    propReferralCode !== undefined ? propReferralCode : initialReferralCode || ""
  );

  const [clinicError, setClinicError] = useState("");
  const [ownerError, setOwnerError] = useState("");
  const [referralError, setReferralError] = useState("");

  const handleNext = () => {
    Keyboard.dismiss();
    setClinicError("");
    setOwnerError("");
    setReferralError("");

    const clinicVal = validateClinicName(clinicName, common);
    if (!clinicVal.isValid) {
      setClinicError(clinicVal.message);
      return;
    }

    const ownerVal = validateOwnerName(ownerName, common);
    if (!ownerVal.isValid) {
      setOwnerError(ownerVal.message);
      return;
    }

    const refVal = validateReferralCode(referralCode);
    if (!refVal.isValid) {
      setReferralError(refVal.message);
      return;
    }

    if (onNext) {
      onNext({
        clinicName: clinicName.trim(),
        ownerName: ownerName.trim(),
        referralCode: referralCode.trim(),
      });
    } else if (nextStep) {
      propSetClinicName?.(clinicName.trim());
      propSetOwnerName?.(ownerName.trim());
      propSetReferralCode?.(referralCode.trim());
      nextStep();
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{signup("clinic_details")}</Text>
      <Text style={styles.subtitle}>{signup("clinic_details_subtitle")}</Text>

      {/* Clinic Name */}
      <Text style={styles.label}>{signup("clinic_name")}</Text>
      <View
        style={[
          styles.inputContainer,
          clinicError ? styles.errorInput : null,
        ]}
      >
        <Ionicons
          name="business-outline"
          size={20}
          color="#64748B"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder={signup("clinic_name_placeholder")}
          placeholderTextColor="#94A3B8"
          value={clinicName}
          maxLength={100}
          onChangeText={(text) => {
            const cleaned = text.replace(/[^a-zA-Z0-9\s&.\-',\(\)]/g, "");
            setClinicName(cleaned);
            if (clinicError) setClinicError("");
          }}
          onBlur={() => {
            if (clinicName.trim()) {
              const res = validateClinicName(clinicName, common);
              if (!res.isValid) setClinicError(res.message);
            }
          }}
        />
      </View>
      {!!clinicError && <Text style={styles.errorText}>{clinicError}</Text>}

      {/* Owner Name */}
      <Text style={styles.label}>{signup("owner_name")}</Text>
      <View
        style={[
          styles.inputContainer,
          ownerError ? styles.errorInput : null,
        ]}
      >
        <Ionicons
          name="person-outline"
          size={20}
          color="#64748B"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder={signup("owner_name_placeholder")}
          placeholderTextColor="#94A3B8"
          value={ownerName}
          maxLength={100}
          onChangeText={(text) => {
            const cleaned = text.replace(/[^a-zA-Z\s\.\'\-]/g, "");
            setOwnerName(cleaned);
            if (ownerError) setOwnerError("");
          }}
          onBlur={() => {
            if (ownerName.trim()) {
              const res = validateOwnerName(ownerName, common);
              if (!res.isValid) setOwnerError(res.message);
            }
          }}
        />
      </View>
      {!!ownerError && <Text style={styles.errorText}>{ownerError}</Text>}

      {/* Referral Code */}
      <Text style={styles.label}>{signup("referral_code")}</Text>
      <View
        style={[
          styles.inputContainer,
          referralError ? styles.errorInput : null,
        ]}
      >
        <Ionicons
          name="gift-outline"
          size={20}
          color="#64748B"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder={signup("referral_code_placeholder")}
          placeholderTextColor="#94A3B8"
          value={referralCode}
          maxLength={20}
          autoCapitalize="characters"
          onChangeText={(text) => {
            const cleaned = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
            setReferralCode(cleaned);
            if (referralError) setReferralError("");
          }}
          onBlur={() => {
            if (referralCode.trim()) {
              const res = validateReferralCode(referralCode, common);
              if (!res.isValid) setReferralError(res.message);
            }
          }}
        />
      </View>
      {!!referralError && <Text style={styles.errorText}>{referralError}</Text>}

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={previousStep}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>{common("back")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>{common("next")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default memo(StepTwo);

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
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
    height: "100%",
  },
  errorInput: {
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    marginTop: 5,
    marginLeft: 4,
    fontSize: 13,
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28,
  },
  backButton: {
    width: "30%",
    height: 52,
    borderWidth: 1,
    borderColor: "#2563EB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 15,
  },
  nextButton: {
    width: "65%",
    height: 52,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  nextButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
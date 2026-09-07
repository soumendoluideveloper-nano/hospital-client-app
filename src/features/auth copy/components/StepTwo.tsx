import React, { memo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

type Props = {
  clinicName: string;
  setClinicName: React.Dispatch<React.SetStateAction<string>>;
  ownerName: string;
  setOwnerName: React.Dispatch<React.SetStateAction<string>>;
  referralCode: string;
  setReferralCode: React.Dispatch<React.SetStateAction<string>>;
  previousStep: () => void;
  nextStep: () => void;
};

function StepTwo({
  clinicName,
  setClinicName,
  ownerName,
  setOwnerName,
  referralCode,
  setReferralCode,
  previousStep,
  nextStep,
}: Props) {
  const { t: signup } =
    useTranslation("signup");

  const { t: common } =
    useTranslation("common");

  const [
    clinicError,
    setClinicError,
  ] = useState("");

  const [
    ownerError,
    setOwnerError,
  ] = useState("");

  const handleNext = () => {
    setClinicError("");
    setOwnerError("");

    let valid = true;

    if (!clinicName.trim()) {
      setClinicError(
        signup("clinic_name_required")
      );
      valid = false;
    }

    if (!ownerName.trim()) {
      setOwnerError(
        signup("owner_name_required")
      );
      valid = false;
    }

    if (!valid) return;

    nextStep();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {signup("clinic_details")}
      </Text>

      <Text style={styles.subtitle}>
        {signup(
          "clinic_details_subtitle"
        )}
      </Text>

      {/* Clinic */}

      <Text style={styles.label}>
        {signup("clinic_name")}
      </Text>

      <View
        style={[
          styles.inputContainer,
          clinicError &&
            styles.errorInput,
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
          placeholder={signup(
            "clinic_name_placeholder"
          )}
          value={clinicName}
          onChangeText={(text) => {
            setClinicName(text);

            if (clinicError)
              setClinicError("");
          }}
        />
      </View>

      {!!clinicError && (
        <Text style={styles.errorText}>
          {clinicError}
        </Text>
      )}

      {/* Owner */}

      <Text style={styles.label}>
        {signup("owner_name")}
      </Text>

      <View
        style={[
          styles.inputContainer,
          ownerError &&
            styles.errorInput,
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
          placeholder={signup(
            "owner_name_placeholder"
          )}
          value={ownerName}
          onChangeText={(text) => {
            setOwnerName(text);

            if (ownerError)
              setOwnerError("");
          }}
        />
      </View>

      {!!ownerError && (
        <Text style={styles.errorText}>
          {ownerError}
        </Text>
      )}

      {/* Referral */}

      <Text style={styles.label}>
        {signup("referral_code")}
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons
          name="gift-outline"
          size={20}
          color="#64748B"
          style={styles.icon}
        />

        <TextInput
          style={styles.input}
          placeholder={signup(
            "referral_code_placeholder"
          )}
          value={referralCode}
          onChangeText={setReferralCode}
        />
      </View>

      {/* Buttons */}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={previousStep}
        >
          <Text
            style={
              styles.backButtonText
            }
          >
            {common("back")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text
            style={
              styles.nextButtonText
            }
          >
            {common("next")}
          </Text>
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
  },

  errorInput: {
    borderColor: "#EF4444",
  },

  errorText: {
    color: "#EF4444",
    marginTop: 5,
    marginLeft: 4,
    fontSize: 13,
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
  },
});
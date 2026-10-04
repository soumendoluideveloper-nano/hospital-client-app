import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { addDoctorApi } from "../api/doctor.api";
import StatusModal from "../../../components/ui/StatusModal";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../navigation/AppNavigator";
import {
  validateDoctorName,
  validateMobile,
  validateEmail,
  validateQualification,
  validateSpecialization,
  validateExperience,
  validateRegistrationNo,
  validateConsultationFee,
  validateAbout,
} from "../../../utils/validation";

export default function AddDoctorScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t: doctor } = useTranslation("doctor");

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [qualification, setQualification] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [aboutDoctor, setAboutDoctor] = useState("");

  // Errors
  const [fullNameError, setFullNameError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [qualificationError, setQualificationError] = useState("");
  const [specializationError, setSpecializationError] = useState("");
  const [experienceError, setExperienceError] = useState("");
  const [registrationNoError, setRegistrationNoError] = useState("");
  const [consultationFeeError, setConsultationFeeError] = useState("");
  const [aboutDoctorError, setAboutDoctorError] = useState("");

  const [statusModal, setStatusModal] = useState<{
    visible: boolean;
    type: "success" | "error" | "warning";
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const validate = () => {
    setFullNameError("");
    setMobileError("");
    setEmailError("");
    setQualificationError("");
    setSpecializationError("");
    setExperienceError("");
    setRegistrationNoError("");
    setConsultationFeeError("");
    setAboutDoctorError("");

    let valid = true;

    const nameVal = validateDoctorName(fullName, doctor);
    if (!nameVal.isValid) {
      setFullNameError(nameVal.message);
      valid = false;
    }

    const mobileVal = validateMobile(mobile, doctor);
    if (!mobileVal.isValid) {
      setMobileError(mobileVal.message);
      valid = false;
    }

    const emailVal = validateEmail(email, true, doctor);
    if (!emailVal.isValid) {
      setEmailError(emailVal.message);
      valid = false;
    }

    const qualVal = validateQualification(qualification, doctor);
    if (!qualVal.isValid) {
      setQualificationError(qualVal.message);
      valid = false;
    }

    const specVal = validateSpecialization(specialization, doctor);
    if (!specVal.isValid) {
      setSpecializationError(specVal.message);
      valid = false;
    }

    const expVal = validateExperience(experience, doctor);
    if (!expVal.isValid) {
      setExperienceError(expVal.message);
      valid = false;
    }

    const regVal = validateRegistrationNo(registrationNo, false, doctor);
    if (!regVal.isValid) {
      setRegistrationNoError(regVal.message);
      valid = false;
    }

    const feeVal = validateConsultationFee(consultationFee, doctor);
    if (!feeVal.isValid) {
      setConsultationFeeError(feeVal.message);
      valid = false;
    }

    const aboutVal = validateAbout(aboutDoctor);
    if (!aboutVal.isValid) {
      setAboutDoctorError(aboutVal.message);
      valid = false;
    }

    return valid;
  };

  const handleSaveDoctor = async () => {
    if (loading) return;

    const isValid = validate();
    if (!isValid) return;

    try {
      setLoading(true);

      const payload = {
        name: fullName.trim(),
        phone: mobile.trim(),
        email: email.trim(),
        qualification: qualification.trim(),
        specialization: specialization.trim(),
        experience: Number(experience),
        registration_no: registrationNo.trim() || undefined,
        consultation_fee: Number(consultationFee),
        about: aboutDoctor.trim() || undefined,
      };

      const response = await addDoctorApi(payload as any);
      if (response.status === 1 || response.status === 201 || (response as any).success) {
        setStatusModal({
          visible: true,
          type: "success",
          title: doctor("doctor_added") || "Doctor Added",
          message: doctor("doctor_added_successfully") || "Doctor added successfully!",
          onConfirm: () => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate("Dashboard");
            }
          },
        });
      } else {
        setStatusModal({
          visible: true,
          type: "error",
          title: doctor("error") || "Error",
          message: response.message || "Failed to add doctor",
        });
      }
    } catch (error: any) {
      setStatusModal({
        visible: true,
        type: "error",
        title: doctor("error") || "Error",
        message: error?.message || doctor("something_went_wrong") || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNavBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Dashboard");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleNavBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{doctor("add_doctor")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.subHeading}>{doctor("add_doctor_subtitle")}</Text>

          <View style={styles.card}>
            {/* Full Name */}
            <Text style={styles.label}>{doctor("full_name")} *</Text>
            <View
              style={[
                styles.inputContainer,
                fullNameError ? styles.errorInput : null,
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
                placeholder={doctor("full_name_placeholder")}
                placeholderTextColor="#94A3B8"
                value={fullName}
                maxLength={150}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^a-zA-Z\s\.\'\,\-]/g, "");
                  setFullName(cleaned);
                  if (fullNameError) setFullNameError("");
                }}
                onBlur={() => {
                  if (fullName.trim()) {
                    const res = validateDoctorName(fullName, doctor);
                    if (!res.isValid) setFullNameError(res.message);
                  }
                }}
              />
            </View>
            {!!fullNameError && <Text style={styles.errorText}>{fullNameError}</Text>}

            {/* Mobile */}
            <Text style={styles.label}>{doctor("mobile_number")} *</Text>
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
                placeholder={doctor("mobile_number_placeholder")}
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                maxLength={10}
                value={mobile}
                onChangeText={(text) => {
                  const value = text.replace(/\D/g, "");
                  setMobile(value);
                  if (mobileError) setMobileError("");
                }}
                onBlur={() => {
                  if (mobile.trim()) {
                    const res = validateMobile(mobile, doctor);
                    if (!res.isValid) setMobileError(res.message);
                  }
                }}
              />
            </View>
            {!!mobileError && <Text style={styles.errorText}>{mobileError}</Text>}

            {/* Email */}
            <Text style={styles.label}>{doctor("email")} *</Text>
            <View
              style={[
                styles.inputContainer,
                emailError ? styles.errorInput : null,
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color="#64748B"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder={doctor("email_placeholder")}
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  const value = text.replace(/\s/g, "").toLowerCase();
                  setEmail(value);
                  if (emailError) setEmailError("");
                }}
                onBlur={() => {
                  if (email.trim()) {
                    const res = validateEmail(email, true, doctor);
                    if (!res.isValid) setEmailError(res.message);
                  }
                }}
              />
            </View>
            {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}

            {/* Qualification */}
            <Text style={styles.label}>{doctor("qualification")} *</Text>
            <View
              style={[
                styles.inputContainer,
                qualificationError ? styles.errorInput : null,
              ]}
            >
              <Ionicons
                name="school-outline"
                size={20}
                color="#64748B"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder={doctor("qualification_placeholder")}
                placeholderTextColor="#94A3B8"
                value={qualification}
                maxLength={200}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^a-zA-Z0-9\s\.\,\(\)\/\-]/g, "");
                  setQualification(cleaned);
                  if (qualificationError) setQualificationError("");
                }}
                onBlur={() => {
                  if (qualification.trim()) {
                    const res = validateQualification(qualification, doctor);
                    if (!res.isValid) setQualificationError(res.message);
                  }
                }}
              />
            </View>
            {!!qualificationError && (
              <Text style={styles.errorText}>{qualificationError}</Text>
            )}

            {/* Specialization */}
            <Text style={styles.label}>{doctor("specialization")} *</Text>
            <View
              style={[
                styles.inputContainer,
                specializationError ? styles.errorInput : null,
              ]}
            >
              <Ionicons
                name="medical-outline"
                size={20}
                color="#64748B"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder={doctor("specialization_placeholder")}
                placeholderTextColor="#94A3B8"
                value={specialization}
                maxLength={150}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^a-zA-Z\s\.\,\/\-]/g, "");
                  setSpecialization(cleaned);
                  if (specializationError) setSpecializationError("");
                }}
                onBlur={() => {
                  if (specialization.trim()) {
                    const res = validateSpecialization(specialization, doctor);
                    if (!res.isValid) setSpecializationError(res.message);
                  }
                }}
              />
            </View>
            {!!specializationError && (
              <Text style={styles.errorText}>{specializationError}</Text>
            )}

            {/* Experience */}
            <Text style={styles.label}>{doctor("experience_years")} *</Text>
            <View
              style={[
                styles.inputContainer,
                experienceError ? styles.errorInput : null,
              ]}
            >
              <Ionicons
                name="time-outline"
                size={20}
                color="#64748B"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder={doctor("experience_placeholder")}
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                maxLength={2}
                value={experience}
                onChangeText={(text) => {
                  const value = text.replace(/\D/g, "");
                  setExperience(value);
                  if (experienceError) setExperienceError("");
                }}
                onBlur={() => {
                  if (experience.trim()) {
                    const res = validateExperience(experience, doctor);
                    if (!res.isValid) setExperienceError(res.message);
                  }
                }}
              />
              <Text style={styles.suffix}>{doctor("years")}</Text>
            </View>
            {!!experienceError && (
              <Text style={styles.errorText}>{experienceError}</Text>
            )}

            {/* Registration Number */}
            <Text style={styles.label}>{doctor("registration_no")}</Text>
            <View
              style={[
                styles.inputContainer,
                registrationNoError ? styles.errorInput : null,
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#64748B"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder={doctor("registration_no_placeholder") || "e.g. WBMH1289"}
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                maxLength={50}
                value={registrationNo}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^a-zA-Z0-9\-\/]/g, "").toUpperCase();
                  setRegistrationNo(cleaned);
                  if (registrationNoError) setRegistrationNoError("");
                }}
                onBlur={() => {
                  if (registrationNo.trim()) {
                    const res = validateRegistrationNo(registrationNo, false, doctor);
                    if (!res.isValid) setRegistrationNoError(res.message);
                  }
                }}
              />
            </View>
            {!!registrationNoError && (
              <Text style={styles.errorText}>{registrationNoError}</Text>
            )}

            {/* Consultation Fee */}
            <Text style={styles.label}>{doctor("consultation_fee")} *</Text>
            <View
              style={[
                styles.inputContainer,
                consultationFeeError ? styles.errorInput : null,
              ]}
            >
              <Text style={styles.currency}>₹</Text>
              <TextInput
                style={styles.input}
                placeholder={doctor("consultation_fee_placeholder")}
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                maxLength={7}
                value={consultationFee}
                onChangeText={(text) => {
                  const value = text.replace(/\D/g, "");
                  setConsultationFee(value);
                  if (consultationFeeError) setConsultationFeeError("");
                }}
                onBlur={() => {
                  if (consultationFee.trim()) {
                    const res = validateConsultationFee(consultationFee, doctor);
                    if (!res.isValid) setConsultationFeeError(res.message);
                  }
                }}
              />
            </View>
            {!!consultationFeeError && (
              <Text style={styles.errorText}>{consultationFeeError}</Text>
            )}

            {/* About Doctor */}
            <Text style={styles.label}>{doctor("about_doctor")}</Text>
            <View
              style={[
                styles.textAreaContainer,
                aboutDoctorError ? styles.errorInput : null,
              ]}
            >
              <TextInput
                style={styles.textArea}
                placeholder={doctor("about_doctor_placeholder")}
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={aboutDoctor}
                maxLength={2000}
                onChangeText={(text) => {
                  setAboutDoctor(text);
                  if (aboutDoctorError) setAboutDoctorError("");
                }}
                onBlur={() => {
                  if (aboutDoctor.trim()) {
                    const res = validateAbout(aboutDoctor);
                    if (!res.isValid) setAboutDoctorError(res.message);
                  }
                }}
              />
            </View>
            {!!aboutDoctorError && (
              <Text style={styles.errorText}>{aboutDoctorError}</Text>
            )}

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.button, loading ? styles.disabledButton : null]}
              onPress={handleSaveDoctor}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>{doctor("save_doctor")}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <StatusModal
        visible={statusModal.visible}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        buttonText={doctor("ok")}
        onClose={() => {
          const wasSuccess = statusModal.type === "success";
          const confirmCallback = statusModal.onConfirm;
          setStatusModal((prev) => ({
            ...prev,
            visible: false,
          }));
          if (wasSuccess) {
            if (confirmCallback) {
              confirmCallback();
            } else {
              handleNavBack();
            }
          }
        }}
        onConfirm={() => {
          const wasSuccess = statusModal.type === "success";
          const confirmCallback = statusModal.onConfirm;
          setStatusModal((prev) => ({ ...prev, visible: false }));
          if (wasSuccess) {
            if (confirmCallback) {
              confirmCallback();
            } else {
              handleNavBack();
            }
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  navHeader: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  subHeading: {
    color: "#64748B",
    marginTop: 5,
    marginBottom: 20,
    fontSize: 15,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "600",
    color: "#334155",
    fontSize: 15,
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
  input: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
    height: "100%",
  },
  suffix: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
  currency: {
    fontSize: 18,
    fontWeight: "700",
    color: "#64748B",
    marginRight: 10,
  },
  textAreaContainer: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    padding: 12,
  },
  textArea: {
    minHeight: 80,
    fontSize: 16,
    color: "#0F172A",
    textAlignVertical: "top",
  },
  errorInput: {
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginTop: 5,
    marginLeft: 4,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#2563EB",
    marginTop: 30,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
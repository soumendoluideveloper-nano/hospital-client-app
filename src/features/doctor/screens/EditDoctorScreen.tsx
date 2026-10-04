import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import {
  RootStackParamList,
} from "../../../navigation/AppNavigator";
import {
  getDoctorByIdApi,
  updateDoctorApi,
} from "../api/doctor.api";
import StatusModal from "../../../components/ui/StatusModal";
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface DoctorForm {
  name: string;
  phone: string;
  email: string;
  qualification: string;
  specialization: string;
  experience: string;
  registration_no: string;
  consultation_fee: string;
  about: string;
}

export default function EditDoctorScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const { t: doctor } = useTranslation("doctor");

  const doctorId =
    route.params?.doctorId || route.params?.id || route.params?.doctor?.id;

  const initialDoctor = route.params?.doctor;

  const [form, setForm] = useState<DoctorForm>({
    name: initialDoctor?.name || "",
    phone:
      initialDoctor?.phone ||
      initialDoctor?.mobile ||
      initialDoctor?.contact_number ||
      initialDoctor?.phone_number ||
      initialDoctor?.clinic?.phone ||
      "",
    email:
      initialDoctor?.email ||
      initialDoctor?.email_id ||
      initialDoctor?.mail ||
      initialDoctor?.clinic?.email ||
      "",
    qualification: initialDoctor?.qualification || "",
    specialization: initialDoctor?.specialization || "",
    experience:
      initialDoctor?.experience != null
        ? String(initialDoctor.experience)
        : "",
    registration_no: initialDoctor?.registration_no || "",
    consultation_fee:
      initialDoctor?.consultation_fee != null
        ? String(initialDoctor.consultation_fee)
        : "",
    about: initialDoctor?.about || "",
  });

  const [loading, setLoading] = useState(!initialDoctor);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof DoctorForm, string>>>({});

  const [statusModal, setStatusModal] = useState({
    visible: false,
    type: "success" as "success" | "error",
    title: "",
    message: "",
  });

  const updateField = (key: keyof DoctorForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (errors[key]) {
      setErrors((prev) => ({
        ...prev,
        [key]: "",
      }));
    }
  };

  const loadDoctor = useCallback(async () => {
    try {
      if (!initialDoctor) {
        setLoading(true);
      }
      if (!doctorId) {
        throw new Error(doctor("doctor_id_missing") || "Doctor ID missing");
      }

      const response = await getDoctorByIdApi(doctorId);
      const data = (response as any)?.data?.doctor || response?.data || response;

      if (!data) {
        throw new Error(doctor("doctor_not_found") || "Doctor not found");
      }

      setForm((prev) => ({
        name: data.name || prev.name || "",
        phone:
          data.phone ||
          data.mobile ||
          data.contact_number ||
          data.phone_number ||
          prev.phone ||
          initialDoctor?.phone ||
          initialDoctor?.mobile ||
          data.clinic?.phone ||
          "",
        email:
          data.email ||
          data.email_id ||
          data.mail ||
          prev.email ||
          initialDoctor?.email ||
          data.clinic?.email ||
          "",
        qualification: data.qualification || prev.qualification || "",
        specialization: data.specialization || prev.specialization || "",
        experience:
          data.experience != null
            ? String(data.experience)
            : (prev.experience || (initialDoctor?.experience != null ? String(initialDoctor.experience) : "")),
        registration_no: data.registration_no || prev.registration_no || initialDoctor?.registration_no || "",
        consultation_fee:
          data.consultation_fee != null
            ? String(data.consultation_fee)
            : (prev.consultation_fee || (initialDoctor?.consultation_fee != null ? String(initialDoctor.consultation_fee) : "")),
        about: data.about || prev.about || initialDoctor?.about || "",
      }));
    } catch (error: any) {
      if (!initialDoctor) {
        setStatusModal({
          visible: true,
          type: "error",
          title: doctor("error") || "Error",
          message: error?.message || doctor("load_doctor_failed") || "Failed to load doctor",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [doctor, doctorId, initialDoctor]);

  useFocusEffect(
    useCallback(() => {
      loadDoctor();
    }, [loadDoctor])
  );

  const validate = () => {
    const newErrors: Partial<Record<keyof DoctorForm, string>> = {};

    const nameVal = validateDoctorName(form.name, doctor);
    if (!nameVal.isValid) newErrors.name = nameVal.message;

    const phoneVal = validateMobile(form.phone, doctor);
    if (!phoneVal.isValid) newErrors.phone = phoneVal.message;

    const emailVal = validateEmail(form.email, true, doctor);
    if (!emailVal.isValid) newErrors.email = emailVal.message;

    const qualVal = validateQualification(form.qualification, doctor);
    if (!qualVal.isValid) newErrors.qualification = qualVal.message;

    const specVal = validateSpecialization(form.specialization, doctor);
    if (!specVal.isValid) newErrors.specialization = specVal.message;

    const expVal = validateExperience(form.experience, doctor);
    if (!expVal.isValid) newErrors.experience = expVal.message;

    const regVal = validateRegistrationNo(form.registration_no, false, doctor);
    if (!regVal.isValid) newErrors.registration_no = regVal.message;

    const feeVal = validateConsultationFee(form.consultation_fee, doctor);
    if (!feeVal.isValid) newErrors.consultation_fee = feeVal.message;

    const aboutVal = validateAbout(form.about);
    if (!aboutVal.isValid) newErrors.about = aboutVal.message;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (saving) return;

    if (!validate()) return;

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        qualification: form.qualification.trim(),
        specialization: form.specialization.trim(),
        experience: Number(form.experience),
        registration_no: form.registration_no.trim() || undefined,
        consultation_fee: Number(form.consultation_fee),
        about: form.about.trim() || undefined,
      };

      const response = await updateDoctorApi(doctorId, payload as any);

      if (response.status === 1 || response.status === 200 || (response as any).success) {
        setStatusModal({
          visible: true,
          type: "success",
          title: doctor("success") || "Success",
          message: doctor("doctor_updated_successfully") || "Doctor updated successfully!",
        });
      } else {
        throw new Error(response.message || "Update failed");
      }
    } catch (error: any) {
      setStatusModal({
        visible: true,
        type: "error",
        title: doctor("error") || "Error",
        message: error?.message || doctor("doctor_update_failed") || "Failed to update doctor",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNavBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Dashboard");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.navHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleNavBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>{doctor("edit_doctor")}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>{doctor("loading_doctor")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.navHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleNavBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{doctor("edit_doctor")}</Text>
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
          <Text style={styles.subHeading}>
            {doctor("update_doctor_information")}
          </Text>

          <View style={styles.card}>
            {/* Name */}
            <Input
              icon="person-outline"
              label={`${doctor("full_name")} *`}
              placeholder={doctor("enter_doctor_name")}
              value={form.name}
              error={errors.name}
              maxLength={150}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^a-zA-Z\s\.\'\,\-]/g, "");
                updateField("name", cleaned);
              }}
              onBlur={() => {
                if (form.name.trim()) {
                  const val = validateDoctorName(form.name, doctor);
                  if (!val.isValid) {
                    setErrors((prev) => ({ ...prev, name: val.message }));
                  }
                }
              }}
            />

            {/* Mobile */}
            <Input
              icon="call-outline"
              label={`${doctor("mobile_number")} *`}
              placeholder={doctor("enter_mobile")}
              value={form.phone}
              error={errors.phone}
              keyboardType="phone-pad"
              maxLength={10}
              onChangeText={(text) => {
                const cleaned = text.replace(/\D/g, "");
                updateField("phone", cleaned);
              }}
              onBlur={() => {
                if (form.phone.trim()) {
                  const val = validateMobile(form.phone, doctor);
                  if (!val.isValid) {
                    setErrors((prev) => ({ ...prev, phone: val.message }));
                  }
                }
              }}
            />

            {/* Email */}
            <Input
              icon="mail-outline"
              label={`${doctor("email")} *`}
              placeholder={doctor("enter_email")}
              value={form.email}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(text) => {
                const cleaned = text.replace(/\s/g, "").toLowerCase();
                updateField("email", cleaned);
              }}
              onBlur={() => {
                if (form.email.trim()) {
                  const val = validateEmail(form.email, true, doctor);
                  if (!val.isValid) {
                    setErrors((prev) => ({ ...prev, email: val.message }));
                  }
                }
              }}
            />

            {/* Qualification */}
            <Input
              icon="school-outline"
              label={`${doctor("qualification")} *`}
              placeholder={doctor("enter_qualification")}
              value={form.qualification}
              error={errors.qualification}
              maxLength={200}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^a-zA-Z0-9\s\.\,\(\)\/\-]/g, "");
                updateField("qualification", cleaned);
              }}
              onBlur={() => {
                if (form.qualification.trim()) {
                  const val = validateQualification(form.qualification, doctor);
                  if (!val.isValid) {
                    setErrors((prev) => ({ ...prev, qualification: val.message }));
                  }
                }
              }}
            />

            {/* Specialization */}
            <Input
              icon="medical-outline"
              label={`${doctor("specialization")} *`}
              placeholder={doctor("enter_specialization")}
              value={form.specialization}
              error={errors.specialization}
              maxLength={150}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^a-zA-Z\s\.\,\/\-]/g, "");
                updateField("specialization", cleaned);
              }}
              onBlur={() => {
                if (form.specialization.trim()) {
                  const val = validateSpecialization(form.specialization, doctor);
                  if (!val.isValid) {
                    setErrors((prev) => ({ ...prev, specialization: val.message }));
                  }
                }
              }}
            />

            {/* Experience */}
            <Input
              icon="time-outline"
              label={`${doctor("experience_years")} *`}
              placeholder={doctor("enter_experience")}
              value={form.experience}
              error={errors.experience}
              keyboardType="numeric"
              maxLength={2}
              onChangeText={(text) => {
                const cleaned = text.replace(/\D/g, "");
                updateField("experience", cleaned);
              }}
              onBlur={() => {
                if (form.experience.trim()) {
                  const val = validateExperience(form.experience, doctor);
                  if (!val.isValid) {
                    setErrors((prev) => ({ ...prev, experience: val.message }));
                  }
                }
              }}
            />

            {/* Registration */}
            <Input
              icon="card-outline"
              label={doctor("registration_no")}
              placeholder={doctor("enter_registration") || "e.g. WBMH1289"}
              value={form.registration_no}
              error={errors.registration_no}
              autoCapitalize="characters"
              maxLength={50}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^a-zA-Z0-9\-\/]/g, "").toUpperCase();
                updateField("registration_no", cleaned);
              }}
              onBlur={() => {
                if (form.registration_no.trim()) {
                  const val = validateRegistrationNo(form.registration_no, false, doctor);
                  if (!val.isValid) {
                    setErrors((prev) => ({ ...prev, registration_no: val.message }));
                  }
                }
              }}
            />

            {/* Consultation Fee */}
            <Input
              icon="cash-outline"
              label={`${doctor("consultation_fee")} *`}
              placeholder={doctor("enter_consultation_fee")}
              value={form.consultation_fee}
              error={errors.consultation_fee}
              keyboardType="numeric"
              maxLength={7}
              onChangeText={(text) => {
                const cleaned = text.replace(/\D/g, "");
                updateField("consultation_fee", cleaned);
              }}
              onBlur={() => {
                if (form.consultation_fee.trim()) {
                  const val = validateConsultationFee(form.consultation_fee, doctor);
                  if (!val.isValid) {
                    setErrors((prev) => ({ ...prev, consultation_fee: val.message }));
                  }
                }
              }}
            />

            {/* About */}
            <Text style={styles.label}>{doctor("about_doctor")}</Text>
            <View
              style={[
                styles.textAreaContainer,
                errors.about ? styles.errorInput : null,
              ]}
            >
              <TextInput
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={form.about}
                placeholder={doctor("write_about_doctor")}
                placeholderTextColor="#94A3B8"
                maxLength={2000}
                onChangeText={(text) => updateField("about", text)}
                onBlur={() => {
                  if (form.about.trim()) {
                    const val = validateAbout(form.about);
                    if (!val.isValid) {
                      setErrors((prev) => ({ ...prev, about: val.message }));
                    }
                  }
                }}
                style={styles.textArea}
              />
            </View>
            {!!errors.about && (
              <Text style={styles.errorText}>{errors.about}</Text>
            )}

            {/* Update Button */}
            <TouchableOpacity
              style={[styles.button, saving ? styles.disabledButton : null]}
              onPress={handleUpdate}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={21}
                    color="#FFFFFF"
                  />
                  <Text style={styles.buttonText}>
                    {doctor("update_doctor")}
                  </Text>
                </>
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
          setStatusModal((prev) => ({ ...prev, visible: false }));
          if (wasSuccess) {
            handleNavBack();
          }
        }}
        onConfirm={() => {
          const wasSuccess = statusModal.type === "success";
          setStatusModal((prev) => ({ ...prev, visible: false }));
          if (wasSuccess) {
            handleNavBack();
          }
        }}
      />
    </SafeAreaView>
  );
}

function Input({
  icon,
  label,
  placeholder,
  value,
  error,
  keyboardType = "default",
  secureTextEntry = false,
  autoCapitalize = "sentences",
  maxLength,
  onChangeText,
  onBlur,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  keyboardType?: any;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  maxLength?: number;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
}) {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          error ? styles.errorInput : null,
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color="#64748B"
          style={styles.icon}
        />
        <TextInput
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          style={styles.input}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          onChangeText={onChangeText}
          onBlur={onBlur}
        />
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
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
  inputWrapper: {
    marginBottom: 12,
  },
  label: {
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
    marginTop: 4,
    marginLeft: 3,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#2563EB",
    marginTop: 24,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 15,
    fontWeight: "500",
  },
});
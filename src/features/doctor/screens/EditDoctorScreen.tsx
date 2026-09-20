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

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;

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
  const navigation =
    useNavigation<NavigationProp>();

  const route =
    useRoute<any>();

  const { t: doctor } =
    useTranslation("doctor");

  const doctorId =
    route.params?.doctorId;

  // =====================================================
  // State
  // =====================================================

  const [form, setForm] =
    useState<DoctorForm>({
      name: "",
      phone: "",
      email: "",
      qualification: "",
      specialization: "",
      experience: "",
      registration_no: "",
      consultation_fee: "",
      about: "",
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [errors, setErrors] =
    useState<
      Partial<
        Record<keyof DoctorForm, string>
      >
    >({});

  const [statusModal, setStatusModal] =
    useState({
      visible: false,
      type: "success" as
        | "success"
        | "error",
      title: "",
      message: "",
    });

  // =====================================================
  // Update Field
  // =====================================================

  const updateField = (
    key: keyof DoctorForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    if (errors[key]) {
      setErrors((previous) => ({
        ...previous,
        [key]: "",
      }));
    }
  };

  // =====================================================
  // Load Doctor
  // =====================================================

  const loadDoctor = useCallback(
    async () => {
      try {
        setLoading(true);

        if (!doctorId) {
          throw new Error(
            doctor("doctor_id_missing")
          );
        }

        const response =
          await getDoctorByIdApi(
            doctorId
          );

        console.log(
          "Edit Doctor Response:",
          response
        );

        const data =
          response?.data;

        if (!data) {
          throw new Error(
            doctor(
              "doctor_not_found"
            )
          );
        }

        setForm({
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          qualification:
            data.qualification || "",
          specialization:
            data.specialization || "",
          experience:
            data.experience != null
              ? String(
                  data.experience
                )
              : "",
          registration_no:
            data.registration_no ||
            "",
          consultation_fee:
            data.consultation_fee !=
            null
              ? String(
                  data.consultation_fee
                )
              : "",
          about: data.about || "",
        });
      } catch (error: any) {
        console.log(
          "Load Doctor Error:",
          error
        );

        setStatusModal({
          visible: true,
          type: "error",
          title: doctor("error"),
          message:
            error?.message ||
            doctor(
              "load_doctor_failed"
            ),
        });
      } finally {
        setLoading(false);
      }
    },
    [
      doctor,
      doctorId,
    ]
  );

  useEffect(() => {
    loadDoctor();
  }, [loadDoctor]);

  // =====================================================
  // Validation
  // =====================================================

  const validate = () => {
    const newErrors: Partial<
      Record<keyof DoctorForm, string>
    > = {};

    if (!form.name.trim()) {
      newErrors.name =
        doctor("name_required");
    }

    if (!form.phone.trim()) {
      newErrors.phone =
        doctor("mobile_required");
    } else if (
      form.phone.length !== 10
    ) {
      newErrors.phone =
        doctor("invalid_mobile");
    }

    if (!form.email.trim()) {
      newErrors.email =
        doctor("email_required");
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email
      )
    ) {
      newErrors.email =
        doctor("invalid_email");
    }

    if (!form.qualification.trim()) {
      newErrors.qualification =
        doctor(
          "qualification_required"
        );
    }

    if (!form.specialization.trim()) {
      newErrors.specialization =
        doctor(
          "specialization_required"
        );
    }

    if (!form.experience.trim()) {
      newErrors.experience =
        doctor(
          "experience_required"
        );
    } else if (
      Number(form.experience) < 0
    ) {
      newErrors.experience =
        doctor(
          "invalid_experience"
        );
    }

    if (
      !form.registration_no.trim()
    ) {
      newErrors.registration_no =
        doctor(
          "registration_required"
        );
    }

    if (
      !form.consultation_fee.trim()
    ) {
      newErrors.consultation_fee =
        doctor(
          "consultation_fee_required"
        );
    } else if (
      Number(
        form.consultation_fee
      ) < 0
    ) {
      newErrors.consultation_fee =
        doctor(
          "invalid_consultation_fee"
        );
    }

    if (!form.about.trim()) {
      newErrors.about =
        doctor("about_required");
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors)
        .length === 0
    );
  };

  // =====================================================
  // Update Doctor
  // =====================================================

  const handleUpdate = async () => {
    if (!validate()) {
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        qualification:
          form.qualification.trim(),
        specialization:
          form.specialization.trim(),
        experience: Number(
          form.experience
        ),
        registration_no:
          form.registration_no.trim(),
        consultation_fee: Number(
          form.consultation_fee
        ),
        about: form.about.trim(),
      };

      console.log(
        "Update Doctor Payload:",
        payload
      );

      const response =
        await updateDoctorApi(
          doctorId,
          payload
        );

      console.log(
        "Update Doctor Response:",
        response
      );

      setStatusModal({
        visible: true,
        type: "success",
        title: doctor(
          "success"
        ),
        message: doctor(
          "doctor_updated_successfully"
        ),
      });
    } catch (error: any) {
      console.log(
        "Update Doctor Error:",
        error
      );

      setStatusModal({
        visible: true,
        type: "error",
        title: doctor("error"),
        message:
          error?.message ||
          doctor(
            "doctor_update_failed"
          ),
      });
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // Loading
  // =====================================================

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["top"]}
      >
        <View style={styles.navHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>{doctor("edit_doctor")}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />

          <Text
            style={
              styles.loadingText
            }
          >
            {doctor(
              "loading_doctor"
            )}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
    >
      <View style={styles.navHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{doctor("edit_doctor")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.content
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
        >
          <Text
            style={
              styles.subHeading
            }
          >
            {doctor(
              "update_doctor_information"
            )}
          </Text>

          {/* Form */}

          <View
            style={styles.card}
          >
            {/* Name */}

            <Input
              icon="person-outline"
              label={doctor(
                "full_name"
              )}
              placeholder={doctor(
                "enter_doctor_name"
              )}
              value={form.name}
              error={errors.name}
              onChangeText={(text) =>
                updateField(
                  "name",
                  text
                )
              }
            />

            {/* Mobile */}

            <Input
              icon="call-outline"
              label={doctor(
                "mobile_number"
              )}
              placeholder={doctor(
                "enter_mobile"
              )}
              value={form.phone}
              error={errors.phone}
              keyboardType="phone-pad"
              maxLength={10}
              onChangeText={(text) =>
                updateField(
                  "phone",
                  text
                )
              }
            />

            {/* Email */}

            <Input
              icon="mail-outline"
              label={doctor(
                "email"
              )}
              placeholder={doctor(
                "enter_email"
              )}
              value={form.email}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(text) =>
                updateField(
                  "email",
                  text
                )
              }
            />

            {/* Qualification */}

            <Input
              icon="school-outline"
              label={doctor(
                "qualification"
              )}
              placeholder={doctor(
                "enter_qualification"
              )}
              value={
                form.qualification
              }
              error={
                errors.qualification
              }
              onChangeText={(text) =>
                updateField(
                  "qualification",
                  text
                )
              }
            />

            {/* Specialization */}

            <Input
              icon="medical-outline"
              label={doctor(
                "specialization"
              )}
              placeholder={doctor(
                "enter_specialization"
              )}
              value={
                form.specialization
              }
              error={
                errors.specialization
              }
              onChangeText={(text) =>
                updateField(
                  "specialization",
                  text
                )
              }
            />

            {/* Experience */}

            <Input
              icon="briefcase-outline"
              label={doctor(
                "experience_years"
              )}
              placeholder={doctor(
                "enter_experience"
              )}
              value={form.experience}
              error={
                errors.experience
              }
              keyboardType="numeric"
              onChangeText={(text) =>
                updateField(
                  "experience",
                  text
                )
              }
            />

            {/* Registration */}

            <Input
              icon="card-outline"
              label={doctor(
                "registration_no"
              )}
              placeholder={doctor(
                "enter_registration"
              )}
              value={
                form.registration_no
              }
              error={
                errors.registration_no
              }
              onChangeText={(text) =>
                updateField(
                  "registration_no",
                  text
                )
              }
            />

            {/* Consultation Fee */}

            <Input
              icon="cash-outline"
              label={doctor(
                "consultation_fee"
              )}
              placeholder={doctor(
                "enter_consultation_fee"
              )}
              value={
                form.consultation_fee
              }
              error={
                errors.consultation_fee
              }
              keyboardType="numeric"
              onChangeText={(text) =>
                updateField(
                  "consultation_fee",
                  text
                )
              }
            />

            {/* About */}

            <Text
              style={styles.label}
            >
              {doctor("about_doctor")}
            </Text>

            <View
              style={[
                styles.inputContainer,
                styles.textAreaContainer,
                errors.about &&
                  styles.errorInput,
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#64748B"
                style={
                  styles.textAreaIcon
                }
              />

              <TextInput
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={form.about}
                placeholder={doctor(
                  "write_about_doctor"
                )}
                placeholderTextColor="#94A3B8"
                onChangeText={(text) =>
                  updateField(
                    "about",
                    text
                  )
                }
                style={
                  styles.textArea
                }
              />
            </View>

            {!!errors.about && (
              <Text
                style={
                  styles.errorText
                }
              >
                {errors.about}
              </Text>
            )}

            {/* Update Button */}

            <TouchableOpacity
              style={[
                styles.button,
                saving &&
                  styles.disabledButton,
              ]}
              onPress={
                handleUpdate
              }
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={21}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.buttonText
                    }
                  >
                    {doctor(
                      "update_doctor"
                    )}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Status Modal */}

      <StatusModal
        visible={
          statusModal.visible
        }
        type={
          statusModal.type
        }
        title={
          statusModal.title
        }
        message={
          statusModal.message
        }
        buttonText={doctor("ok")}
        onClose={() => {
          setStatusModal(
            (previous) => ({
              ...previous,
              visible: false,
            })
          );

          if (
            statusModal.type ===
            "success"
          ) {
            navigation.navigate(
              "DoctorDetails",
              {
                doctorId:
                  doctorId.toString(),
              }
            );
          }
        }}
      />
    </SafeAreaView>
  );
}

// =====================================================
// Input Component
// =====================================================

function Input({
  icon,
  label,
  placeholder,
  value,
  error,
  onChangeText,
  keyboardType,
  maxLength,
  autoCapitalize,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  onChangeText: (
    text: string
  ) => void;
  keyboardType?: any;
  maxLength?: number;
  autoCapitalize?: any;
}) {
  return (
    <View>
      <Text
        style={styles.label}
      >
        {label}
      </Text>

      <View
        style={[
          styles.inputContainer,
          error &&
            styles.errorInput,
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color="#64748B"
          style={styles.icon}
        />

        <TextInput
          style={styles.input}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          onChangeText={
            onChangeText
          }
          keyboardType={
            keyboardType
          }
          maxLength={maxLength}
          autoCapitalize={
            autoCapitalize
          }
        />
      </View>

      {!!error && (
        <Text
          style={
            styles.errorText
          }
        >
          {error}
        </Text>
      )}
    </View>
  );
}

// =====================================================
// Styles
// =====================================================

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
    paddingBottom: 50,
  },

  header: {
    marginBottom: 5,
  },

  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },

  subHeading: {
    marginTop: 6,
    color: "#64748B",
    fontSize: 14,
  },

  card: {
    marginTop: 18,

    backgroundColor: "#FFFFFF",

    borderRadius: 20,

    padding: 18,

    borderWidth: 1,
    borderColor: "#E0EAFF",

    shadowColor: "#2563EB",
    shadowOpacity: 0.06,
    shadowRadius: 12,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 3,
  },

  label: {
    marginTop: 16,
    marginBottom: 8,

    fontWeight: "700",

    color: "#334155",

    fontSize: 14,
  },

  inputContainer: {
    height: 52,

    borderWidth: 1,
    borderColor: "#CBD5E1",

    borderRadius: 12,

    backgroundColor: "#FFFFFF",

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 14,
  },

  errorInput: {
    borderColor: "#EF4444",
    backgroundColor: "#FFF7F7",
  },

  icon: {
    marginRight: 10,
  },

  input: {
    flex: 1,

    height: "100%",

    fontSize: 15,

    color: "#0F172A",
  },

  textAreaContainer: {
    height: 120,

    alignItems: "flex-start",

    paddingTop: 14,
  },

  textAreaIcon: {
    marginRight: 10,
  },

  textArea: {
    flex: 1,

    width: "100%",

    minHeight: 90,

    fontSize: 15,

    color: "#0F172A",

    paddingTop: 0,
  },

  errorText: {
    marginTop: 5,

    marginLeft: 3,

    color: "#EF4444",

    fontSize: 13,

    fontWeight: "500",
  },

  button: {
    marginTop: 28,

    height: 55,

    borderRadius: 14,

    backgroundColor: "#2563EB",

    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    shadowColor: "#2563EB",

    shadowOpacity: 0.2,

    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  disabledButton: {
    opacity: 0.7,
  },

  buttonText: {
    marginLeft: 8,

    color: "#FFFFFF",

    fontSize: 16,

    fontWeight: "800",
  },

  loadingContainer: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,

    color: "#64748B",

    fontSize: 14,
  },
});
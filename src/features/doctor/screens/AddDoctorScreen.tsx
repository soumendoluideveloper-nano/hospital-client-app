import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { addDoctorApi } from "../api/doctor.api";
import StatusModal from "../../../components/ui/StatusModal";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../navigation/AppNavigator";
export default function AddDoctorScreen() {

  const navigation =
  useNavigation<
    NativeStackNavigationProp<RootStackParamList>
  >();
  const { t: doctor } =
    useTranslation("doctor");

  const [fullName, setFullName] =
    useState("");

  const [mobile, setMobile] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [qualification, setQualification] =
    useState("");

  const [specialization, setSpecialization] =
    useState("");

  const [experience, setExperience] =
    useState("");

  const [registrationNo, setRegistrationNo] =
    useState("");

  const [consultationFee, setConsultationFee] =
    useState("");

  const [aboutDoctor, setAboutDoctor] =
    useState("");

  // Errors

  const [fullNameError, setFullNameError] =
    useState("");

  const [mobileError, setMobileError] =
    useState("");

  const [emailError, setEmailError] =
    useState("");

  const [qualificationError, setQualificationError] =
    useState("");

  const [specializationError, setSpecializationError] =
    useState("");

  const [experienceError, setExperienceError] =
    useState("");

  const [registrationNoError, setRegistrationNoError] =
    useState("");

  const [consultationFeeError, setConsultationFeeError] =
    useState("");

  const [aboutDoctorError, setAboutDoctorError] =
    useState("");
const [statusModal, setStatusModal] =
  useState({
    visible: false,
    type: "success" as
      | "success"
      | "error"
      | "warning",
    title: "",
    message: "",
  });
  const [loading, setLoading] =
    useState(false);
  // =========================================================
  // Validation
  // =========================================================

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

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Full Name

    if (!fullName.trim()) {
      setFullNameError(
        doctor("full_name_required")
      );

      valid = false;
    }

    // Mobile

    if (!mobile.trim()) {
      setMobileError(
        doctor("mobile_required")
      );

      valid = false;
    } else if (mobile.length !== 10) {
      setMobileError(
        doctor("invalid_mobile")
      );

      valid = false;
    }

    // Email

    if (!email.trim()) {
      setEmailError(
        doctor("email_required")
      );

      valid = false;
    } else if (
      !emailRegex.test(email.trim())
    ) {
      setEmailError(
        doctor("invalid_email")
      );

      valid = false;
    }

    // Qualification

    if (!qualification.trim()) {
      setQualificationError(
        doctor("qualification_required")
      );

      valid = false;
    }

    // Specialization

    if (!specialization.trim()) {
      setSpecializationError(
        doctor("specialization_required")
      );

      valid = false;
    }

    // Experience

    if (!experience.trim()) {
      setExperienceError(
        doctor("experience_required")
      );

      valid = false;
    } else if (
      !/^\d+$/.test(
        experience.trim()
      )
    ) {
      setExperienceError(
        doctor("invalid_experience")
      );

      valid = false;
    }

    // Registration No

    if (!registrationNo.trim()) {
      setRegistrationNoError(
        doctor("registration_no_required")
      );

      valid = false;
    }

    // Consultation Fee

    if (!consultationFee.trim()) {
      setConsultationFeeError(
        doctor("consultation_fee_required")
      );

      valid = false;
    } else if (
      !/^\d+$/.test(
        consultationFee.trim()
      )
    ) {
      setConsultationFeeError(
        doctor(
          "invalid_consultation_fee"
        )
      );

      valid = false;
    }

    // About Doctor

    if (!aboutDoctor.trim()) {
      setAboutDoctorError(
        doctor("about_doctor_required")
      );

      valid = false;
    }

    return valid;
  };

  // =========================================================
  // Submit
  // =========================================================

const handleSaveDoctor = async () => {
  
  const isValid = validate();

  if (!isValid) {
    return;
  }

  try {
    setLoading(true);


    const payload = {
      name: fullName.trim(),
      phone: mobile.trim(),
      email: email.trim(),
      qualification: qualification.trim(),
      specialization: specialization.trim(),
      experience: Number(experience),
      registration_no: registrationNo.trim(),
      consultation_fee: Number(consultationFee),
      about: aboutDoctor.trim(),
    };

    const response = await addDoctorApi(
      payload
    );
    if(response.status==1){
        console.log(
      "Add Doctor Response:",
      response
    );
      setStatusModal({
        visible: true,
        type: "success",
        title: doctor("doctor_added"),
        message: doctor(
          "doctor_added_successfully"
        ),
      });

    }
    else{
      setStatusModal({
        visible: true,
        type: "error",
        title: doctor("error"),
        message: response.message,
      });
    }
    setLoading(false);

    // success
    // navigation.goBack();

  } catch (error: any) {
    console.log(
      "Add Doctor Error:",
      error
    );
    setLoading(false);

    setStatusModal({
        visible: true,
        type: "error",
        title: doctor("error"),
        message: doctor("something_went_wrong"),
      });
  } finally {
    setLoading(false);
   
  }
};

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Header */}

        <Text style={styles.heading}>
          {doctor("add_doctor")}
        </Text>

        <Text style={styles.subHeading}>
          {doctor("add_doctor_subtitle")}
        </Text>

        <View style={styles.card}>

          {/* =================================================
              Full Name
          ================================================= */}

          <Text style={styles.label}>
            {doctor("full_name")}
          </Text>

          <View
            style={[
              styles.inputContainer,
              fullNameError &&
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
              placeholder={doctor(
                "full_name_placeholder"
              )}
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);

                if (fullNameError) {
                  setFullNameError("");
                }
              }}
            />
          </View>

          {!!fullNameError && (
            <Text style={styles.errorText}>
              {fullNameError}
            </Text>
          )}

          {/* =================================================
              Mobile
          ================================================= */}

          <Text style={styles.label}>
            {doctor("mobile_number")}
          </Text>

          <View
            style={[
              styles.inputContainer,
              mobileError &&
                styles.errorInput,
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
              placeholder={doctor(
                "mobile_number_placeholder"
              )}
              keyboardType="phone-pad"
              maxLength={10}
              value={mobile}
              onChangeText={(text) => {
                const value =
                  text.replace(
                    /\D/g,
                    ""
                  );

                setMobile(value);

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

          {/* =================================================
              Email
          ================================================= */}

          <Text style={styles.label}>
            {doctor("email")}
          </Text>

          <View
            style={[
              styles.inputContainer,
              emailError &&
                styles.errorInput,
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
              placeholder={doctor(
                "email_placeholder"
              )}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => {
                setEmail(text);

                if (emailError) {
                  setEmailError("");
                }
              }}
            />
          </View>

          {!!emailError && (
            <Text style={styles.errorText}>
              {emailError}
            </Text>
          )}

          {/* =================================================
              Qualification
          ================================================= */}

          <Text style={styles.label}>
            {doctor("qualification")}
          </Text>

          <View
            style={[
              styles.inputContainer,
              qualificationError &&
                styles.errorInput,
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
              placeholder={doctor(
                "qualification_placeholder"
              )}
              value={qualification}
              onChangeText={(text) => {
                setQualification(text);

                if (
                  qualificationError
                ) {
                  setQualificationError(
                    ""
                  );
                }
              }}
            />
          </View>

          {!!qualificationError && (
            <Text style={styles.errorText}>
              {qualificationError}
            </Text>
          )}

          {/* =================================================
              Specialization
          ================================================= */}

          <Text style={styles.label}>
            {doctor("specialization")}
          </Text>

          <View
            style={[
              styles.inputContainer,
              specializationError &&
                styles.errorInput,
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
              placeholder={doctor(
                "specialization_placeholder"
              )}
              value={specialization}
              onChangeText={(text) => {
                setSpecialization(text);

                if (
                  specializationError
                ) {
                  setSpecializationError(
                    ""
                  );
                }
              }}
            />
          </View>

          {!!specializationError && (
            <Text style={styles.errorText}>
              {specializationError}
            </Text>
          )}

          {/* =================================================
              Experience
          ================================================= */}

          <Text style={styles.label}>
            {doctor("experience")}
          </Text>

          <View
            style={[
              styles.inputContainer,
              experienceError &&
                styles.errorInput,
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
              placeholder={doctor(
                "experience_placeholder"
              )}
              keyboardType="number-pad"
              value={experience}
              onChangeText={(text) => {
                const value =
                  text.replace(
                    /\D/g,
                    ""
                  );

                setExperience(value);

                if (experienceError) {
                  setExperienceError("");
                }
              }}
            />

            <Text style={styles.suffix}>
              {doctor("years")}
            </Text>
          </View>

          {!!experienceError && (
            <Text style={styles.errorText}>
              {experienceError}
            </Text>
          )}

          {/* =================================================
              Registration Number
          ================================================= */}

          <Text style={styles.label}>
            {doctor("registration_no")}
          </Text>

          <View
            style={[
              styles.inputContainer,
              registrationNoError &&
                styles.errorInput,
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
              placeholder={doctor(
                "registration_no_placeholder"
              )}
              autoCapitalize="characters"
              value={registrationNo}
              onChangeText={(text) => {
                setRegistrationNo(text);

                if (
                  registrationNoError
                ) {
                  setRegistrationNoError(
                    ""
                  );
                }
              }}
            />
          </View>

          {!!registrationNoError && (
            <Text style={styles.errorText}>
              {registrationNoError}
            </Text>
          )}

          {/* =================================================
              Consultation Fee
          ================================================= */}

          <Text style={styles.label}>
            {doctor("consultation_fee")}
          </Text>

          <View
            style={[
              styles.inputContainer,
              consultationFeeError &&
                styles.errorInput,
            ]}
          >
            <Text style={styles.currency}>
              ₹
            </Text>

            <TextInput
              style={styles.input}
              placeholder={doctor(
                "consultation_fee_placeholder"
              )}
              keyboardType="number-pad"
              value={consultationFee}
              onChangeText={(text) => {
                const value =
                  text.replace(
                    /\D/g,
                    ""
                  );

                setConsultationFee(
                  value
                );

                if (
                  consultationFeeError
                ) {
                  setConsultationFeeError(
                    ""
                  );
                }
              }}
            />
          </View>

          {!!consultationFeeError && (
            <Text style={styles.errorText}>
              {consultationFeeError}
            </Text>
          )}

          {/* =================================================
              About Doctor
          ================================================= */}

          <Text style={styles.label}>
            {doctor("about_doctor")}
          </Text>

          <View
            style={[
              styles.textAreaContainer,
              aboutDoctorError &&
                styles.errorInput,
            ]}
          >
            <TextInput
              placeholder={doctor(
                "about_doctor_placeholder"
              )}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              style={styles.textArea}
              value={aboutDoctor}
              onChangeText={(text) => {
                setAboutDoctor(text);

                if (
                  aboutDoctorError
                ) {
                  setAboutDoctorError(
                    ""
                  );
                }
              }}
            />
          </View>

          {!!aboutDoctorError && (
            <Text style={styles.errorText}>
              {aboutDoctorError}
            </Text>
          )}

          {/* =================================================
              Save Button
          ================================================= */}

          <TouchableOpacity
            style={styles.button}
            onPress={
              handleSaveDoctor
            }
            disabled={loading}
          >
            <Text
              style={styles.buttonText}
            >
             {loading ? "Saving..." : doctor("save_doctor")}

            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
     <StatusModal
  visible={statusModal.visible}
  type={statusModal.type}
  title={statusModal.title}
  message={statusModal.message}
  buttonText={doctor("ok")}

  onClose={() =>
    setStatusModal((prev) => ({
      ...prev,
      visible: false,
    }))
  }

  onConfirm={() => {
    if (
      statusModal.type === "success"
    ) {
      navigation.goBack();
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

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
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
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    padding: 15,
  },

  textArea: {
    minHeight: 90,
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

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
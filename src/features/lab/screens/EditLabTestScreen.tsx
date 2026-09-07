import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { LabTest, updateLabTestApi } from "../api/lab.api";
import StatusModal from "../../../components/ui/StatusModal";

export default function EditLabTestScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const test: LabTest = route.params?.test;
  const { t } = useTranslation("lab");

  const [category, setCategory] = useState<
    "Radiology" | "Pathology" | "Ultrasound" | "Cardiology" | "General"
  >((test?.category as any) || "Radiology");
  const [testName, setTestName] = useState(test?.test_name || "");
  const [description, setDescription] = useState(test?.description || "");
  const [price, setPrice] = useState(String(test?.price || ""));
  const [reportDuration, setReportDuration] = useState(test?.report_duration || "");
  const [isActive, setIsActive] = useState(test?.status === "Active");
  const [loading, setLoading] = useState(false);

  // Field validation errors
  const [testNameError, setTestNameError] = useState("");
  const [priceError, setPriceError] = useState("");

  // Status Modal popup state
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

  const categoryOptions = [
    {
      key: "Radiology" as const,
      label: "🩻 " + t("category_radiology"),
      shortLabel: "🩻 X-Ray / CT / MRI",
    },
    {
      key: "Pathology" as const,
      label: "🧪 " + t("category_pathology"),
      shortLabel: "🧪 Blood / Pathology",
    },
    {
      key: "Ultrasound" as const,
      label: "📡 " + t("category_ultrasound"),
      shortLabel: "📡 USG / Ultrasound",
    },
    {
      key: "Cardiology" as const,
      label: "🫀 " + t("category_cardiology"),
      shortLabel: "🫀 ECG / Cardiology",
    },
    {
      key: "General" as const,
      label: "🔬 " + t("category_general"),
      shortLabel: "🔬 General",
    },
  ];

  const validate = () => {
    let valid = true;
    setTestNameError("");
    setPriceError("");

    if (!testName.trim()) {
      setTestNameError(t("validation_name_req"));
      valid = false;
    }

    if (!price.trim()) {
      setPriceError(t("validation_price_req"));
      valid = false;
    } else if (isNaN(Number(price)) || Number(price) <= 0) {
      setPriceError(t("validation_price_req"));
      valid = false;
    }

    return valid;
  };

  const handleUpdate = async () => {
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      const res = await updateLabTestApi(test.id, {
        test_name: testName.trim(),
        category,
        description: description.trim() || undefined,
        price: Number(price),
        report_duration: reportDuration.trim() || undefined,
        status: isActive ? "Active" : "Inactive",
      });

      if (res && res.status === 1) {
        setStatusModal({
          visible: true,
          type: "success",
          title: t("test_updated_success"),
          message: t("test_updated_success"),
          onConfirm: () => navigation.goBack(),
        });
      } else {
        setStatusModal({
          visible: true,
          type: "error",
          title: t("error_loading_tests"),
          message: res.message || "Failed to update test.",
        });
      }
    } catch (err: any) {
      console.log("Update test error:", err);
      setStatusModal({
        visible: true,
        type: "error",
        title: t("error_loading_tests"),
        message: err?.message || "Failed to update test. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{t("edit_lab_test")}</Text>

        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formCard}>
            {/* Status toggle */}
            <View style={styles.statusRow}>
              <View>
                <Text style={styles.statusTitle}>{t("active_status")}</Text>
                <Text style={styles.statusSubtitle}>
                  {isActive ? t("active_status_enabled") : t("active_status_disabled")}
                </Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: "#CBD5E1", true: "#93C5FD" }}
                thumbColor={isActive ? "#2563EB" : "#94A3B8"}
              />
            </View>

            <View style={styles.divider} />

            {/* Category Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("diagnostic_category")}</Text>
              <View style={styles.categoryPillsRow}>
                {categoryOptions.map((opt) => {
                  const isSelected = category === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[
                        styles.categoryPill,
                        isSelected && styles.categoryPillActive,
                      ]}
                      onPress={() => setCategory(opt.key)}
                    >
                      <Text
                        style={[
                          styles.categoryPillText,
                          isSelected && styles.categoryPillTextActive,
                        ]}
                      >
                        {opt.shortLabel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Test Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t("test_name")} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, !!testNameError && styles.errorInput]}
                placeholder={t("test_name_placeholder")}
                placeholderTextColor="#94A3B8"
                value={testName}
                onChangeText={(val) => {
                  setTestName(val);
                  if (testNameError) setTestNameError("");
                }}
              />
              {!!testNameError && (
                <Text style={styles.errorText}>{testNameError}</Text>
              )}
            </View>

            {/* Price */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t("price")} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, !!priceError && styles.errorInput]}
                placeholder={t("price_placeholder")}
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={price}
                onChangeText={(val) => {
                  setPrice(val);
                  if (priceError) setPriceError("");
                }}
              />
              {!!priceError && (
                <Text style={styles.errorText}>{priceError}</Text>
              )}
            </View>

            {/* Report Duration */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("report_duration")}</Text>
              <TextInput
                style={styles.input}
                placeholder={t("report_duration_placeholder")}
                placeholderTextColor="#94A3B8"
                value={reportDuration}
                onChangeText={setReportDuration}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("description")}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t("description_placeholder")}
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveBtn, loading && styles.btnDisabled]}
              onPress={handleUpdate}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>{t("update_test")}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Standard Popup Modal */}
      <StatusModal
        visible={statusModal.visible}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        buttonText={t("cancel") === "Cancel" ? "OK" : "ঠিক আছে"}
        onClose={() =>
          setStatusModal((prev) => ({
            ...prev,
            visible: false,
          }))
        }
        onConfirm={() => {
          statusModal.onConfirm?.();
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  statusSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 14,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  required: {
    color: "#DC2626",
  },
  categoryPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  categoryPillActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  categoryPillTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0F172A",
  },
  errorInput: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginTop: 5,
    marginLeft: 4,
    fontWeight: "500",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  saveBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    height: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
});

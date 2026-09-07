import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
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
import { useNavigation, useRoute } from "@react-navigation/native";
import { launchImageLibraryAsync } from "expo-image-picker";
import { useTranslation } from "react-i18next";

import { uploadLabReportApi } from "../api/lab.api";
import StatusModal from "../../../components/ui/StatusModal";

export default function UploadReportScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const bookingId = route.params?.bookingId;
  const booking = route.params?.booking;
  const { t } = useTranslation("lab");

  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    fileName?: string;
    mimeType?: string;
  } | null>(null);
  const [remarks, setRemarks] = useState(booking?.report?.remarks || "");
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState("");

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

  const handlePickFile = async () => {
    try {
      const result = await launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          fileName: asset.fileName || `report_${bookingId}.jpg`,
          mimeType: asset.mimeType || "image/jpeg",
        });
        setFileError("");
      }
    } catch (err: any) {
      console.log("Pick file error:", err);
      setStatusModal({
        visible: true,
        type: "error",
        title: t("error_loading_bookings"),
        message: "Could not select file. Please try again.",
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile && !booking?.report?.report_file) {
      setFileError(t("file_required_msg"));
      setStatusModal({
        visible: true,
        type: "warning",
        title: t("file_required_title"),
        message: t("file_required_msg"),
      });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      if (selectedFile) {
        formData.append("report_file", {
          uri: selectedFile.uri,
          name: selectedFile.fileName || `report_${bookingId}.jpg`,
          type: selectedFile.mimeType || "image/jpeg",
        } as any);
      }

      if (remarks.trim()) {
        formData.append("remarks", remarks.trim());
      }

      const res = await uploadLabReportApi(bookingId, formData);

      if (res && res.status === 1) {
        setStatusModal({
          visible: true,
          type: "success",
          title: t("test_updated_success"),
          message: t("upload_success"),
          onConfirm: () => navigation.goBack(),
        });
      } else {
        setStatusModal({
          visible: true,
          type: "error",
          title: t("error_loading_bookings"),
          message: res.message || "Failed to upload report.",
        });
      }
    } catch (err: any) {
      console.log("Upload report error:", err);
      setStatusModal({
        visible: true,
        type: "error",
        title: t("error_loading_bookings"),
        message: err?.message || "Failed to upload report. Please try again.",
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

        <Text style={styles.headerTitle}>{t("upload_report_title")}</Text>

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
          {/* Booking Summary Box */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>{t("booking_details")}</Text>
            <Text style={styles.summaryText}>
              {t("booking_id")} <Text style={styles.bold}>#{bookingId}</Text>
            </Text>
            {booking?.patient?.name && (
              <Text style={styles.summaryText}>
                {t("patient")} <Text style={styles.bold}>{booking.patient.name}</Text>
              </Text>
            )}
            {booking?.lab_test?.test_name && (
              <Text style={styles.summaryText}>
                {t("test")} <Text style={styles.bold}>{booking.lab_test.test_name}</Text>
              </Text>
            )}
          </View>

          <View style={styles.formCard}>
            {/* File Picker */}
            <Text style={styles.label}>
              {t("report_doc")} <Text style={styles.required}>*</Text>
            </Text>

            <TouchableOpacity
              style={[
                styles.uploadArea,
                !!fileError && styles.uploadAreaError,
              ]}
              onPress={handlePickFile}
              activeOpacity={0.7}
            >
              {selectedFile ? (
                <View style={styles.fileSelectedBox}>
                  <Image source={{ uri: selectedFile.uri }} style={styles.previewImage} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.fileNameText} numberOfLines={1}>
                      {selectedFile.fileName}
                    </Text>
                    <Text style={styles.changeFileText}>{t("tap_to_change")}</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <View style={styles.uploadIconBox}>
                    <Ionicons name="cloud-upload-outline" size={32} color="#2563EB" />
                  </View>
                  <Text style={styles.uploadPlaceholderTitle}>
                    {t("select_doc")}
                  </Text>
                  <Text style={styles.uploadPlaceholderSubtitle}>
                    {t("upload_doc_desc")}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            {!!fileError && (
              <Text style={styles.errorText}>{fileError}</Text>
            )}

            {/* Remarks / Diagnostic Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("remarks")}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t("remarks_placeholder")}
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                value={remarks}
                onChangeText={setRemarks}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.btnDisabled]}
              onPress={handleUpload}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="cloud-done-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>{t("upload_complete_btn")}</Text>
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
  summaryBox: {
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 13,
    color: "#334155",
    marginTop: 2,
  },
  bold: {
    fontWeight: "700",
    color: "#0F172A",
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  required: {
    color: "#DC2626",
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: "#CBD5E1",
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#F8FAFC",
  },
  uploadAreaError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginTop: -8,
    marginBottom: 16,
    marginLeft: 4,
    fontWeight: "500",
  },
  uploadPlaceholder: {
    alignItems: "center",
    paddingVertical: 18,
  },
  uploadIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  uploadPlaceholderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 4,
  },
  uploadPlaceholderSubtitle: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 16,
  },
  fileSelectedBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
  },
  fileNameText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  changeFileText: {
    fontSize: 12,
    color: "#2563EB",
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 18,
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
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  submitBtn: {
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
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
});

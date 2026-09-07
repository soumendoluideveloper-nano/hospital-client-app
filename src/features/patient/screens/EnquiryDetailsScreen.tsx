import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import {
  getEnquiryDetailsApi,
  acceptEnquiryApi,
  cancelEnquiryApi,
} from "../api/enquiry.api";
import {
  EnquiryItem,
  AppointmentInfo,
  EnquiryStatus,
} from "../types/patient.types";
import StatusModal from "../../../components/ui/StatusModal";

export default function EnquiryDetailsScreen() {
  const { t, i18n } = useTranslation("enquiry");
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const enquiryId = route.params?.enquiryId;

  // Data states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [enquiry, setEnquiry] = useState<EnquiryItem | null>(null);
  const [appointment, setAppointment] = useState<AppointmentInfo | null>(null);

  // StatusModal states
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusModalType, setStatusModalType] = useState<
    "success" | "error" | "warning"
  >("success");
  const [statusModalTitle, setStatusModalTitle] = useState("");
  const [statusModalMessage, setStatusModalMessage] = useState("");

  const loadData = async () => {
    if (!enquiryId) return;
    try {
      setLoading(true);
      const res = await getEnquiryDetailsApi(enquiryId);
      if (res.status === 1 && res.data?.enquiry) {
        setEnquiry(res.data.enquiry);
        setAppointment(res.data.appointment || null);
      }
    } catch (err: any) {
      console.error("loadData error:", err);
      setStatusModalType("error");
      setStatusModalTitle(t("title"));
      setStatusModalMessage(t("messages.error"));
      setStatusModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [enquiryId]);

  // Handle Call Patient
  const handleCallPatient = () => {
    const phone = enquiry?.patient?.phone;
    if (!phone) {
      setStatusModalType("warning");
      setStatusModalTitle(t("title"));
      setStatusModalMessage(t("messages.phone_not_available"));
      setStatusModalVisible(true);
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() => {
      setStatusModalType("error");
      setStatusModalTitle(t("title"));
      setStatusModalMessage(t("messages.error"));
      setStatusModalVisible(true);
    });
  };

  // Direct 1-Click Accept
  const handleAccept = async () => {
    if (!enquiryId) return;
    try {
      setActionLoading(true);
      const res = await acceptEnquiryApi(enquiryId);
      if (res.status === 1) {
        setEnquiry((prev) => (prev ? { ...prev, status: "Accepted" } : prev));
        setStatusModalType("success");
        setStatusModalTitle(t("card.accept"));
        setStatusModalMessage(t("messages.accept_success"));
        setStatusModalVisible(true);
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      setStatusModalType("error");
      setStatusModalTitle(t("title"));
      setStatusModalMessage(err.message || t("messages.error"));
      setStatusModalVisible(true);
    } finally {
      setActionLoading(false);
    }
  };

  // Direct 1-Click Cancel
  const handleCancel = async () => {
    if (!enquiryId) return;
    try {
      setActionLoading(true);
      const res = await cancelEnquiryApi(enquiryId, {
        reason: "Cancelled by clinic admin",
      });
      if (res.status === 1) {
        setEnquiry((prev) => (prev ? { ...prev, status: "Cancelled" } : prev));
        setStatusModalType("success");
        setStatusModalTitle(t("card.cancel"));
        setStatusModalMessage(t("messages.cancel_success"));
        setStatusModalVisible(true);
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      setStatusModalType("error");
      setStatusModalTitle(t("title"));
      setStatusModalMessage(err.message || t("messages.error"));
      setStatusModalVisible(true);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      const locale = i18n.language === "bn" ? "bn-BD" : "en-IN";
      return date.toLocaleString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  if (!enquiry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("details_title")}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>{t("no_enquiries")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isAccepted = enquiry.status === "Accepted" || enquiry.status === "Confirmed";
  const isCancelled = enquiry.status === "Cancelled";
  const patientName = enquiry.patient?.name || `Patient #${enquiry.patient_id}`;
  const patientPhone = enquiry.patient?.phone || "N/A";
  const doctorName = enquiry.doctor?.name;
  const doctorSpecialization = enquiry.doctor?.specialization;
  const doctorFee = enquiry.doctor?.consultation_fee;

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("details_title")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {patientName.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.patientName}>{patientName}</Text>
            <Text style={styles.mobile}>{patientPhone}</Text>
          </View>

          <View
            style={[
              styles.badge,
              isAccepted
                ? { backgroundColor: "#DCFCE7" }
                : isCancelled
                ? { backgroundColor: "#FEE2E2" }
                : { backgroundColor: "#FEF3C7" },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                isAccepted
                  ? { color: "#15803D" }
                  : isCancelled
                  ? { color: "#DC2626" }
                  : { color: "#D97706" },
              ]}
            >
              {isAccepted
                ? t("status.accepted")
                : isCancelled
                ? t("status.cancelled")
                : t("status.pending")}
            </Text>
          </View>
        </View>

        {/* 3 Main Action Buttons: Call | Accept | Cancel */}
        <View style={styles.actionSection}>
          {/* Call Button */}
          <TouchableOpacity
            style={styles.callBtn}
            onPress={handleCallPatient}
            activeOpacity={0.85}
          >
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={styles.callText}>{t("details.call_patient")}</Text>
          </TouchableOpacity>

          {/* Accept Button */}
          {!isAccepted && (
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={handleAccept}
              activeOpacity={0.85}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.acceptBtnText}>
                    {t("details.accept_enquiry")}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Cancel Button */}
          {!isCancelled && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancel}
              activeOpacity={0.85}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#DC2626" />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={20} color="#DC2626" />
                  <Text style={styles.cancelBtnText}>
                    {t("details.cancel_enquiry")}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Patient Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("details.patient_info")}</Text>

          <InfoRow
            icon="person-outline"
            label={t("details.patient_name")}
            value={patientName}
          />

          <InfoRow
            icon="call-outline"
            label={t("details.mobile")}
            value={patientPhone}
          />
        </View>

        {/* Doctor Details Card */}
        {Boolean(doctorName) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t("details.doctor_selected")}</Text>

            <InfoRow
              icon="medical-outline"
              label={t("details.doctor_name")}
              value={doctorName || ""}
            />

            {Boolean(doctorSpecialization) && (
              <InfoRow
                icon="business-outline"
                label={t("details.specialization")}
                value={doctorSpecialization || ""}
              />
            )}

            {Boolean(doctorFee) && (
              <InfoRow
                icon="cash-outline"
                label={t("details.consultation_fee")}
                value={`₹${doctorFee}`}
              />
            )}

            {Boolean(enquiry.doctor?.schedules && enquiry.doctor.schedules.length > 0) && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.scheduleHeading}>Doctor's Schedule & Slots:</Text>
                <View style={styles.scheduleChipsContainer}>
                  {enquiry.doctor?.schedules
                    ?.filter((s) => s.is_available)
                    .map((sch) => (
                      <View key={sch.id} style={styles.scheduleBadge}>
                        <Ionicons name="time-outline" size={12} color="#2563EB" />
                        <Text style={styles.scheduleBadgeText}>
                          {sch.day}: {sch.start_time?.slice(0, 5)} - {sch.end_time?.slice(0, 5)}
                        </Text>
                      </View>
                    ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Lead & Call Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("details.contact_info")}</Text>

          {Boolean(enquiry.appointment_date) && (
            <InfoRow
              icon="calendar-outline"
              label="Requested Date"
              value={enquiry.appointment_date}
            />
          )}

          {Boolean(enquiry.slot || enquiry.appointment_time) && (
            <InfoRow
              icon="time-outline"
              label="Requested Slot / Time"
              value={enquiry.slot || enquiry.appointment_time || ""}
            />
          )}

          <InfoRow
            icon="alarm-outline"
            label={t("details.contact_time")}
            value={formatDateTime(enquiry.created_at)}
          />

          <InfoRow
            icon="phone-portrait-outline"
            label={t("details.source")}
            value={t("details.source_app")}
          />

          <View style={{ marginTop: 12 }}>
            <Text style={styles.label}>{t("details.reason")}</Text>
            <Text style={styles.reason}>
              {enquiry.message || "Direct Doctor Call Inquiry"}
            </Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Status Modal */}
      <StatusModal
        visible={statusModalVisible}
        type={statusModalType}
        title={statusModalTitle}
        message={statusModalMessage}
        onClose={() => setStatusModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const InfoRow = ({ icon, label, value }: any) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={18} color="#2563EB" />
    <View style={{ marginLeft: 12, flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
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
    padding: 18,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    elevation: 3,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2563EB",
  },
  patientName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  mobile: {
    marginTop: 3,
    fontSize: 13,
    color: "#64748B",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  badgeText: {
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 0.3,
  },
  actionSection: {
    gap: 10,
    marginBottom: 16,
  },
  callBtn: {
    backgroundColor: "#16A34A",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  callText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  acceptBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  acceptBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  cancelBtn: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  cancelBtnText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
    color: "#0F172A",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  value: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  reason: {
    marginTop: 4,
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  emptyTitle: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "600",
  },
  scheduleHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 6,
  },
  scheduleChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  scheduleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  scheduleBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1D4ED8",
  },
});
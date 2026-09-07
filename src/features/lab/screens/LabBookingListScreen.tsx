import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import {
  getClinicLabBookingsApi,
  TestBooking,
  updateLabBookingStatusApi,
} from "../api/lab.api";
import StatusModal from "../../../components/ui/StatusModal";

type BookingStatus = "Pending" | "Collected" | "Processing" | "Completed" | "Cancelled";

export default function LabBookingListScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation("lab");

  const [bookings, setBookings] = useState<TestBooking[]>([]);
  const [selectedStatusKey, setSelectedStatusKey] = useState<
    "All" | BookingStatus
  >("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Status Selector Modal state
  const [statusPickerBooking, setStatusPickerBooking] = useState<TestBooking | null>(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState<BookingStatus>("Processing");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Status Modal popup state
  const [statusModal, setStatusModal] = useState<{
    visible: boolean;
    type: "success" | "error" | "warning";
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    visible: false,
    type: "error",
    title: "",
    message: "",
  });

  const statusTabs = useMemo(() => [
    { key: "All" as const, label: t("all") },
    { key: "Pending" as const, label: t("pending") },
    { key: "Collected" as const, label: t("collected") },
    { key: "Processing" as const, label: t("processing") },
    { key: "Completed" as const, label: t("completed") },
    { key: "Cancelled" as const, label: t("cancelled") },
  ], [t]);

  const fetchBookings = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const res = await getClinicLabBookingsApi(
        selectedStatusKey === "All" ? undefined : selectedStatusKey,
        1,
        50
      );
      if (res && res.status === 1) {
        setBookings(res.data || []);
      } else {
        setError(res.message || t("error_loading_bookings"));
      }
    } catch (err: any) {
      console.log("Fetch lab bookings error:", err);
      setError(err?.message || t("error_loading_bookings"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedStatusKey, t]);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [fetchBookings])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings(true);
  };

  const openStatusPicker = (booking: TestBooking) => {
    setStatusPickerBooking(booking);
    setSelectedNewStatus(booking.status as BookingStatus);
  };

  const handleConfirmStatusChange = async () => {
    if (!statusPickerBooking) return;

    try {
      setUpdatingStatus(true);
      const res = await updateLabBookingStatusApi(statusPickerBooking.id, selectedNewStatus);
      if (res && res.status === 1) {
        setStatusPickerBooking(null);
        fetchBookings(true);
        setStatusModal({
          visible: true,
          type: "success",
          title: t("test_updated_success"),
          message: `${t("test_updated_success")} (#${statusPickerBooking.id} -> ${selectedNewStatus})`,
        });
      } else {
        setStatusModal({
          visible: true,
          type: "error",
          title: t("error_loading_bookings"),
          message: res.message || "Failed to update status",
        });
      }
    } catch (e: any) {
      setStatusModal({
        visible: true,
        type: "error",
        title: t("error_loading_bookings"),
        message: e?.message || "Failed to update status",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return { bg: "#FEF3C7", text: "#D97706" };
      case "Collected":
        return { bg: "#E0E7FF", text: "#4338CA" };
      case "Processing":
        return { bg: "#DBEAFE", text: "#2563EB" };
      case "Completed":
        return { bg: "#DCFCE7", text: "#16A34A" };
      case "Cancelled":
        return { bg: "#FEE2E2", text: "#DC2626" };
      default:
        return { bg: "#F1F5F9", text: "#64748B" };
    }
  };

  const availableStatuses: BookingStatus[] = [
    "Pending",
    "Collected",
    "Processing",
    "Completed",
    "Cancelled",
  ];

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

        <Text style={styles.headerTitle}>{t("lab_bookings_title")}</Text>

        <TouchableOpacity style={styles.backBtn} onPress={() => fetchBookings(true)}>
          <Ionicons name="reload-outline" size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Status Filter Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={statusTabs}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.tabsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tabItem,
                selectedStatusKey === item.key && styles.tabItemActive,
              ]}
              onPress={() => setSelectedStatusKey(item.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedStatusKey === item.key && styles.tabTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loaderText}>{t("loading_bookings")}</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
          <Text style={styles.errorTitle}>{t("error_loading_bookings")}</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchBookings()}>
            <Text style={styles.retryBtnText}>{t("cancel") === "Cancel" ? "Retry" : "পুনরায় চেষ্টা করুন"}</Text>
          </TouchableOpacity>
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={60} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>{t("no_bookings_title")}</Text>
          <Text style={styles.emptySubtitle}>
            {selectedStatusKey === "All"
              ? t("no_bookings_subtitle")
              : t("no_bookings_state", { status: selectedStatusKey })}
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#2563EB"]}
              tintColor="#2563EB"
            />
          }
          renderItem={({ item }) => {
            const badgeColor = getStatusColor(item.status);
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.idBox}>
                    <Text style={styles.idText}>#{item.id}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.patientName}>
                      {item.patient?.name || "Patient"}
                    </Text>
                    <Text style={styles.patientContact}>
                      {item.patient?.phone || item.patient?.email || "—"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.statusBadge, { backgroundColor: badgeColor.bg }]}
                    onPress={() => openStatusPicker(item)}
                  >
                    <Text style={[styles.statusText, { color: badgeColor.text }]}>
                      {item.status} ▾
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                {/* Test details */}
                <View style={styles.infoRow}>
                  <Ionicons name="flask-outline" size={18} color="#2563EB" />
                  <Text style={styles.infoLabel}>{t("test_label")}</Text>
                  <Text style={styles.infoValue}>
                    {item.lab_test?.test_name || `Test #${item.lab_test_id}`}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={18} color="#2563EB" />
                  <Text style={styles.infoLabel}>{t("slot_label")}</Text>
                  <Text style={styles.infoValue}>
                    {item.booking_date} at {item.booking_time}
                  </Text>
                </View>

                {item.lab_test?.price && (
                  <View style={styles.infoRow}>
                    <Ionicons name="cash-outline" size={18} color="#16A34A" />
                    <Text style={styles.infoLabel}>{t("fee_label")}</Text>
                    <Text style={[styles.infoValue, { color: "#16A34A" }]}>
                      ₹{item.lab_test.price}
                    </Text>
                  </View>
                )}

                {item.report?.report_file && (
                  <View style={styles.reportReadyRow}>
                    <Ionicons name="document-text" size={18} color="#16A34A" />
                    <Text style={styles.reportReadyText}>
                      {t("report_uploaded_badge")}
                    </Text>
                  </View>
                )}

                {/* Actions */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.changeStatusBtn}
                    onPress={() => openStatusPicker(item)}
                  >
                    <Ionicons name="swap-horizontal-outline" size={16} color="#334155" />
                    <Text style={styles.changeStatusText}>{t("status_btn")}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.uploadBtn}
                    onPress={() =>
                      navigation.navigate("UploadReport", {
                        bookingId: item.id,
                        booking: item,
                      })
                    }
                  >
                    <Ionicons name="cloud-upload-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.uploadBtnText}>
                      {item.report ? t("reupload_report") : t("upload_report")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Status Selection Modal Sheet */}
      <Modal
        visible={!!statusPickerBooking}
        transparent
        animationType="fade"
        onRequestClose={() => setStatusPickerBooking(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("update_booking_status")}</Text>
              <TouchableOpacity onPress={() => setStatusPickerBooking(null)}>
                <Ionicons name="close-circle" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              {statusPickerBooking
                ? t("select_new_status", { id: statusPickerBooking.id })
                : ""}
            </Text>

            <View style={styles.statusOptionsContainer}>
              {availableStatuses.map((st) => {
                const color = getStatusColor(st);
                const isSelected = selectedNewStatus === st;
                return (
                  <TouchableOpacity
                    key={st}
                    style={[
                      styles.statusOptionRow,
                      isSelected && styles.statusOptionRowSelected,
                    ]}
                    onPress={() => setSelectedNewStatus(st)}
                  >
                    <View
                      style={[
                        styles.statusPill,
                        { backgroundColor: color.bg },
                      ]}
                    >
                      <Text style={[styles.statusPillText, { color: color.text }]}>
                        {st}
                      </Text>
                    </View>

                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={22} color="#2563EB" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setStatusPickerBooking(null)}
              >
                <Text style={styles.modalCancelBtnText}>{t("cancel")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalConfirmBtn, updatingStatus && { opacity: 0.7 }]}
                onPress={handleConfirmStatusChange}
                disabled={updatingStatus}
              >
                {updatingStatus ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalConfirmBtnText}>
                    {t("cancel") === "Cancel" ? "Update" : "আপডেট করুন"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  tabsContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tabsList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tabItem: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    marginRight: 6,
  },
  tabItemActive: {
    backgroundColor: "#2563EB",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  idBox: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
  },
  idText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
  },
  patientName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  patientContact: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748B",
    width: 45,
    marginLeft: 8,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  reportReadyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 6,
    marginBottom: 4,
  },
  reportReadyText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#16A34A",
    marginLeft: 6,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 12,
    gap: 10,
  },
  changeStatusBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  changeStatusText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginLeft: 4,
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#2563EB",
  },
  uploadBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 6,
  },
  loaderCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#DC2626",
    marginTop: 12,
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
  },
  retryBtn: {
    marginTop: 18,
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    marginBottom: 16,
  },
  statusOptionsContainer: {
    gap: 8,
    marginBottom: 20,
  },
  statusOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  statusOptionRowSelected: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 13,
    fontWeight: "700",
  },
  modalButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCancelBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
  },
  modalConfirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  modalConfirmBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

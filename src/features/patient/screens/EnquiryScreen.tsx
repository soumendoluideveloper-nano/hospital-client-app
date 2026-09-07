import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Linking,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import {
  getEnquiriesApi,
  acceptEnquiryApi,
  cancelEnquiryApi,
} from "../api/enquiry.api";
import { EnquiryItem, EnquiryStatus } from "../types/patient.types";
import StatusModal from "../../../components/ui/StatusModal";

type FilterTab = "Pending" | "TODAY" | "ALL" | "Cancelled";

export default function EnquiryScreen() {
  const { t, i18n } = useTranslation("enquiry");
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>(
    (route.params?.filter as FilterTab) || "Pending"
  );

  // Status modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"success" | "error" | "warning">("success");

  // Sync route param filter if updated (e.g. from Dashboard "Today's Patients" card)
  useEffect(() => {
    if (route.params?.filter) {
      setActiveTab(route.params.filter);
    }
  }, [route.params?.filter]);

  const fetchEnquiries = useCallback(
    async (isRefresh = false) => {
      try {
        if (!isRefresh) setLoading(true);

        const params: any = {};
        if (activeTab === "TODAY") {
          params.status = "TODAY";
        } else if (activeTab !== "ALL") {
          params.status = activeTab;
        }

        if (search.trim()) {
          params.search = search.trim();
        }

        const res = await getEnquiriesApi(params);
        if (res.status === 1 && Array.isArray(res.data)) {
          setEnquiries(res.data);
        } else {
          setEnquiries([]);
        }
      } catch (err: any) {
        console.error("fetchEnquiries error:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeTab, search]
  );

  useFocusEffect(
    useCallback(() => {
      fetchEnquiries();
    }, [fetchEnquiries])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEnquiries(true);
  };

  // Direct 1-Click Call Patient
  const handleCall = (phone?: string) => {
    if (!phone) {
      setModalType("warning");
      setModalTitle(t("title"));
      setModalMessage(t("messages.phone_not_available"));
      setModalVisible(true);
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() => {
      setModalType("error");
      setModalTitle(t("title"));
      setModalMessage(t("messages.error"));
      setModalVisible(true);
    });
  };

  // Direct 1-Click Accept Enquiry
  const handleAccept = async (enquiryId: number) => {
    try {
      setActionLoadingId(enquiryId);
      const res = await acceptEnquiryApi(enquiryId);
      if (res.status === 1) {
        // Update local list
        setEnquiries((prev) =>
          prev.map((item) =>
            item.id === enquiryId ? { ...item, status: "Accepted" } : item
          )
        );
        setModalType("success");
        setModalTitle(t("card.accept"));
        setModalMessage(t("messages.accept_success"));
        setModalVisible(true);
        // Refresh list to update counts/tabs
        fetchEnquiries();
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      setModalType("error");
      setModalTitle(t("title"));
      setModalMessage(err.message || t("messages.error"));
      setModalVisible(true);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Direct 1-Click Cancel Enquiry
  const handleCancel = async (enquiryId: number) => {
    try {
      setActionLoadingId(enquiryId);
      const res = await cancelEnquiryApi(enquiryId, {
        reason: "Cancelled by clinic admin",
      });
      if (res.status === 1) {
        setEnquiries((prev) =>
          prev.map((item) =>
            item.id === enquiryId ? { ...item, status: "Cancelled" } : item
          )
        );
        setModalType("success");
        setModalTitle(t("card.cancel"));
        setModalMessage(t("messages.cancel_success"));
        setModalVisible(true);
        fetchEnquiries();
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      setModalType("error");
      setModalTitle(t("title"));
      setModalMessage(err.message || t("messages.error"));
      setModalVisible(true);
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatEnquiryTime = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const isToday =
        date.toDateString() === new Date().toDateString();

      const timeStr = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      if (isToday) {
        return `Today • ${timeStr}`;
      }

      const locale = i18n.language === "bn" ? "bn-BD" : "en-IN";
      return `${date.toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
      })} • ${timeStr}`;
    } catch {
      return dateStr;
    }
  };

  const tabs: { key: FilterTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: "Pending", label: t("tabs.pending"), icon: "call-outline" },
    { key: "TODAY", label: t("tabs.today"), icon: "today-outline" },
    { key: "ALL", label: t("tabs.all"), icon: "list-outline" },
    { key: "Cancelled", label: t("tabs.cancelled"), icon: "close-circle-outline" },
  ];

  const renderEnquiryCard = ({ item }: { item: EnquiryItem }) => {
    const isAccepted = item.status === "Accepted" || item.status === "Confirmed";
    const isCancelled = item.status === "Cancelled";
    const isPending = item.status === "Pending";

    const patientName = item.patient?.name || `Patient #${item.patient_id}`;
    const patientPhone = item.patient?.phone || "";
    const doctorName = item.doctor?.name;
    const department = item.doctor?.specialization;
    const isActionLoading = actionLoadingId === item.id;

    return (
      <View style={styles.card}>
        {/* Top Header: Avatar + Patient Name + Status Badge */}
        <TouchableOpacity
          style={styles.cardHeader}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate("EnquiryDetails", {
              enquiryId: String(item.id),
            })
          }
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {patientName.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.patientName} numberOfLines={1}>
              {patientName}
            </Text>
            {Boolean(patientPhone) && (
              <Text style={styles.phoneText}>{patientPhone}</Text>
            )}
          </View>

          <View
            style={[
              styles.statusBadge,
              isAccepted
                ? { backgroundColor: "#DCFCE7" }
                : isCancelled
                ? { backgroundColor: "#FEE2E2" }
                : { backgroundColor: "#FEF3C7" },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
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
        </TouchableOpacity>

        {/* Doctor Inquired */}
        {Boolean(doctorName) && (
          <View style={styles.doctorRow}>
            <Ionicons name="medical" size={15} color="#2563EB" />
            <Text style={styles.doctorName}>
              {doctorName}
              {department ? (
                <Text style={styles.departmentText}> • {department}</Text>
              ) : null}
            </Text>
          </View>
        )}

        {/* Requested Day / Date & Time Slot */}
        {Boolean(item.appointment_date || item.slot) && (
          <View style={styles.slotRow}>
            <Ionicons name="calendar-outline" size={14} color="#7C3AED" />
            <Text style={styles.slotText}>
              {item.appointment_date ? `${item.appointment_date}` : "Today"}
              {item.slot
                ? ` • ${item.slot}`
                : item.appointment_time
                ? ` • ${item.appointment_time}`
                : ""}
            </Text>
          </View>
        )}

        {/* Message / Call Reason */}
        {Boolean(item.message) && (
          <Text style={styles.messageText} numberOfLines={2}>
            "{item.message}"
          </Text>
        )}

        {/* Timestamp */}
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={13} color="#64748B" />
          <Text style={styles.timeText}>
            {formatEnquiryTime(item.created_at)}
          </Text>
        </View>

        {/* 3 Main Action Buttons: Call | Accept | Cancel */}
        <View style={styles.cardActionsRow}>
          {/* 1. Call Button */}
          {Boolean(patientPhone) && (
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => handleCall(patientPhone)}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={16} color="#fff" />
              <Text style={styles.callBtnText}>{t("card.call")}</Text>
            </TouchableOpacity>
          )}

          {/* 2. Accept Button (if pending or cancelled) */}
          {!isAccepted && (
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() => handleAccept(item.id)}
              disabled={isActionLoading}
              activeOpacity={0.8}
            >
              {isActionLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color="#fff"
                  />
                  <Text style={styles.acceptBtnText}>{t("card.accept")}</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* 3. Cancel Button (if pending) */}
          {isPending && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => handleCancel(item.id)}
              disabled={isActionLoading}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
              <Text style={styles.cancelBtnText}>{t("card.cancel")}</Text>
            </TouchableOpacity>
          )}

          {/* 4. Details Button */}
          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() =>
              navigation.navigate("EnquiryDetails", {
                enquiryId: String(item.id),
              })
            }
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-forward" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>{t("title")}</Text>
          <Text style={styles.subtitle}>
            {enquiries.length} {t("tabs.all").toLowerCase()}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.refreshIconBtn}
          onPress={() => fetchEnquiries()}
          activeOpacity={0.7}
        >
          <Ionicons name="reload" size={18} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Search Box */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#94A3B8" />
        <TextInput
          placeholder={t("search_placeholder")}
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => fetchEnquiries()}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Simplified Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabItem,
                  isSelected && styles.tabItemSelected,
                ]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={tab.icon}
                  size={15}
                  color={isSelected ? "#FFFFFF" : "#64748B"}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.tabItemText,
                    isSelected && styles.tabItemTextSelected,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Enquiries List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={enquiries}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderEnquiryCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#2563EB"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="chatbubbles-outline"
                size={56}
                color="#CBD5E1"
              />
              <Text style={styles.emptyTitle}>{t("no_enquiries")}</Text>
              <Text style={styles.emptySubtitle}>
                {t("no_enquiries_desc")}
              </Text>
              <TouchableOpacity
                style={styles.emptyRefreshBtn}
                onPress={() => fetchEnquiries()}
              >
                <Ionicons name="refresh" size={16} color="#2563EB" />
                <Text style={styles.emptyRefreshBtnText}>
                  {t("refresh")}
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Status Feedback Popup */}
      <StatusModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  refreshIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 10,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#0F172A",
  },
  tabsWrapper: {
    paddingBottom: 10,
  },
  tabsScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  tabItemSelected: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  tabItemTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2563EB",
  },
  patientName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  phoneText: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  doctorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
  },
  doctorName: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#166534",
  },
  departmentText: {
    fontSize: 12,
    color: "#15803D",
    fontWeight: "500",
  },
  slotRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#F5F3FF",
    borderRadius: 10,
  },
  slotText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#6D28D9",
  },
  messageText: {
    marginTop: 8,
    fontSize: 13,
    color: "#475569",
    fontStyle: "italic",
    lineHeight: 18,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
  },
  cardActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 8,
  },
  callBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16A34A",
    height: 38,
    borderRadius: 10,
    gap: 6,
  },
  callBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  acceptBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    height: 38,
    borderRadius: 10,
    gap: 6,
  },
  acceptBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  cancelBtn: {
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    height: 38,
    borderRadius: 10,
    gap: 4,
  },
  cancelBtnText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "700",
  },
  detailsBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 18,
  },
  emptyRefreshBtn: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
  },
  emptyRefreshBtnText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },
});
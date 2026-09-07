import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import {
  getTodaySchedulesApi,
  TodayScheduleItem,
  updateScheduleApi,
} from "../api/doctor.api";
import StatusModal from "../../../components/ui/StatusModal";

type LiveStatus = "Live" | "Upcoming" | "Completed" | "Off";

function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(":");
  const hour = parseInt(parts[0], 10) || 0;
  const min = parseInt(parts[1], 10) || 0;
  return hour * 60 + min;
}

function formatTime(timeStr: string) {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  let hour = parseInt(parts[0], 10);
  const min = parts[1] || "00";
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  hour = hour ? hour : 12;
  return `${String(hour).padStart(2, "0")}:${min} ${ampm}`;
}

function getScheduleStatus(
  startTime: string,
  endTime: string,
  isAvailable: boolean
): LiveStatus {
  if (!isAvailable) return "Off";

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);

  if (currentMinutes >= startMin && currentMinutes <= endMin) {
    return "Live";
  } else if (currentMinutes < startMin) {
    return "Upcoming";
  } else {
    return "Completed";
  }
}

export default function TodayScheduleScreen() {
  const navigation = useNavigation<any>();
  const { t, i18n } = useTranslation("doctor");

  const [schedules, setSchedules] = useState<TodayScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [selectedTabKey, setSelectedTabKey] = useState<"all" | "live" | "upcoming" | "off" | "ended">("all");

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

  const filterTabs = useMemo(() => [
    { key: "all" as const, label: t("tab_all") },
    { key: "live" as const, label: t("tab_live_now") },
    { key: "upcoming" as const, label: t("tab_upcoming") },
    { key: "off" as const, label: t("tab_off") },
    { key: "ended" as const, label: t("tab_ended") },
  ], [t]);

  const fetchTodaySchedules = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const res = await getTodaySchedulesApi();
      if (res && res.status === 1) {
        setSchedules(res.data || []);
      } else {
        setError(res.message || t("failed_load_today_schedule"));
      }
    } catch (err: any) {
      console.log("Fetch today schedules error:", err);
      setError(err?.message || t("network_error_schedule"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      fetchTodaySchedules();
    }, [fetchTodaySchedules])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTodaySchedules(true);
  };

  // Toggle Doctor availability ON / OFF for this schedule session
  const handleToggleAvailability = async (item: TodayScheduleItem) => {
    const newAvailability = !item.is_available;
    const scheduleId = item.id;

    // Optimistic UI update
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === scheduleId ? { ...s, is_available: newAvailability } : s
      )
    );
    setTogglingId(scheduleId);

    try {
      const res = await updateScheduleApi(scheduleId, {
        is_available: newAvailability,
      });

      if (!res || res.status !== 1) {
        // Rollback on error
        setSchedules((prev) =>
          prev.map((s) =>
            s.id === scheduleId ? { ...s, is_available: !newAvailability } : s
          )
        );
        setStatusModal({
          visible: true,
          type: "error",
          title: t("error"),
          message: res?.message || t("failed_update_availability"),
        });
      }
    } catch (err: any) {
      // Rollback on network error
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === scheduleId ? { ...s, is_available: !newAvailability } : s
        )
      );
      setStatusModal({
        visible: true,
        type: "error",
        title: t("error"),
        message: err?.message || t("network_error_schedule"),
      });
    } finally {
      setTogglingId(null);
    }
  };

  const filteredSchedules = useMemo(() => {
    return schedules.filter((item) => {
      const status = getScheduleStatus(item.start_time, item.end_time, item.is_available);

      let matchTab = true;
      if (selectedTabKey === "live") matchTab = status === "Live";
      else if (selectedTabKey === "upcoming") matchTab = status === "Upcoming";
      else if (selectedTabKey === "off") matchTab = status === "Off";
      else if (selectedTabKey === "ended") matchTab = status === "Completed";

      const doctorName = item.doctor?.name || "";
      const specialization = item.doctor?.specialization || "";

      const matchSearch =
        doctorName.toLowerCase().includes(search.toLowerCase()) ||
        specialization.toLowerCase().includes(search.toLowerCase());

      return matchTab && matchSearch;
    });
  }, [schedules, search, selectedTabKey]);

  const locale = i18n.language === "bn" ? "bn-BD" : "en-US";
  const todayDayName = new Date().toLocaleDateString(locale, { weekday: "long" });

  // Counts for summary header
  const liveCount = schedules.filter(
    (s) => getScheduleStatus(s.start_time, s.end_time, s.is_available) === "Live"
  ).length;

  const upcomingCount = schedules.filter(
    (s) => getScheduleStatus(s.start_time, s.end_time, s.is_available) === "Upcoming"
  ).length;

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

        <View style={{ alignItems: "center" }}>
          <Text style={styles.headerTitle}>{t("todays_doctor_schedule")}</Text>
          <Text style={styles.headerSubtitle}>{todayDayName} - {t("todays_availability")}</Text>
        </View>

        <TouchableOpacity style={styles.backBtn} onPress={() => fetchTodaySchedules(true)}>
          <Ionicons name="reload-outline" size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Live & Upcoming Quick Summary Pills */}
      <View style={styles.summaryBar}>
        <View style={[styles.summaryPill, { backgroundColor: "#DCFCE7", borderColor: "#86EFAC" }]}>
          <View style={styles.greenPulse} />
          <Text style={styles.summaryPillText}>
            <Text style={{ fontWeight: "700", color: "#15803D" }}>{liveCount}</Text> {liveCount === 1 ? t("doctor_live_now") : t("doctors_live_now")}
          </Text>
        </View>

        <View style={[styles.summaryPill, { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }]}>
          <Ionicons name="time" size={14} color="#2563EB" />
          <Text style={styles.summaryPillText}>
            <Text style={{ fontWeight: "700", color: "#1D4ED8" }}>{upcomingCount}</Text> {t("upcoming")}
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder={t("search_schedule_placeholder")}
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterTabs}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.tabsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => setSelectedTabKey(item.key)}
              style={[
                styles.tabItem,
                selectedTabKey === item.key && styles.tabItemActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTabKey === item.key && styles.tabTextActive,
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
          <Text style={styles.loaderText}>{t("loading_todays_schedules")}</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
          <Text style={styles.errorTitle}>{t("unable_to_load_schedule")}</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchTodaySchedules()}>
            <Text style={styles.retryBtnText}>{t("retry")}</Text>
          </TouchableOpacity>
        </View>
      ) : filteredSchedules.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={60} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>
            {search ? t("no_doctors_found") : t("no_matching_schedules")}
          </Text>
          <Text style={styles.emptySubtitle}>
            {search
              ? t("adjust_search_criteria")
              : t("no_sessions_match_filter")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredSchedules}
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
            const status = getScheduleStatus(item.start_time, item.end_time, item.is_available);
            const isLive = status === "Live";
            const isUpcoming = status === "Upcoming";
            const isOff = status === "Off";
            const isCompleted = status === "Completed";

            return (
              <View
                style={[
                  styles.scheduleCard,
                  isLive && styles.scheduleCardLive,
                  isOff && styles.scheduleCardOff,
                ]}
              >
                {/* Doctor Header */}
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.avatar,
                      isLive && { backgroundColor: "#DCFCE7" },
                      isOff && { backgroundColor: "#F1F5F9" },
                    ]}
                  >
                    <Ionicons
                      name="medical"
                      size={24}
                      color={isLive ? "#16A34A" : isOff ? "#94A3B8" : "#2563EB"}
                    />
                  </View>

                  <View style={styles.doctorInfo}>
                    <Text style={[styles.doctorName, isOff && { color: "#64748B" }]}>
                      {item.doctor?.name || "Doctor"}
                    </Text>
                    <Text style={styles.specialization}>
                      {item.doctor?.specialization || "General Physician"}
                    </Text>
                  </View>

                  {/* Status Badge */}
                  {isLive && (
                    <View style={styles.liveBadge}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveBadgeText}>{t("live_now_badge")}</Text>
                    </View>
                  )}

                  {isUpcoming && (
                    <View style={styles.upcomingBadge}>
                      <Ionicons name="time" size={12} color="#2563EB" />
                      <Text style={styles.upcomingBadgeText}>{t("upcoming_badge")}</Text>
                    </View>
                  )}

                  {isCompleted && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedBadgeText}>{t("ended_badge")}</Text>
                    </View>
                  )}

                  {isOff && (
                    <View style={styles.offBadge}>
                      <Text style={styles.offBadgeText}>{t("off_badge")}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.divider} />

                {/* Timings */}
                <View style={styles.infoRow}>
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={isLive ? "#16A34A" : "#2563EB"}
                  />
                  <Text style={styles.infoLabel}>{t("time_slot_label")}</Text>
                  <Text style={[styles.infoValue, isLive && { color: "#15803D", fontWeight: "700" }]}>
                    {formatTime(item.start_time)} - {formatTime(item.end_time)}
                  </Text>
                </View>

                {/* Slot Duration */}
                <View style={styles.infoRow}>
                  <Ionicons name="timer-outline" size={18} color="#64748B" />
                  <Text style={styles.infoLabel}>{t("duration_label")}</Text>
                  <Text style={styles.infoValue}>{item.slot_duration || 30} {t("mins_per_slot")}</Text>
                </View>

                {/* Doctor ON / OFF Availability Switch */}
                <View style={styles.toggleRow}>
                  <View style={styles.toggleLeft}>
                    <Ionicons
                      name={item.is_available ? "checkmark-circle" : "close-circle"}
                      size={20}
                      color={item.is_available ? "#16A34A" : "#DC2626"}
                    />
                    <View style={{ marginLeft: 8 }}>
                      <Text style={styles.toggleTitle}>
                        {t("doctor_availability")}{" "}
                        <Text
                          style={{
                            fontWeight: "700",
                            color: item.is_available ? "#16A34A" : "#DC2626",
                          }}
                        >
                          {item.is_available ? t("status_on_available") : t("status_off_unavailable")}
                        </Text>
                      </Text>
                      <Text style={styles.toggleSubtitle}>
                        {item.is_available
                          ? t("doctor_on_duty")
                          : t("doctor_off_duty")}
                      </Text>
                    </View>
                  </View>

                  {togglingId === item.id ? (
                    <ActivityIndicator size="small" color="#2563EB" />
                  ) : (
                    <Switch
                      value={item.is_available}
                      onValueChange={() => handleToggleAvailability(item)}
                      trackColor={{ false: "#CBD5E1", true: "#86EFAC" }}
                      thumbColor={item.is_available ? "#16A34A" : "#94A3B8"}
                    />
                  )}
                </View>

                {/* Action Buttons */}
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={styles.manageBtn}
                    onPress={() =>
                      navigation.navigate("DoctorSchedule", {
                        doctorId: String(item.doctor_id),
                      })
                    }
                  >
                    <Ionicons name="create-outline" size={16} color="#2563EB" />
                    <Text style={styles.manageBtnText}>{t("edit_weekly_schedule")}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.detailsBtn}
                    onPress={() =>
                      navigation.navigate("DoctorDetails", {
                        doctorId: String(item.doctor_id),
                      })
                    }
                  >
                    <Text style={styles.detailsBtnText}>{t("profile")}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
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
  headerSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  summaryBar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  summaryPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  greenPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#16A34A",
  },
  summaryPillText: {
    fontSize: 12,
    color: "#334155",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#0F172A",
  },
  tabsContainer: {
    marginTop: 10,
    marginBottom: 6,
  },
  tabsList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 6,
  },
  tabItemActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  tabText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 13,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 30,
  },
  scheduleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  scheduleCardLive: {
    borderColor: "#86EFAC",
    backgroundColor: "#F0FDF4",
  },
  scheduleCardOff: {
    opacity: 0.75,
    backgroundColor: "#F8FAFC",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  doctorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  specialization: {
    marginTop: 2,
    color: "#64748B",
    fontSize: 13,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#86EFAC",
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#16A34A",
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#15803D",
  },
  upcomingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    gap: 4,
  },
  upcomingBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
  },
  completedBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  offBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  offBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#DC2626",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    marginLeft: 8,
    color: "#64748B",
    width: 80,
    fontSize: 13,
    fontWeight: "500",
  },
  infoValue: {
    flex: 1,
    color: "#0F172A",
    fontWeight: "600",
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  toggleTitle: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "600",
  },
  toggleSubtitle: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 2,
  },
  cardActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 8,
  },
  manageBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    gap: 6,
  },
  manageBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
  },
  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    gap: 4,
  },
  detailsBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
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
});
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import { RootStackParamList } from "../../../navigation/AppNavigator";
import CustomTimePicker, {
  TimePickerRef,
  TimeResult,
} from "../../../components/ui/CustomTimePicker";
import StatusModal from "../../../components/ui/StatusModal";
import {
  BackendScheduleRecord,
  DaySchedule,
  Doctor,
  getDoctorByIdApi,
  getDoctorScheduleApi,
  saveDoctorWeeklyScheduleApi,
  SaveWeeklySchedulePayload,
  SessionItem,
  Weekday,
} from "../api/doctor.api";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ALL_DAYS: Weekday[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// =========================================================
// Time Formatting & Conversion Helpers
// =========================================================

/** Converts "14:30:00" or "14:30" to "02:30 PM" */
function formatBackendTimeTo12h(timeStr?: string): string {
  if (!timeStr) return "09:00 AM";
  const trimmed = timeStr.trim();

  // If already 12h
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/i);
  if (match12) {
    const h = String(parseInt(match12[1], 10)).padStart(2, "0");
    return `${h}:${match12[2]} ${match12[3].toUpperCase()}`;
  }

  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (!match24) return "09:00 AM";

  let hour = parseInt(match24[1], 10);
  const min = match24[2];
  const period = hour >= 12 ? "PM" : "AM";
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;

  return `${String(hour).padStart(2, "0")}:${min} ${period}`;
}

/** Converts "02:30 PM" to "14:30" (24-hour) */
function time12hTo24h(str: string): string {
  if (!str) return "09:00";
  const match = str.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/i);
  if (!match) return str.trim();

  let hour = parseInt(match[1], 10);
  const min = match[2];
  const period = match[3].toUpperCase();

  if (period === "AM" && hour === 12) hour = 0;
  if (period === "PM" && hour < 12) hour += 12;

  return `${String(hour).padStart(2, "0")}:${min}`;
}

/** Parses "09:30 AM" into minutes from midnight (0..1440) for comparison */
function time12hToMinutes(str: string): number {
  if (!str) return 0;
  const match = str.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/i);
  if (!match) return 0;

  let hour = parseInt(match[1], 10);
  const min = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === "AM" && hour === 12) hour = 0;
  if (period === "PM" && hour < 12) hour += 12;

  return hour * 60 + min;
}

/** Extracts { hour, minute, period } from "09:30 AM" for CustomTimePicker */
function parse12hToTimeResult(str: string): TimeResult {
  const defaultRes: TimeResult = { hour: "09", minute: "00", period: "AM" };
  if (!str) return defaultRes;

  const match = str.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/i);
  if (!match) return defaultRes;

  return {
    hour: String(parseInt(match[1], 10)).padStart(2, "0"),
    minute: match[2],
    period: match[3].toUpperCase() as "AM" | "PM",
  };
}

function createDefaultWeek(): DaySchedule[] {
  return ALL_DAYS.map((day) => ({
    day,
    enabled: day !== "Sunday", // Monday-Saturday enabled by default
    sessions: [
      {
        id: `${day}-default-1`,
        startTime: "09:00 AM",
        endTime: "01:00 PM",
      },
    ],
  }));
}

export default function DoctorScheduleScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const { t: doctorT } = useTranslation("doctor");

  const doctorId = route.params?.doctorId;

  // =========================================================
  // States
  // =========================================================
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [schedule, setSchedule] = useState<DaySchedule[]>(createDefaultWeek());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const [statusModal, setStatusModal] = useState<{
    visible: boolean;
    type: "success" | "error" | "warning";
    title: string;
    message: string;
  }>({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  const timePickerRef = useRef<TimePickerRef>(null);

  // =========================================================
  // Load Doctor Details & Existing Schedule
  // =========================================================
  const loadData = useCallback(
    async (isRefresh = false) => {
      if (!doctorId) {
        setFetchError(doctorT("doctor_id_missing") || "Doctor ID is missing");
        setLoading(false);
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setFetchError("");

        // Fetch doctor profile & schedule in parallel
        const [docRes, schedRes] = await Promise.all([
          getDoctorByIdApi(doctorId),
          getDoctorScheduleApi(doctorId),
        ]);

        if (docRes?.data) {
          setDoctor(docRes.data);
        }

        const rawSchedules: BackendScheduleRecord[] = schedRes?.data || [];

        // Group backend records by day
        const grouped: Record<string, SessionItem[]> = {};
        const dayAvailability: Record<string, boolean> = {};

        rawSchedules.forEach((rec) => {
          if (!grouped[rec.day]) {
            grouped[rec.day] = [];
            dayAvailability[rec.day] = false;
          }
          if (rec.is_available) {
            dayAvailability[rec.day] = true;
          }
          grouped[rec.day].push({
            id: String(rec.id || Math.random()),
            startTime: formatBackendTimeTo12h(rec.start_time),
            endTime: formatBackendTimeTo12h(rec.end_time),
            slot_duration: rec.slot_duration || 30,
          });
        });

        // Map over all 7 days
        const mappedSchedule: DaySchedule[] = ALL_DAYS.map((day) => {
          const daySessions = grouped[day];
          const isDayEnabled = dayAvailability[day] === true;

          if (daySessions && daySessions.length > 0) {
            return {
              day,
              enabled: isDayEnabled,
              sessions: daySessions,
            };
          }
          return {
            day,
            enabled: false,
            sessions: [
              {
                id: `${day}-s1`,
                startTime: "09:00 AM",
                endTime: "01:00 PM",
              },
            ],
          };
        });

        setSchedule(mappedSchedule);
      } catch (err: any) {
        console.error("Error loading doctor schedule:", err);
        setFetchError(
          err?.message ||
            doctorT("load_schedule_failed") ||
            "Failed to load doctor schedule."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [doctorId, doctorT]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // =========================================================
  // Schedule Manipulation Handlers
  // =========================================================

  const toggleDay = (dayIndex: number) => {
    setSchedule((prev) => {
      const copy = [...prev];
      const target = { ...copy[dayIndex] };
      target.enabled = !target.enabled;

      // If toggled ON and has no sessions, add one default session
      if (target.enabled && (!target.sessions || target.sessions.length === 0)) {
        target.sessions = [
          {
            id: `${target.day}-${Date.now()}`,
            startTime: "09:00 AM",
            endTime: "01:00 PM",
          },
        ];
      }
      copy[dayIndex] = target;
      return copy;
    });
  };

  const addSession = (dayIndex: number) => {
    setSchedule((prev) => {
      const copy = [...prev];
      const target = { ...copy[dayIndex] };

      // Suggest a logical next session slot
      const existingCount = target.sessions.length;
      let newStart = "05:00 PM";
      let newEnd = "08:00 PM";

      if (existingCount > 0) {
        const lastSession = target.sessions[existingCount - 1];
        const lastEndMin = time12hToMinutes(lastSession.endTime);
        if (lastEndMin < 17 * 60) {
          newStart = "05:00 PM";
          newEnd = "08:00 PM";
        } else {
          newStart = "08:00 PM";
          newEnd = "10:00 PM";
        }
      }

      target.sessions = [
        ...target.sessions,
        {
          id: `${target.day}-${Date.now()}-${Math.random()}`,
          startTime: newStart,
          endTime: newEnd,
        },
      ];
      copy[dayIndex] = target;
      return copy;
    });
  };

  const removeSession = (dayIndex: number, sessionId: string) => {
    setSchedule((prev) => {
      const copy = [...prev];
      const target = { ...copy[dayIndex] };
      target.sessions = target.sessions.filter((s) => s.id !== sessionId);
      copy[dayIndex] = target;
      return copy;
    });
  };

  const openTimePicker = (
    dayIndex: number,
    sessionIndex: number,
    field: "startTime" | "endTime"
  ) => {
    const currentVal = schedule[dayIndex]?.sessions[sessionIndex]?.[field] || "";
    const parsed = parse12hToTimeResult(currentVal);

    timePickerRef.current?.open(parsed, (res: TimeResult) => {
      const formatted = `${res.hour}:${res.minute} ${res.period}`;
      setSchedule((prev) => {
        const copy = [...prev];
        const dayItem = { ...copy[dayIndex] };
        const sessionList = [...dayItem.sessions];
        sessionList[sessionIndex] = {
          ...sessionList[sessionIndex],
          [field]: formatted,
        };
        dayItem.sessions = sessionList;
        copy[dayIndex] = dayItem;
        return copy;
      });
    });
  };

  // =========================================================
  // Validation
  // =========================================================

  /** Validates sessions for a single day and returns error string if invalid */
  const getDayError = (dayItem: DaySchedule): string | null => {
    if (!dayItem.enabled) return null;

    if (!dayItem.sessions || dayItem.sessions.length === 0) {
      return (
        doctorT("no_sessions_added") ||
        "Please add at least one session or disable this day."
      );
    }

    const parsed: { startMin: number; endMin: number; idx: number }[] = [];

    for (let i = 0; i < dayItem.sessions.length; i++) {
      const s = dayItem.sessions[i];
      if (!s.startTime || !s.endTime) {
        return (
          doctorT("time_empty_error") || "Please select both start and end times"
        );
      }

      const startMin = time12hToMinutes(s.startTime);
      const endMin = time12hToMinutes(s.endTime);

      if (startMin >= endMin) {
        return `${doctorT("session") || "Session"} ${i + 1}: ${
          doctorT("time_order_error") ||
          "Start time must be earlier than end time"
        }`;
      }

      parsed.push({ startMin, endMin, idx: i + 1 });
    }

    // Check for overlaps
    parsed.sort((a, b) => a.startMin - b.startMin);
    for (let i = 0; i < parsed.length - 1; i++) {
      if (parsed[i].endMin > parsed[i + 1].startMin) {
        return `${doctorT("session") || "Session"} ${parsed[i].idx} & ${
          parsed[i + 1].idx
        }: ${
          doctorT("time_overlap_error") || "Sessions must not overlap with each other"
        }`;
      }
    }

    return null;
  };

  const hasAnyErrors = useMemo(() => {
    return schedule.some((day) => getDayError(day) !== null);
  }, [schedule]);

  // =========================================================
  // Save Schedule
  // =========================================================

  const handleSave = async () => {
    if (saving) return;

    // Check validation
    for (const dayItem of schedule) {
      const err = getDayError(dayItem);
      if (err) {
        setStatusModal({
          visible: true,
          type: "error",
          title: doctorT("error") || "Validation Error",
          message: `${dayItem.day}: ${err}`,
        });
        return;
      }
    }

    try {
      setSaving(true);

      const payload: SaveWeeklySchedulePayload = {
        schedule: schedule.map((d) => ({
          day: d.day,
          enabled: d.enabled,
          sessions: d.sessions.map((s) => ({
            start_time: time12hTo24h(s.startTime || "09:00 AM"),
            end_time: time12hTo24h(s.endTime || "01:00 PM"),
            slot_duration: s.slot_duration || 30,
            is_available: d.enabled,
          })),
        })),
      };

      const res = await saveDoctorWeeklyScheduleApi(doctorId, payload);

      if (res?.status === 1 || res?.status === 200) {
        setStatusModal({
          visible: true,
          type: "success",
          title: doctorT("success") || "Success",
          message:
            res?.message ||
            doctorT("schedule_saved_successfully") ||
            "Doctor weekly schedule saved successfully.",
        });
      } else {
        throw new Error(
          res?.message ||
            doctorT("schedule_save_failed") ||
            "Failed to save schedule."
        );
      }
    } catch (err: any) {
      console.error("Save schedule error:", err);
      setStatusModal({
        visible: true,
        type: "error",
        title: doctorT("error") || "Error",
        message:
          err?.message ||
          doctorT("schedule_save_failed") ||
          "Failed to save doctor schedule.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // Render Loading & Error Views
  // =========================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.navHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>
            {doctorT("doctor_schedule") || "Doctor Schedule"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>
            {doctorT("loading_schedule") || "Loading doctor schedule..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (fetchError) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.navHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>
            {doctorT("doctor_schedule") || "Doctor Schedule"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.centerState}>
          <Ionicons name="alert-circle-outline" size={54} color="#EF4444" />
          <Text style={styles.errorTitle}>
            {doctorT("load_schedule_failed") || "Failed to load schedule"}
          </Text>
          <Text style={styles.errorSubtitle}>{fetchError}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => loadData(false)}
          >
            <Text style={styles.retryText}>{doctorT("retry") || "Retry"}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // =========================================================
  // Main UI
  // =========================================================

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Top App Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.navTitle}>
            {doctorT("weekly_schedule") || "Weekly Schedule"}
          </Text>
          {doctor?.name ? (
            <Text style={styles.navSubtitle} numberOfLines={1}>
              {doctor.name}
            </Text>
          ) : null}
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            colors={["#2563EB"]}
          />
        }
      >
        {/* Doctor Summary Card */}
        {doctor ? (
          <View style={styles.doctorHeaderCard}>
            <View style={styles.docAvatar}>
              <Ionicons name="medkit" size={26} color="#2563EB" />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docName}>{doctor.name}</Text>
              <Text style={styles.docSpec}>
                {doctor.specialization || "General Specialist"}
                {doctor.qualification ? ` • ${doctor.qualification}` : ""}
              </Text>
              {doctor.registration_no ? (
                <Text style={styles.docReg}>
                  Reg: {doctor.registration_no}
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar-outline" size={20} color="#2563EB" />
          <Text style={styles.sectionTitle}>
            {doctorT("manage_schedule_subtitle") ||
              "Configure weekly availability and session timings"}
          </Text>
        </View>

        {/* Monday - Sunday Day Cards */}
        {schedule.map((dayItem, dayIndex) => {
          const dayError = getDayError(dayItem);

          return (
            <View
              key={dayItem.day}
              style={[
                styles.dayCard,
                dayError && styles.dayCardError,
                !dayItem.enabled && styles.dayCardDisabled,
              ]}
            >
              {/* Day Header Row */}
              <View style={styles.cardHeader}>
                <View style={styles.dayTitleRow}>
                  <Text
                    style={[
                      styles.dayName,
                      !dayItem.enabled && styles.dayNameDisabled,
                    ]}
                  >
                    {dayItem.day}
                  </Text>
                  {!dayItem.enabled ? (
                    <View style={styles.holidayBadge}>
                      <Text style={styles.holidayBadgeText}>
                        {doctorT("holiday") || "Closed"}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>
                        {dayItem.sessions.length}{" "}
                        {dayItem.sessions.length === 1 ? "Session" : "Sessions"}
                      </Text>
                    </View>
                  )}
                </View>

                <Switch
                  value={dayItem.enabled}
                  onValueChange={() => toggleDay(dayIndex)}
                  trackColor={{ false: "#CBD5E1", true: "#93C5FD" }}
                  thumbColor={dayItem.enabled ? "#2563EB" : "#94A3B8"}
                />
              </View>

              {/* Day Body */}
              {!dayItem.enabled ? (
                <TouchableOpacity
                  style={styles.closedDayBanner}
                  onPress={() => toggleDay(dayIndex)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="moon-outline"
                    size={18}
                    color="#64748B"
                  />
                  <Text style={styles.closedDayText}>
                    Doctor is off / not consulting on {dayItem.day}. Tap to enable.
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.sessionsContainer}>
                  {dayItem.sessions.map((session, sessionIndex) => (
                    <View key={session.id} style={styles.sessionBox}>
                      <View style={styles.sessionHeaderRow}>
                        <View style={styles.sessionLabelRow}>
                          <View style={styles.sessionIndexBadge}>
                            <Text style={styles.sessionIndexText}>
                              {sessionIndex + 1}
                            </Text>
                          </View>
                          <Text style={styles.sessionTitle}>
                            {doctorT("session") || "Session"}{" "}
                            {sessionIndex + 1}
                          </Text>
                        </View>

                        {dayItem.sessions.length > 1 ? (
                          <TouchableOpacity
                            style={styles.trashBtn}
                            onPress={() =>
                              removeSession(dayIndex, session.id)
                            }
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={18}
                              color="#EF4444"
                            />
                          </TouchableOpacity>
                        ) : null}
                      </View>

                      {/* Time Selectors Row */}
                      <View style={styles.timeButtonsRow}>
                        {/* Start Time Button */}
                        <TouchableOpacity
                          style={styles.timeSelector}
                          onPress={() =>
                            openTimePicker(dayIndex, sessionIndex, "startTime")
                          }
                          activeOpacity={0.75}
                        >
                          <Text style={styles.timeLabel}>
                            {doctorT("start_time") || "Start Time"}
                          </Text>
                          <View style={styles.timeValRow}>
                            <Ionicons
                              name="time-outline"
                              size={16}
                              color="#2563EB"
                            />
                            <Text style={styles.timeValText}>
                              {session.startTime || "--:--"}
                            </Text>
                          </View>
                        </TouchableOpacity>

                        <View style={styles.timeDivider}>
                          <Ionicons
                            name="arrow-forward"
                            size={16}
                            color="#94A3B8"
                          />
                        </View>

                        {/* End Time Button */}
                        <TouchableOpacity
                          style={styles.timeSelector}
                          onPress={() =>
                            openTimePicker(dayIndex, sessionIndex, "endTime")
                          }
                          activeOpacity={0.75}
                        >
                          <Text style={styles.timeLabel}>
                            {doctorT("end_time") || "End Time"}
                          </Text>
                          <View style={styles.timeValRow}>
                            <Ionicons
                              name="time-outline"
                              size={16}
                              color="#16A34A"
                            />
                            <Text style={styles.timeValText}>
                              {session.endTime || "--:--"}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}

                  {/* Add Session Button */}
                  <TouchableOpacity
                    style={styles.addSessionBtn}
                    onPress={() => addSession(dayIndex)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={18}
                      color="#2563EB"
                    />
                    <Text style={styles.addSessionText}>
                      {doctorT("add_session") || "Add Session"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Inline Day Error */}
              {dayError ? (
                <View style={styles.dayErrorBanner}>
                  <Ionicons
                    name="alert-circle"
                    size={16}
                    color="#DC2626"
                  />
                  <Text style={styles.dayErrorText}>{dayError}</Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>

      {/* Sticky Bottom Save Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.saveBtn, (saving || hasAnyErrors) && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving || hasAnyErrors}
          activeOpacity={0.85}
        >
          {saving ? (
            <View style={styles.savingRow}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.saveBtnText}>
                {doctorT("saving_schedule") || "Saving Schedule..."}
              </Text>
            </View>
          ) : (
            <View style={styles.savingRow}>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>
                {doctorT("save_schedule") || "Save Schedule"}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Time Picker Modal */}
      <CustomTimePicker ref={timePickerRef} />

      {/* Feedback Status Modal */}
      <StatusModal
        visible={statusModal.visible}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onClose={() => {
          const wasSuccess = statusModal.type === "success";
          setStatusModal((prev) => ({ ...prev, visible: false }));
          if (wasSuccess) {
            navigation.goBack();
          }
        }}
      />
    </SafeAreaView>
  );
}

// =========================================================
// Styles
// =========================================================
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
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },

  navSubtitle: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "600",
    marginTop: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
  },

  doctorHeaderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  docAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  docInfo: {
    flex: 1,
  },

  docName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  docSpec: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },

  docReg: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 3,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    paddingHorizontal: 4,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginLeft: 8,
    flex: 1,
  },

  dayCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  dayCardDisabled: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
  },

  dayCardError: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dayTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  dayName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginRight: 10,
  },

  dayNameDisabled: {
    color: "#94A3B8",
  },

  holidayBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

  holidayBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },

  activeBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

  activeBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2563EB",
  },

  closedDayBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 8,
  },

  closedDayText: {
    fontSize: 13,
    color: "#64748B",
    marginLeft: 8,
    flex: 1,
  },

  sessionsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  sessionBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  sessionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  sessionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  sessionIndexBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },

  sessionIndexText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "700",
  },

  sessionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },

  trashBtn: {
    padding: 4,
  },

  timeButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  timeSelector: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },

  timeLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 4,
  },

  timeValRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  timeValText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginLeft: 6,
  },

  timeDivider: {
    paddingHorizontal: 8,
  },

  addSessionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#93C5FD",
    borderStyle: "dashed",
    backgroundColor: "#EFF6FF",
    marginTop: 4,
  },

  addSessionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
    marginLeft: 6,
  },

  dayErrorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
  },

  dayErrorText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "500",
    marginLeft: 6,
    flex: 1,
  },

  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  loadingText: {
    fontSize: 15,
    color: "#64748B",
    marginTop: 14,
    fontWeight: "500",
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 14,
  },

  errorSubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },

  retryBtn: {
    marginTop: 20,
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
  },

  saveBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },

  saveBtnDisabled: {
    backgroundColor: "#94A3B8",
  },

  savingRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  saveBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 8,
  },
});
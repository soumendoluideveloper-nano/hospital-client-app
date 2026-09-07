import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import * as Location from "expo-location";

import useAuth from "../../../hooks/useAuth";
import { DashboardData, getDashboardApi } from "../api/dashboard.api";

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { t, i18n } = useTranslation("dashboard");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    total_doctors: 0,
    todays_schedule: 0,
    todays_patients: 0,
    profile_views: 0,
    has_lab: false,
  });

  // =====================================================
  // Fetch Dashboard Metrics
  // =====================================================
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);

      const response = await getDashboardApi();

      if (response && (response.status === 1 || response.status === 200)) {
        setDashboardData({
          total_doctors: Number(response.data?.total_doctors) || 0,
          todays_schedule: Number(response.data?.todays_schedule) || 0,
          todays_patients: Number(response.data?.todays_patients) || 0,
          profile_views: Number(response.data?.profile_views) || 0,
          has_lab: response.data?.has_lab ?? user?.has_lab ?? false,
        });
      } else {
        setError(t("unable_to_load"));
      }
    } catch (err: any) {
      console.log("Fetch dashboard error:", err);
      setError(t("check_connection"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.has_lab, t]);

  // Reload when screen gains focus & verify location permission
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();

      // Proactively prompt for location permission on dashboard open if not determined
      const checkLocationPermission = async () => {
        try {
          const { status } = await Location.getForegroundPermissionsAsync();
          if (status !== "granted") {
            await Location.requestForegroundPermissionsAsync();
          }
        } catch (e) {
          console.log("Dashboard location permission check:", e);
        }
      };
      checkLocationPermission();
    }, [fetchDashboardData])
  );

  // Pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(true);
  };

  // =====================================================
  // Dynamic Greetings & Dates
  // =====================================================
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) return t("good_morning");
    if (hours >= 12 && hours < 17) return t("good_afternoon");
    if (hours >= 17 && hours < 22) return t("good_evening");
    return t("good_night");
  };

  const getFormattedDate = () => {
    const locale = i18n.language === "bn" ? "bn-BD" : "en-US";
    return new Date().toLocaleDateString(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Determine lab permission directly from real backend dashboard / auth context
  const hasLabPermission = Boolean(
    dashboardData.has_lab !== undefined ? dashboardData.has_lab : user?.has_lab
  );

  // =====================================================
  // Stats List (4 Main Required Metrics)
  // =====================================================
  const stats = [
    {
      title: t("total_doctors"),
      value: loading && !refreshing ? null : String(dashboardData.total_doctors),
      icon: "people",
      color: "#2563EB",
      onPress: () => navigation.navigate("Doctors"),
    },
    {
      title: t("todays_schedule"),
      value: loading && !refreshing ? null : String(dashboardData.todays_schedule),
      icon: "time",
      color: "#16A34A",
      onPress: () => navigation.navigate("TodaySchedule"),
    },
    {
      title: t("todays_patients"),
      value: loading && !refreshing ? null : String(dashboardData.todays_patients),
      icon: "fitness",
      color: "#F59E0B",
      onPress: () => navigation.navigate("Enquiries", { filter: "TODAY" }),
    },
    {
      title: t("profile_views"),
      value: loading && !refreshing ? null : String(dashboardData.profile_views),
      icon: "eye",
      color: "#8B5CF6",
      onPress: () => navigation.navigate("Profile"),
    },
  ];

  // =====================================================
  // Core Quick Actions List
  // =====================================================
  const quickActions = [
    {
      title: t("add_doctor"),
      icon: "person-add-outline",
      color: "#2563EB",
      onPress: () => navigation.navigate("AddDoctor"),
    },
    {
      title: t("todays_schedule"),
      icon: "time-outline",
      color: "#16A34A",
      onPress: () => navigation.navigate("TodaySchedule"),
    },
    {
      title: t("doctors_list"),
      icon: "people-outline",
      color: "#2563EB",
      onPress: () => navigation.navigate("Doctors"),
    },
    {
      title: t("enquiries"),
      icon: "chatbubbles-outline",
      color: "#F59E0B",
      onPress: () => navigation.navigate("Enquiries"),
    },
  ];

  // =====================================================
  // Lab Quick Actions (Dynamic - visible only with Lab permission)
  // =====================================================
  const labQuickActions = [
    {
      title: t("lab_tests"),
      icon: "flask-outline",
      color: "#2563EB",
      onPress: () => navigation.navigate("LabTestList"),
    },
    {
      title: t("add_test"),
      icon: "add-circle-outline",
      color: "#16A34A",
      onPress: () => navigation.navigate("AddLabTest"),
    },
    {
      title: t("lab_bookings"),
      icon: "calendar-outline",
      color: "#8B5CF6",
      onPress: () => navigation.navigate("LabBookingList"),
    },
    {
      title: t("upload_report"),
      icon: "cloud-upload-outline",
      color: "#F59E0B",
      onPress: () => navigation.navigate("LabBookingList"),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2563EB"]}
            tintColor="#2563EB"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerLogoBox}>
              <Image
                source={require("../../../../assets/care_spot_icon.png")}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.clinicName} numberOfLines={1}>
                {user?.name || "HealthSpot Clinic"}
              </Text>
              <Text style={styles.date}>{getFormattedDate()}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.notification}
            onPress={() => navigation.navigate("Profile")}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Welcome Card */}
        <LinearGradient
          colors={["#1E40AF", "#1D4ED8", "#2563EB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeCard}
        >
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.welcomeTitle}>{t("welcome_title")}</Text>
            <Text style={styles.welcomeSubTitle}>
              {t("welcome_subtitle")}
            </Text>
          </View>

          <View style={styles.welcomeLogoBox}>
            <Image
              source={require("../../../../assets/care_spot_icon.png")}
              style={styles.welcomeLogo}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>

        {/* Error Notification / Banner */}
        {error && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={22} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => fetchDashboardData()}
            >
              <Text style={styles.retryText}>{t("retry")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Clinic Location Reminder Banner (if latitude/longitude unset) */}
        {(!user?.latitude || !user?.longitude) && (
          <View style={styles.locationAlertCard}>
            <View style={styles.locationAlertIconBox}>
              <Ionicons name="location" size={22} color="#D97706" />
            </View>
            <View style={styles.locationAlertContent}>
              <Text style={styles.locationAlertTitle}>Set Clinic GPS Location</Text>
              <Text style={styles.locationAlertSubText}>
                Set your clinic location on map so nearby patients can see distance and find your clinic!
              </Text>
            </View>
            <TouchableOpacity
              style={styles.locationAlertBtn}
              onPress={() => navigation.navigate("EditProfile")}
              activeOpacity={0.8}
            >
              <Text style={styles.locationAlertBtnText}>Set Map</Text>
              <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Statistics Section */}
        <Text style={styles.sectionTitle}>{t("overview")}</Text>

        <View style={styles.cardContainer}>
          {stats.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: item.color,
                  },
                ]}
              >
                <Ionicons name={item.icon as any} size={22} color="#FFF" />
              </View>

              {item.value === null ? (
                <View style={styles.cardLoader}>
                  <ActivityIndicator size="small" color={item.color} />
                </View>
              ) : (
                <Text style={styles.cardValue}>{item.value}</Text>
              )}

              <Text style={styles.cardTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions Section */}
        <Text style={styles.sectionTitle}>{t("quick_actions")}</Text>

        <View style={styles.quickContainer}>
          {quickActions.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickCard}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.quickIcon, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons
                  name={item.icon as any}
                  size={26}
                  color={item.color}
                />
              </View>

              <Text style={styles.quickText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lab Services Quick Actions (Rendered conditionally if clinic has Lab permission) */}
        {hasLabPermission && (
          <>
            <View style={styles.labSectionHeader}>
              <View style={styles.labBadge}>
                <Ionicons name="flask" size={14} color="#2563EB" />
                <Text style={styles.labBadgeText}>{t("lab_enabled")}</Text>
              </View>
              <Text style={styles.sectionTitleWithoutMargin}>{t("laboratory_actions")}</Text>
            </View>

            <View style={styles.quickContainer}>
              {labQuickActions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickCard}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.quickIcon, { backgroundColor: "#EFF6FF" }]}>
                    <Ionicons
                      name={item.icon as any}
                      size={26}
                      color={item.color}
                    />
                  </View>

                  <Text style={styles.quickText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollContent: {
    paddingBottom: 40,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  headerLogoBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    shadowColor: "#0284C7",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    padding: 6,
  },

  headerLogo: {
    width: "100%",
    height: "100%",
  },

  greeting: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
  },

  clinicName: {
    marginTop: 2,
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },

  date: {
    marginTop: 2,
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "500",
  },

  notification: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    marginLeft: 10,
  },

  welcomeCard: {
    marginHorizontal: 20,
    marginTop: 22,
    borderRadius: 22,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#1D4ED8",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },

  welcomeLogoBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  welcomeLogo: {
    width: "100%",
    height: "100%",
  },

  welcomeTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  welcomeSubTitle: {
    marginTop: 8,
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    lineHeight: 20,
  },

  errorCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  errorText: {
    flex: 1,
    marginLeft: 8,
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "500",
  },

  retryBtn: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  locationAlertCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FDE68A",
    elevation: 2,
    shadowColor: "#D97706",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  locationAlertIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  locationAlertContent: {
    flex: 1,
    paddingRight: 6,
  },

  locationAlertTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 2,
  },

  locationAlertSubText: {
    fontSize: 11,
    color: "#B45309",
    lineHeight: 15,
  },

  locationAlertBtn: {
    backgroundColor: "#D97706",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 4,
  },

  locationAlertBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 14,
    fontSize: 19,
    fontWeight: "700",
    color: "#0F172A",
  },

  labSectionHeader: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  sectionTitleWithoutMargin: {
    fontSize: 19,
    fontWeight: "700",
    color: "#0F172A",
  },

  labBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },

  labBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
  },

  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },

  cardLoader: {
    height: 36,
    marginTop: 14,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  cardValue: {
    marginTop: 14,
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
  },

  cardTitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },

  quickContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  quickCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  quickIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  quickText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
});
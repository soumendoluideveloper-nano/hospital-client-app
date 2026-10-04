import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  RootStackParamList,
} from "../../../navigation/AppNavigator";

import {
  getDoctorByIdApi,
  deleteDoctorApi,
} from "../api/doctor.api";
import StatusModal from "../../../components/ui/StatusModal";

import { useTranslation } from "react-i18next";

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;

type RouteProp =
  ReturnType<
    typeof useRoute
  >;

export default function DoctorDetailsScreen() {
  const navigation =
    useNavigation<NavigationProp>();

  const route =
    useRoute<any>();

  const { t: doctor } =
    useTranslation("doctor");

  const doctorId =
    route.params?.doctorId || route.params?.id || route.params?.doctor?.id;

  const initialDoctor = route.params?.doctor;

  const [doctorData, setDoctorData] =
    useState<any>(initialDoctor || null);

  const [loading, setLoading] =
    useState(!initialDoctor);

  const [error, setError] =
    useState("");

  const [deleting, setDeleting] =
    useState(false);

  const [statusModal, setStatusModal] = useState<{
    visible: boolean;
    type: "success" | "error" | "warning";
    title: string;
    message: string;
    showCancel?: boolean;
    buttonText?: string;
    cancelText?: string;
    confirmButtonColor?: string;
    onConfirm?: () => void;
  }>({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  // =====================================================
  // Load Doctor
  // =====================================================

  const loadDoctor = useCallback(
    async () => {
      try {
        if (!initialDoctor && !doctorData) {
          setLoading(true);
        }
        setError("");

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
          "Doctor Details Response:",
          response
        );

        const data = (response as any)?.data?.doctor || response?.data || response;
        if (data) {
          setDoctorData((prev: any) => ({
            ...(initialDoctor || {}),
            ...(prev || {}),
            ...data,
            phone:
              data.phone ||
              data.mobile ||
              data.contact_number ||
              data.phone_number ||
              prev?.phone ||
              prev?.mobile ||
              initialDoctor?.phone ||
              initialDoctor?.mobile ||
              data.clinic?.phone ||
              "",
            email:
              data.email ||
              data.email_id ||
              data.mail ||
              prev?.email ||
              initialDoctor?.email ||
              data.clinic?.email ||
              "",
          }));
        }
      } catch (err: any) {
        console.log(
          "Doctor Details Error:",
          err
        );

        if (!doctorData && !initialDoctor) {
          setError(
            err?.message ||
              doctor(
                "load_doctor_failed"
              )
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [
      doctor,
      doctorId,
      initialDoctor,
    ]
  );

  useFocusEffect(
    useCallback(() => {
      loadDoctor();
    }, [loadDoctor])
  );

  const handleNavBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Dashboard");
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
            onPress={handleNavBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>{doctor("doctor_information")}</Text>
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
  // Error
  // =====================================================

  if (error || !doctorData) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["top"]}
      >
        <View style={styles.navHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleNavBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>{doctor("doctor_information")}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View
          style={
            styles.errorContainer
          }
        >
          <View
            style={
              styles.errorIcon
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={42}
              color="#DC2626"
            />
          </View>

          <Text
            style={
              styles.errorTitle
            }
          >
            {doctor(
              "doctor_not_found"
            )}
          </Text>

          <Text
            style={
              styles.errorMessage
            }
          >
            {error ||
              doctor(
                "load_doctor_failed"
              )}
          </Text>

          <TouchableOpacity
            style={
              styles.retryButton
            }
            onPress={loadDoctor}
          >
            <Text
              style={
                styles.retryButtonText
              }
            >
              {doctor("retry")}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // =====================================================
  // Doctor Avatar
  // =====================================================

  const firstLetter =
    doctorData.name
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "D";

  // =====================================================
  // Delete
  // =====================================================

  const handleDelete = () => {
    if (deleting) return;
    const docName = doctorData?.name ? `Dr. ${doctorData.name.replace(/^Dr\.\s*/i, "")}` : "this doctor";
    setStatusModal({
      visible: true,
      type: "warning",
      title: doctor("delete_doctor_title") || "Delete Doctor",
      message: doctor("delete_doctor_confirmation") || `Are you sure you want to delete ${docName}? This will remove the doctor from your clinic.`,
      showCancel: true,
      buttonText: doctor("delete") || "Delete",
      cancelText: doctor("cancel") || "Cancel",
      confirmButtonColor: "#DC2626",
      onConfirm: async () => {
        try {
          setDeleting(true);
          const res = await deleteDoctorApi(doctorId);
          if (res.status === 1 || res.status === 200 || (res as any).success) {
            setStatusModal({
              visible: true,
              type: "success",
              title: doctor("delete_success_title") || "Doctor Deleted",
              message: doctor("delete_success_message") || "The doctor has been removed successfully from your clinic.",
              showCancel: false,
              buttonText: doctor("ok") || "OK",
              onConfirm: handleNavBack,
            });
          } else {
            throw new Error(res.message || doctor("delete_failed") || "Failed to delete doctor");
          }
        } catch (err: any) {
          setStatusModal({
            visible: true,
            type: "error",
            title: doctor("error") || "Error",
            message: err?.message || doctor("delete_failed") || "Failed to delete doctor. Please try again.",
            showCancel: false,
            buttonText: doctor("ok") || "OK",
          });
        } finally {
          setDeleting(false);
        }
      },
    });
  };

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
          onPress={handleNavBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{doctor("doctor_information")}</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() =>
            navigation.navigate("EditDoctor", {
              doctorId: String(doctorId),
              doctor: doctorData || initialDoctor,
            })
          }
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={22} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        {/* =================================================
            Profile Header
        ================================================= */}

        <View
          style={
            styles.profileCard
          }
        >
          <View
            style={
              styles.avatarWrapper
            }
          >
            <View
              style={
                styles.avatar
              }
            >
              {doctorData.profile_image ? (
                <Image
                  source={{
                    uri:
                      doctorData.profile_image,
                  }}
                  style={
                    styles.avatarImage
                  }
                />
              ) : (
                <Text
                  style={
                    styles.avatarText
                  }
                >
                  {firstLetter}
                </Text>
              )}
            </View>

            {/* Active Indicator */}

            {doctorData.status ===
              "Active" && (
              <View
                style={
                  styles.onlineDot
                }
              />
            )}
          </View>

          <Text
            style={styles.name}
          >
            {doctorData.name}
          </Text>

          <Text
            style={
              styles.specialization
            }
          >
            {
              doctorData.specialization
            }
          </Text>

          {doctorData.qualification && (
            <Text
              style={
                styles.qualification
              }
            >
              {
                doctorData.qualification
              }
            </Text>
          )}

          <View
            style={
              styles.statusBadge
            }
          >
            <View
              style={
                styles.statusBadgeDot
              }
            />

            <Text
              style={
                styles.statusBadgeText
              }
            >
              {doctorData.status ||
                "Active"}
            </Text>
          </View>
        </View>

        {/* =================================================
            Doctor Information
        ================================================= */}

        <Text
          style={styles.sectionTitle}
        >
          {doctor(
            "doctor_information"
          )}
        </Text>

        <View
          style={styles.infoCard}
        >
          <InfoRow
            icon="call-outline"
            label={doctor(
              "mobile"
            )}
            value={
              doctorData.phone ||
              doctorData.mobile ||
              doctorData.contact_number ||
              doctorData.phone_number ||
              doctorData.clinic?.phone ||
              doctor("not_available")
            }
          />

          <InfoRow
            icon="mail-outline"
            label={doctor(
              "email"
            )}
            value={
              doctorData.email ||
              doctorData.email_id ||
              doctorData.mail ||
              doctorData.clinic?.email ||
              doctor("not_available")
            }
          />

          <InfoRow
            icon="school-outline"
            label={doctor(
              "qualification"
            )}
            value={
              doctorData.qualification ||
              doctor("not_available")
            }
          />

          <InfoRow
            icon="briefcase-outline"
            label={doctor(
              "experience"
            )}
            value={
              doctorData.experience !=
              null
                ? `${doctorData.experience} ${doctor(
                    "years"
                  )}`
                : doctor(
                    "not_available"
                  )
            }
          />

          <InfoRow
            icon="card-outline"
            label={doctor(
              "registration"
            )}
            value={
              doctorData.registration_no ||
              doctor("not_available")
            }
            last
          />

          <InfoRow
            icon="cash-outline"
            label={doctor(
              "consultation_fee"
            )}
            value={
              doctorData.consultation_fee
                ? `₹${doctorData.consultation_fee}`
                : doctor(
                    "not_available"
                  )
            }
            last
          />
        </View>

        {/* =================================================
            About
        ================================================= */}

        {doctorData.about ? (
          <>
            <Text
              style={
                styles.sectionTitle
              }
            >
              {doctor("about")}
            </Text>

            <View
              style={
                styles.aboutCard
              }
            >
              <Text
                style={
                  styles.aboutText
                }
              >
                {doctorData.about}
              </Text>
            </View>
          </>
        ) : null}

        {/* =================================================
            Schedule Summary
        ================================================= */}

        <Text
          style={styles.sectionTitle}
        >
          {doctor(
            "schedule"
          )}
        </Text>

        <TouchableOpacity
          style={
            styles.scheduleCard
          }
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate(
              "DoctorSchedule",
              {
                doctorId:
                  doctorId.toString(),
                doctor: doctorData || initialDoctor,
              }
            )
          }
        >
          <View
            style={
              styles.scheduleIcon
            }
          >
            <Ionicons
              name="time-outline"
              size={24}
              color="#16A34A"
            />
          </View>

          <View
            style={
              styles.scheduleContent
            }
          >
            <Text
              style={
                styles.scheduleTitle
              }
            >
              {doctor(
                "manage_schedule"
              )}
            </Text>

            <Text
              style={
                styles.scheduleSubtitle
              }
            >
              {doctor(
                "manage_doctor_schedule"
              )}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#94A3B8"
          />
        </TouchableOpacity>

        {/* =================================================
            Quick Actions
        ================================================= */}

        <Text
          style={styles.sectionTitle}
        >
          {doctor(
            "quick_actions"
          )}
        </Text>

        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate(
              "EditDoctor",
              {
                doctorId:
                  doctorId.toString(),
                doctor: doctorData || initialDoctor,
              }
            )
          }
        >
          <View
            style={
              styles.actionIconBlue
            }
          >
            <Ionicons
              name="create-outline"
              size={22}
              color="#2563EB"
            />
          </View>

          <Text
            style={
              styles.actionText
            }
          >
            {doctor(
              "edit_doctor"
            )}
          </Text>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#94A3B8"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.85}
          onPress={() => {
            navigation.navigate("Dashboard", {
              screen: "Enquiries",
              params: { doctorId: doctorId, filter: "ALL" },
            } as any);
          }}
        >
          <View
            style={
              styles.actionIconOrange
            }
          >
            <Ionicons
              name="calendar-outline"
              size={22}
              color="#F59E0B"
            />
          </View>

          <Text
            style={
              styles.actionText
            }
          >
            {doctor(
              "appointments"
            )}
          </Text>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#94A3B8"
          />
        </TouchableOpacity>

        {/* =================================================
            Delete
        ================================================= */}

        <TouchableOpacity
          style={styles.deleteCard}
          activeOpacity={0.85}
          onPress={
            handleDelete
          }
        >
          <View
            style={
              styles.deleteIcon
            }
          >
            <Ionicons
              name="trash-outline"
              size={22}
              color="#EF4444"
            />
          </View>

          <Text
            style={
              styles.deleteText
            }
          >
            {doctor(
              "delete_doctor"
            )}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <StatusModal
        visible={statusModal.visible}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        showCancel={statusModal.showCancel}
        buttonText={statusModal.buttonText || doctor("ok")}
        cancelText={statusModal.cancelText || doctor("cancel")}
        confirmButtonColor={statusModal.confirmButtonColor}
        onClose={() => setStatusModal((prev) => ({ ...prev, visible: false }))}
        onCancel={() => setStatusModal((prev) => ({ ...prev, visible: false }))}
        onConfirm={() => {
          const cb = statusModal.onConfirm;
          setStatusModal((prev) => ({ ...prev, visible: false }));
          cb?.();
        }}
      />
    </SafeAreaView>
  );
}

// =====================================================
// Info Row
// =====================================================

function InfoRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.infoRow,
        !last &&
          styles.infoRowBorder,
      ]}
    >
      <View
        style={
          styles.infoIcon
        }
      >
        <Ionicons
          name={icon}
          size={19}
          color="#2563EB"
        />
      </View>

      <View
        style={
          styles.infoContent
        }
      >
        <Text
          style={
            styles.infoLabel
          }
        >
          {label}
        </Text>

        <Text
          style={
            styles.infoValue
          }
        >
          {value}
        </Text>
      </View>
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
    paddingBottom: 40,
  },

  // ===================================================
  // Loading
  // ===================================================

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

  // ===================================================
  // Error
  // ===================================================

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  errorIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },

  errorTitle: {
    marginTop: 18,
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },

  errorMessage: {
    marginTop: 8,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 21,
  },

  retryButton: {
    marginTop: 20,
    backgroundColor: "#2563EB",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  // ===================================================
  // Profile
  // ===================================================

  profileCard: {
    marginHorizontal: 16,
    marginTop: 16,

    backgroundColor: "#FFFFFF",

    borderRadius: 24,

    paddingVertical: 28,
    paddingHorizontal: 20,

    alignItems: "center",

    borderWidth: 1,
    borderColor: "#E0EAFF",

    shadowColor: "#2563EB",
    shadowOpacity: 0.08,
    shadowRadius: 14,

    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 4,
  },

  avatarWrapper: {
    position: "relative",
  },

  avatar: {
    width: 112,
    height: 112,

    borderRadius: 56,

    backgroundColor: "#EEF5FF",

    justifyContent: "center",
    alignItems: "center",

    overflow: "hidden",

    borderWidth: 3,
    borderColor: "#DCEBFF",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  avatarText: {
    fontSize: 44,
    fontWeight: "800",
    color: "#2563EB",
  },

  onlineDot: {
    position: "absolute",

    right: 4,
    bottom: 5,

    width: 20,
    height: 20,

    borderRadius: 10,

    backgroundColor: "#22C55E",

    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  name: {
    marginTop: 17,

    fontSize: 24,

    fontWeight: "800",

    color: "#0F172A",

    textAlign: "center",
  },

  specialization: {
    marginTop: 5,

    color: "#2563EB",

    fontSize: 16,

    fontWeight: "700",

    textAlign: "center",
  },

  qualification: {
    marginTop: 5,

    color: "#64748B",

    fontSize: 14,

    textAlign: "center",
  },

  statusBadge: {
    marginTop: 12,

    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#ECFDF5",

    paddingHorizontal: 12,
    paddingVertical: 6,

    borderRadius: 20,
  },

  statusBadgeDot: {
    width: 7,
    height: 7,

    borderRadius: 4,

    backgroundColor: "#22C55E",

    marginRight: 6,
  },

  statusBadgeText: {
    color: "#15803D",

    fontSize: 12,

    fontWeight: "700",
  },

  // ===================================================
  // Section
  // ===================================================

  sectionTitle: {
    marginHorizontal: 20,

    marginTop: 22,
    marginBottom: 12,

    fontSize: 18,

    fontWeight: "800",

    color: "#0F172A",
  },

  // ===================================================
  // Info Card
  // ===================================================

  infoCard: {
    marginHorizontal: 16,

    backgroundColor: "#FFFFFF",

    borderRadius: 20,

    paddingHorizontal: 16,

    borderWidth: 1,
    borderColor: "#E5EDF8",

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  infoRow: {
    flexDirection: "row",

    alignItems: "center",

    paddingVertical: 14,
  },

  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  infoIcon: {
    width: 40,
    height: 40,

    borderRadius: 12,

    backgroundColor: "#EEF5FF",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,

    color: "#94A3B8",

    fontWeight: "500",
  },

  infoValue: {
    marginTop: 3,

    fontSize: 15,

    color: "#0F172A",

    fontWeight: "600",
  },

  // ===================================================
  // About
  // ===================================================

  aboutCard: {
    marginHorizontal: 16,

    backgroundColor: "#FFFFFF",

    borderRadius: 20,

    padding: 18,

    borderWidth: 1,
    borderColor: "#E5EDF8",

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  aboutText: {
    color: "#475569",

    fontSize: 15,

    lineHeight: 24,
  },

  // ===================================================
  // Schedule
  // ===================================================

  scheduleCard: {
    marginHorizontal: 16,

    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    padding: 15,

    flexDirection: "row",

    alignItems: "center",

    borderWidth: 1,
    borderColor: "#DCFCE7",

    shadowColor: "#16A34A",
    shadowOpacity: 0.05,
    shadowRadius: 8,

    elevation: 2,
  },

  scheduleIcon: {
    width: 46,
    height: 46,

    borderRadius: 14,

    backgroundColor: "#F0FDF4",

    justifyContent: "center",
    alignItems: "center",
  },

  scheduleContent: {
    flex: 1,

    marginLeft: 13,
  },

  scheduleTitle: {
    fontSize: 15,

    fontWeight: "700",

    color: "#0F172A",
  },

  scheduleSubtitle: {
    marginTop: 4,

    fontSize: 12,

    color: "#64748B",
  },

  // ===================================================
  // Actions
  // ===================================================

  actionCard: {
    marginHorizontal: 16,

    marginBottom: 12,

    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    padding: 15,

    flexDirection: "row",

    alignItems: "center",

    borderWidth: 1,
    borderColor: "#E5EDF8",

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  actionIconBlue: {
    width: 46,
    height: 46,

    borderRadius: 14,

    backgroundColor: "#EEF5FF",

    justifyContent: "center",
    alignItems: "center",
  },

  actionIconOrange: {
    width: 46,
    height: 46,

    borderRadius: 14,

    backgroundColor: "#FFF7ED",

    justifyContent: "center",
    alignItems: "center",
  },

  actionText: {
    flex: 1,

    marginLeft: 13,

    fontSize: 15,

    fontWeight: "700",

    color: "#0F172A",
  },

  // ===================================================
  // Delete
  // ===================================================

  deleteCard: {
    marginHorizontal: 16,

    marginTop: 10,

    marginBottom: 20,

    backgroundColor: "#FFF7F7",

    borderRadius: 18,

    padding: 15,

    flexDirection: "row",

    alignItems: "center",

    borderWidth: 1,
    borderColor: "#FECACA",
  },

  deleteIcon: {
    width: 46,
    height: 46,

    borderRadius: 14,

    backgroundColor: "#FEE2E2",

    justifyContent: "center",
    alignItems: "center",
  },

  deleteText: {
    marginLeft: 13,

    color: "#DC2626",

    fontWeight: "800",

    fontSize: 15,
  },
});
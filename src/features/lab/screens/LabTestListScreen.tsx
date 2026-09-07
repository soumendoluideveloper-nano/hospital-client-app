import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
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
  deleteLabTestApi,
  getMyLabTestsApi,
  LabTest,
} from "../api/lab.api";
import StatusModal from "../../../components/ui/StatusModal";

type CategoryKey = "All" | "Radiology" | "Pathology" | "Ultrasound" | "Cardiology" | "General";

export default function LabTestListScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation("lab");

  const [tests, setTests] = useState<LabTest[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Deactivation confirmation modal state
  const [deactivatingTest, setDeactivatingTest] = useState<LabTest | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

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

  const categoryTabs = useMemo(() => [
    { key: "All" as const, label: t("category_all") },
    { key: "Radiology" as const, label: "🩻 " + (t("cancel") === "Cancel" ? "Radiology (X-Ray/CT/MRI)" : "রেডিওলজি (X-Ray/CT/MRI)") },
    { key: "Pathology" as const, label: "🧪 " + (t("cancel") === "Cancel" ? "Pathology (Blood/Urine)" : "প্যাথলজি (ব্লাড/ইউরিন)") },
    { key: "Ultrasound" as const, label: "📡 " + (t("cancel") === "Cancel" ? "Ultrasound (USG)" : "আল্ট্রাসাউন্ড (USG)") },
    { key: "Cardiology" as const, label: "🫀 " + (t("cancel") === "Cancel" ? "Cardiology (ECG/Echo)" : "কার্ডিওলজি (ECG/Echo)") },
    { key: "General" as const, label: "🔬 " + (t("cancel") === "Cancel" ? "General" : "অন্যান্য") },
  ], [t]);

  const fetchTests = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const res = await getMyLabTestsApi(1, 50, selectedCategory === "All" ? undefined : selectedCategory);
      if (res && res.status === 1) {
        setTests(res.data || []);
      } else {
        setError(res.message || t("error_loading_tests"));
      }
    } catch (err: any) {
      console.log("Fetch lab tests error:", err);
      setError(err?.message || t("error_loading_tests"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, t]);

  useFocusEffect(
    useCallback(() => {
      fetchTests();
    }, [fetchTests])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTests(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivatingTest) return;

    try {
      setDeletingLoading(true);
      const res = await deleteLabTestApi(deactivatingTest.id);
      if (res && res.status === 1) {
        const testName = deactivatingTest.test_name;
        setDeactivatingTest(null);
        fetchTests(true);
        setStatusModal({
          visible: true,
          type: "success",
          title: t("test_updated_success"),
          message: `"${testName}" ${t("active_status_disabled").toLowerCase()}`,
        });
      } else {
        setStatusModal({
          visible: true,
          type: "error",
          title: t("error_loading_tests"),
          message: res.message || "Failed to delete test",
        });
      }
    } catch (e: any) {
      setStatusModal({
        visible: true,
        type: "error",
        title: t("error_loading_tests"),
        message: e?.message || "Failed to delete test",
      });
    } finally {
      setDeletingLoading(false);
    }
  };

  const getTestVisual = (item: LabTest) => {
    const name = item.test_name.toLowerCase();
    const cat = (item.category || "").toLowerCase();

    if (cat.includes("radio") || name.includes("x-ray") || name.includes("ct scan") || name.includes("mri") || name.includes("xray")) {
      return { icon: "scan-outline" as const, color: "#2563EB", bg: "#EFF6FF", label: "Radiology / Imaging" };
    }
    if (cat.includes("ultra") || name.includes("usg") || name.includes("ultrasound") || name.includes("sono")) {
      return { icon: "radio-outline" as const, color: "#7C3AED", bg: "#F5F3FF", label: "Ultrasound (USG)" };
    }
    if (cat.includes("cardio") || name.includes("ecg") || name.includes("echo") || name.includes("tmt")) {
      return { icon: "heart-outline" as const, color: "#DC2626", bg: "#FEF2F2", label: "Cardiology" };
    }
    if (cat.includes("patho") || name.includes("blood") || name.includes("cbc") || name.includes("lft") || name.includes("urine") || name.includes("sugar")) {
      return { icon: "flask-outline" as const, color: "#059669", bg: "#ECFDF5", label: "Pathology" };
    }
    return { icon: "medical-outline" as const, color: "#2563EB", bg: "#EFF6FF", label: item.category || "Diagnostic" };
  };

  const filteredTests = useMemo(() => {
    return tests.filter((tItem) => {
      let matchCategory = true;
      if (selectedCategory !== "All") {
        matchCategory = (tItem.category || "General").toLowerCase() === selectedCategory.toLowerCase();
      }

      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        tItem.test_name.toLowerCase().includes(q) ||
        (tItem.category && tItem.category.toLowerCase().includes(q)) ||
        (tItem.description && tItem.description.toLowerCase().includes(q));

      return matchCategory && matchSearch;
    });
  }, [tests, search, selectedCategory]);

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

        <Text style={styles.headerTitle}>{t("lab_test_catalog")}</Text>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate("AddLabTest")}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categoryTabs}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.tabsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tabItem,
                selectedCategory === item.key && styles.tabItemActive,
              ]}
              onPress={() => setSelectedCategory(item.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedCategory === item.key && styles.tabTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Search Box */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder={t("search_tests")}
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

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loaderText}>{t("loading_tests")}</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
          <Text style={styles.errorTitle}>{t("error_loading_tests")}</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchTests()}>
            <Text style={styles.retryBtnText}>{t("cancel") === "Cancel" ? "Retry" : "পুনরায় চেষ্টা করুন"}</Text>
          </TouchableOpacity>
        </View>
      ) : filteredTests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="scan-outline" size={60} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>
            {search ? t("no_matching_tests") : t("no_tests_title")}
          </Text>
          <Text style={styles.emptySubtitle}>
            {search
              ? t("try_diff_search")
              : t("no_tests_subtitle")}
          </Text>
          {!search && (
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => navigation.navigate("AddLabTest")}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.emptyAddBtnText}>{t("add_first_test")}</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredTests}
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
            const visual = getTestVisual(item);
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={[styles.cardIconBox, { backgroundColor: visual.bg }]}>
                    <Ionicons name={visual.icon} size={22} color={visual.color} />
                  </View>
                  <View style={styles.cardMain}>
                    <View style={styles.nameCategoryRow}>
                      <Text style={styles.testName} numberOfLines={1}>
                        {item.test_name}
                      </Text>
                    </View>
                    <View style={styles.categoryBadgeRow}>
                      <Text style={[styles.categoryBadgeText, { color: visual.color }]}>
                        {visual.label}
                      </Text>
                    </View>
                    <Text style={styles.testDesc} numberOfLines={2}>
                      {item.description || "—"}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      item.status === "Active"
                        ? styles.badgeActive
                        : styles.badgeInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        item.status === "Active"
                          ? styles.badgeActiveText
                          : styles.badgeInactiveText,
                      ]}
                    >
                      {item.status === "Active" ? (t("cancel") === "Cancel" ? "Active" : "সক্রিয়") : (t("cancel") === "Cancel" ? "Inactive" : "নিষ্ক্রিয়")}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.cardDetailsRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="cash-outline" size={16} color="#16A34A" />
                    <Text style={styles.detailLabel}>{t("price_label")}</Text>
                    <Text style={styles.priceValue}>₹{item.price}</Text>
                  </View>

                  {item.report_duration ? (
                    <View style={styles.detailItem}>
                      <Ionicons name="time-outline" size={16} color="#2563EB" />
                      <Text style={styles.detailLabel}>{t("turnaround_label")}</Text>
                      <Text style={styles.durationValue}>{item.report_duration}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.actionBtnEdit}
                    onPress={() => navigation.navigate("EditLabTest", { test: item })}
                  >
                    <Ionicons name="create-outline" size={16} color="#2563EB" />
                    <Text style={styles.actionBtnEditText}>{t("edit")}</Text>
                  </TouchableOpacity>

                  {item.status === "Active" && (
                    <TouchableOpacity
                      style={styles.actionBtnDelete}
                      onPress={() => setDeactivatingTest(item)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#DC2626" />
                      <Text style={styles.actionBtnDeleteText}>{t("deactivate")}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Confirmation Modal */}
      <Modal
        visible={!!deactivatingTest}
        transparent
        animationType="fade"
        onRequestClose={() => setDeactivatingTest(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.warningIconBox}>
              <Ionicons name="warning-outline" size={42} color="#D97706" />
            </View>

            <Text style={styles.modalTitle}>{t("deactivate_confirm_title")}</Text>
            <Text style={styles.modalMessage}>
              {deactivatingTest
                ? t("deactivate_confirm_msg", { name: deactivatingTest.test_name })
                : ""}
            </Text>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setDeactivatingTest(null)}
                disabled={deletingLoading}
              >
                <Text style={styles.modalCancelBtnText}>{t("cancel")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalDeleteBtn, deletingLoading && { opacity: 0.7 }]}
                onPress={handleConfirmDeactivate}
                disabled={deletingLoading}
              >
                {deletingLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalDeleteBtnText}>{t("deactivate")}</Text>
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
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 10,
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
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 30,
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
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  cardIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  cardMain: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  nameCategoryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  testName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  categoryBadgeRow: {
    marginTop: 2,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  testDesc: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: "#DCFCE7",
  },
  badgeInactive: {
    backgroundColor: "#FEE2E2",
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  badgeActiveText: {
    color: "#16A34A",
  },
  badgeInactiveText: {
    color: "#DC2626",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },
  cardDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 13,
    color: "#64748B",
    marginLeft: 6,
    marginRight: 4,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#16A34A",
  },
  durationValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 14,
    gap: 10,
  },
  actionBtnEdit: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
  },
  actionBtnEditText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
    marginLeft: 4,
  },
  actionBtnDelete: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
  },
  actionBtnDeleteText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#DC2626",
    marginLeft: 4,
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
  emptyAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 20,
  },
  emptyAddBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  warningIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  modalMessage: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
  },
  modalButtonsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalCancelBtn: {
    flex: 1,
    height: 50,
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
  modalDeleteBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
  },
  modalDeleteBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

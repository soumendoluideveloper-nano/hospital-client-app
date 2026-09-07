import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import { useFocusEffect, useNavigation } from "@react-navigation/native";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import { useTranslation } from "react-i18next";

import {
  RootStackParamList,
} from "../../../navigation/AppNavigator";

import {
  Doctor,
  listDoctorsApi,
} from "../api/doctor.api";

export default function DoctorListScreen() {
  const { t: doctor } =
    useTranslation("doctor");

  type NavigationProp =
    NativeStackNavigationProp<
      RootStackParamList
    >;

  const navigation =
    useNavigation<NavigationProp>();

  // =====================================================
  // State
  // =====================================================

  const [doctors, setDoctors] =
    useState<Doctor[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [hasMore, setHasMore] =
    useState(true);

  // =====================================================
  // Load Doctors
  // =====================================================

  const loadDoctors = useCallback(
    async (
      pageNumber: number = 1,
      searchValue: string = "",
      isRefresh: boolean = false
    ) => {
      try {
        if (pageNumber === 1) {
          if (isRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }
        } else {
          setLoadingMore(true);
        }

        setError("");

        const response =
          await listDoctorsApi(
            pageNumber,
            10,
            searchValue
          );

        console.log(
          "Doctor List Response:",
          response
        );

        const newDoctors =
          response?.data || [];

        const meta =
          response?.meta;

        // =================================================
        // First Page
        // =================================================

        if (pageNumber === 1) {
          setDoctors(newDoctors);
        }

        // =================================================
        // Next Page
        // =================================================

        else {
          setDoctors((previous) => [
            ...previous,
            ...newDoctors,
          ]);
        }

        setPage(
          meta?.page || pageNumber
        );

        setTotalPages(
          meta?.total_pages || 1
        );

        setHasMore(
          pageNumber <
            (meta?.total_pages || 1)
        );
      } catch (err: any) {
        console.log(
          "Doctor List Error:",
          err
        );

        setError(
          err?.message ||
            doctor(
              "load_doctors_failed"
            )
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [doctor]
  );

  // =====================================================
  // Focus API (Refreshes on screen open/focus)
  // =====================================================

  useFocusEffect(
    useCallback(() => {
      loadDoctors(1, search.trim());
    }, [loadDoctors, search])
  );

  // =====================================================
  // Search
  // =====================================================

  const handleSearch = (
    text: string
  ) => {
    setSearch(text);
  };

  // =====================================================
  // Debounced Search API
  // =====================================================

  useEffect(() => {
    if (!search.trim()) {
      return;
    }

    const timer =
      setTimeout(() => {
        setPage(1);
        setHasMore(true);

        loadDoctors(
          1,
          search.trim()
        );
      }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [
    search,
    loadDoctors,
  ]);

  // =====================================================
  // Clear Search
  // =====================================================

  const handleClearSearch = () => {
    setSearch("");

    setPage(1);
    setHasMore(true);

    loadDoctors(1, "");
  };

  // =====================================================
  // Pull To Refresh
  // =====================================================

  const handleRefresh = () => {
    setPage(1);
    setHasMore(true);

    loadDoctors(
      1,
      search.trim(),
      true
    );
  };

  // =====================================================
  // Load More
  // =====================================================

  const handleLoadMore = () => {
    if (
      loading ||
      loadingMore ||
      !hasMore
    ) {
      return;
    }

    const nextPage =
      page + 1;

    if (
      nextPage >
      totalPages
    ) {
      setHasMore(false);
      return;
    }

    loadDoctors(
      nextPage,
      search.trim()
    );
  };

  // =====================================================
  // Doctor Avatar
  // =====================================================

  const renderAvatar = (
    item: Doctor
  ) => {
    if (item.profile_image) {
      return (
        <Image
          source={{
            uri: item.profile_image,
          }}
          style={styles.avatarImage}
        />
      );
    }

    const firstLetter =
      item.name
        ?.trim()
        ?.charAt(0)
        ?.toUpperCase() || "D";

    return (
      <Text style={styles.avatarText}>
        {firstLetter}
      </Text>
    );
  };

  // =====================================================
  // Doctor Item
  // =====================================================

  const renderItem = ({
    item,
  }: {
    item: Doctor;
  }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate(
            "DoctorDetails",
            {
              doctorId:
                item.id.toString(),
            }
          )
        }
      >
        {/* Doctor Avatar */}

        <View style={styles.avatar}>
          {renderAvatar(item)}
        </View>

        {/* Doctor Information */}

        <View
          style={styles.info}
        >
          {/* Name */}

          <Text
            style={styles.name}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          {/* Specialization */}

          <Text
            style={
              styles.specialization
            }
            numberOfLines={1}
          >
            {item.specialization}
          </Text>

          {/* Status */}

          <View
            style={styles.statusRow}
          >
            <View
              style={styles.statusDot}
            />

            <Text
              style={styles.statusText}
            >
              {item.status ||
                "Active"}
            </Text>
          </View>

          {/* Meta */}

          <View
            style={styles.metaContainer}
          >
            <View
              style={styles.metaRow}
            >
              <Ionicons
                name="briefcase-outline"
                size={14}
                color="#64748B"
              />

              <Text
                style={
                  styles.metaText
                }
              >
                {item.experience}{" "}
                {doctor("years")}
              </Text>
            </View>

            {item.qualification ? (
              <View
                style={
                  styles.metaRow
                }
              >
                <Ionicons
                  name="school-outline"
                  size={14}
                  color="#64748B"
                />

                <Text
                  style={
                    styles.metaText
                  }
                  numberOfLines={1}
                >
                  {item.qualification}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Arrow Container */}

        <View
          style={
            styles.arrowContainer
          }
        >
          <Ionicons
            name="chevron-forward"
            size={19}
            color="#2563EB"
          />
        </View>
      </TouchableOpacity>
    );
  };

  // =====================================================
  // Initial Loading
  // =====================================================

  if (
    loading &&
    doctors.length === 0
  ) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["top"]}
      >
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
              "loading_doctors"
            )}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // =====================================================
  // Footer Loader
  // =====================================================

  const renderFooter = () => {
    if (!loadingMore) {
      return null;
    }

    return (
      <View
        style={
          styles.footerLoader
        }
      >
        <ActivityIndicator
          size="small"
          color="#2563EB"
        />

        <Text
          style={
            styles.footerText
          }
        >
          {doctor(
            "loading_more"
          )}
        </Text>
      </View>
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
    >
      {/* Search */}

      <View
        style={
          styles.searchContainer
        }
      >
        <View
          style={
            styles.searchIconContainer
          }
        >
          <Ionicons
            name="search"
            size={19}
            color="#2563EB"
          />
        </View>

        <TextInput
          style={
            styles.searchInput
          }
          placeholder={doctor(
            "search_doctor"
          )}
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={
            handleSearch
          }
          returnKeyType="search"
        />

        {search.length > 0 && (
          <TouchableOpacity
            style={
              styles.clearButton
            }
            onPress={
              handleClearSearch
            }
          >
            <Ionicons
              name="close-circle"
              size={20}
              color="#94A3B8"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Error */}

      {!!error && (
        <View
          style={
            styles.errorContainer
          }
        >
          <View
            style={
              styles.errorIconContainer
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color="#DC2626"
            />
          </View>

          <Text
            style={
              styles.errorText
            }
          >
            {error}
          </Text>

          <TouchableOpacity
            onPress={() =>
              loadDoctors(
                1,
                search.trim()
              )
            }
          >
            <Text
              style={
                styles.retryText
              }
            >
              {doctor("retry")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Doctor List */}

      <FlatList
        data={doctors}
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={
          false
        }
        onEndReached={
          handleLoadMore
        }
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              handleRefresh
            }
            tintColor="#2563EB"
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 110,
          flexGrow:
            doctors.length === 0
              ? 1
              : 0,
        }}
        ListFooterComponent={
          renderFooter
        }
        ListEmptyComponent={
          <View
            style={
              styles.emptyContainer
            }
          >
            <View
              style={
                styles.emptyIcon
              }
            >
              <Ionicons
                name={
                  search
                    ? "search-outline"
                    : "people-outline"
                }
                size={42}
                color="#94A3B8"
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              {search
                ? doctor(
                    "no_doctor_found"
                  )
                : doctor(
                    "no_doctors"
                  )}
            </Text>

            <Text
              style={
                styles.emptySubTitle
              }
            >
              {search
                ? doctor(
                    "try_another_keyword"
                  )
                : doctor(
                    "add_first_doctor"
                  )}
            </Text>
          </View>
        }
      />

      {/* Add Doctor */}

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate(
            "AddDoctor"
          )
        }
      >
        <Ionicons
          name="add"
          size={30}
          color="#FFFFFF"
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // =====================================================
  // Search
  // =====================================================

  searchContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,

    height: 54,

    backgroundColor: "#FFFFFF",

    borderRadius: 16,

    paddingHorizontal: 12,

    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#DCE7F7",

    shadowColor: "#2563EB",
    shadowOpacity: 0.06,
    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 2,
  },

  searchIconContainer: {
    width: 36,
    height: 36,

    borderRadius: 12,

    backgroundColor: "#EEF5FF",

    justifyContent: "center",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,

    marginLeft: 10,

    fontSize: 15,

    color: "#0F172A",
  },

  clearButton: {
    padding: 4,
  },

  // =====================================================
  // Doctor Card
  // =====================================================

  card: {
    backgroundColor: "#FFFFFF",

    borderRadius: 20,

    padding: 15,

    flexDirection: "row",
    alignItems: "center",

    marginBottom: 14,

    borderWidth: 1,
    borderColor: "#E0EAFF",

    shadowColor: "#2563EB",
    shadowOpacity: 0.08,
    shadowRadius: 12,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 4,
  },

  // =====================================================
  // Avatar
  // =====================================================

  avatar: {
    width: 60,
    height: 60,

    borderRadius: 18,

    backgroundColor: "#EEF5FF",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 14,

    overflow: "hidden",

    borderWidth: 1,
    borderColor: "#D9E8FF",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  avatarText: {
    fontSize: 23,

    fontWeight: "800",

    color: "#2563EB",
  },

  // =====================================================
  // Doctor Info
  // =====================================================

  info: {
    flex: 1,

    marginRight: 10,
  },

  name: {
    fontSize: 17,

    fontWeight: "800",

    color: "#0F172A",

    letterSpacing: 0.1,
  },

  specialization: {
    marginTop: 5,

    color: "#2563EB",

    fontWeight: "700",

    fontSize: 14,
  },

  // =====================================================
  // Status
  // =====================================================

  statusRow: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 6,
  },

  statusDot: {
    width: 7,
    height: 7,

    borderRadius: 4,

    backgroundColor: "#22C55E",

    marginRight: 6,
  },

  statusText: {
    fontSize: 12,

    fontWeight: "700",

    color: "#16A34A",
  },

  // =====================================================
  // Meta
  // =====================================================

  metaContainer: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 6,

    gap: 12,
  },

  metaRow: {
    flexDirection: "row",

    alignItems: "center",

    flexShrink: 1,
  },

  metaText: {
    marginLeft: 5,

    color: "#64748B",

    fontSize: 12,

    fontWeight: "500",

    flexShrink: 1,
  },

  // =====================================================
  // Arrow
  // =====================================================

  arrowContainer: {
    width: 34,
    height: 34,

    borderRadius: 12,

    backgroundColor: "#EEF5FF",

    justifyContent: "center",
    alignItems: "center",
  },

  // =====================================================
  // Loading
  // =====================================================

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

  footerLoader: {
    paddingVertical: 20,

    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",
  },

  footerText: {
    marginLeft: 8,

    color: "#64748B",

    fontSize: 13,
  },

  // =====================================================
  // Error
  // =====================================================

  errorContainer: {
    marginHorizontal: 16,

    marginTop: 6,

    marginBottom: 8,

    padding: 12,

    borderRadius: 14,

    backgroundColor: "#FFF7F7",

    borderWidth: 1,
    borderColor: "#FECACA",

    flexDirection: "row",

    alignItems: "center",
  },

  errorIconContainer: {
    width: 32,
    height: 32,

    borderRadius: 10,

    backgroundColor: "#FEE2E2",

    justifyContent: "center",
    alignItems: "center",
  },

  errorText: {
    flex: 1,

    marginLeft: 8,

    color: "#B91C1C",

    fontSize: 13,
  },

  retryText: {
    marginLeft: 10,

    color: "#DC2626",

    fontWeight: "800",

    fontSize: 13,
  },

  // =====================================================
  // Empty
  // =====================================================

  emptyContainer: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    marginTop: 80,
  },

  emptyIcon: {
    width: 84,
    height: 84,

    borderRadius: 42,

    backgroundColor: "#EFF6FF",

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#DCEBFF",
  },

  emptyTitle: {
    marginTop: 16,

    fontSize: 18,

    fontWeight: "800",

    color: "#0F172A",
  },

  emptySubTitle: {
    marginTop: 6,

    color: "#64748B",

    textAlign: "center",

    fontSize: 14,
  },

  // =====================================================
  // FAB
  // =====================================================

  fab: {
    position: "absolute",

    bottom: 30,

    right: 25,

    backgroundColor: "#2563EB",

    width: 60,
    height: 60,

    borderRadius: 30,

    justifyContent: "center",
    alignItems: "center",

    elevation: 7,

    shadowColor: "#2563EB",

    shadowOpacity: 0.25,

    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 5,
    },
  },
});
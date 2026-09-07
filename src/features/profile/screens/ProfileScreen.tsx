import React, { useEffect, useState } from "react";

import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useNavigation } from "@react-navigation/native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Ionicons } from "@expo/vector-icons";

import useAuth from "../../../hooks/useAuth";

import { RootStackParamList } from "../../../navigation/AppNavigator";

import { FILE_BASE_URL } from "../../../config/env";

import {
  getLocalProfileImage,
  saveProfileImage,
} from "../../../utils/profileImage";

type NavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress?: () => void;
};

function MenuItem({
  icon,
  title,
  onPress,
}: MenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuLeft}>
        <View style={styles.menuIcon}>
          <Ionicons
            name={icon}
            size={21}
            color="#2563EB"
          />
        </View>

        <Text style={styles.menuTitle}>
          {title}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color="#94A3B8"
      />
    </TouchableOpacity>
  );
}

const getInitials = (name?: string) => {
  if (!name?.trim()) {
    return "U";
  }

  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0]
      .substring(0, 2)
      .toUpperCase();
  }

  return (
    words[0][0] +
    words[words.length - 1][0]
  ).toUpperCase();
};

export default function ProfileScreen() {
  const {
    user,
    logout,
  } = useAuth();

  const navigation =
    useNavigation<NavigationProp>();

  const [localProfileImage, setLocalProfileImage] =
    useState<string | null>(null);

  const [imageLoading, setImageLoading] =
    useState(true);

  const [imageError, setImageError] =
    useState(false);

  /*
   * Load profile image
   *
   * Priority:
   *
   * 1. Local image
   * 2. Backend image -> download once
   * 3. Initials
   */
  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        setImageLoading(true);
        setImageError(false);

        /*
         * First check local storage
         */
        const localImage =
          await getLocalProfileImage();

        if (localImage) {
          console.log(
            "Using local profile image:",
            localImage
          );

          setLocalProfileImage(
            localImage
          );

          return;
        }

        /*
         * No local image.
         *
         * If backend has image,
         * download it once.
         */
        if (user?.logo) {
          const imageUrl =
            `${FILE_BASE_URL}/${user.logo.replace(
              /^public\//,
              ""
            )}`;

          console.log(
            "Downloading profile image:",
            imageUrl
          );

          const downloadedImage =
            await saveProfileImage(
              imageUrl
            );

          if (downloadedImage) {
            console.log(
              "Profile image saved locally:",
              downloadedImage
            );

            setLocalProfileImage(
              downloadedImage
            );
          }
        }
      } catch (error) {
        console.log(
          "Profile image load error:",
          error
        );
      } finally {
        setImageLoading(false);
      }
    };

    loadProfileImage();
  }, [user?.logo]);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
      >
        {/* Header */}

        <View style={styles.header}>
          <Text style={styles.title}>
            Profile
          </Text>
        </View>

        {/* Profile Card */}

        <View style={styles.profileCard}>

          {/* Profile Image */}

          {imageLoading ? (
            <View
              style={styles.avatarFallback}
            >
              <Ionicons
                name="person"
                size={40}
                color="#2563EB"
              />
            </View>
          ) : localProfileImage &&
            !imageError ? (
            <Image
              source={{
                uri: localProfileImage,
              }}
              style={styles.avatar}
              onLoad={() => {
                console.log(
                  "Local profile image loaded"
                );
              }}
              onError={(error) => {
                console.log(
                  "Local profile image error:",
                  error.nativeEvent
                );

                setImageError(true);
              }}
            />
          ) : (
            <View
              style={styles.avatarFallback}
            >
              <Text
                style={styles.avatarInitials}
              >
                {getInitials(user?.name)}
              </Text>
            </View>
          )}

          {/* Name */}

          <Text style={styles.name}>
            {user?.name || "Clinic"}
          </Text>

          {/* Owner */}

          <Text style={styles.owner}>
            {user?.owner_name || ""}
          </Text>

          {/* Edit Profile */}

          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate(
                "EditProfile"
              )
            }
            activeOpacity={0.8}
          >
            <Ionicons
              name="create-outline"
              size={18}
              color="#FFFFFF"
            />

            <Text style={styles.editText}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contact Information */}

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>
            Contact Information
          </Text>

          {/* Mobile */}

          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Ionicons
                name="call-outline"
                size={21}
                color="#2563EB"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.label}>
                Mobile
              </Text>

              <Text style={styles.value}>
                {user?.phone ||
                  "Not available"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Email */}

          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Ionicons
                name="mail-outline"
                size={21}
                color="#2563EB"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.label}>
                Email
              </Text>

              <Text style={styles.value}>
                {user?.email ||
                  "Not available"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Address */}

          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Ionicons
                name="location-outline"
                size={21}
                color="#2563EB"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.label}>
                Address
              </Text>

              <Text style={styles.value}>
                {[user?.address, user?.city, user?.state, user?.pincode]
                  .filter(Boolean)
                  .join(", ") || "Not available"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* GPS Coordinates */}

          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Ionicons
                name="compass-outline"
                size={21}
                color="#2563EB"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.label}>
                GPS Coordinates (For Patient App Distance)
              </Text>

              <Text style={[styles.value, { color: user?.latitude && user?.longitude ? "#16A34A" : "#D97706" }]}>
                {user?.latitude && user?.longitude
                  ? `${Number(user.latitude).toFixed(4)}° N, ${Number(user.longitude).toFixed(4)}° E`
                  : "Not configured (Tap Edit Profile to set)"}
              </Text>
            </View>
          </View>
        </View>

        {/* Account Settings */}

        <View style={styles.menuCard}>
          <Text style={styles.cardTitle}>
            Account Settings
          </Text>

          <MenuItem
            icon="person-outline"
            title="Edit Profile"
            onPress={() =>
              navigation.navigate(
                "EditProfile"
              )
            }
          />

          <MenuItem
            icon="lock-closed-outline"
            title="Change Password"
            onPress={() =>
              navigation.navigate(
                "ChangePassword"
              )
            }
          />

          <MenuItem
            icon="language-outline"
            title="Language"
            onPress={() =>
              navigation.navigate(
                "Language"
              )
            }
          />
        </View>

        {/* Logout */}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color="#FFFFFF"
          />

          <Text style={styles.logoutText}>
            Logout
          </Text>
        </TouchableOpacity>

        {/* Version */}

        <Text style={styles.version}>
          Clinic Partner v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
  },

  profileCard: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 28,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#DBEAFE",
    borderWidth: 3,
    borderColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarInitials: {
    fontSize: 34,
    fontWeight: "700",
    color: "#2563EB",
  },

  name: {
    marginTop: 15,
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },

  owner: {
    marginTop: 5,
    fontSize: 15,
    color: "#64748B",
  },

  editButton: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },

  editText: {
    marginLeft: 8,
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },

  infoCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 18,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  infoContent: {
    flex: 1,
    marginLeft: 14,
  },

  label: {
    fontSize: 13,
    color: "#64748B",
  },

  value: {
    marginTop: 4,
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 16,
  },

  menuCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  menuTitle: {
    marginLeft: 14,
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },

  logoutButton: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: "#EF4444",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  logoutText: {
    marginLeft: 10,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  version: {
    textAlign: "center",
    marginTop: 20,
    marginBottom: 30,
    color: "#94A3B8",
    fontSize: 13,
  },
});
import React from "react";
import { Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import DashboardScreen from "../features/dashboard/screens/DashboardScreen";
import DoctorListScreen from "../features/doctor/screens/DoctorListScreen";
import ProfileScreen from "../features/profile/screens/ProfileScreen";
import EnquiryScreen from "../features/patient/screens/EnquiryScreen";

const Tab = createBottomTabNavigator();

export default function BottomNavigator() {
  const { t } = useTranslation("common");
  const insets = useSafeAreaInsets();

  const bottomPadding = insets.bottom > 0 ? insets.bottom : (Platform.OS === "android" ? 12 : 8);
  const tabHeight = 60 + bottomPadding;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: {
          borderTopColor: "#E2E8F0",
          backgroundColor: "#FFFFFF",
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
        },
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Doctors":
              iconName = focused ? "people" : "people-outline";
              break;
            case "Enquiries":
              iconName = focused ? "calendar" : "calendar-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
          }

          return <Ionicons name={iconName} size={23} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{ tabBarLabel: t("tab_home") }}
      />
      <Tab.Screen
        name="Doctors"
        component={DoctorListScreen}
        options={{ tabBarLabel: t("tab_doctors") }}
      />
      <Tab.Screen
        name="Enquiries"
        component={EnquiryScreen}
        options={{ tabBarLabel: t("tab_enquiries") }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: t("tab_profile") }}
      />
    </Tab.Navigator>
  );
}
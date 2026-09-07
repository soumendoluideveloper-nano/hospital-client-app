import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import DashboardScreen from "../features/dashboard/screens/DashboardScreen";
import DoctorListScreen from "../features/doctor/screens/DoctorListScreen";
// import AppointmentListScreen from "../features/appointment/screens/AppointmentListScreen";
import ProfileScreen from "../features/profile/screens/ProfileScreen";
import EnquiryScreen from "../features/patient/screens/EnquiryScreen";

const Tab = createBottomTabNavigator();

export default function BottomNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          switch (route.name) {
            case "Home":
              iconName = "home";
              break;
            case "Doctors":
              iconName = "people";
              break;
            case "Enquiries":
              iconName = "calendar";
              break;
            case "Profile":
              iconName = "person";
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Doctors" component={DoctorListScreen} />
      {/* <Tab.Screen name="Enquiries" component={AppointmentListScreen} /> */}
      <Tab.Screen
  name="Enquiries"
  component={EnquiryScreen}
/>
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
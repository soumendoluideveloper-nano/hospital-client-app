import React from "react";
import { Alert } from "react-native";
import useAuth from "../../../hooks/useAuth";
import {

  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../navigation/AppNavigator";
import { Ionicons } from "@expo/vector-icons";

// const clinic = {
//   name: "ABC Clinic",
//   owner: "Dr. John Doe",
//   mobile: "+91 9876543210",
//   email: "clinic@example.com",
//   address: "Salt Lake, Kolkata",
//   image:
//     "https://i.pravatar.cc/300?img=12",
// };

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
    >
      <View style={styles.menuLeft}>
        <View style={styles.menuIcon}>
          <Ionicons
            name={icon}
            size={20}
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
type NavigationProp =
  NativeStackNavigationProp<RootStackParamList>;
export default function ProfileScreen() {
const {
  user,
  logout,
} = useAuth();
const navigation =
  useNavigation<NavigationProp>();
console.log("User in ProfileScreen:", user);
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
        <View style={styles.header}>
          <Text style={styles.title}>
            Profile
          </Text>
        </View>

        {/* Profile Card */}

        <View style={styles.profileCard}>
        <Image
  source={{
    uri:
      user?.image ||
      "https://i.pravatar.cc/300?img=12",
  }}
  style={styles.avatar}
/>

          <Text style={styles.name}>
            {user?.name}
          </Text>

          <Text style={styles.owner}>
            {user?.owner_name}
          </Text>

         <TouchableOpacity
  style={styles.editButton}
  onPress={() =>
    navigation.navigate("EditProfile")
  }
>
  <Ionicons
    name="create-outline"
    size={18}
    color="#fff"
  />

  <Text style={styles.editText}>
    Edit Profile
  </Text>
</TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
  <Text style={styles.cardTitle}>
    Clinic Information
  </Text>

  <View style={styles.infoRow}>
    <View style={styles.iconBox}>
      <Ionicons
        name="call-outline"
        size={20}
        color="#2563EB"
      />
    </View>

    <View style={styles.infoContent}>
      <Text style={styles.label}>
        Mobile
      </Text>

      <Text style={styles.value}>
        {user?.phone}
      </Text>
    </View>
  </View>

  <View style={styles.divider} />

  <View style={styles.infoRow}>
    <View style={styles.iconBox}>
      <Ionicons
        name="mail-outline"
        size={20}
        color="#2563EB"
      />
    </View>

    <View style={styles.infoContent}>
      <Text style={styles.label}>
        Email
      </Text>

      <Text style={styles.value}>
        {user?.email}
      </Text>
    </View>
  </View>

  <View style={styles.divider} />

  <View style={styles.infoRow}>
    <View style={styles.iconBox}>
      <Ionicons
        name="location-outline"
        size={20}
        color="#2563EB"
      />
    </View>

    <View style={styles.infoContent}>
      <Text style={styles.label}>
        Address
      </Text>

      <Text style={styles.value}>
        {user?.address}
      </Text>
    </View>
  </View>
</View>

<View style={styles.menuCard}>
  <Text style={styles.cardTitle}>
    Account Settings
  </Text>

 <MenuItem
  icon="person-outline"
  title="Edit Profile"
  onPress={() =>
    navigation.navigate("EditProfile")
  }
/>

 <MenuItem
  icon="lock-closed-outline"
  title="Change Password"
  onPress={() =>
    navigation.navigate("ChangePassword")
  }
/>

  <MenuItem
    icon="notifications-outline"
    title="Notifications"
  />

  <MenuItem
    icon="language-outline"
    title="Language"
    onPress={() =>
      navigation.navigate("Language")
    }
  />

  <MenuItem
    icon="help-circle-outline"
    title="Help & Support"
  />

  <MenuItem
    icon="star-outline"
    title="Rate App"
  />
</View>

<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
  <Ionicons
    name="log-out-outline"
    size={22}
    color="#fff"
  />

  <Text style={styles.logoutText}>
    Logout
  </Text>
</TouchableOpacity>

<Text style={styles.version}>
  Version 1.0.0
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
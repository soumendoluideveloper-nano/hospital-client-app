import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import {
  SafeAreaView,

} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
export default function DashboardScreen() {
    const navigation = useNavigation<any>();
  
  const stats = [
    {
      title: "Today's Appointments",
      value: "18",
      icon: "calendar",
      color: "#2563EB",
    },
    {
      title: "Doctors",
      value: "12",
      icon: "people",
      color: "#16A34A",
    },
    {
      title: "Pending",
      value: "5",
      icon: "time",
      color: "#F59E0B",
    },
    {
      title: "Completed",
      value: "13",
      icon: "checkmark-circle",
      color: "#8B5CF6",
    },
  ];

  const quickActions = [
    {
      title: "Add Doctor",
      icon: "person-add",
    },
    {
      title: "Appointments",
      icon: "calendar-outline",
    },
    {
      title: "Patients",
      icon: "people-outline",
    },
    {
      title: "Schedule",
      icon: "time-outline",
    },
  ];

  return (
   <SafeAreaView
  style={styles.container}
  edges={["top"]}
>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}

        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning 👋</Text>

            <Text style={styles.clinicName}>
              ABC Clinic
            </Text>
          </View>

          <TouchableOpacity>
            <Ionicons
              name="notifications-outline"
              size={28}
              color="#0F172A"
            />
          </TouchableOpacity>
        </View>

        {/* Statistics */}

        <View style={styles.cardContainer}>
          {stats.map((item, index) => (
            <View key={index} style={styles.card}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: item.color },
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color="#fff"
                />
              </View>

              <Text style={styles.cardValue}>
                {item.value}
              </Text>

              <Text style={styles.cardTitle}>
                {item.title}
              </Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}

        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>

        <View style={styles.quickContainer}>
          {quickActions.map((item, index) => (
           <TouchableOpacity
  key={index}
  style={styles.quickCard}
  onPress={() => {
    if (item.title === "Add Doctor") {
      navigation.navigate("AddDoctor");
    }
  }}
>
              <Ionicons
                name={item.icon as any}
                size={28}
                color="#2563EB"
              />

              <Text style={styles.quickText}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Appointment */}

        <Text style={styles.sectionTitle}>
          Today's Appointments
        </Text>

        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.appointmentCard}>
            <View>
              <Text style={styles.patientName}>
                Rahul Das
              </Text>

              <Text style={styles.doctor}>
                Dr. Amit Sen
              </Text>

              <Text style={styles.time}>
                10:30 AM
              </Text>
            </View>

            <View style={styles.status}>
              <Text style={styles.statusText}>
                Confirmed
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  greeting: {
    fontSize: 16,
    color: "#64748B",
  },

  clinicName: {
    marginTop: 5,
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
  },

  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 25,
  },

  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },

  cardValue: {
    marginTop: 16,
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
  },

  cardTitle: {
    marginTop: 6,
    color: "#64748B",
    fontSize: 14,
  },

  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 15,
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },

  quickContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  quickCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 18,
    alignItems: "center",
    paddingVertical: 22,
    marginBottom: 16,
    elevation: 2,
  },

  quickText: {
    marginTop: 10,
    fontWeight: "600",
    color: "#334155",
  },

  appointmentCard: {
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },

  patientName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },

  doctor: {
    marginTop: 4,
    color: "#64748B",
  },

  time: {
    marginTop: 6,
    color: "#2563EB",
    fontWeight: "600",
  },

  status: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  statusText: {
    color: "#16A34A",
    fontWeight: "600",
  },
});
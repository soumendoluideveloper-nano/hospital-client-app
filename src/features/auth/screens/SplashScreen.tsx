import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function SplashScreen() {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(progress, {
        toValue: 100,
        duration: 2000,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const width = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <LinearGradient
      colors={["#0B132B", "#1C2541", "#0B132B"]}
      style={styles.container}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Decorative ambient lights */}
      <View style={styles.ambientTop} />
      <View style={styles.ambientBottom} />

      <View style={styles.centerSection}>
        <Animated.View
          style={{
            opacity: fade,
            transform: [{ scale }],
            alignItems: "center",
          }}
        >
          {/* Logo Card with White background */}
          <View style={styles.logoCard}>
            <Image
              source={require("../../../../assets/care_spot_icon.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Brand Title */}
          <Text style={styles.brandTitle}>Care Spot</Text>

          {/* Clinic Partner Badge */}
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={14} color="#38BDF8" style={{ marginRight: 6 }} />
            <Text style={styles.badgeText}>CLINIC PARTNER</Text>
          </View>

          <Text style={styles.tagline}>
            Smart Healthcare Platform
          </Text>
        </Animated.View>
      </View>

      <View style={styles.bottom}>
        <View style={styles.progressBackground}>
          <Animated.View
            style={[
              styles.progress,
              { width },
            ]}
          />
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>

        <Text style={styles.powered}>Powered by</Text>
        <Text style={styles.company}>S4 Technologies Pvt. Ltd.</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
    position: "relative",
  },

  ambientTop: {
    position: "absolute",
    top: -80,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(14, 165, 233, 0.15)",
  },

  ambientBottom: {
    position: "absolute",
    bottom: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(37, 99, 235, 0.15)",
  },

  centerSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },

  logoCard: {
    width: 140,
    height: 140,
    borderRadius: 38,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,

    shadowColor: "#0284C7",
    shadowOpacity: 0.45,
    shadowRadius: 32,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    elevation: 20,
  },

  logoImage: {
    width: "100%",
    height: "100%",
  },

  brandTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 20,
    letterSpacing: 1,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    backgroundColor: "rgba(14, 165, 233, 0.14)",
    borderColor: "rgba(56, 189, 248, 0.35)",
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },

  badgeText: {
    color: "#7DD3FC",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  tagline: {
    marginTop: 12,
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.72)",
    fontWeight: "500",
    letterSpacing: 0.4,
  },

  bottom: {
    width: "100%",
    alignItems: "center",
  },

  progressBackground: {
    width: 180,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },

  progress: {
    height: "100%",
    backgroundColor: "#38BDF8",
    borderRadius: 10,
  },

  version: {
    color: "rgba(255, 255, 255, 0.55)",
    fontSize: 12,
    fontWeight: "500",
  },

  powered: {
    marginTop: 16,
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
  },

  company: {
    marginTop: 4,
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.8,
  },
});
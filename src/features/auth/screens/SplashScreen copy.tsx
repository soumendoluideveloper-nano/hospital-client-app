import React, { useEffect, useRef } from "react";
import {
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
} from "@react-navigation/native";
import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import { RootStackParamList } from "../../../navigation/AppNavigator";

type NavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

export default function SplashScreen() {
  const navigation =
    useNavigation<NavigationProp>();

  const fade = useRef(
    new Animated.Value(0)
  ).current;

  const scale = useRef(
    new Animated.Value(0.8)
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [fade, scale, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#2563EB"
      />

      <Animated.View
        style={{
          opacity: fade,
          transform: [{ scale }],
          alignItems: "center",
        }}
      >
        <View style={styles.logo}>
          <Ionicons
            name="medical"
            size={48}
            color="#2563EB"
          />
        </View>

        <Text style={styles.title}>
          Clinic Partner
        </Text>

        <Text style={styles.subtitle}>
          Healthcare Made Simple
        </Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.dotContainer}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <Text style={styles.powered}>
          Powered by
        </Text>

        <Text style={styles.company}>
          ELENOVA TECH
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2563EB",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 80,
  },

  logo: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },

  title: {
    marginTop: 28,
    fontSize: 34,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
  },

  footer: {
    alignItems: "center",
  },

  dotContainer: {
    flexDirection: "row",
    marginBottom: 28,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 5,
    opacity: 0.9,
  },

  powered: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
  },

  company: {
    marginTop: 5,
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 1,
  },
});
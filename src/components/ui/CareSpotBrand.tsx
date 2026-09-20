import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface CareSpotBrandProps {
  fontSize?: number;
  theme?: "light" | "dark";
  careColor?: string;
  spotColor?: string;
  pinColor?: string;
  fontWeight?: TextStyle["fontWeight"];
  letterSpacing?: number;
  showTagline?: boolean;
  taglineText?: string;
  style?: StyleProp<ViewStyle>;
}

export default function CareSpotBrand({
  fontSize = 26,
  theme = "light",
  careColor,
  spotColor,
  pinColor,
  fontWeight = "800",
  letterSpacing = 0.5,
  showTagline = false,
  taglineText = "Healthcare Platform",
  style,
}: CareSpotBrandProps) {
  const isDark = theme === "dark";

  const resolvedCareColor = careColor || (isDark ? "#FFFFFF" : "#18558A");
  const resolvedSpotColor = spotColor || (isDark ? "#38BDF8" : "#0284C7");
  const resolvedPinColor = pinColor || (isDark ? "#7DD3FC" : "#0D2F52");

  const pinSize = fontSize * 0.88;
  const pinOffset = Platform.OS === "ios" ? 1 : 2;

  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.brandRow}>
        {/* "Care " */}
        <Text
          style={[
            styles.text,
            {
              fontSize,
              color: resolvedCareColor,
              fontWeight,
              letterSpacing,
            },
          ]}
        >
          Care{" "}
        </Text>

        {/* "Sp<Pin>t" */}
        <View style={styles.spotRow}>
          <Text
            style={[
              styles.text,
              {
                fontSize,
                color: resolvedSpotColor,
                fontWeight,
                letterSpacing: 0,
              },
            ]}
          >
            Sp
          </Text>

          <View
            style={[
              styles.pinContainer,
              {
                height: fontSize,
                marginHorizontal: Math.max(0.5, fontSize * 0.02),
              },
            ]}
          >
            <Ionicons
              name="location-sharp"
              size={pinSize}
              color={resolvedPinColor}
              style={{
                marginTop: pinOffset,
              }}
            />
          </View>

          <Text
            style={[
              styles.text,
              {
                fontSize,
                color: resolvedSpotColor,
                fontWeight,
                letterSpacing,
              },
            ]}
          >
            t
          </Text>
        </View>
      </View>

      {showTagline && (
        <Text
          style={[
            styles.tagline,
            {
              fontSize: Math.max(10, fontSize * 0.42),
              color: isDark ? "rgba(255, 255, 255, 0.7)" : "#64748B",
            },
          ]}
        >
          {taglineText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  spotRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pinContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  tagline: {
    marginTop: 3,
    fontWeight: "500",
    letterSpacing: 0.6,
  },
});

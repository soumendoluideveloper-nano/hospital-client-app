import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControlProps,
  ScrollView,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";

interface KeyboardSafeScreenProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardVerticalOffset?: number;
  edges?: Edge[];
  scrollEnabled?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  bounces?: boolean;
}

/**
 * Universal KeyboardSafeScreen component that ensures form inputs, errors,
 * and submit buttons remain fully accessible and visible above the software keyboard
 * on both iOS and Android.
 */
export default function KeyboardSafeScreen({
  children,
  style,
  contentContainerStyle,
  keyboardVerticalOffset,
  edges = ["top", "bottom"],
  scrollEnabled = true,
  refreshControl,
  header,
  footer,
  bounces = true,
}: KeyboardSafeScreenProps) {
  const defaultOffset =
    keyboardVerticalOffset !== undefined
      ? keyboardVerticalOffset
      : Platform.OS === "ios"
      ? 0
      : 20;

  return (
    <SafeAreaView style={[styles.safeArea, style]} edges={edges}>
      {header}

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={defaultOffset}
      >
        {scrollEnabled ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.contentContainer,
              contentContainerStyle,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            automaticallyAdjustKeyboardInsets={true}
            refreshControl={refreshControl}
            bounces={bounces}
          >
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </KeyboardAvoidingView>

      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
});

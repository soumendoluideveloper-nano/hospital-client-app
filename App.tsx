// import React, { useEffect, useState } from "react";
// import { SafeAreaProvider } from "react-native-safe-area-context";
// import "react-native-reanimated";
// import AppNavigator from "./src/navigation/AppNavigator";
// import LanguageModal from "./src/components/ui/LanguageModal";


// import AsyncStorage from "@react-native-async-storage/async-storage";

// export default function App() {
 

//   return (
//     <SafeAreaProvider>
//       <AppNavigator />

//       {/* <LanguageModal
//         visible={showLanguage}
//         onClose={() => setShowLanguage(false)}
//       /> */}
//     </SafeAreaProvider>
//   );
// }

import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";
import {
  requestMediaLibraryPermissionsAsync,
} from "expo-image-picker";
import * as Location from "expo-location";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";

export default function App() {
  useEffect(() => {
    const requestInitialPermissions = async () => {
      try {
        // Request Photo Permission
        const photoPermission = await requestMediaLibraryPermissionsAsync();
        console.log("Photo permission:", photoPermission.status);

        // Request Location Permission on App Open
        const locationPermission = await Location.requestForegroundPermissionsAsync();
        console.log("Location permission:", locationPermission.status);
      } catch (error) {
        console.log("App startup permissions error:", error);
      }
    };

    requestInitialPermissions();
  }, []);
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
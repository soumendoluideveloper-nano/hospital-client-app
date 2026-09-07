// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";

// import useAuth from "../hooks/useAuth";

// import SplashScreen from "../features/auth/screens/SplashScreen";
// import LoginScreen from "../features/auth/screens/LoginScreen";
// import SignupScreen from "../features/auth/screens/SignupScreen";

// import BottomNavigator from "./BottomNavigator";

// import AddDoctorScreen from "../features/doctor/screens/AddDoctorScreen";
// import DoctorDetailsScreen from "../features/doctor/screens/DoctorDetailsScreen";
// import EditDoctorScreen from "../features/doctor/screens/EditDoctorScreen";
// import DoctorScheduleScreen from "../features/doctor/screens/DoctorScheduleScreen";
// import TodayScheduleScreen from "../features/doctor/screens/TodayScheduleScreen";

// import EnquiryDetailsScreen from "../features/patient/screens/EnquiryDetailsScreen";

// export type RootStackParamList = {
//   Login: undefined;
//   Dashboard: undefined;
//   Signup: undefined;

//   AddDoctor: undefined;

//   DoctorDetails: {
//     doctorId: string;
//   };

//   EditDoctor: {
//     doctorId: string;
//   };

//   DoctorSchedule: {
//     doctorId: string;
//   };

//   TodaySchedule: undefined;

//   EnquiryDetails: {
//     enquiryId: string;
//   };
// };

// const Stack =
//   createNativeStackNavigator<RootStackParamList>();

// export default function AppNavigator() {
//   const {
//     loading,
//     isAuthenticated,
//   } = useAuth();

//   if (loading) {
//     return <SplashScreen />;
//   }

//   return (
//     <NavigationContainer>
//       <Stack.Navigator
//         screenOptions={{
//           headerShown: false,
//         }}
//       >
//         {isAuthenticated ? (
//           <>
//             <Stack.Screen
//               name="Dashboard"
//               component={BottomNavigator}
//             />

//             <Stack.Screen
//               name="AddDoctor"
//               component={AddDoctorScreen}
//             />

//             <Stack.Screen
//               name="DoctorDetails"
//               component={DoctorDetailsScreen}
//             />

//             <Stack.Screen
//               name="EditDoctor"
//               component={EditDoctorScreen}
//             />

//             <Stack.Screen
//               name="DoctorSchedule"
//               component={DoctorScheduleScreen}
//             />

//             <Stack.Screen
//               name="TodaySchedule"
//               component={TodayScheduleScreen}
//             />

//             <Stack.Screen
//               name="EnquiryDetails"
//               component={EnquiryDetailsScreen}
//             />
//           </>
//         ) : (
//           <>
//             <Stack.Screen
//               name="Login"
//               component={LoginScreen}
//             />

//             <Stack.Screen
//               name="Signup"
//               component={SignupScreen}
//             />
//           </>
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import useAuth from "../hooks/useAuth";

import SplashScreen from "../features/auth/screens/SplashScreen";
import LoginScreen from "../features/auth/screens/LoginScreen";
import SignupScreen from "../features/auth/screens/SignupScreen";

import BottomNavigator from "./BottomNavigator";

import AddDoctorScreen from "../features/doctor/screens/AddDoctorScreen";
import DoctorDetailsScreen from "../features/doctor/screens/DoctorDetailsScreen";
import EditDoctorScreen from "../features/doctor/screens/EditDoctorScreen";
import DoctorScheduleScreen from "../features/doctor/screens/DoctorScheduleScreen";
import TodayScheduleScreen from "../features/doctor/screens/TodayScheduleScreen";

import EnquiryDetailsScreen from "../features/patient/screens/EnquiryDetailsScreen";

import EditProfileScreen from "../features/profile/screens/EditProfileScreen";
import ChangePasswordScreen from "../features/profile/screens/ChangePasswordScreen";
import LanguageScreen from "../features/profile/screens/LanguageScreen";

import LabTestListScreen from "../features/lab/screens/LabTestListScreen";
import AddLabTestScreen from "../features/lab/screens/AddLabTestScreen";
import EditLabTestScreen from "../features/lab/screens/EditLabTestScreen";
import LabBookingListScreen from "../features/lab/screens/LabBookingListScreen";
import UploadReportScreen from "../features/lab/screens/UploadReportScreen";

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Signup: undefined;

  AddDoctor: undefined;

  DoctorDetails: {
    doctorId: string;
  };

  EditDoctor: {
    doctorId: string;
  };

  DoctorSchedule: {
    doctorId: string;
  };

  TodaySchedule: undefined;

  EnquiryDetails: {
    enquiryId: string;
  };
  EditProfile: undefined; 
  ChangePassword: undefined;
  Language: undefined;

  // Lab routes
  LabTestList: undefined;
  AddLabTest: undefined;
  EditLabTest: {
    test: any;
  };
  LabBookingList: undefined;
  UploadReport: {
    bookingId: number | string;
    booking?: any;
  };
};

const Stack =
  createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const {
    loading,
    isAuthenticated,
  } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen
              name="Dashboard"
              component={BottomNavigator}
            />

            <Stack.Screen
              name="AddDoctor"
              component={AddDoctorScreen}
            />

            <Stack.Screen
              name="DoctorDetails"
              component={DoctorDetailsScreen}
            />

            <Stack.Screen
              name="EditDoctor"
              component={EditDoctorScreen}
            />

            <Stack.Screen
              name="DoctorSchedule"
              component={DoctorScheduleScreen}
            />

            <Stack.Screen
              name="TodaySchedule"
              component={TodayScheduleScreen}
            />

            <Stack.Screen
              name="EnquiryDetails"
              component={EnquiryDetailsScreen}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
            />
            <Stack.Screen
              name="Language"
              component={LanguageScreen}
            />

            {/* Lab Screens */}
            <Stack.Screen
              name="LabTestList"
              component={LabTestListScreen}
            />
            <Stack.Screen
              name="AddLabTest"
              component={AddLabTestScreen}
            />
            <Stack.Screen
              name="EditLabTest"
              component={EditLabTestScreen}
            />
            <Stack.Screen
              name="LabBookingList"
              component={LabBookingListScreen}
            />
            <Stack.Screen
              name="UploadReport"
              component={UploadReportScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
            />

            <Stack.Screen
              name="Signup"
              component={SignupScreen}
            />
          </>

        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
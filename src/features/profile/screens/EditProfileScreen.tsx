import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  launchCameraAsync,
  launchImageLibraryAsync,
  requestCameraPermissionsAsync,
} from "expo-image-picker";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import useAuth from "../../../hooks/useAuth";
import { updateProfileApi } from "../api/profile.api";
import { FILE_BASE_URL } from "../../../config/env";
import {
  getLocalProfileImage,
  saveProfileImage,
} from "../../../utils/profileImage";
import StatusModal from "../../../components/ui/StatusModal";
import MapLocationPicker, {
  SelectedLocationData,
} from "../../../components/ui/MapLocationPicker";

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation("common");
  const { user, updateUser } = useAuth();

  // =====================================================
  // Basic States (Always safe string types)
  // =====================================================
  const [clinicName, setClinicName] = useState<string>(
    user?.name ? String(user.name) : ""
  );
  const [ownerName, setOwnerName] = useState<string>(
    user?.owner_name ? String(user.owner_name) : ""
  );
  const [mobile] = useState<string>(
    user?.phone ? String(user.phone) : ""
  );
  const [email, setEmail] = useState<string>(
    user?.email ? String(user.email) : ""
  );
  const [registrationNo, setRegistrationNo] = useState<string>(
    user?.registration_no ? String(user.registration_no) : ""
  );
  const [address, setAddress] = useState<string>(
    user?.address ? String(user.address) : ""
  );
  const [city, setCity] = useState<string>(
    user?.city ? String(user.city) : ""
  );
  const [state, setState] = useState<string>(
    user?.state ? String(user.state) : ""
  );
  const [country, setCountry] = useState<string>(
    user?.country ? String(user.country) : "India"
  );
  const [pincode, setPincode] = useState<string>(
    user?.pincode !== undefined && user?.pincode !== null
      ? String(user.pincode)
      : ""
  );

  // GPS Coordinates (for Patient App Distance Calculation)
  const [latitude, setLatitude] = useState<string>(
    user?.latitude !== undefined && user?.latitude !== null
      ? String(user.latitude)
      : ""
  );
  const [longitude, setLongitude] = useState<string>(
    user?.longitude !== undefined && user?.longitude !== null
      ? String(user.longitude)
      : ""
  );
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);

  // Field validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const [description, setDescription] = useState<string>(
    user?.description ? String(user.description) : ""
  );
  const [hasLab, setHasLab] = useState<boolean>(
    Boolean(user?.has_lab)
  );
  const [loading, setLoading] = useState(false);

  // Synchronize state if user loads/updates asynchronously
  useEffect(() => {
    if (user) {
      if (user.name) setClinicName(String(user.name));
      if (user.owner_name) setOwnerName(String(user.owner_name));
      if (user.email) setEmail(String(user.email));
      if (user.registration_no) setRegistrationNo(String(user.registration_no));
      if (user.address) setAddress(String(user.address));
      if (user.city) setCity(String(user.city));
      if (user.state) setState(String(user.state));
      if (user.country) setCountry(String(user.country));
      if (user.pincode !== undefined && user.pincode !== null) {
        setPincode(String(user.pincode));
      }
      if (user.latitude !== undefined && user.latitude !== null) {
        setLatitude(String(user.latitude));
      }
      if (user.longitude !== undefined && user.longitude !== null) {
        setLongitude(String(user.longitude));
      }
      if (user.description) setDescription(String(user.description));
      if (user.has_lab !== undefined) setHasLab(Boolean(user.has_lab));
    }
  }, [user]);

  // Status Modal popup state
  const [statusModal, setStatusModal] = useState<{
    visible: boolean;
    type: "success" | "error" | "warning";
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  // =====================================================
  // Image States
  // =====================================================
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(() => {
    if (user?.logo) {
      return user.logo.startsWith("http")
        ? user.logo
        : `${FILE_BASE_URL}/${user.logo.replace(/^public\//, "").replace(/^\//, "")}`;
    }
    return null;
  });

  const getInitials = (name?: string) => {
    if (!name || typeof name !== "string" || !name.trim()) return "U";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  useEffect(() => {
    if (user?.logo) {
      const url = user.logo.startsWith("http")
        ? user.logo
        : `${FILE_BASE_URL}/${user.logo.replace(/^public\//, "").replace(/^\//, "")}`;
      setProfileImage(url);
      setImageError(false);
    }
  }, [user?.logo]);

  const handleChangePhoto = async () => {
    try {
      const permission = await requestCameraPermissionsAsync();
      const result = await launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setImageError(false);
        setProfileImage(result.assets[0].uri);
      }
    } catch (error: any) {
      console.log("Image picker error:", error);
      setStatusModal({
        visible: true,
        type: "warning",
        title: "Photo Selection",
        message: error?.message || "Could not open gallery. Please check app permissions.",
      });
    }
  };

  const handleOpenCamera = async () => {
    try {
      const permission = await requestCameraPermissionsAsync();
      if (!permission.granted) {
        setStatusModal({
          visible: true,
          type: "warning",
          title: "Permission Required",
          message: "Camera permission is required to take a profile photo.",
        });
        return;
      }

      const result = await launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setImageError(false);
        setProfileImage(result.assets[0].uri);
      }
    } catch (error: any) {
      console.log("Camera error:", error);
      setStatusModal({
        visible: true,
        type: "warning",
        title: "Camera",
        message: error?.message || "Could not open camera. Please check app permissions.",
      });
    }
  };

  // =====================================================
  // Auto-Detect Current GPS Location
  // =====================================================
  const handleDetectLocation = async () => {
    try {
      setDetectingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setStatusModal({
          visible: true,
          type: "warning",
          title: "Location Permission Required",
          message:
            "Please allow location permission to automatically capture your clinic's GPS coordinates.",
        });
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      if (position?.coords) {
        const latStr = String(position.coords.latitude);
        const lngStr = String(position.coords.longitude);
        setLatitude(latStr);
        setLongitude(lngStr);

        // Try reverse geocoding to auto-fill address if blank
        try {
          const [geo] = await Location.reverseGeocodeAsync({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          if (geo) {
            if (!city && geo.city) setCity(String(geo.city));
            if (!state && geo.region) setState(String(geo.region));
            if (!country && geo.country) setCountry(String(geo.country));
            if (!pincode && geo.postalCode) setPincode(String(geo.postalCode));
            if (!address && (geo.street || geo.name)) {
              const fullAddr = [geo.name, geo.street, geo.district, geo.city]
                .filter(Boolean)
                .join(", ");
              setAddress(fullAddr);
            }
          }
        } catch (geoErr) {
          console.log("Reverse geocode error:", geoErr);
        }

        setStatusModal({
          visible: true,
          type: "success",
          title: "GPS Location Detected",
          message: `Latitude: ${position.coords.latitude.toFixed(6)}\nLongitude: ${position.coords.longitude.toFixed(6)}\n\nCoordinates captured successfully!`,
        });
        clearError("latitude");
        clearError("longitude");
      }
    } catch (err: any) {
      console.log("Location detection error:", err);
      setStatusModal({
        visible: true,
        type: "error",
        title: "Location Error",
        message:
          err?.message ||
          "Could not detect GPS location. Please check your device location settings or enter coordinates manually.",
      });
    } finally {
      setDetectingLocation(false);
    }
  };

  // =====================================================
  // Handle Map Pin Selected
  // =====================================================
  const handleMapLocationSelected = (data: SelectedLocationData) => {
    setLatitude(String(data.latitude));
    setLongitude(String(data.longitude));

    if (data.address && (!address || String(address).trim() === "")) {
      setAddress(data.address);
      clearError("address");
    }
    if (data.city && (!city || String(city).trim() === "")) {
      setCity(data.city);
      clearError("city");
    }
    if (data.state && (!state || String(state).trim() === "")) {
      setState(data.state);
    }
    if (data.country && (!country || String(country).trim() === "")) {
      setCountry(data.country);
    }
    if (data.pincode && (!pincode || String(pincode).trim() === "")) {
      setPincode(String(data.pincode));
      clearError("pincode");
    }

    clearError("latitude");
    clearError("longitude");

    setStatusModal({
      visible: true,
      type: "success",
      title: "Location Selected",
      message: `Selected GPS:\nLat: ${data.latitude.toFixed(6)}, Lng: ${data.longitude.toFixed(6)}\n\nAddress details auto-filled.`,
    });
  };

  // =====================================================
  // Validate Form Fields
  // =====================================================
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const cleanClinicName = String(clinicName || "").trim();
    const cleanOwnerName = String(ownerName || "").trim();
    const cleanEmail = String(email || "").trim();
    const cleanAddress = String(address || "").trim();
    const cleanCity = String(city || "").trim();
    const cleanPincode = String(pincode || "").trim();
    const cleanLatitude = String(latitude || "").trim();
    const cleanLongitude = String(longitude || "").trim();

    // Clinic Name Validation
    if (!cleanClinicName) {
      newErrors.clinicName = "Clinic name is required";
    } else if (cleanClinicName.length < 2) {
      newErrors.clinicName = "Clinic name must be at least 2 characters";
    }

    // Owner Name Validation
    if (!cleanOwnerName) {
      newErrors.ownerName = "Owner / Admin name is required";
    } else if (cleanOwnerName.length < 2) {
      newErrors.ownerName = "Owner name must be at least 2 characters";
    }

    // Email Validation (optional but if provided must be valid)
    if (cleanEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    // Address Validation
    if (!cleanAddress) {
      newErrors.address = "Street / Clinic address is required";
    }

    // City Validation
    if (!cleanCity) {
      newErrors.city = "City is required";
    }

    // Pincode Validation (if entered, 6 digits)
    if (cleanPincode) {
      if (!/^\d{6}$/.test(cleanPincode)) {
        newErrors.pincode = "Please enter a valid 6-digit pincode";
      }
    }

    // Latitude Validation (if entered, -90 to 90)
    if (cleanLatitude !== "") {
      const latNum = Number(cleanLatitude);
      if (isNaN(latNum) || latNum < -90 || latNum > 90) {
        newErrors.latitude = "Invalid latitude (must be between -90 and 90)";
      }
    }

    // Longitude Validation (if entered, -180 to 180)
    if (cleanLongitude !== "") {
      const lngNum = Number(cleanLongitude);
      if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
        newErrors.longitude = "Invalid longitude (must be between -180 and 180)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =====================================================
  // Update Profile
  // =====================================================
  const handleUpdateProfile = async () => {
    // Validate all form fields first
    const isValid = validateForm();
    if (!isValid) {
      setStatusModal({
        visible: true,
        type: "warning",
        title: "Validation Error",
        message: "Please check and correct the highlighted fields with red errors before saving.",
      });
      return;
    }

    try {
      setLoading(true);

      const isLocalImage =
        !!profileImage && !profileImage.startsWith("http");

      const cleanClinicName = String(clinicName || "").trim();
      const cleanOwnerName = String(ownerName || "").trim();
      const cleanEmail = String(email || "").trim();
      const cleanRegNo = String(registrationNo || "").trim();
      const cleanAddress = String(address || "").trim();
      const cleanCity = String(city || "").trim();
      const cleanState = String(state || "").trim();
      const cleanCountry = String(country || "India").trim();
      const cleanPincode = String(pincode || "").trim();
      const cleanLatitude = String(latitude || "").trim();
      const cleanLongitude = String(longitude || "").trim();
      const cleanDesc = String(description || "").trim();

      const payload = {
        name: cleanClinicName,
        owner_name: cleanOwnerName,
        email: cleanEmail,
        registration_no: cleanRegNo,
        address: cleanAddress,
        city: cleanCity,
        state: cleanState,
        country: cleanCountry,
        pincode: cleanPincode || undefined,
        latitude: cleanLatitude !== "" ? Number(cleanLatitude) : undefined,
        longitude: cleanLongitude !== "" ? Number(cleanLongitude) : undefined,
        description: cleanDesc,
        has_lab: hasLab,
        logo: isLocalImage
          ? {
            uri: profileImage,
            name: "clinic-profile.jpg",
            type: "image/jpeg",
          }
          : null,
      };

      console.log("Update profile payload:", payload);

      const response = await updateProfileApi(payload);

      console.log("Update profile response:", response);

      if (response?.status !== 1) {
        setStatusModal({
          visible: true,
          type: "error",
          title: "Update Failed",
          message: response?.message || "Failed to update profile.",
        });
        return;
      }

      const responseData = response?.data;
      const updatedUser =
        responseData?.user || responseData?.clinic || responseData;

      const updatedLogo = updatedUser?.logo;

      if (updatedLogo && isLocalImage) {
        const backendImageUrl = `${FILE_BASE_URL}/${updatedLogo.replace(/^public\//, "")}`;
        const savedLocalImage = await saveProfileImage(backendImageUrl);
        if (savedLocalImage) {
          setProfileImage(savedLocalImage);
        }
      }

      if (updatedUser) {
        await updateUser(updatedUser);
      }

      setStatusModal({
        visible: true,
        type: "success",
        title: t("success"),
        message: response?.message || t("profile_updated"),
        onConfirm: () => navigation.goBack(),
      });
    } catch (error: any) {
      console.log("Update profile error:", error);
      setStatusModal({
        visible: true,
        type: "error",
        title: t("error"),
        message: error?.message || "Failed to update profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t("edit_profile_title")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* =================================================
            Profile Header & Photo
        ================================================= */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            {imageLoading ? (
              <View style={styles.avatarFallback}>
                <Ionicons name="business" size={44} color="#2563EB" />
              </View>
            ) : profileImage && !imageError ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.avatar}
                onError={() => setImageError(true)}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>
                  {getInitials(clinicName || user?.name)}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.cameraBadge}
              onPress={handleChangePhoto}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.profileName}>
            {clinicName || user?.name || "Clinic Partner"}
          </Text>
          <Text style={styles.profileRole}>
            {ownerName || user?.owner_name || "Clinic Administrator"}
          </Text>

          <View style={styles.photoActions}>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={handleChangePhoto}
            >
              <Ionicons name="images-outline" size={16} color="#2563EB" />
              <Text style={styles.photoButtonText}>Change Logo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.photoButton}
              onPress={handleOpenCamera}
            >
              <Ionicons name="camera-outline" size={16} color="#2563EB" />
              <Text style={styles.photoButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* =================================================
            Basic Information
        ================================================= */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Basic Information</Text>

          {/* Clinic Name */}
          <Text style={styles.label}>
            Clinic Name <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, !!errors.clinicName && styles.errorInput]}
            value={clinicName}
            onChangeText={(text) => {
              setClinicName(text);
              clearError("clinicName");
            }}
            placeholder="e.g. Apollo Clinic"
            placeholderTextColor="#94A3B8"
          />
          {!!errors.clinicName && (
            <Text style={styles.errorText}>{errors.clinicName}</Text>
          )}

          {/* Owner Name */}
          <Text style={styles.label}>
            Owner / Admin Name <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, !!errors.ownerName && styles.errorInput]}
            value={ownerName}
            onChangeText={(text) => {
              setOwnerName(text);
              clearError("ownerName");
            }}
            placeholder="e.g. Dr. John Doe"
            placeholderTextColor="#94A3B8"
          />
          {!!errors.ownerName && (
            <Text style={styles.errorText}>{errors.ownerName}</Text>
          )}

          {/* Mobile */}
          <Text style={styles.label}>Mobile Number (Registered)</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={mobile}
            editable={false}
            placeholder="Mobile Number"
            placeholderTextColor="#94A3B8"
          />

          {/* Email */}
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[styles.input, !!errors.email && styles.errorInput]}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              clearError("email");
            }}
            placeholder="clinic@example.com"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {!!errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}

          {/* Registration No */}
          <Text style={styles.label}>Registration / License No</Text>
          <TextInput
            style={styles.input}
            value={registrationNo}
            onChangeText={setRegistrationNo}
            placeholder="e.g. WB-MED-2024-001"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* =================================================
            📍 Clinic GPS Coordinates & Location (For Distance Calculation)
        ================================================= */}
        <View style={[styles.card, styles.locationCard]}>
          <View style={styles.locationHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>📍 Clinic Location on Map</Text>
              <Text style={styles.locationSubtitle}>
                Nearby patients will see your clinic's live distance (e.g. 1.2 km away) based on these GPS coordinates.
              </Text>
            </View>
          </View>

          {/* Action Buttons: Pick on Map & Auto-Detect GPS */}
          <View style={styles.locationBtnRow}>
            <TouchableOpacity
              style={styles.mapPickerBtn}
              onPress={() => setMapModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="map" size={18} color="#FFFFFF" />
              <Text style={styles.mapPickerBtnText}>Pick on Map</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.detectGpsBtn}
              onPress={handleDetectLocation}
              disabled={detectingLocation}
              activeOpacity={0.8}
            >
              {detectingLocation ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="navigate-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.detectGpsBtnText}>Auto-GPS</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Coordinates Inputs */}
          <View style={styles.coordsRow}>
            {/* Latitude */}
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Latitude</Text>
              <View
                style={[
                  styles.coordInputContainer,
                  !!errors.latitude && styles.errorInput,
                ]}
              >
                <Ionicons
                  name="compass-outline"
                  size={18}
                  color="#2563EB"
                  style={{ marginRight: 6 }}
                />
                <TextInput
                  style={styles.coordInput}
                  value={latitude}
                  onChangeText={(text) => {
                    setLatitude(text);
                    clearError("latitude");
                  }}
                  placeholder="e.g. 22.572645"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
              </View>
              {!!errors.latitude && (
                <Text style={styles.errorText}>{errors.latitude}</Text>
              )}
            </View>

            {/* Longitude */}
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Longitude</Text>
              <View
                style={[
                  styles.coordInputContainer,
                  !!errors.longitude && styles.errorInput,
                ]}
              >
                <Ionicons
                  name="compass-outline"
                  size={18}
                  color="#2563EB"
                  style={{ marginRight: 6 }}
                />
                <TextInput
                  style={styles.coordInput}
                  value={longitude}
                  onChangeText={(text) => {
                    setLongitude(text);
                    clearError("longitude");
                  }}
                  placeholder="e.g. 88.363892"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
              </View>
              {!!errors.longitude && (
                <Text style={styles.errorText}>{errors.longitude}</Text>
              )}
            </View>
          </View>

          {/* Status Badge */}
          {latitude && longitude ? (
            <View style={styles.geoSuccessBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
              <Text style={styles.geoSuccessText}>
                GPS Coordinates Configured ({Number(latitude).toFixed(4)}°,{" "}
                {Number(longitude).toFixed(4)}°)
              </Text>
            </View>
          ) : (
            <View style={styles.geoWarningBadge}>
              <Ionicons name="alert-circle" size={16} color="#D97706" />
              <Text style={styles.geoWarningText}>
                Location not configured. Tap "Pick on Map" to pinpoint your clinic shop.
              </Text>
            </View>
          )}
        </View>

        {/* =================================================
            Address Information
        ================================================= */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Address Details</Text>

          {/* Address */}
          <Text style={styles.label}>
            Street / Building Address <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={[styles.textArea, !!errors.address && styles.errorInput]}
            multiline
            value={address}
            onChangeText={(text) => {
              setAddress(text);
              clearError("address");
            }}
            placeholder="Shop / Building No, Street Name, Area..."
            placeholderTextColor="#94A3B8"
            textAlignVertical="top"
          />
          {!!errors.address && (
            <Text style={styles.errorText}>{errors.address}</Text>
          )}

          {/* City */}
          <Text style={styles.label}>
            City <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, !!errors.city && styles.errorInput]}
            value={city}
            onChangeText={(text) => {
              setCity(text);
              clearError("city");
            }}
            placeholder="e.g. Kolkata"
            placeholderTextColor="#94A3B8"
          />
          {!!errors.city && (
            <Text style={styles.errorText}>{errors.city}</Text>
          )}

          {/* State */}
          <Text style={styles.label}>State</Text>
          <TextInput
            style={styles.input}
            value={state}
            onChangeText={setState}
            placeholder="e.g. West Bengal"
            placeholderTextColor="#94A3B8"
          />

          {/* Pincode */}
          <Text style={styles.label}>Pincode / Postal Code</Text>
          <TextInput
            style={[styles.input, !!errors.pincode && styles.errorInput]}
            value={pincode}
            onChangeText={(text) => {
              setPincode(text);
              clearError("pincode");
            }}
            placeholder="e.g. 700001"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            maxLength={6}
          />
          {!!errors.pincode && (
            <Text style={styles.errorText}>{errors.pincode}</Text>
          )}

          {/* Country */}
          <Text style={styles.label}>Country</Text>
          <TextInput
            style={styles.input}
            value={country}
            onChangeText={setCountry}
            placeholder="Country"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* =================================================
            Clinic Details & Facilities
        ================================================= */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Clinic Details & Facilities</Text>

          {/* Description */}
          <Text style={styles.label}>About Clinic</Text>
          <TextInput
            style={styles.description}
            multiline
            numberOfLines={5}
            value={description}
            onChangeText={setDescription}
            placeholder="Write details about your clinic, specialty departments, facilities..."
            placeholderTextColor="#94A3B8"
            textAlignVertical="top"
          />

          {/* Lab */}
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.switchTitle}>Diagnostic / Lab Available</Text>
              <Text style={styles.switchSubtitle}>
                Enable if your clinic offers X-Ray, CT/MRI scans, ultrasound, or pathology blood tests.
              </Text>
            </View>

            <Switch
              value={hasLab}
              onValueChange={setHasLab}
              trackColor={{
                false: "#CBD5E1",
                true: "#93C5FD",
              }}
              thumbColor={hasLab ? "#2563EB" : "#94A3B8"}
            />
          </View>
        </View>

        {/* =================================================
            Save Button
        ================================================= */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleUpdateProfile}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Interactive Leaflet Map Location Picker Modal */}
      <MapLocationPicker
        visible={mapModalVisible}
        initialLatitude={latitude.trim() ? Number(latitude) : undefined}
        initialLongitude={longitude.trim() ? Number(longitude) : undefined}
        onClose={() => setMapModalVisible(false)}
        onSelectLocation={handleMapLocationSelected}
      />

      {/* Standard Status Popup Modal */}
      <StatusModal
        visible={statusModal.visible}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        buttonText="OK"
        onClose={() =>
          setStatusModal((prev) => ({
            ...prev,
            visible: false,
          }))
        }
        onConfirm={() => {
          statusModal.onConfirm?.();
        }}
      />
    </SafeAreaView>
  );
}

// =====================================================
// Styles
// =====================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  navHeader: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  profileHeader: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "#EFF6FF",
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#BFDBFE",
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: "700",
    color: "#2563EB",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#2563EB",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 12,
  },
  profileRole: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  photoActions: {
    flexDirection: "row",
    marginTop: 14,
    gap: 10,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  photoButtonText: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 13,
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  locationCard: {
    borderColor: "#BFDBFE",
    backgroundColor: "#F8FAFC",
  },
  locationHeaderRow: {
    marginBottom: 12,
  },
  locationSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  locationBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  mapPickerBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    height: 46,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
    shadowColor: "#2563EB",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  mapPickerBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  detectGpsBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F172A",
    height: 46,
    borderRadius: 12,
    gap: 8,
  },
  detectGpsBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  detectLocationBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    height: 46,
    borderRadius: 12,
    gap: 8,
    marginBottom: 14,
  },
  detectLocationBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  coordsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  coordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  coordInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
  },
  geoSuccessBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 12,
    gap: 6,
  },
  geoSuccessText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16A34A",
    flex: 1,
  },
  geoWarningBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 12,
    gap: 6,
  },
  geoWarningText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#B45309",
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
    marginTop: 10,
  },
  requiredAsterisk: {
    color: "#EF4444",
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: "#0F172A",
  },
  errorInput: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
    marginLeft: 2,
  },
  disabledInput: {
    backgroundColor: "#F1F5F9",
    color: "#94A3B8",
  },
  textArea: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 70,
    fontSize: 14,
    color: "#0F172A",
  },
  description: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 90,
    fontSize: 14,
    color: "#0F172A",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  switchSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    marginHorizontal: 16,
    marginTop: 24,
    height: 52,
    borderRadius: 14,
    gap: 8,
    elevation: 3,
    shadowColor: "#2563EB",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
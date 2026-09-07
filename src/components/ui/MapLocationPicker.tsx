import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, PROVIDER_DEFAULT, Region } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

export interface SelectedLocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

interface MapLocationPickerProps {
  visible: boolean;
  initialLatitude?: number;
  initialLongitude?: number;
  onClose: () => void;
  onSelectLocation: (data: SelectedLocationData) => void;
}

const { width, height } = Dimensions.get("window");

// Default coordinates (Kolkata, WB, India)
const DEFAULT_LAT = 22.572645;
const DEFAULT_LNG = 88.363892;

export default function MapLocationPicker({
  visible,
  initialLatitude,
  initialLongitude,
  onClose,
  onSelectLocation,
}: MapLocationPickerProps) {
  const mapRef = useRef<MapView>(null);

  const [currentLat, setCurrentLat] = useState<number>(
    initialLatitude && !isNaN(initialLatitude) ? Number(initialLatitude) : DEFAULT_LAT
  );
  const [currentLng, setCurrentLng] = useState<number>(
    initialLongitude && !isNaN(initialLongitude) ? Number(initialLongitude) : DEFAULT_LNG
  );

  const [addressInfo, setAddressInfo] = useState<{
    formattedAddress?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  }>({});

  const [loadingAddress, setLoadingAddress] = useState(false);
  const [locatingUser, setLocatingUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isMapMoving, setIsMapMoving] = useState(false);

  // Reverse Geocoding with debounce/safety
  const reverseGeocodeCoordinates = useCallback(async (lat: number, lng: number) => {
    try {
      setLoadingAddress(true);
      const results = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      if (results && results.length > 0) {
        const item = results[0];
        const parts = [item.name, item.street, item.district, item.city]
          .filter(Boolean)
          .join(", ");

        setAddressInfo({
          formattedAddress: parts || `${item.city || ""}, ${item.region || ""}`,
          city: item.city || item.subregion || "",
          state: item.region || "",
          country: item.country || "India",
          pincode: item.postalCode || "",
        });
      }
    } catch (error) {
      console.log("Reverse geocode error:", error);
      setAddressInfo((prev) => ({
        ...prev,
        formattedAddress: `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`,
      }));
    } finally {
      setLoadingAddress(false);
    }
  }, []);

  // Update initial coordinates when modal opens
  useEffect(() => {
    if (visible) {
      const lat = initialLatitude && !isNaN(initialLatitude) ? Number(initialLatitude) : DEFAULT_LAT;
      const lng = initialLongitude && !isNaN(initialLongitude) ? Number(initialLongitude) : DEFAULT_LNG;
      setCurrentLat(lat);
      setCurrentLng(lng);
      reverseGeocodeCoordinates(lat, lng);

      setTimeout(() => {
        mapRef.current?.animateToRegion(
          {
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.008,
            longitudeDelta: 0.008,
          },
          800
        );
      }, 300);
    }
  }, [visible, initialLatitude, initialLongitude, reverseGeocodeCoordinates]);

  // Handle Region Change (Native Map pan/zoom)
  const onRegionChangeComplete = (region: Region) => {
    setIsMapMoving(false);
    if (!isNaN(region.latitude) && !isNaN(region.longitude)) {
      setCurrentLat(region.latitude);
      setCurrentLng(region.longitude);
      reverseGeocodeCoordinates(region.latitude, region.longitude);
    }
  };

  const onRegionChange = () => {
    if (!isMapMoving) {
      setIsMapMoving(true);
    }
  };

  // GPS "Locate Me" Button
  const handleLocateMe = async () => {
    try {
      setLocatingUser(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      if (position?.coords) {
        const { latitude, longitude } = position.coords;
        setCurrentLat(latitude);
        setCurrentLng(longitude);
        mapRef.current?.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: 0.006,
            longitudeDelta: 0.006,
          },
          1000
        );
        reverseGeocodeCoordinates(latitude, longitude);
      }
    } catch (err) {
      console.log("Error locating user:", err);
    } finally {
      setLocatingUser(false);
    }
  };

  // Search Locality/Address using OpenStreetMap Nominatim
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery.trim()
      )}&limit=5`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "ClinicPartnerApp/1.0",
        },
      });
      const data = await response.json();

      if (data && data.length > 0) {
        setSearchResults(data);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.log("Search error:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    if (!isNaN(lat) && !isNaN(lng)) {
      setSearchResults([]);
      setSearchQuery("");
      setCurrentLat(lat);
      setCurrentLng(lng);
      mapRef.current?.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        },
        1000
      );
      reverseGeocodeCoordinates(lat, lng);
    }
  };

  // Confirm and Return Selected Location
  const handleConfirm = () => {
    onSelectLocation({
      latitude: Number(currentLat.toFixed(6)),
      longitude: Number(currentLng.toFixed(6)),
      address: addressInfo.formattedAddress,
      city: addressInfo.city,
      state: addressInfo.state,
      country: addressInfo.country,
      pincode: addressInfo.pincode,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        {/* =================================================
            Top Bar with Search
        ================================================= */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.searchBarContainer}>
            <Ionicons name="search" size={18} color="#64748B" style={{ marginRight: 6 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search area, street or city..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              >
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.searchActionBtn}
            onPress={handleSearch}
            activeOpacity={0.8}
            disabled={searching}
          >
            {searching ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <View style={styles.searchResultsList}>
            {searchResults.map((item: any, idx: number) => (
              <TouchableOpacity
                key={idx}
                style={styles.searchResultItem}
                onPress={() => handleSelectSearchResult(item)}
              >
                <Ionicons name="location-outline" size={18} color="#2563EB" />
                <Text style={styles.searchResultText} numberOfLines={2}>
                  {item.display_name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* =================================================
            Native Map View
        ================================================= */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            initialRegion={{
              latitude: currentLat,
              longitude: currentLng,
              latitudeDelta: 0.008,
              longitudeDelta: 0.008,
            }}
            onRegionChange={onRegionChange}
            onRegionChangeComplete={onRegionChangeComplete}
            showsUserLocation={true}
            showsMyLocationButton={false}
            showsCompass={true}
          />

          {/* Floating Instruction Badge */}
          <View style={styles.instructionBadge}>
            <Text style={styles.instructionText}>
              📍 Move map to place pin on your clinic shop
            </Text>
          </View>

          {/* Fixed Center Pin with animated elevation */}
          <View style={styles.centerPinWrapper} pointerEvents="none">
            <View style={[styles.centerPinIcon, isMapMoving && styles.centerPinMoving]}>
              <Ionicons name="location" size={36} color="#2563EB" />
            </View>
            <View style={styles.centerPinDot} />
          </View>

          {/* Floating "Locate Me" GPS Button */}
          <TouchableOpacity
            style={styles.locateMeBtn}
            onPress={handleLocateMe}
            activeOpacity={0.8}
            disabled={locatingUser}
          >
            {locatingUser ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : (
              <Ionicons name="locate" size={24} color="#2563EB" />
            )}
          </TouchableOpacity>
        </View>

        {/* =================================================
            Bottom Location Info & Confirmation Sheet
        ================================================= */}
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />

          {/* Coordinates Details */}
          <View style={styles.coordHeaderRow}>
            <View style={styles.coordBadge}>
              <Ionicons name="navigate" size={14} color="#2563EB" />
              <Text style={styles.coordBadgeText}>
                {currentLat.toFixed(6)}°, {currentLng.toFixed(6)}°
              </Text>
            </View>

            {loadingAddress && (
              <View style={styles.loadingAddressBadge}>
                <ActivityIndicator size="small" color="#64748B" />
                <Text style={styles.loadingAddressText}>Locating address...</Text>
              </View>
            )}
          </View>

          {/* Address Display */}
          <View style={styles.addressCard}>
            <Ionicons
              name="business"
              size={22}
              color="#2563EB"
              style={{ marginTop: 2, marginRight: 10 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.addressTitle}>Clinic Shop Location</Text>
              <Text style={styles.addressText} numberOfLines={3}>
                {addressInfo.formattedAddress ||
                  `Latitude: ${currentLat.toFixed(5)}, Longitude: ${currentLng.toFixed(5)}`}
              </Text>
              {!!addressInfo.city && (
                <Text style={styles.addressSubText}>
                  {[addressInfo.city, addressInfo.state, addressInfo.pincode]
                    .filter(Boolean)
                    .join(" • ")}
                </Text>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.confirmBtnText}>Confirm Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    zIndex: 10,
    gap: 8,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
  },
  searchActionBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  searchResultsList: {
    position: "absolute",
    top: 65,
    left: 16,
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    zIndex: 20,
    maxHeight: 220,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 10,
  },
  searchResultText: {
    flex: 1,
    fontSize: 13,
    color: "#334155",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  instructionBadge: {
    position: "absolute",
    top: 12,
    alignSelf: "center",
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 5,
  },
  instructionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  centerPinWrapper: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -36,
    marginLeft: -18,
    alignItems: "center",
    justifyContent: "center",
  },
  centerPinIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerPinMoving: {
    transform: [{ translateY: -8 }, { scale: 1.15 }],
  },
  centerPinDot: {
    width: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    marginTop: -4,
  },
  locateMeBtn: {
    position: "absolute",
    right: 16,
    bottom: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  bottomSheet: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: 12,
  },
  coordHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  coordBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  coordBadgeText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "700",
  },
  loadingAddressBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  loadingAddressText: {
    fontSize: 12,
    color: "#64748B",
  },
  addressCard: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  addressTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  addressText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
  },
  addressSubText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2563EB",
    marginTop: 4,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  cancelBtnText: {
    color: "#64748B",
    fontSize: 15,
    fontWeight: "600",
  },
  confirmBtn: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    elevation: 2,
    shadowColor: "#2563EB",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});

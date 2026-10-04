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
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useTranslation } from "react-i18next";

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

const { width } = Dimensions.get("window");

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
  const { t: common } = useTranslation("common");
  const webViewRef = useRef<WebView>(null);

  const [currentLat, setCurrentLat] = useState<number>(
    initialLatitude && !isNaN(initialLatitude) && initialLatitude !== 0
      ? Number(initialLatitude)
      : DEFAULT_LAT
  );
  const [currentLng, setCurrentLng] = useState<number>(
    initialLongitude && !isNaN(initialLongitude) && initialLongitude !== 0
      ? Number(initialLongitude)
      : DEFAULT_LNG
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
  const [mapError, setMapError] = useState(false);
  const [permissionError, setPermissionError] = useState("");

  // Reverse Geocoding
  const reverseGeocodeCoordinates = useCallback(
    async (lat: number, lng: number) => {
      try {
        setLoadingAddress(true);
        let resolved = false;

        // 1. Try expo-location native reverse geocode
        try {
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
              formattedAddress:
                parts || `${item.city || ""}, ${item.region || ""}`,
              city: item.city || item.subregion || "",
              state: item.region || "",
              country: item.country || "India",
              pincode: item.postalCode || "",
            });
            resolved = true;
          }
        } catch (e) {
          // fallback to online OSM reverse geocode
        }

        // 2. Fallback to OpenStreetMap reverse geocode
        if (!resolved) {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
              headers: { "User-Agent": "CareSpotClinicPartnerApp/1.0" },
            }
          );
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const road = addr.road || addr.suburb || addr.neighbourhood || "";
            const city = addr.city || addr.town || addr.village || addr.county || "";
            const state = addr.state || "";
            const pincode = addr.postcode || "";
            const full = data.display_name || [road, city, state].filter(Boolean).join(", ");

            setAddressInfo({
              formattedAddress: full,
              city,
              state,
              country: addr.country || "India",
              pincode,
            });
            resolved = true;
          }
        }

        if (!resolved) {
          setAddressInfo((prev) => ({
            ...prev,
            formattedAddress: `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`,
          }));
        }
      } catch (error) {
        setAddressInfo((prev) => ({
          ...prev,
          formattedAddress: `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`,
        }));
      } finally {
        setLoadingAddress(false);
      }
    },
    []
  );

  // Update initial coordinates when modal opens
  useEffect(() => {
    if (visible) {
      setMapError(false);
      setPermissionError("");
      const lat =
        initialLatitude && !isNaN(initialLatitude) && initialLatitude !== 0
          ? Number(initialLatitude)
          : DEFAULT_LAT;
      const lng =
        initialLongitude && !isNaN(initialLongitude) && initialLongitude !== 0
          ? Number(initialLongitude)
          : DEFAULT_LNG;
      setCurrentLat(lat);
      setCurrentLng(lng);
      reverseGeocodeCoordinates(lat, lng);
    }
  }, [visible, initialLatitude, initialLongitude, reverseGeocodeCoordinates]);

  // Send map center change to Leaflet WebView
  const setWebMapLocation = (lat: number, lng: number) => {
    const jsCode = `if (window.map) { window.map.setView([${lat}, ${lng}], 16); } true;`;
    webViewRef.current?.injectJavaScript(jsCode);
  };

  // Handle messages from Leaflet WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "locationChange") {
        const lat = parseFloat(data.lat);
        const lng = parseFloat(data.lng);
        if (!isNaN(lat) && !isNaN(lng)) {
          setCurrentLat(lat);
          setCurrentLng(lng);
          setIsMapMoving(false);
          reverseGeocodeCoordinates(lat, lng);
        }
      } else if (data.type === "mapMoveStart") {
        setIsMapMoving(true);
      }
    } catch (e) {
      console.log("WebView message error:", e);
    }
  };

  // GPS "Locate Me" Button
  const handleLocateMe = async () => {
    try {
      setLocatingUser(true);
      setPermissionError("");
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setPermissionError("Location permission is required to detect your location.");
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      if (position?.coords) {
        const { latitude, longitude } = position.coords;
        setCurrentLat(latitude);
        setCurrentLng(longitude);
        setWebMapLocation(latitude, longitude);
        reverseGeocodeCoordinates(latitude, longitude);
      }
    } catch (err: any) {
      setPermissionError("Unable to retrieve GPS location. Please check device location settings.");
    } finally {
      setLocatingUser(false);
    }
  };

  // Search using OpenStreetMap Nominatim
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery.trim()
      )}&countrycodes=in&limit=5`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "CareSpotClinicPartner/1.0",
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
      setWebMapLocation(lat, lng);
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

  // Leaflet HTML Content with ultra-fast CDN and embedded styling
  const leafletHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body, #map {
            width: 100%;
            height: 100%;
            background-color: #f1f5f9;
          }
          .leaflet-control-attribution {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>
        <script>
          try {
            var map = L.map('map', {
              center: [${currentLat}, ${currentLng}],
              zoom: 16,
              zoomControl: false
            });

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: ''
            }).addTo(map);

            window.map = map;

            map.on('movestart', function() {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapMoveStart' }));
              }
            });

            map.on('moveend', function() {
              var center = map.getCenter();
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'locationChange',
                  lat: center.lat,
                  lng: center.lng
                }));
              }
            });

            map.on('click', function(e) {
              map.panTo(e.latlng);
            });
          } catch (e) {
            console.error('Leaflet initialization error:', e);
          }
        </script>
      </body>
    </html>
  `;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        {/* Top Bar with Search */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.searchBarContainer}>
            <Ionicons
              name="search"
              size={18}
              color="#64748B"
              style={{ marginRight: 6 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={common("map_search_placeholder") || "Search area, street or landmark..."}
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

        {/* Permission / Status Warning Banner */}
        {!!permissionError && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning-outline" size={16} color="#B45309" />
            <Text style={styles.warningBannerText}>{permissionError}</Text>
          </View>
        )}

        {/* Map View Area */}
        <View style={styles.mapContainer}>
          {mapError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="map-outline" size={48} color="#94A3B8" />
              <Text style={styles.errorTitle}>
                {common("map_error_title") || "Unable to load map"}
              </Text>
              <Text style={styles.errorSubtitle}>
                {common("map_error_subtitle") || "Please check your internet connection and location permissions."}
              </Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => {
                  setMapError(false);
                  reverseGeocodeCoordinates(currentLat, currentLng);
                }}
              >
                <Text style={styles.retryBtnText}>
                  {common("map_retry_btn") || "Retry Map"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <WebView
                ref={webViewRef}
                originWhitelist={["*"]}
                source={{ html: leafletHtml }}
                style={styles.map}
                onMessage={handleWebViewMessage}
                onError={() => setMapError(true)}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                cacheEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                  <View style={styles.mapLoading}>
                    <ActivityIndicator size="large" color="#2563EB" />
                  </View>
                )}
              />

              {/* Floating Instruction Badge */}
              <View style={styles.instructionBadge}>
                <Text style={styles.instructionText}>
                  {common("map_drag_instruction") || "📍 Drag map to position pin on your clinic"}
                </Text>
              </View>

              {/* Fixed Center Pin */}
              <View style={styles.centerPinWrapper} pointerEvents="none">
                <View
                  style={[
                    styles.centerPinIcon,
                    isMapMoving && styles.centerPinMoving,
                  ]}
                >
                  <Ionicons name="location" size={38} color="#2563EB" />
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
            </>
          )}
        </View>

        {/* Bottom Sheet */}
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
                <Text style={styles.loadingAddressText}>
                  {common("map_loading_address") || "Fetching address details..."}
                </Text>
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
              <Text style={styles.addressTitle}>
                {common("map_selected_location") || "Selected Clinic Location"}
              </Text>
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
              <Text style={styles.cancelBtnText}>
                {common("cancel") || "Cancel"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.confirmBtnText}>
                {common("map_confirm_btn") || "Confirm Location"}
              </Text>
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
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  warningBannerText: {
    fontSize: 12,
    color: "#B45309",
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F8FAFC",
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 12,
  },
  errorSubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
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
    marginTop: -38,
    marginLeft: -19,
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

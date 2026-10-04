import React, { memo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  validateAddress,
  validateCity,
  validateState,
  validatePincode,
} from "../../../utils/validation";

type Props = {
  initialAddress?: string;
  initialCity?: string;
  initialStateName?: string;
  initialPincode?: string;

  address?: string;
  setAddress?: (value: string) => void;
  city?: string;
  setCity?: (value: string) => void;
  stateName?: string;
  setStateName?: (value: string) => void;
  pincode?: string;
  setPincode?: (value: string) => void;

  previousStep: () => void;
  nextStep?: () => void;
  onNext?: (data: {
    address: string;
    city: string;
    stateName: string;
    pincode: string;
  }) => void;
};

function StepThree({
  initialAddress,
  initialCity,
  initialStateName,
  initialPincode,
  address: propAddress,
  setAddress: propSetAddress,
  city: propCity,
  setCity: propSetCity,
  stateName: propStateName,
  setStateName: propSetStateName,
  pincode: propPincode,
  setPincode: propSetPincode,
  previousStep,
  nextStep,
  onNext,
}: Props) {
  const { t: common } = useTranslation("common");
  const { t: signup } = useTranslation("signup");

  const [address, setAddress] = useState(
    propAddress !== undefined ? propAddress : initialAddress || ""
  );
  const [city, setCity] = useState(
    propCity !== undefined ? propCity : initialCity || ""
  );
  const [stateName, setStateName] = useState(
    propStateName !== undefined ? propStateName : initialStateName || ""
  );
  const [pincode, setPincode] = useState(
    propPincode !== undefined ? propPincode : initialPincode || ""
  );

  const [addressError, setAddressError] = useState("");
  const [cityError, setCityError] = useState("");
  const [stateError, setStateError] = useState("");
  const [pincodeError, setPincodeError] = useState("");

  const handleNext = () => {
    Keyboard.dismiss();
    setAddressError("");
    setCityError("");
    setStateError("");
    setPincodeError("");

    const addrVal = validateAddress(address, common);
    if (!addrVal.isValid) {
      setAddressError(addrVal.message);
      return;
    }

    const cityVal = validateCity(city, common);
    if (!cityVal.isValid) {
      setCityError(cityVal.message);
      return;
    }

    const stateVal = validateState(stateName, common);
    if (!stateVal.isValid) {
      setStateError(stateVal.message);
      return;
    }

    const pinVal = validatePincode(pincode, common);
    if (!pinVal.isValid) {
      setPincodeError(pinVal.message);
      return;
    }

    if (onNext) {
      onNext({
        address: address.trim(),
        city: city.trim(),
        stateName: stateName.trim(),
        pincode: pincode.trim(),
      });
    } else if (nextStep) {
      propSetAddress?.(address.trim());
      propSetCity?.(city.trim());
      propSetStateName?.(stateName.trim());
      propSetPincode?.(pincode.trim());
      nextStep();
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{signup("address_details")}</Text>
      <Text style={styles.subtitle}>{signup("address_details_subtitle")}</Text>

      {/* Address */}
      <Text style={styles.label}>{common("address")}</Text>
      <View
        style={[
          styles.textAreaContainer,
          addressError ? styles.errorInput : null,
        ]}
      >
        <TextInput
          style={styles.textArea}
          placeholder={common("address_placeholder")}
          placeholderTextColor="#94A3B8"
          multiline
          value={address}
          maxLength={250}
          onChangeText={(text) => {
            setAddress(text);
            if (addressError) setAddressError("");
          }}
          onBlur={() => {
            if (address.trim()) {
              const res = validateAddress(address, common);
              if (!res.isValid) setAddressError(res.message);
            }
          }}
        />
      </View>
      {!!addressError && <Text style={styles.errorText}>{addressError}</Text>}

      {/* City */}
      <Text style={styles.label}>{common("city")}</Text>
      <View
        style={[
          styles.inputContainer,
          cityError ? styles.errorInput : null,
        ]}
      >
        <Ionicons
          name="business-outline"
          size={20}
          color="#64748B"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          value={city}
          maxLength={100}
          placeholder={common("city_placeholder")}
          placeholderTextColor="#94A3B8"
          onChangeText={(text) => {
            const cleaned = text.replace(/[^a-zA-Z\s\.\-]/g, "");
            setCity(cleaned);
            if (cityError) setCityError("");
          }}
          onBlur={() => {
            if (city.trim()) {
              const res = validateCity(city, common);
              if (!res.isValid) setCityError(res.message);
            }
          }}
        />
      </View>
      {!!cityError && <Text style={styles.errorText}>{cityError}</Text>}

      {/* State */}
      <Text style={styles.label}>{common("state")}</Text>
      <View
        style={[
          styles.inputContainer,
          stateError ? styles.errorInput : null,
        ]}
      >
        <Ionicons
          name="map-outline"
          size={20}
          color="#64748B"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          value={stateName}
          maxLength={100}
          placeholder={common("state_placeholder")}
          placeholderTextColor="#94A3B8"
          onChangeText={(text) => {
            const cleaned = text.replace(/[^a-zA-Z\s\.\-]/g, "");
            setStateName(cleaned);
            if (stateError) setStateError("");
          }}
          onBlur={() => {
            if (stateName.trim()) {
              const res = validateState(stateName, common);
              if (!res.isValid) setStateError(res.message);
            }
          }}
        />
      </View>
      {!!stateError && <Text style={styles.errorText}>{stateError}</Text>}

      {/* Pincode */}
      <Text style={styles.label}>{common("pincode")}</Text>
      <View
        style={[
          styles.inputContainer,
          pincodeError ? styles.errorInput : null,
        ]}
      >
        <Ionicons
          name="pin-outline"
          size={20}
          color="#64748B"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          maxLength={6}
          value={pincode}
          placeholder={common("pincode_placeholder")}
          placeholderTextColor="#94A3B8"
          onChangeText={(text) => {
            const cleaned = text.replace(/\D/g, "");
            setPincode(cleaned);
            if (pincodeError) setPincodeError("");
          }}
          onBlur={() => {
            if (pincode.trim()) {
              const res = validatePincode(pincode, common);
              if (!res.isValid) setPincodeError(res.message);
            }
          }}
        />
      </View>
      {!!pincodeError && <Text style={styles.errorText}>{pincodeError}</Text>}

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={previousStep}
          activeOpacity={0.8}
        >
          <Text style={styles.backText}>{common("back")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextText}>{common("next")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default memo(StepThree);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 20,
    color: "#64748B",
    fontSize: 14,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "600",
    color: "#334155",
    fontSize: 14,
  },
  inputContainer: {
    height: 56,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    backgroundColor: "#FFF",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
    height: "100%",
  },
  textAreaContainer: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    minHeight: 90,
    padding: 12,
    backgroundColor: "#FFF",
  },
  textArea: {
    fontSize: 16,
    textAlignVertical: "top",
    color: "#0F172A",
  },
  errorInput: {
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    marginTop: 5,
    marginLeft: 4,
    fontSize: 13,
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28,
  },
  backButton: {
    width: "30%",
    height: 52,
    borderWidth: 1,
    borderColor: "#2563EB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  backText: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 15,
  },
  nextButton: {
    width: "65%",
    height: 52,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  nextText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
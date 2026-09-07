import React, { memo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

type Props = {
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;

  city: string;
  setCity: React.Dispatch<React.SetStateAction<string>>;

  stateName: string;
  setStateName: React.Dispatch<React.SetStateAction<string>>;

  pincode: string;
  setPincode: React.Dispatch<React.SetStateAction<string>>;

  previousStep: () => void;
  nextStep: () => void;
};

function StepThree({
  address,
  setAddress,
  city,
  setCity,
  stateName,
  setStateName,
  pincode,
  setPincode,
  previousStep,
  nextStep,
}: Props) {

  const { t: common } =
    useTranslation("common");

  const { t: signup } =
    useTranslation("signup");

  const [addressError, setAddressError] =
    useState("");

  const [cityError, setCityError] =
    useState("");

  const [stateError, setStateError] =
    useState("");

  const [pincodeError, setPincodeError] =
    useState("");

  const handleNext = () => {

    setAddressError("");
    setCityError("");
    setStateError("");
    setPincodeError("");

    let valid = true;

    if (!address.trim()) {
      setAddressError(
        signup("address_required")
      );
      valid = false;
    }

    if (!city.trim()) {
      setCityError(
        signup("city_required")
      );
      valid = false;
    }

    if (!stateName.trim()) {
      setStateError(
        signup("state_required")
      );
      valid = false;
    }

    if (!pincode.trim()) {
      setPincodeError(
        signup("pincode_required")
      );
      valid = false;
    } else if (pincode.length !== 6) {
      setPincodeError(
        signup("invalid_pincode")
      );
      valid = false;
    }

    if (!valid) return;

    nextStep();
  };

  return (
    <View style={styles.card}>

      <Text style={styles.title}>
        {signup("address_details")}
      </Text>

      <Text style={styles.subtitle}>
        {signup("address_details_subtitle")}
      </Text>

      {/* Address */}

      <Text style={styles.label}>
        {common("address")}
      </Text>

      <View
        style={[
          styles.textAreaContainer,
          addressError &&
            styles.errorInput,
        ]}
      >
        <TextInput
          style={styles.textArea}
          placeholder={common(
            "address_placeholder"
          )}
          multiline
          value={address}
          onChangeText={(text) => {
            setAddress(text);

            if (addressError)
              setAddressError("");
          }}
        />
      </View>

      {!!addressError && (
        <Text style={styles.errorText}>
          {addressError}
        </Text>
      )}

      {/* City */}

      <Text style={styles.label}>
        {common("city")}
      </Text>

      <View
        style={[
          styles.inputContainer,
          cityError &&
            styles.errorInput,
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
          placeholder={common(
            "city_placeholder"
          )}
          onChangeText={(text) => {
            setCity(text);

            if (cityError)
              setCityError("");
          }}
        />
      </View>

      {!!cityError && (
        <Text style={styles.errorText}>
          {cityError}
        </Text>
      )}

      {/* State */}

      <Text style={styles.label}>
        {common("state")}
      </Text>

      <View
        style={[
          styles.inputContainer,
          stateError &&
            styles.errorInput,
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
          placeholder={common(
            "state_placeholder"
          )}
          onChangeText={(text) => {
            setStateName(text);

            if (stateError)
              setStateError("");
          }}
        />
      </View>

      {!!stateError && (
        <Text style={styles.errorText}>
          {stateError}
        </Text>
      )}

      {/* Pincode */}

      <Text style={styles.label}>
        {common("pincode")}
      </Text>

      <View
        style={[
          styles.inputContainer,
          pincodeError &&
            styles.errorInput,
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
          placeholder={common(
            "pincode_placeholder"
          )}
          onChangeText={(text) => {
            setPincode(text);

            if (pincodeError)
              setPincodeError("");
          }}
        />
      </View>

      {!!pincodeError && (
        <Text style={styles.errorText}>
          {pincodeError}
        </Text>
      )}

      <View style={styles.buttonRow}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={previousStep}
        >
          <Text style={styles.backText}>
            {common("back")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextText}>
            {common("next")}
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

export default memo(StepThree);

const styles = StyleSheet.create({
  card:{
    backgroundColor:"#FFF",
    borderRadius:18,
    padding:20,
    elevation:3,
  },

  title:{
    fontSize:22,
    fontWeight:"700",
    color:"#0F172A",
  },

  subtitle:{
    marginTop:6,
    marginBottom:20,
    color:"#64748B",
  },

  label:{
    marginTop:16,
    marginBottom:8,
    fontWeight:"600",
    color:"#334155",
  },

  inputContainer:{
    height:56,
    borderWidth:1,
    borderColor:"#CBD5E1",
    borderRadius:12,
    flexDirection:"row",
    alignItems:"center",
    paddingHorizontal:15,
  },

  icon:{
    marginRight:10,
  },

  input:{
    flex:1,
    fontSize:16,
  },

  textAreaContainer:{
    borderWidth:1,
    borderColor:"#CBD5E1",
    borderRadius:12,
    minHeight:110,
    padding:15,
  },

  textArea:{
    fontSize:16,
    textAlignVertical:"top",
  },

  errorInput:{
    borderColor:"#EF4444",
  },

  errorText:{
    color:"#EF4444",
    marginTop:5,
    marginLeft:4,
    fontSize:13,
  },

  buttonRow:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginTop:28,
  },

  backButton:{
    width:"30%",
    height:52,
    borderWidth:1,
    borderColor:"#2563EB",
    borderRadius:12,
    justifyContent:"center",
    alignItems:"center",
  },

  backText:{
    color:"#2563EB",
    fontWeight:"700",
  },

  nextButton:{
    width:"65%",
    height:52,
    backgroundColor:"#2563EB",
    borderRadius:12,
    justifyContent:"center",
    alignItems:"center",
  },

  nextText:{
    color:"#FFF",
    fontWeight:"700",
  },
});
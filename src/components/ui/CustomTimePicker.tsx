import React, {
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";

import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";

export type TimeResult = {
  hour: string;
  minute: string;
  period: "AM" | "PM";
};

export type TimePickerRef = {
  open: (
    value: TimeResult,
    callback: (time: TimeResult) => void
  ) => void;

  close: () => void;
};

const CustomTimePicker = forwardRef<
  TimePickerRef,
  {}
>((props, ref) => {
  const [visible, setVisible] =
    useState(false);

  const [hour, setHour] =
    useState("09");

  const [minute, setMinute] =
    useState("00");

  const [period, setPeriod] =
    useState<"AM" | "PM">("AM");

  const [onSelect, setOnSelect] =
    useState<
      ((t: TimeResult) => void) | null
    >(null);

  useImperativeHandle(ref, () => ({
    open(value, callback) {
      setHour(value.hour);
      setMinute(value.minute);
      setPeriod(value.period);

      setOnSelect(() => callback);

      setVisible(true);
    },

    close() {
      setVisible(false);
    },
  }));

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>
            Select Time
          </Text>

         <View style={styles.pickerContainer}>
  <View style={styles.column}>
    <Text style={styles.heading}>
      Hour
    </Text>

    <FlatList
      data={HOURS}
      keyExtractor={(item) => item}
      showsVerticalScrollIndicator={false}
      style={{ maxHeight: 220 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.item,
            hour === item &&
              styles.selectedItem,
          ]}
          onPress={() =>
            setHour(item)
          }
        >
          <Text
            style={[
              styles.itemText,
              hour === item &&
                styles.selectedItemText,
            ]}
          >
            {item}
          </Text>
        </TouchableOpacity>
      )}
    />
  </View>
<View style={styles.column}>
  <Text style={styles.heading}>
    Minute
  </Text>

  <FlatList
    data={MINUTES}
    keyExtractor={(item) => item}
    showsVerticalScrollIndicator={false}
    style={{ maxHeight: 220 }}
    renderItem={({ item }) => (
      <TouchableOpacity
        style={[
          styles.item,
          minute === item &&
            styles.selectedItem,
        ]}
        onPress={() =>
          setMinute(item)
        }
      >
        <Text
          style={[
            styles.itemText,
            minute === item &&
              styles.selectedItemText,
          ]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    )}
  />
</View>

  <View style={styles.column}>
  <Text style={styles.heading}>
    AM / PM
  </Text>

  <FlatList
    data={PERIODS}
    keyExtractor={(item) => item}
    showsVerticalScrollIndicator={false}
    style={{ maxHeight: 220 }}
    renderItem={({ item }) => (
      <TouchableOpacity
        style={[
          styles.item,
          period === item &&
            styles.selectedItem,
        ]}
        onPress={() => setPeriod(item)}
      >
        <Text
          style={[
            styles.itemText,
            period === item &&
              styles.selectedItemText,
          ]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    )}
  />
</View>
</View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() =>
                setVisible(false)
              }
            >
              <Text>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.doneBtn}
             onPress={() => {
  onSelect?.({
    hour,
    minute,
    period,
  });

  setVisible(false);
}}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "700",
                }}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

export default CustomTimePicker;
const HOURS = Array.from(
  { length: 12 },
  (_, i) => String(i + 1).padStart(2, "0")
);

const MINUTES = Array.from(
  { length: 60 },
  (_, i) => String(i).padStart(2, "0")
);

const PERIODS: ("AM" | "PM")[] = [
  "AM",
  "PM",
];
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },

  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    minHeight: 420,
  },

  title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },

  footer: {
    flexDirection: "row",
    marginTop: 25,
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: "#E2E8F0",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 8,
  },

  doneBtn: {
    flex: 1,
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginLeft: 8,
  },
  pickerContainer: {
  flexDirection: "row",
},

column: {
  flex: 1,
  marginHorizontal: 5,
},

heading: {
  textAlign: "center",
  fontWeight: "700",
  fontSize: 16,
  marginBottom: 10,
},

item: {
  paddingVertical: 12,
  borderRadius: 12,
  alignItems: "center",
  marginBottom: 6,
},

selectedItem: {
  backgroundColor: "#2563EB",
},

itemText: {
  fontSize: 18,
  color: "#334155",
},

selectedItemText: {
  color: "#fff",
  fontWeight: "700",
},
});
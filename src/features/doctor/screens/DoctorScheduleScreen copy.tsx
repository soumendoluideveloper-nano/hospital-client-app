import React, { useState,useRef } from "react";


import CustomTimePicker, {
  TimePickerRef,
  TimeResult,
} from "../../../components/ui/CustomTimePicker";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Session = {
  id: string;
  startTime: string;
  endTime: string;
};

type DaySchedule = {
  day: string;
  enabled: boolean;
  sessions: Session[];
};

const initialSchedule: DaySchedule[] = [
  {
    day: "Monday",
    enabled: true,
    sessions: [
      {
        id: "1",
        startTime: "09:00 AM",
        endTime: "01:00 PM",
      },
      {
        id: "2",
        startTime: "05:00 PM",
        endTime: "08:00 PM",
      },
    ],
  },
  {
    day: "Tuesday",
    enabled: true,
    sessions: [
      {
        id: "1",
        startTime: "10:00 AM",
        endTime: "02:00 PM",
      },
    ],
  },
  {
    day: "Wednesday",
    enabled: false,
    sessions: [],
  },
  {
    day: "Thursday",
    enabled: true,
    sessions: [
      {
        id: "1",
        startTime: "09:00 AM",
        endTime: "01:00 PM",
      },
    ],
  },
  {
    day: "Friday",
    enabled: true,
    sessions: [
      {
        id: "1",
        startTime: "09:00 AM",
        endTime: "01:00 PM",
      },
    ],
  },
  {
    day: "Saturday",
    enabled: true,
    sessions: [
      {
        id: "1",
        startTime: "10:00 AM",
        endTime: "03:00 PM",
      },
    ],
  },
  {
    day: "Sunday",
    enabled: false,
    sessions: [],
  },
];

export default function DoctorScheduleScreen() {
  const [schedule, setSchedule] =
    useState(initialSchedule);


const [selectedDay, setSelectedDay] = useState(0);

const [selectedSession, setSelectedSession] = useState(0);

const [selectedType, setSelectedType] = useState<
  "startTime" | "endTime"
>("startTime");
const timePickerRef = useRef<TimePickerRef>(null);
const openPicker = (
  dayIndex: number,
  sessionIndex: number,
  type: "startTime" | "endTime"
) => {
  setSelectedDay(dayIndex);
  setSelectedSession(sessionIndex);
  setSelectedType(type);

  const current =
    schedule[dayIndex].sessions[sessionIndex][
      type
    ];

  let hour = "09";
  let minute = "00";
  let period: "AM" | "PM" = "AM";

  if (current) {
    const parts = current.split(" ");

    if (parts.length === 2) {
      const hm = parts[0].split(":");

      hour = hm[0];

      minute = hm[1];

      period = parts[1] as "AM" | "PM";
    }
  }

  timePickerRef.current?.open(
    {
      hour,
      minute,
      period,
    },
    (time: TimeResult) => {
      const data = [...schedule];

      data[dayIndex].sessions[
        sessionIndex
      ][type] =
        `${time.hour}:${time.minute} ${time.period}`;

      setSchedule(data);
    }
  );
};

  const toggleDay = (dayIndex: number) => {
    const data = [...schedule];

    data[dayIndex].enabled =
      !data[dayIndex].enabled;

    if (
      data[dayIndex].enabled &&
      data[dayIndex].sessions.length === 0
    ) {
      data[dayIndex].sessions.push({
        id: Date.now().toString(),
        startTime: "",
        endTime: "",
      });
    }

    setSchedule(data);
  };

  const addSession = (dayIndex: number) => {
    const data = [...schedule];

    data[dayIndex].sessions.push({
      id: Date.now().toString(),
      startTime: "",
      endTime: "",
    });

    setSchedule(data);
  };

  const removeSession = (
    dayIndex: number,
    sessionId: string
  ) => {
    const data = [...schedule];

    data[dayIndex].sessions =
      data[dayIndex].sessions.filter(
        (s) => s.id !== sessionId
      );

    setSchedule(data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            Doctor Schedule
          </Text>

          <Text style={styles.subTitle}>
            Weekly Availability
          </Text>
        </View>

        {schedule.map((day, dayIndex) => (
          <View
            key={day.day}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.dayName}>
                {day.day}
              </Text>

              <Switch
                value={day.enabled}
                onValueChange={() =>
                  toggleDay(dayIndex)
                }
              />
            </View>

            {!day.enabled ? (
              <View style={styles.holiday}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color="#EF4444"
                />

                <Text style={styles.holidayText}>
                  Holiday
                </Text>
              </View>
            ) : (
              <>
                {day.sessions.map(
                  (session, sessionIndex) => (
                    <View
                      key={session.id}
                      style={styles.sessionCard}
                    >
                      <View
                        style={
                          styles.sessionHeader
                        }
                      >
                        <Text
                          style={
                            styles.sessionTitle
                          }
                        >
                          Session{" "}
                          {sessionIndex + 1}
                        </Text>

                        {day.sessions.length >
                          1 && (
                          <TouchableOpacity
                            onPress={() =>
                              removeSession(
                                dayIndex,
                                session.id
                              )
                            }
                          >
                            <Ionicons
                              name="trash-outline"
                              size={20}
                              color="#EF4444"
                            />
                          </TouchableOpacity>
                        )}
                      </View>

                      <TouchableOpacity
  style={styles.timeButton}
  onPress={() =>
    openPicker(
      dayIndex,
      sessionIndex,
      "startTime"
    )
  }
>
                        <Ionicons
                          name="time-outline"
                          size={18}
                          color="#2563EB"
                        />

                        <Text
                          style={
                            styles.timeText
                          }
                        >
                          Start Time
                        </Text>

                        <Text
                          style={
                            styles.timeValue
                          }
                        >
                          {session.startTime ||
                            "--:--"}
                        </Text>
                      </TouchableOpacity>

                     <TouchableOpacity
  style={styles.timeButton}
  onPress={() =>
    openPicker(
      dayIndex,
      sessionIndex,
      "endTime"
    )
  }
>
                        <Ionicons
                          name="time-outline"
                          size={18}
                          color="#2563EB"
                        />

                        <Text
                          style={
                            styles.timeText
                          }
                        >
                          End Time
                        </Text>

                        <Text
                          style={
                            styles.timeValue
                          }
                        >
                          {session.endTime ||
                            "--:--"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )
                )}

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() =>
                    addSession(dayIndex)
                  }
                >
                  <Ionicons
                    name="add-circle"
                    size={20}
                    color="#2563EB"
                  />

                  <Text
                    style={styles.addText}
                  >
                    Add Session
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ))}
 
      </ScrollView>
   <CustomTimePicker
  ref={timePickerRef}
/>
    </SafeAreaView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },

  header: {
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
  },

  subTitle: {
    marginTop: 4,
    color: "#64748B",
  },

  card: {
    marginHorizontal: 18,
    marginBottom: 18,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dayName: {
    fontSize: 18,
    fontWeight: "700",
  },

  holiday: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  holidayText: {
    marginLeft: 8,
    color: "#EF4444",
    fontWeight: "600",
  },

  sessionCard: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 15,
  },

  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  sessionTitle: {
    fontWeight: "700",
    fontSize: 16,
  },

  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },

  timeText: {
    marginLeft: 8,
    flex: 1,
    color: "#475569",
  },

  timeValue: {
    fontWeight: "700",
    color: "#2563EB",
  },

  addButton: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#2563EB",
  },

  addText: {
    marginLeft: 8,
    color: "#2563EB",
    fontWeight: "700",
  },
});
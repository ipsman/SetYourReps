import { CircularProgressBar } from "@/components/ProgressBar";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ImageBackground,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

type DayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

interface WeekDayItem {
  day: DayKey;
  icon: "run" | "bed" | "weight-lifter";
  completed: boolean;
  lastWorkout?: string;
  durationMinutes?: number;
}

const INITIAL_WEEK_DAYS: WeekDayItem[] = [
  {
    day: "Mon",
    icon: "run",
    completed: true,
    lastWorkout: "5 km Tempo Run",
    durationMinutes: 35,
  },
  { day: "Tue", icon: "bed", completed: false },
  {
    day: "Wed",
    icon: "weight-lifter",
    completed: true,
    lastWorkout: "Upper Body",
    durationMinutes: 55,
  },
  { day: "Thu", icon: "bed", completed: false },
  {
    day: "Fri",
    icon: "weight-lifter",
    completed: true,
    lastWorkout: "Pull Day",
    durationMinutes: 60,
  },
  { day: "Sat", icon: "bed", completed: false },
  {
    day: "Sun",
    icon: "weight-lifter",
    completed: true,
    lastWorkout: "Legs & Core",
    durationMinutes: 50,
  },
];

const QUICK_TEMPLATES: {
  title: string;
  type: "weight-lifter" | "run";
  meta: string;
}[] = [
  { title: "Push Day", type: "weight-lifter", meta: "45-60m" },
  { title: "Pull Day", type: "weight-lifter", meta: "45-60m" },
  { title: "Cardio Run", type: "run", meta: "30m" },
];

function formatElapsed(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hrs > 0
    ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}`
    : `${pad(mins)}:${pad(secs)}`;
}

export default function HomeScreen() {
  const [weekDays, setWeekDays] = useState<WeekDayItem[]>(INITIAL_WEEK_DAYS);

  // Aktív edzés állapot
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activeWorkoutTitle, setActiveWorkoutTitle] =
    useState("Strength Session");

  // Új edzés modal állapot
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayKey>("Thu");
  const [workoutName, setWorkoutName] = useState("");
  const [workoutType, setWorkoutType] = useState<"weight-lifter" | "run">(
    "weight-lifter",
  );

  // Recent workouts részletező / törlő modal állapot
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState<DayKey | null>(
    null,
  );

  useEffect(() => {
    if (!isWorkoutActive) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isWorkoutActive]);

  const handleToggleWorkoutSession = () => {
    if (!isWorkoutActive) {
      setElapsedSeconds(0);
      setIsWorkoutActive(true);
    } else {
      const completedMins = Math.max(1, Math.round(elapsedSeconds / 60));
      setWeekDays((prev) =>
        prev.map((item) =>
          item.day === selectedDay
            ? {
                ...item,
                completed: true,
                icon: workoutType,
                lastWorkout: activeWorkoutTitle.trim() || "Completed Workout",
                durationMinutes: (item.durationMinutes ?? 0) + completedMins,
              }
            : item,
        ),
      );
      setIsWorkoutActive(false);
    }
  };

  const handleSaveNewWorkout = () => {
    const cleanTitle = workoutName.trim() || "Custom Workout";
    setWeekDays((prev) =>
      prev.map((item) =>
        item.day === selectedDay
          ? {
              ...item,
              completed: true,
              icon: workoutType,
              lastWorkout: cleanTitle,
              durationMinutes: item.durationMinutes ?? 40,
            }
          : item,
      ),
    );
    setWorkoutName("");
    setAddModalVisible(false);
  };

  const handleDeleteWorkout = (dayToClear: DayKey) => {
    setWeekDays((prev) =>
      prev.map((item) =>
        item.day === dayToClear
          ? {
              ...item,
              completed: false,
              icon: "bed",
              lastWorkout: undefined,
              durationMinutes: undefined,
            }
          : item,
      ),
    );
    setSelectedWorkoutDay(null);
  };

  const handleRepeatWorkout = (item: WeekDayItem) => {
    setSelectedDay(item.day);
    setActiveWorkoutTitle(item.lastWorkout ?? "Workout");
    if (item.icon === "run" || item.icon === "weight-lifter") {
      setWorkoutType(item.icon);
    }
    setElapsedSeconds(0);
    setIsWorkoutActive(true);
    setSelectedWorkoutDay(null);
  };

  const completedWorkouts = weekDays.filter((item) => item.completed);
  const completedCount = completedWorkouts.length;
  const weeklyCompletionPercent = Math.round((completedCount / 7) * 100);
  const totalActiveMinutes = completedWorkouts.reduce(
    (sum, item) => sum + (item.durationMinutes ?? 40),
    0,
  );
  const selectedDayItem = weekDays.find((d) => d.day === selectedDay);
  const selectedWorkoutItem =
    completedWorkouts.find((item) => item.day === selectedWorkoutDay) ?? null;

  return (
    <SafeAreaView className="flex-1 bg-[#111111]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Képes fejléc */}
        <View style={{ height: 256, width: "100%", overflow: "hidden" }}>
          <ImageBackground
            source={{
              uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqPCjJ2wCZJgLWkRohoz84HNpZ76cAd6dM5rz8OvNRiw&s=10",
            }}
            style={{ flex: 1, justifyContent: "space-between" }}
            resizeMode="cover"
          >
            {/* Felső szöveg */}
            <View
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                padding: 16,
                zIndex: 2,
              }}
            >
              <Text className="text-[#FFFFFF] font-bold text-2xl">
                Welcome back Máté!
              </Text>
              <Text className="text-[#FFFFFF] text-base font-bold mt-1">
                {isWorkoutActive
                  ? `Workout in progress • ${formatElapsed(elapsedSeconds)}`
                  : "Ready for a workout?"}
              </Text>
            </View>

            {/* Teljesen #111111-be kifutó alsó átmenet */}
            <LinearGradient
              colors={["transparent", "#111111"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 170,
                zIndex: 1,
              }}
            />
          </ImageBackground>
        </View>

        {/* Edzéskártya (negatív margóval kicsit rácsúszik a halványuló részre) */}
        <View className="bg-[#242424] border border-[#353535] rounded-2xl p-4 mx-4 -mt-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-2">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-[#FFFFFF] font-bold text-base">
                  My workouts
                </Text>
                <Text className="text-[#35C878] text-xs font-semibold">
                  {completedCount}/7 done
                </Text>
              </View>

              <View className="flex-row items-center gap-2.5">
                {weekDays.map((item) => (
                  <TouchableOpacity
                    key={item.day}
                    activeOpacity={0.7}
                    onPress={() => setSelectedDay(item.day)}
                    className="items-center gap-1 w-7"
                  >
                    <Text
                      className={`text-[13px] font-medium ${
                        selectedDay === item.day
                          ? "text-[#FFFFFF] font-bold"
                          : "text-[#A3A3A3]"
                      }`}
                    >
                      {item.day}
                    </Text>
                    <View
                      className={`rounded-full w-8 h-8 items-center justify-center ${
                        item.completed ? "bg-[#35C878]" : "bg-[#353535]"
                      } ${
                        selectedDay === item.day
                          ? "border border-[#FFFFFF]"
                          : ""
                      }`}
                    >
                      <MaterialCommunityIcons
                        name={item.icon}
                        color={item.completed ? "#111111" : "#A3A3A3"}
                        size={18}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Jobb oldal: Új edzés hozzáadása */}
            <View className="border-l border-[#353535] px-3 pl-6 items-center justify-center">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setAddModalVisible(true)}
                className="items-center gap-1.5"
              >
                <View className="rounded-full bg-[#F04438] w-8 h-8 items-center justify-center">
                  <MaterialCommunityIcons
                    name="plus"
                    color="#FFFFFF"
                    size={20}
                  />
                </View>
                <Text className="text-[#FFFFFF] text-[11px] font-medium text-center leading-tight">
                  Add{"\n"}workout
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Kiválasztott nap összefoglalója */}
          <View className="mt-3 pt-2.5 border-t border-[#353535] flex-row items-center justify-between">
            <Text className="text-[#A3A3A3] text-xs">
              {selectedDay}:{" "}
              <Text className="text-[#FFFFFF] font-semibold">
                {selectedDayItem?.completed
                  ? (selectedDayItem.lastWorkout ?? "Completed")
                  : "Rest day"}
              </Text>
            </Text>
            {selectedDayItem?.durationMinutes ? (
              <Text className="text-[#A3A3A3] text-xs">
                {selectedDayItem.durationMinutes} min
              </Text>
            ) : null}
          </View>
        </View>

        {/* Aktív edzés státuszkártya */}
        {isWorkoutActive && (
          <View className="bg-[#1B1B1B] border border-[#35C878] rounded-2xl p-4 mx-4 mt-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-[#35C878] text-xs font-bold uppercase">
                  Active Session ({selectedDay})
                </Text>
                <Text className="text-[#FFFFFF] text-lg font-bold mt-0.5">
                  {activeWorkoutTitle}
                </Text>
              </View>
              <Text className="text-[#FFFFFF] text-2xl font-bold">
                {formatElapsed(elapsedSeconds)}
              </Text>
            </View>
          </View>
        )}

        {/* Fő CTA gomb */}
        <View className="mt-5 mx-4">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleToggleWorkoutSession}
            className={`w-full py-3.5 rounded-2xl items-center ${
              isWorkoutActive ? "bg-[#35C878]" : "bg-[#F04438]"
            }`}
          >
            <Text
              className={`font-bold text-lg ${
                isWorkoutActive ? "text-[#111111]" : "text-[#FFFFFF]"
              }`}
            >
              {isWorkoutActive ? "Finish workout" : "Start a workout"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Weekly stats kártya */}
        <View className="bg-[#242424] border border-[#353535] rounded-2xl p-4 mx-4 mt-5">
          <Text className="text-[#FFFFFF] font-bold text-base mb-3">
            Weekly stats
          </Text>
          <View className="flex-row items-center justify-between gap-4">
            <CircularProgressBar
              progress={weeklyCompletionPercent}
              showPercentage={true}
              size={130}
              label="Weekly goal"
              color="#35C878"
            />

            <View className="flex-1 gap-3">
              <View className="bg-[#1B1B1B] border border-[#353535] rounded-xl p-3">
                <Text className="text-[#A3A3A3] text-xs">Active time</Text>
                <Text className="text-[#FFFFFF] text-lg font-bold mt-0.5">
                  {totalActiveMinutes} min
                </Text>
              </View>

              <View className="bg-[#1B1B1B] border border-[#353535] rounded-xl p-3">
                <Text className="text-[#A3A3A3] text-xs">Sessions done</Text>
                <Text className="text-[#35C878] text-lg font-bold mt-0.5">
                  {completedCount} / 7 days
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Gyors edzéssablonok */}
        <View className="mx-4 mt-5">
          <Text className="text-[#FFFFFF] font-bold text-base mb-2.5">
            Quick start templates
          </Text>
          <View className="flex-row gap-2.5">
            {QUICK_TEMPLATES.map((tpl) => (
              <TouchableOpacity
                key={tpl.title}
                activeOpacity={0.75}
                onPress={() => {
                  setActiveWorkoutTitle(tpl.title);
                  setWorkoutType(tpl.type);
                  setElapsedSeconds(0);
                  setIsWorkoutActive(true);
                }}
                className="flex-1 bg-[#242424] border border-[#353535] rounded-2xl p-3"
              >
                <View className="w-7 h-7 rounded-full bg-[#1B1B1B] items-center justify-center mb-2">
                  <MaterialCommunityIcons
                    name={tpl.type}
                    color="#F04438"
                    size={16}
                  />
                </View>
                <Text
                  numberOfLines={1}
                  className="text-[#FFFFFF] font-bold text-xs"
                >
                  {tpl.title}
                </Text>
                <Text className="text-[#A3A3A3] text-[11px] mt-0.5">
                  {tpl.meta}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Legutóbbi edzések */}
        <View className="bg-[#242424] border border-[#353535] rounded-2xl p-4 mx-4 mt-5">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[#FFFFFF] font-bold text-base">
              Recent workouts
            </Text>
            <Text className="text-[#A3A3A3] text-xs">Tap for details</Text>
          </View>

          {completedWorkouts.length === 0 ? (
            <Text className="text-[#A3A3A3] text-xs py-3">
              No completed workouts yet this week.
            </Text>
          ) : (
            <View>
              {completedWorkouts.slice(0, 4).map((item, idx, arr) => (
                <TouchableOpacity
                  key={item.day}
                  activeOpacity={0.75}
                  onPress={() => setSelectedWorkoutDay(item.day)}
                  className={`flex-row items-center justify-between py-2.5 ${
                    idx < arr.length - 1 ? "border-b border-[#353535]" : ""
                  }`}
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-9 h-9 rounded-full bg-[#35C878]/15 items-center justify-center">
                      <MaterialCommunityIcons
                        name={item.icon}
                        color="#35C878"
                        size={18}
                      />
                    </View>
                    <View>
                      <Text className="text-[#FFFFFF] font-semibold text-sm">
                        {item.lastWorkout ?? "Workout"}
                      </Text>
                      <Text className="text-[#A3A3A3] text-xs">{item.day}</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-2">
                    <Text className="text-[#35C878] font-semibold text-xs">
                      {item.durationMinutes ?? 40} min
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      color="#A3A3A3"
                      size={20}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Új edzés felvétele Modal */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View className="flex-1 bg-black/75 justify-end">
          <View className="bg-[#1B1B1B] border-t border-[#353535] rounded-t-3xl p-5">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-[#FFFFFF] font-bold text-xl">
                Add workout ({selectedDay})
              </Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <MaterialCommunityIcons
                  name="close"
                  color="#A3A3A3"
                  size={24}
                />
              </TouchableOpacity>
            </View>

            <Text className="text-[#A3A3A3] text-sm mb-1.5">Workout name</Text>
            <TextInput
              value={workoutName}
              onChangeText={(text) => {
                setWorkoutName(text);
                if (text.trim()) setActiveWorkoutTitle(text);
              }}
              placeholder="e.g. Push Day or 5K Run"
              placeholderTextColor="#A3A3A3"
              className="bg-[#242424] border border-[#353535] text-[#FFFFFF] rounded-xl px-4 py-3 mb-4"
            />

            <Text className="text-[#A3A3A3] text-sm mb-2">Type</Text>
            <View className="flex-row gap-3 mb-6">
              <TouchableOpacity
                onPress={() => setWorkoutType("weight-lifter")}
                className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl border ${
                  workoutType === "weight-lifter"
                    ? "bg-[#242424] border-[#F04438]"
                    : "bg-[#242424] border-[#353535]"
                }`}
              >
                <MaterialCommunityIcons
                  name="weight-lifter"
                  color="#FFFFFF"
                  size={20}
                />
                <Text className="text-[#FFFFFF] font-semibold">Strength</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setWorkoutType("run")}
                className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl border ${
                  workoutType === "run"
                    ? "bg-[#242424] border-[#F04438]"
                    : "bg-[#242424] border-[#353535]"
                }`}
              >
                <MaterialCommunityIcons name="run" color="#FFFFFF" size={20} />
                <Text className="text-[#FFFFFF] font-semibold">Cardio</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSaveNewWorkout}
              className="w-full py-3.5 bg-[#F04438] rounded-2xl items-center"
            >
              <Text className="text-[#FFFFFF] font-bold text-base">
                Save workout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edzés részletező és törlő Modal */}
      <Modal
        visible={Boolean(selectedWorkoutItem)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedWorkoutDay(null)}
      >
        <View className="flex-1 bg-black/75 justify-end">
          <View className="bg-[#1B1B1B] border-t border-[#353535] rounded-t-3xl p-5">
            {selectedWorkoutItem && (
              <>
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center gap-2.5">
                    <View className="w-10 h-10 rounded-full bg-[#35C878]/15 items-center justify-center">
                      <MaterialCommunityIcons
                        name={selectedWorkoutItem.icon}
                        color="#35C878"
                        size={22}
                      />
                    </View>
                    <View>
                      <Text className="text-[#FFFFFF] font-bold text-xl">
                        {selectedWorkoutItem.lastWorkout ?? "Workout"}
                      </Text>
                      <Text className="text-[#A3A3A3] text-xs">
                        {selectedWorkoutItem.day} •{" "}
                        {selectedWorkoutItem.icon === "run"
                          ? "Cardio"
                          : "Strength"}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity onPress={() => setSelectedWorkoutDay(null)}>
                    <MaterialCommunityIcons
                      name="close"
                      color="#A3A3A3"
                      size={24}
                    />
                  </TouchableOpacity>
                </View>

                <View className="flex-row gap-3 mb-6">
                  <View className="flex-1 bg-[#242424] border border-[#353535] rounded-2xl p-3.5">
                    <Text className="text-[#A3A3A3] text-xs">Duration</Text>
                    <Text className="text-[#FFFFFF] font-bold text-lg mt-1">
                      {selectedWorkoutItem.durationMinutes ?? 40} min
                    </Text>
                  </View>

                  <View className="flex-1 bg-[#242424] border border-[#353535] rounded-2xl p-3.5">
                    <Text className="text-[#A3A3A3] text-xs">Status</Text>
                    <Text className="text-[#35C878] font-bold text-lg mt-1">
                      Completed
                    </Text>
                  </View>
                </View>

                <View className="gap-3">
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleRepeatWorkout(selectedWorkoutItem)}
                    className="w-full py-3.5 bg-[#35C878] rounded-2xl items-center"
                  >
                    <Text className="text-[#111111] font-bold text-base">
                      Start again
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleDeleteWorkout(selectedWorkoutItem.day)}
                    className="w-full py-3.5 bg-[#242424] border border-[#F04438] rounded-2xl items-center"
                  >
                    <Text className="text-[#F04438] font-bold text-base">
                      Delete workout
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

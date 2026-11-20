import { AVAILABLE_MACHINES, useWorkout } from "@/context/workoutContext";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

function formatElapsed(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hrs > 0
    ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}`
    : `${pad(mins)}:${pad(secs)}`;
}

export default function WorkoutScreen() {
  const {
    selectedDay,
    elapsedSeconds,
    activeWorkoutTitle,
    activePlan,
    exerciseEdits,
    selectExerciseMachine,
    updateMachineEntry,
    cycleExerciseSets,
    finishWorkoutSession,
  } = useWorkout();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [machineDropdownOpen, setMachineDropdownOpen] = useState(false);

  const exercises = activePlan?.exercises ?? [];
  const totalExercises = exercises.length;

  useEffect(() => {
    setCurrentIndex(0);
  }, [activePlan?.id]);

  const currentExercise =
    totalExercises > 0
      ? exercises[Math.min(currentIndex, totalExercises - 1)]
      : null;

  const editState = currentExercise
    ? (exerciseEdits[currentExercise.id] ?? {
        selectedMachine: AVAILABLE_MACHINES[0],
        machineEntries: {
          [AVAILABLE_MACHINES[0]]: {
            reps: currentExercise.reps,
            weight: currentExercise.weightNote,
          },
        },
        completedSets: 0,
      })
    : null;

  const activeMachine = editState?.selectedMachine ?? AVAILABLE_MACHINES[0];
  const currentMachineEntry = editState?.machineEntries[activeMachine] ?? {
    reps: currentExercise?.reps ?? "",
    weight: "",
  };

  const loggedMachines = Object.entries(editState?.machineEntries ?? {});

  const handleFinishAndReturn = () => {
    finishWorkoutSession();
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#111111]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Felső fejléc */}
        <View className="bg-[#1B1B1B] border-b border-[#353535] px-4 py-3.5 flex-row items-center justify-between">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="flex-row items-center gap-1"
          >
            <MaterialCommunityIcons
              name="chevron-left"
              color="#FFFFFF"
              size={26}
            />
            <Text className="text-[#FFFFFF] font-semibold text-base">Back</Text>
          </TouchableOpacity>

          <View className="items-center flex-1 px-2">
            <Text className="text-[#35C878] text-[11px] font-bold uppercase">
              {selectedDay} •{" "}
              {totalExercises > 0
                ? `${currentIndex + 1} / ${totalExercises} gyakorlat`
                : "Szabad edzés"}
            </Text>
            <Text
              numberOfLines={1}
              className="text-[#FFFFFF] font-bold text-base"
            >
              {activeWorkoutTitle}
            </Text>
          </View>

          <Text className="text-[#FFFFFF] font-bold text-lg">
            {formatElapsed(elapsedSeconds)}
          </Text>
        </View>

        {/* Gyakorlat-léptető sáv */}
        {totalExercises > 0 && (
          <View className="px-4 pt-3 pb-1 flex-row items-center justify-between gap-2">
            <TouchableOpacity
              activeOpacity={0.75}
              disabled={currentIndex === 0}
              onPress={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className={`flex-row items-center gap-1 px-3.5 py-2 rounded-xl border ${
                currentIndex === 0
                  ? "bg-[#1B1B1B] border-[#242424] opacity-40"
                  : "bg-[#242424] border-[#353535]"
              }`}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                color="#FFFFFF"
                size={18}
              />
              <Text className="text-[#FFFFFF] font-semibold text-xs">
                Előző
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center gap-1.5">
              {exercises.map((ex, idx) => {
                const exSets = exerciseEdits[ex.id]?.completedSets ?? 0;
                const isExDone = exSets >= ex.sets;
                const isCurrent = idx === currentIndex;

                return (
                  <TouchableOpacity
                    key={ex.id}
                    onPress={() => setCurrentIndex(idx)}
                    className={`w-7 h-7 rounded-full items-center justify-center border ${
                      isCurrent
                        ? "bg-[#F04438] border-[#FFFFFF]"
                        : isExDone
                          ? "bg-[#35C878] border-[#35C878]"
                          : "bg-[#242424] border-[#353535]"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        isCurrent
                          ? "text-[#FFFFFF]"
                          : isExDone
                            ? "text-[#111111]"
                            : "text-[#A3A3A3]"
                      }`}
                    >
                      {idx + 1}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              activeOpacity={0.75}
              disabled={currentIndex >= totalExercises - 1}
              onPress={() =>
                setCurrentIndex((prev) =>
                  Math.min(totalExercises - 1, prev + 1),
                )
              }
              className={`flex-row items-center gap-1 px-3.5 py-2 rounded-xl border ${
                currentIndex >= totalExercises - 1
                  ? "bg-[#1B1B1B] border-[#242424] opacity-40"
                  : "bg-[#242424] border-[#353535]"
              }`}
            >
              <Text className="text-[#FFFFFF] font-semibold text-xs">
                Következő
              </Text>
              <MaterialCommunityIcons
                name="arrow-right"
                color="#FFFFFF"
                size={18}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Egyetlen aktuális gyakorlat kártyája */}
        <ScrollView
          className="flex-1 px-4 pt-3"
          contentContainerStyle={{ paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {currentExercise && editState ? (
            <View className="bg-[#242424] border border-[#353535] rounded-2xl p-4">
              {/* Fejléc + sorozat léptető */}
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-[#A3A3A3] text-xs font-semibold uppercase">
                    {currentExercise.category} • Pihenő: {currentExercise.rest}
                  </Text>
                  <Text className="text-[#FFFFFF] font-bold text-xl mt-1">
                    {currentIndex + 1}. {currentExercise.name}
                  </Text>
                  {currentExercise.focus ? (
                    <Text className="text-[#35C878] text-xs mt-1">
                      {currentExercise.focus}
                    </Text>
                  ) : null}
                  <Text className="text-[#A3A3A3] text-xs mt-1.5">
                    Terv: {currentExercise.sets}x{currentExercise.reps} •{" "}
                    {currentExercise.weightNote}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() =>
                    cycleExerciseSets(
                      currentExercise.id,
                      currentExercise.sets,
                      currentExercise.reps,
                      currentExercise.weightNote,
                    )
                  }
                  className={`px-3.5 py-2 rounded-xl border ${
                    editState.completedSets >= currentExercise.sets
                      ? "bg-[#35C878] border-[#35C878]"
                      : "bg-[#1B1B1B] border-[#353535]"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      editState.completedSets >= currentExercise.sets
                        ? "text-[#111111]"
                        : "text-[#FFFFFF]"
                    }`}
                  >
                    {editState.completedSets}/{currentExercise.sets} sorozat
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Legördülő lista: Gépszám kiválasztása */}
              <View className="mt-5 pt-4 border-t border-[#353535]">
                <Text className="text-[#A3A3A3] text-xs font-semibold mb-1.5">
                  Gépszám kiválasztása (legördülő)
                </Text>

                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => setMachineDropdownOpen(true)}
                  className="bg-[#1B1B1B] border border-[#353535] rounded-xl px-4 py-3 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-2.5">
                    <MaterialCommunityIcons
                      name="counter"
                      color="#F04438"
                      size={20}
                    />
                    <Text className="text-[#FFFFFF] font-bold text-base">
                      {activeMachine}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    color="#A3A3A3"
                    size={22}
                  />
                </TouchableOpacity>
              </View>

              {/* Kiválasztott gépszámhoz tartozó külön súly és ismétlés */}
              <View className="mt-4 bg-[#1B1B1B] border border-[#353535] rounded-2xl p-3.5">
                <Text className="text-[#35C878] text-xs font-bold mb-3">
                  Beállítás ehhez: {activeMachine}
                </Text>

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="text-[#A3A3A3] text-xs font-medium mb-1">
                      Súly (kg)
                    </Text>
                    <TextInput
                      value={currentMachineEntry.weight}
                      onChangeText={(val) =>
                        updateMachineEntry(
                          currentExercise.id,
                          activeMachine,
                          "weight",
                          val,
                        )
                      }
                      placeholder="pl. 30 kg"
                      placeholderTextColor="#737373"
                      className="bg-[#242424] border border-[#353535] text-[#FFFFFF] rounded-xl px-3.5 py-2.5 text-sm font-semibold"
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-[#A3A3A3] text-xs font-medium mb-1">
                      Ismétlésszám
                    </Text>
                    <TextInput
                      value={currentMachineEntry.reps}
                      onChangeText={(val) =>
                        updateMachineEntry(
                          currentExercise.id,
                          activeMachine,
                          "reps",
                          val,
                        )
                      }
                      placeholder="pl. 10-12"
                      placeholderTextColor="#737373"
                      className="bg-[#242424] border border-[#353535] text-[#FFFFFF] rounded-xl px-3.5 py-2.5 text-sm font-semibold"
                    />
                  </View>
                </View>
              </View>

              {/* Gépszámonként rögzített értékek áttekintése */}
              {loggedMachines.length > 0 && (
                <View className="mt-4">
                  <Text className="text-[#A3A3A3] text-xs font-semibold mb-2">
                    Rögzített gépek ehhez a gyakorlathoz
                  </Text>
                  <View className="gap-2">
                    {loggedMachines.map(([machineName, entry]) => {
                      const isSelected = machineName === activeMachine;
                      return (
                        <TouchableOpacity
                          key={machineName}
                          activeOpacity={0.75}
                          onPress={() =>
                            selectExerciseMachine(
                              currentExercise.id,
                              machineName,
                              currentExercise.reps,
                              currentExercise.weightNote,
                            )
                          }
                          className={`rounded-xl px-3.5 py-2.5 border flex-row items-center justify-between ${
                            isSelected
                              ? "bg-[#1B1B1B] border-[#35C878]"
                              : "bg-[#1B1B1B]/60 border-[#353535]"
                          }`}
                        >
                          <Text className="text-[#FFFFFF] font-bold text-xs">
                            {machineName}
                          </Text>
                          <Text className="text-[#A3A3A3] text-xs">
                            Súly:{" "}
                            <Text className="text-[#FFFFFF] font-semibold">
                              {entry.weight || "–"}
                            </Text>{" "}
                            • Ism.:{" "}
                            <Text className="text-[#35C878] font-semibold">
                              {entry.reps || "–"}
                            </Text>
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View className="bg-[#242424] border border-[#353535] rounded-2xl p-5">
              <Text className="text-[#FFFFFF] font-bold text-base mb-1">
                Szabad edzés
              </Text>
              <Text className="text-[#A3A3A3] text-xs">
                Nem tervből indítottad az edzést. Ha végeztél, nyomd meg a
                Finish workout gombot alul.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Gépszám legördülő választó Modal */}
        <Modal
          visible={machineDropdownOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setMachineDropdownOpen(false)}
        >
          <View className="flex-1 bg-black/75 justify-end">
            <View className="bg-[#1B1B1B] border-t border-[#353535] rounded-t-3xl p-5 max-h-[70%]">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-[#FFFFFF] font-bold text-lg">
                  Válassz gépszámot
                </Text>
                <TouchableOpacity onPress={() => setMachineDropdownOpen(false)}>
                  <MaterialCommunityIcons
                    name="close"
                    color="#A3A3A3"
                    size={24}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="gap-2 pb-2">
                  {AVAILABLE_MACHINES.map((machine) => {
                    const selected = machine === activeMachine;
                    return (
                      <TouchableOpacity
                        key={machine}
                        activeOpacity={0.75}
                        onPress={() => {
                          if (currentExercise) {
                            selectExerciseMachine(
                              currentExercise.id,
                              machine,
                              currentExercise.reps,
                              currentExercise.weightNote,
                            );
                          }
                          setMachineDropdownOpen(false);
                        }}
                        className={`px-4 py-3 rounded-xl border flex-row items-center justify-between ${
                          selected
                            ? "bg-[#242424] border-[#35C878]"
                            : "bg-[#242424] border-[#353535]"
                        }`}
                      >
                        <Text className="text-[#FFFFFF] font-semibold text-sm">
                          {machine}
                        </Text>
                        {selected && (
                          <MaterialCommunityIcons
                            name="check"
                            color="#35C878"
                            size={20}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Alsó fix Finish gomb */}
        <View className="absolute bottom-0 left-0 right-0 bg-[#1B1B1B] border-t border-[#353535] px-4 py-3.5">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleFinishAndReturn}
            className="w-full py-3.5 bg-[#35C878] rounded-2xl items-center"
          >
            <Text className="text-[#111111] font-bold text-lg">
              Finish workout
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

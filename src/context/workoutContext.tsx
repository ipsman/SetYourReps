import { WORKOUT_PLANS, type WorkoutPlanTemplate } from "@/data/workoutPlans";
import React, { createContext, useContext, useEffect, useState } from "react";

export type DayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export interface WeekDayItem {
  day: DayKey;
  icon: "run" | "bed" | "weight-lifter";
  completed: boolean;
  lastWorkout?: string;
  durationMinutes?: number;
}

export interface MachineLogEntry {
  reps: string;
  weight: string;
}

export interface EditableExerciseState {
  selectedMachine: string;
  machineEntries: Record<string, MachineLogEntry>;
  completedSets: number;
}

export const AVAILABLE_MACHINES = [
  "Gép #01",
  "Gép #02",
  "Gép #03",
  "Gép #04",
  "Gép #05",
  "Gép #06",
  "Gép #07",
  "Gép #08",
  "Gép #10",
  "Gép #12",
  "Gép #14",
  "Gép #16",
  "Gép #20",
  "Gép #21",
  "Gép #25",
  "Gép #26",
  "Kábel / Csigás",
  "Kézi súlyzó",
  "Rúd / Szabad gép",
] as const;

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

interface WorkoutContextValue {
  weekDays: WeekDayItem[];
  selectedDay: DayKey;
  setSelectedDay: (day: DayKey) => void;
  isWorkoutActive: boolean;
  elapsedSeconds: number;
  activeWorkoutTitle: string;
  setActiveWorkoutTitle: (title: string) => void;
  workoutType: "weight-lifter" | "run";
  setWorkoutType: (type: "weight-lifter" | "run") => void;
  activePlan: WorkoutPlanTemplate | null;
  exerciseEdits: Record<string, EditableExerciseState>;
  startPlanSession: (plan: WorkoutPlanTemplate) => void;
  startFreeWorkout: (
    title?: string,
    day?: DayKey,
    type?: "weight-lifter" | "run",
  ) => void;
  finishWorkoutSession: () => void;
  selectExerciseMachine: (
    exerciseId: string,
    machine: string,
    defaultReps: string,
    defaultWeight: string,
  ) => void;
  updateMachineEntry: (
    exerciseId: string,
    machine: string,
    field: "reps" | "weight",
    value: string,
  ) => void;
  cycleExerciseSets: (
    exerciseId: string,
    maxSets: number,
    defaultReps: string,
    defaultWeight: string,
  ) => void;
  saveCustomWorkoutForDay: (
    day: DayKey,
    title: string,
    type: "weight-lifter" | "run",
  ) => void;
  deleteWorkoutForDay: (day: DayKey) => void;
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [weekDays, setWeekDays] = useState<WeekDayItem[]>(INITIAL_WEEK_DAYS);
  const [selectedDay, setSelectedDay] = useState<DayKey>("Thu");
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activeWorkoutTitle, setActiveWorkoutTitle] =
    useState("Strength Session");
  const [workoutType, setWorkoutType] = useState<"weight-lifter" | "run">(
    "weight-lifter",
  );
  const [activePlan, setActivePlan] = useState<WorkoutPlanTemplate | null>(
    null,
  );
  const [exerciseEdits, setExerciseEdits] = useState<
    Record<string, EditableExerciseState>
  >({});

  useEffect(() => {
    if (!isWorkoutActive) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isWorkoutActive]);

  const buildInitialEdits = (plan: WorkoutPlanTemplate) => {
    const map: Record<string, EditableExerciseState> = {};
    const defaultMachine = AVAILABLE_MACHINES[0];
    for (const ex of plan.exercises) {
      map[ex.id] = {
        selectedMachine: defaultMachine,
        machineEntries: {
          [defaultMachine]: {
            reps: ex.reps,
            weight: ex.weightNote,
          },
        },
        completedSets: 0,
      };
    }
    return map;
  };

  const startPlanSession = (plan: WorkoutPlanTemplate) => {
    setActivePlan(plan);
    setActiveWorkoutTitle(plan.title);
    setWorkoutType(plan.icon);
    setExerciseEdits(buildInitialEdits(plan));
    setElapsedSeconds(0);
    setIsWorkoutActive(true);
  };

  const startFreeWorkout = (
    title = "Strength Session",
    day: DayKey = selectedDay,
    type: "weight-lifter" | "run" = "weight-lifter",
  ) => {
    setActivePlan(null);
    setActiveWorkoutTitle(title);
    setWorkoutType(type);
    setSelectedDay(day);
    setExerciseEdits({});
    setElapsedSeconds(0);
    setIsWorkoutActive(true);
  };

  const finishWorkoutSession = () => {
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
    setActivePlan(null);
    setExerciseEdits({});
    setElapsedSeconds(0);
  };

  const ensureExerciseState = (
    prev: Record<string, EditableExerciseState>,
    exerciseId: string,
    defaultReps: string,
    defaultWeight: string,
  ): EditableExerciseState => {
    const existing = prev[exerciseId];
    if (existing) return existing;
    const defaultMachine = AVAILABLE_MACHINES[0];
    return {
      selectedMachine: defaultMachine,
      machineEntries: {
        [defaultMachine]: {
          reps: defaultReps,
          weight: defaultWeight,
        },
      },
      completedSets: 0,
    };
  };

  const selectExerciseMachine = (
    exerciseId: string,
    machine: string,
    defaultReps: string,
    defaultWeight: string,
  ) => {
    setExerciseEdits((prev) => {
      const current = ensureExerciseState(
        prev,
        exerciseId,
        defaultReps,
        defaultWeight,
      );
      const nextEntries = current.machineEntries[machine]
        ? current.machineEntries
        : {
            ...current.machineEntries,
            [machine]: {
              reps: defaultReps,
              weight: "",
            },
          };

      return {
        ...prev,
        [exerciseId]: {
          ...current,
          selectedMachine: machine,
          machineEntries: nextEntries,
        },
      };
    });
  };

  const updateMachineEntry = (
    exerciseId: string,
    machine: string,
    field: "reps" | "weight",
    value: string,
  ) => {
    setExerciseEdits((prev) => {
      const current = ensureExerciseState(prev, exerciseId, "", "");
      const currentEntry = current.machineEntries[machine] ?? {
        reps: "",
        weight: "",
      };

      return {
        ...prev,
        [exerciseId]: {
          ...current,
          selectedMachine: machine,
          machineEntries: {
            ...current.machineEntries,
            [machine]: {
              ...currentEntry,
              [field]: value,
            },
          },
        },
      };
    });
  };

  const cycleExerciseSets = (
    exerciseId: string,
    maxSets: number,
    defaultReps: string,
    defaultWeight: string,
  ) => {
    setExerciseEdits((prev) => {
      const current = ensureExerciseState(
        prev,
        exerciseId,
        defaultReps,
        defaultWeight,
      );
      const nextSets =
        current.completedSets >= maxSets ? 0 : current.completedSets + 1;
      return {
        ...prev,
        [exerciseId]: {
          ...current,
          completedSets: nextSets,
        },
      };
    });
  };

  const saveCustomWorkoutForDay = (
    day: DayKey,
    title: string,
    type: "weight-lifter" | "run",
  ) => {
    const cleanTitle = title.trim() || "Custom Workout";
    setWeekDays((prev) =>
      prev.map((item) =>
        item.day === day
          ? {
              ...item,
              completed: true,
              icon: type,
              lastWorkout: cleanTitle,
              durationMinutes: item.durationMinutes ?? 40,
            }
          : item,
      ),
    );
  };

  const deleteWorkoutForDay = (dayToClear: DayKey) => {
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
  };

  return (
    <WorkoutContext.Provider
      value={{
        weekDays,
        selectedDay,
        setSelectedDay,
        isWorkoutActive,
        elapsedSeconds,
        activeWorkoutTitle,
        setActiveWorkoutTitle,
        workoutType,
        setWorkoutType,
        activePlan,
        exerciseEdits,
        startPlanSession,
        startFreeWorkout,
        finishWorkoutSession,
        selectExerciseMachine,
        updateMachineEntry,
        cycleExerciseSets,
        saveCustomWorkoutForDay,
        deleteWorkoutForDay,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) {
    throw new Error("useWorkout must be used inside WorkoutProvider");
  }
  return ctx;
}

export { WORKOUT_PLANS };


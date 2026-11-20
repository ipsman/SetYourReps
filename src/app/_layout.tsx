import { SettingsProvider } from "@/context/settingsController";
import { WorkoutProvider } from "@/context/workoutContext";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      <SettingsProvider>
        <WorkoutProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </WorkoutProvider>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}

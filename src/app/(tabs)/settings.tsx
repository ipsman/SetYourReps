import { useSettings } from "@/context/settingsController";
import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function SettingsScreen() {
  const { theme, setTheme } = useSettings();
  const isDarkMode = theme?.toLowerCase() === "dark";

  const [serverUrl, setServerUrl] = useState("192.168.0.115:8080");
  const [apiKey, setApiKey] = useState("••••••••••••••••");
  const [refreshInterval, setRefreshInterval] = useState("2");

  return (
    <SafeAreaView className="flex-1 bg-[#111111]">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.back()}
        className="flex-row items-center gap-1"
      >
        <MaterialCommunityIcons name="chevron-left" color="#FFFFFF" size={26} />
        <Text className="text-[#FFFFFF] font-semibold text-base">Back</Text>
      </TouchableOpacity>
      <ScrollView
        className="flex-1 px-5 pt-10"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text className="text-2xl font-bold text-center mb-5 text-slate-800 dark:text-white">
          Settings
        </Text>
        {/* 2. Szerver Kapcsolat */}
        <View className="bg-[#242424] p-4 rounded-2xl mb-4 shadow-sm border border-[#353535]">
          <Text className="text-xs font-bold text-slate-400 uppercase mb-3">
            Server Connection
          </Text>

          <Text className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Server IP & Port (pl. 192.168.0.115:8080)
          </Text>
          <TextInput
            className="border bg-[#111111] border-[#353535] p-3 rounded-xl mb-3 text-sm text-white"
            placeholder="192.168.0.115:8080"
            placeholderTextColor="#94a3b8"
            value={serverUrl}
            onChangeText={setServerUrl}
            autoCapitalize="none"
          />

          <Text className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            API Token
          </Text>
          <TextInput
            className="border bg-[#111111] border-[#353535] p-3 rounded-xl mb-3 text-sm text-white"
            placeholder="Enter API Key"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={apiKey}
            onChangeText={setApiKey}
          />

          <Text className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Auto Refresh Interval (seconds)
          </Text>
          <TextInput
            className="border bg-[#111111] border-[#353535] p-3 rounded-xl mb-3 text-sm text-white"
            placeholder="2"
            placeholderTextColor="#94a3b8"
            keyboardType="number-pad"
            value={refreshInterval}
            onChangeText={setRefreshInterval}
          />

          <TouchableOpacity className="bg-[#F04438] border border-black p-3.5 rounded-xl items-center">
            <Text className="text-white font-bold text-sm">
              Save Server Config
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. Credits / App Info */}
        <View className="bg-[#242424] p-4 rounded-2xl shadow-sm border border-[#353535]">
          <Text className="text-base font-bold text-slate-700 dark:text-slate-200 mb-1">
            MaxYourReps
          </Text>
          <Text className="text-xs text-slate-400 dark:text-slate-400">
            Version 1.0.0 — Developed by Máté Auer ©️ MateDevs
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

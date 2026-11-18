import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function HomeScreen() {
  return (
    <SafeAreaView
      style={{ flex: 1 }}
      className="flex-1 bg-slate-100 dark:bg-[#111111]"
    >
      <View className="m-1 rounded-lg p-5">
        <Text className="text-[#ffffff] font-bold text-lg">
          Welcome back Máté!
        </Text>
        <Text className="text-[#ffffff] text-md">Ready for a workout?</Text>
      </View>
      <View className="bg-[#242424] my-1 mx-3 rounded-lg p-5">
        <View className="flex-row">
          <View className="flex-initial w-[80%]">
            <Text className="text-[#ffffff] font-bold text-lg">
              My workouts
            </Text>
            <View className="flex-row gap-2">
              <View>
                <Text className="text-white">Mon</Text>
                <View className="rounded-full bg-[#FF6B5E] p-1">
                  <MaterialCommunityIcons name="run" color="#fff" size={20} />
                </View>
              </View>
              <View>
                <Text className="text-white">Tue</Text>
                <View className="rounded-full bg-[#FF6B5E] p-1">
                  <MaterialCommunityIcons
                    name="weight-lifter"
                    color="#fff"
                    size={20}
                  />
                </View>
              </View>
              <View>
                <Text className="text-white">Wed</Text>
                <View className="rounded-full bg-[#FF6B5E] p-1">
                  <MaterialCommunityIcons
                    name="weight-lifter"
                    color="#fff"
                    size={20}
                  />
                </View>
              </View>
              <View>
                <Text className="text-white">Thu</Text>
                <View className="rounded-full bg-[#646464] p-1">
                  <MaterialCommunityIcons
                    name="weight-lifter"
                    color="#fff"
                    size={20}
                  />
                </View>
              </View>
              <View>
                <Text className="text-white">Fri</Text>
                <View className="rounded-full bg-[#FF6B5E] p-1">
                  <MaterialCommunityIcons
                    name="weight-lifter"
                    color="#fff"
                    size={20}
                  />
                </View>
              </View>
            </View>
          </View>
          <View className="border-l-2 border-l-[#353535] flex-none pl-2 pt-2">
            <TouchableOpacity className="flex items-center content-center">
              <View className="rounded-full bg-[#FF6B5E] w-8 h-8 flex items-center">
                <Text className="text-white text-xl font-bold">+</Text>
              </View>
              <Text className="text-white">Add workout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View className="flex items-center">
        <TouchableOpacity className="py-2 px-6 bg-[#F04438] rounded-2xl">
          <Text className="text-[#ffffff] font-bold text-lg">
            Start a workout
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

import { Text, View } from "react-native";

export const UserStatistics = () => {
    return (

        //daje jako template ok ok?
        <View className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-5 mb-5 border border-gray-800/50">
            <Text className="text-white text-base font-medium mb-4">Statistics</Text>
            <View className="flex-row justify-between">
                <View className="items-center">
                    <Text className="text-white text-xl font-semibold">12</Text>
                    <Text className="text-gray-400 text-xs mt-1">Created</Text>
                </View>
                <View className="items-center">
                    <Text className="text-white text-xl font-semibold">8</Text>
                    <Text className="text-gray-400 text-xs mt-1">Saved</Text>
                </View>
                <View className="items-center">
                    <Text className="text-white text-xl font-semibold">156</Text>
                    <Text className="text-gray-400 text-xs mt-1">Likes</Text>
                </View>
                <View className="items-center">
                    <Text className="text-white text-xl font-semibold">24</Text>
                    <Text className="text-gray-400 text-xs mt-1">Following</Text>
                </View>
            </View>
        </View>
    )
};
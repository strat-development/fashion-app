import { useQuery } from '@tanstack/react-query';
import { Text, View } from "react-native";
import { fetchUserStatistics } from '../../fetchers/dashboard/fetchUserStatistics';

interface UserStatisticsProps {
  userId: string;
}

export const UserStatistics = ({ userId }: UserStatisticsProps) => {
    const { data: statistics, isLoading, error } = useQuery({
        queryKey: ['userStatistics', userId],
        queryFn: () => fetchUserStatistics(userId),
        enabled: !!userId,
    });

    if (isLoading) {
        return (
            <View className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-5 mb-5 border border-gray-800/50">
                <Text className="text-white text-base font-medium mb-4">Statistics</Text>
                <View className="flex-row justify-between">
                    <View className="items-center">
                        <Text className="text-white text-xl font-semibold">-</Text>
                        <Text className="text-gray-400 text-xs mt-1">Created</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-white text-xl font-semibold">-</Text>
                        <Text className="text-gray-400 text-xs mt-1">Saved</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-white text-xl font-semibold">-</Text>
                        <Text className="text-gray-400 text-xs mt-1">Likes</Text>
                    </View>
                </View>
            </View>
        );
    }

    if (error) {
        console.error('Error loading user statistics:', error);
        return (
            <View className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-5 mb-5 border border-gray-800/50">
                <Text className="text-white text-base font-medium mb-4">Statistics</Text>
                <View className="flex-row justify-between">
                    <View className="items-center">
                        <Text className="text-white text-xl font-semibold">0</Text>
                        <Text className="text-gray-400 text-xs mt-1">Created</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-white text-xl font-semibold">0</Text>
                        <Text className="text-gray-400 text-xs mt-1">Saved</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-white text-xl font-semibold">0</Text>
                        <Text className="text-gray-400 text-xs mt-1">Likes</Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-5 mb-5 border border-gray-800/50">
            <Text className="text-white text-base font-medium mb-4">Statistics</Text>
            <View className="flex-row justify-between">
                <View className="items-center">
                    <Text className="text-white text-xl font-semibold">{statistics?.createdCount || 0}</Text>
                    <Text className="text-gray-400 text-xs mt-1">Created</Text>
                </View>
                <View className="items-center">
                    <Text className="text-white text-xl font-semibold">{statistics?.savedCount || 0}</Text>
                    <Text className="text-gray-400 text-xs mt-1">Saved</Text>
                </View>
                <View className="items-center">
                    <Text className="text-white text-xl font-semibold">{statistics?.likesReceivedCount || 0}</Text>
                    <Text className="text-gray-400 text-xs mt-1">Likes</Text>
                </View>
            </View>
        </View>
    )
};
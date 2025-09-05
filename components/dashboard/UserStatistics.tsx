import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, Text, View } from "react-native";
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
            <View>
                <Text className="text-white text-lg font-semibold mb-4">Statistics</Text>
                <View className="flex-row justify-around">
                    <View className="items-center">
                        <View className="flex-row items-center">
                            <ActivityIndicator size="small" color="#888" />
                            <Text className="text-gray-500 text-xl font-semibold ml-2">...</Text>
                        </View>
                        <Text className="text-gray-400 text-sm mt-1">Created</Text>
                    </View>
                    <View className="items-center">
                        <View className="flex-row items-center">
                            <ActivityIndicator size="small" color="#888" />
                            <Text className="text-gray-500 text-xl font-semibold ml-2">...</Text>
                        </View>
                        <Text className="text-gray-400 text-sm mt-1">Saved</Text>
                    </View>
                    <View className="items-center">
                        <View className="flex-row items-center">
                            <ActivityIndicator size="small" color="#888" />
                            <Text className="text-gray-500 text-xl font-semibold ml-2">...</Text>
                        </View>
                        <Text className="text-gray-400 text-sm mt-1">Likes</Text>
                    </View>
                </View>
            </View>
        );
    }

    if (error) {
        console.error('Error loading user statistics:', error);
        return (
            <View>
                <Text className="text-white text-lg font-semibold mb-4">Statistics</Text>
                <View className="flex-row justify-around">
                    <View className="items-center">
                        <Text className="text-white text-2xl font-bold">0</Text>
                        <Text className="text-gray-400 text-sm mt-1">Created</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-white text-2xl font-bold">0</Text>
                        <Text className="text-gray-400 text-sm mt-1">Saved</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-white text-2xl font-bold">0</Text>
                        <Text className="text-gray-400 text-sm mt-1">Likes</Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View>
            <Text className="text-white text-lg font-semibold mb-4">Statistics</Text>
            <View className="flex-row justify-around">
                <View className="items-center">
                    <Text className="text-white text-2xl font-bold">{statistics?.createdCount || 0}</Text>
                    <Text className="text-gray-400 text-sm mt-1">Created</Text>
                </View>
                <View className="items-center">
                    <Text className="text-white text-2xl font-bold">{statistics?.savedCount || 0}</Text>
                    <Text className="text-gray-400 text-sm mt-1">Saved</Text>
                </View>
                <View className="items-center">
                    <Text className="text-white text-2xl font-bold">{statistics?.likesReceivedCount || 0}</Text>
                    <Text className="text-gray-400 text-sm mt-1">Likes</Text>
                </View>
            </View>
        </View>
    )
};
import { useTheme } from '@/providers/themeContext';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from "react-native";
import { fetchUserStatistics } from '../../fetchers/dashboard/fetchUserStatistics';

interface UserStatisticsProps {
  userId: string;
}

export const UserStatistics = ({ userId }: UserStatisticsProps) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const { data: statistics, isLoading, error } = useQuery({
        queryKey: ['userStatistics', userId],
        queryFn: () => fetchUserStatistics(userId),
        enabled: !!userId,
    });

    if (isLoading) {
        return (
            <View>
                <Text style={{ 
                    color: colors.text, 
                    fontSize: 18, 
                    fontWeight: '600', 
                    marginBottom: 16 
                }}>{t('userStatistics.title')}</Text>
                <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-around' 
                }}>
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <ActivityIndicator size="small" color="#ec4899" />
                            <Text style={{ 
                                color: colors.textMuted, 
                                fontSize: 20, 
                                fontWeight: '600', 
                                marginLeft: 8 
                            }}>{t('userStatistics.loading')}</Text>
                        </View>
                        <Text style={{ 
                            color: colors.textSecondary, 
                            fontSize: 14, 
                            marginTop: 4 
                        }}>{t('userStatistics.created')}</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <ActivityIndicator size="small" color="#ec4899" />
                            <Text style={{ 
                                color: colors.textMuted, 
                                fontSize: 20, 
                                fontWeight: '600', 
                                marginLeft: 8 
                            }}>{t('userStatistics.loading')}</Text>
                        </View>
                        <Text style={{ 
                            color: colors.textSecondary, 
                            fontSize: 14, 
                            marginTop: 4 
                        }}>{t('userStatistics.saved')}</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <ActivityIndicator size="small" color="#ec4899" />
                            <Text style={{ 
                                color: colors.textMuted, 
                                fontSize: 20, 
                                fontWeight: '600', 
                                marginLeft: 8 
                            }}>{t('userStatistics.loading')}</Text>
                        </View>
                        <Text style={{ 
                            color: colors.textSecondary, 
                            fontSize: 14, 
                            marginTop: 4 
                        }}>{t('userStatistics.likes')}</Text>
                    </View>
                </View>
            </View>
        );
    }

    if (error) {
        console.error('Error loading user statistics:', error);
        return (
            <View>
                <Text style={{ 
                    color: colors.text, 
                    fontSize: 18, 
                    fontWeight: '600', 
                    marginBottom: 16 
                }}>{t('userStatistics.title')}</Text>
                <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-around' 
                }}>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ 
                            color: colors.text, 
                            fontSize: 24, 
                            fontWeight: 'bold' 
                        }}>0</Text>
                        <Text style={{ 
                            color: colors.textSecondary, 
                            fontSize: 14, 
                            marginTop: 4 
                        }}>{t('userStatistics.created')}</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ 
                            color: colors.text, 
                            fontSize: 24, 
                            fontWeight: 'bold' 
                        }}>0</Text>
                        <Text style={{ 
                            color: colors.textSecondary, 
                            fontSize: 14, 
                            marginTop: 4 
                        }}>{t('userStatistics.saved')}</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ 
                            color: colors.text, 
                            fontSize: 24, 
                            fontWeight: 'bold' 
                        }}>0</Text>
                        <Text style={{ 
                            color: colors.textSecondary, 
                            fontSize: 14, 
                            marginTop: 4 
                        }}>{t('userStatistics.likes')}</Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View>
            <Text style={{ 
                color: colors.text, 
                fontSize: 18, 
                fontWeight: '600', 
                marginBottom: 16 
            }}>{t('userStatistics.title')}</Text>
            <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-around' 
            }}>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ 
                        color: colors.text, 
                        fontSize: 24, 
                        fontWeight: 'bold' 
                    }}>{statistics?.createdCount || 0}</Text>
                    <Text style={{ 
                        color: colors.textSecondary, 
                        fontSize: 14, 
                        marginTop: 4 
                    }}>{t('userStatistics.created')}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ 
                        color: colors.text, 
                        fontSize: 24, 
                        fontWeight: 'bold' 
                    }}>{statistics?.savedCount || 0}</Text>
                    <Text style={{ 
                        color: colors.textSecondary, 
                        fontSize: 14, 
                        marginTop: 4 
                    }}>{t('userStatistics.saved')}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ 
                        color: colors.text, 
                        fontSize: 24, 
                        fontWeight: 'bold' 
                    }}>{statistics?.likesReceivedCount || 0}</Text>
                    <Text style={{ 
                        color: colors.textSecondary, 
                        fontSize: 14, 
                        marginTop: 4 
                    }}>{t('userStatistics.likes')}</Text>
                </View>
            </View>
        </View>
    )
};
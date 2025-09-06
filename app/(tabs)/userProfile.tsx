import { CreatedOutfitsSection } from '@/components/dashboard/CreatedOutfitsSection';
import { SavedOutfitsSection } from '@/components/dashboard/SavedOutfitsSection';
import { UserStatistics } from '@/components/dashboard/UserStatistics';
import { ProfileEdit } from '@/components/modals/ProfileEditModal';
import { supabase } from '@/lib/supabase';
import { useTheme, ThemedGradient } from '@/providers/themeContext';
import { useUserContext } from '@/providers/userContext';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { BookOpen, Edit3, Heart, LogOut, Palette, Plus, Trophy, User, User2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

type TabType = 'user-info' | 'created-outfits' | 'saved-outfits';

interface UserProfileProps {
  isOwnProfile?: boolean;
}

export default function UserProfile({
  isOwnProfile = true
}: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<TabType>('user-info');
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const { colors } = useTheme();

  const {
    userName,
    userBio,
    userImage,
    userEmail,
    userSocials,
    userId,
  } = useUserContext();

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleLogout = async () => {
    try {
      await supabase?.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'user-info':
        return (
          <View className="mt-6 space-y-6 px-6">
            {/* Bio Section */}
            <View style={{ 
              paddingBottom: 24, 
              borderBottomWidth: 1, 
              borderBottomColor: colors.border,
              marginBottom: 24
            }}>
              <Text style={{ 
                color: colors.text, 
                fontSize: 18, 
                fontWeight: '600', 
                marginBottom: 12 
              }}>About</Text>
              <Text style={{ 
                color: colors.textSecondary, 
                fontSize: 16, 
                lineHeight: 24 
              }}>
                {userBio || "No bio available yet. Add one by editing your profile!"}
              </Text>
            </View>

            {/* Statistics */}
            <View style={{ 
              paddingBottom: 24, 
              borderBottomWidth: 1, 
              borderBottomColor: colors.border,
              marginBottom: 24
            }}>
              {userId && <UserStatistics userId={userId} />}
            </View>

            {/* Recent Activity */}
            <View style={{ paddingBottom: 24 }}>
              <Text style={{ 
                color: colors.text, 
                fontSize: 18, 
                fontWeight: '600', 
                marginBottom: 16 
              }}>Recent Activity</Text>
              <View style={{ gap: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 32,
                    height: 32,
                    backgroundColor: `${colors.success}33`,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12
                  }}>
                    <Trophy size={14} color={colors.success} />
                  </View>
                  <Text style={{ 
                    color: colors.textSecondary, 
                    fontSize: 14, 
                    flex: 1 
                  }}>Your outfit got 50+ likes!</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 32,
                    height: 32,
                    backgroundColor: `${colors.accent}33`,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12
                  }}>
                    <Heart size={14} color={colors.accent} />
                  </View>
                  <Text style={{ 
                    color: colors.textSecondary, 
                    fontSize: 14, 
                    flex: 1 
                  }}>Liked 5 new outfits</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 32,
                    height: 32,
                    backgroundColor: `${colors.secondary}33`,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12
                  }}>
                    <Plus size={14} color={colors.secondary} />
                  </View>
                  <Text style={{ 
                    color: colors.textSecondary, 
                    fontSize: 14, 
                    flex: 1 
                  }}>Created "Summer Casual Look"</Text>
                </View>
              </View>
            </View>

            {/* Settings Buttons */}
            {isOwnProfile && (
              <View style={{ gap: 12, marginTop: 16 }}>
                {/* Theme Settings Button */}
                <Pressable
                  onPress={() => router.push('/(tabs)/theme-settings' as any)}
                  style={{
                    backgroundColor: `${colors.accent}33`,
                    borderWidth: 1,
                    borderColor: `${colors.accent}4D`,
                    borderRadius: 12,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Palette size={18} color={colors.accent} />
                  <Text style={{ 
                    color: colors.accent, 
                    fontWeight: '500', 
                    marginLeft: 8 
                  }}>Theme Settings</Text>
                </Pressable>
                
                {/* Logout Button */}
                <Pressable
                  onPress={handleLogout}
                  style={{
                    backgroundColor: `${colors.error}33`,
                    borderWidth: 1,
                    borderColor: `${colors.error}4D`,
                    borderRadius: 12,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <LogOut size={18} color={colors.error} />
                  <Text style={{ 
                    color: colors.error, 
                    fontWeight: '500', 
                    marginLeft: 8 
                  }}>Logout</Text>
                </Pressable>
              </View>
            )}
          </View>
        );
      case 'created-outfits':
        return <CreatedOutfitsSection refreshing={refreshing} profileId={userId || ''} />;
      case 'saved-outfits':
        return <SavedOutfitsSection refreshing={refreshing} profileId={userId || ''} />;
      default:
        return null;
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={{ paddingTop: 32, paddingBottom: 80 }}>
        {/* Profile Header */}
        <View style={{ alignItems: 'center', marginBottom: 32, paddingHorizontal: 24 }}>
          <View style={{ position: 'relative', marginBottom: 16 }}>
            {userImage ? (
              <Image
                source={{ uri: userImage }}
                style={{ 
                  width: 112, 
                  height: 112, 
                  borderRadius: 56, 
                  borderWidth: 2, 
                  borderColor: colors.border 
                }}
              />
            ) : (
              <View style={{
                width: 112,
                height: 112,
                borderRadius: 56,
                backgroundColor: colors.accent,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: colors.border
              }}>
                <User size={32} color={colors.white} />
              </View>
            )}
            {/* Online indicator */}
            <View style={{
              position: 'absolute',
              bottom: 4,
              right: 4,
              width: 24,
              height: 24,
              backgroundColor: colors.success,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: colors.background
            }} />
          </View>

          <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
            {userName || "Anonymous User"}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 16 }}>
            Fashion Enthusiast
          </Text>

          {isOwnProfile && (
            <Pressable
              onPress={handleEditProfile}
              style={{ 
                backgroundColor: colors.surface,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 999,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border
              }}
            >
              <Edit3 size={16} color={colors.text} />
              <Text style={{ color: colors.text, fontWeight: '500', marginLeft: 8 }}>
                Edit Profile
              </Text>
            </Pressable>
          )}
        </View>

        {/* Tab Navigation */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 32, paddingHorizontal: 24 }}>
          <View style={{ 
            backgroundColor: colors.surface, 
            flexDirection: 'row', 
            borderRadius: 999, 
            padding: 4,
            borderWidth: 1,
            borderColor: colors.border
          }}>
            {[
              { key: 'user-info', label: 'Profile', icon: User2 },
              { key: 'created-outfits', label: 'Created', icon: BookOpen },
              { key: 'saved-outfits', label: 'Saved', icon: Heart },
            ].map(({ key, label, icon: Icon }) => (
              <Pressable
                key={key}
                onPress={() => setActiveTab(key as TabType)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: activeTab === key ? 'transparent' : 'transparent',
                  overflow: 'hidden'
                }}
              >
                {activeTab === key && (
                  <ThemedGradient
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                  />
                )}
                <Icon
                  size={16}
                  color={activeTab === key ? colors.white : colors.textMuted}
                />
                <Text
                  style={{
                    fontSize: 14,
                    marginLeft: 8,
                    fontWeight: '500',
                    color: activeTab === key ? colors.white : colors.textMuted
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </View>

      {/* Profile Edit Modal */}
      {showEditModal && (
        <ProfileEdit
          isVisible={showEditModal}
          onClose={() => setShowEditModal(false)}
          currentUserData={{
            name: userName,
            bio: userBio,
            avatar: userImage,
            email: userEmail,
            socials: userSocials,
          }}
        />
      )}
    </ScrollView>
  );
};

import { CreatedOutfitsSection } from '@/components/dashboard/CreatedOutfitsSection';
import { FeedSection } from '@/components/dashboard/FeedSection';
import { ProfileEdit, type ProfileData } from '@/components/dashboard/modals/ProfileEditModal';
import { SavedOutfitsSection } from '@/components/dashboard/SavedOutfitsSection';
import { UserProfile } from '@/components/dashboard/UserProfile';
import { Bookmark, Grid, Plus, User } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const mockUserStats = {
  createdOutfits: 15,
  savedOutfits: 42,
  totalLikes: 1234,
  followers: 567,
  following: 123
};

type TabType = 'feed' | 'saved' | 'created' | 'profile';

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [refreshing, setRefreshing] = useState(false);
  const [showOutfitDetail, setShowOutfitDetail] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showOutfitCreate, setShowOutfitCreate] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "Your Profile",
    bio: "Passionate about fashion and style."
  });

  // Helper function to format date

  const toggleLike = (outfitId: string) => {
    // TODO: Implement actual like toggle with API call
    console.log('Toggle like for outfit:', outfitId);
  };

  const toggleSave = (outfitId: string) => {
    // TODO: Implement actual save toggle with API call
    console.log('Toggle save for outfit:', outfitId);
  };

  const handleComment = (outfitId: string) => {
    // TODO: Implement comment functionality
    console.log('Comment on outfit:', outfitId);
  };

  const handleShare = (outfitId: string) => {
    // TODO: Implement share functionality
    console.log('Share outfit:', outfitId);
  };

  

  const handleEditProfile = () => {
    setShowProfileEdit(true);
  };

  const handleSaveProfile = (data: ProfileData) => {
    setProfileData(data);
    console.log('Profile saved:', data);
  };

  const handleCloseProfileEdit = () => {
    setShowProfileEdit(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <FeedSection refreshing={refreshing} />
        );

      case 'saved':
        return (
          <SavedOutfitsSection refreshing={refreshing} />
        );

      case 'created':
        return (
          <CreatedOutfitsSection refreshing={refreshing} />
        );

      case 'profile':
        return (
          <UserProfile
            userName={profileData.name}
            userBio={profileData.bio}
            stats={mockUserStats}
            onEditProfile={handleEditProfile}
          />
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-black to-gray-900">
      <View className="h-2" />

      {/* Tab Navigation */}
      <View className="flex-row bg-gray-900/90 backdrop-blur-xl mx-6 mt-2 rounded-full p-1 border border-gray-700/50">
        {[
          { key: 'feed', label: 'Feed', icon: Grid },
          { key: 'saved', label: 'Saved', icon: Bookmark },
          { key: 'created', label: 'Created', icon: Plus },
          { key: 'profile', label: 'Profile', icon: User }
        ].map(({ key, label, icon: Icon }) => (
          <Pressable
            key={key}
            onPress={() => setActiveTab(key as TabType)}
            className={`flex-1 items-center py-3 rounded-full ${activeTab === key ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''
              }`}
          >
            <Icon
              size={18}
              color={activeTab === key ? "#FFFFFF" : "#9CA3AF"}
            />
            <Text
              className={`text-xs mt-1 font-medium ${activeTab === key ? 'text-white' : 'text-gray-400'
                }`}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      {renderTabContent()}

      {/* Outfit Detail Modal */}
      

      {/* Profile Edit Modal */}
      <ProfileEdit
        isVisible={showProfileEdit}
        onClose={handleCloseProfileEdit}
        onSave={handleSaveProfile}
        initialData={profileData}
      />

      {/* Outfit Create Modal */}
      
    </SafeAreaView>
  );
}
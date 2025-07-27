import { EmptyState } from '@/components/dashboard/EmptyState';
import { OutfitCard, type OutfitData } from '@/components/dashboard/OutfitCard';
import { OutfitCreate } from '@/components/dashboard/OutfitCreate';
import { OutfitDetail } from '@/components/dashboard/OutfitDetail';
import { ProfileEdit, type ProfileData } from '@/components/dashboard/ProfileEdit';
import { UserProfile } from '@/components/dashboard/UserProfile';
import { Button } from '@/components/ui/button';
import { useFetchCreatedOutfits } from '@/fetchers/fetchCreatedOutfits';
import { useUserContext } from '@/providers/userContext';
import { Bookmark, Grid, Plus, User } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
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
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitData | null>(null);
  const [showOutfitDetail, setShowOutfitDetail] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showOutfitCreate, setShowOutfitCreate] = useState(false);
  const { userId } = useUserContext();
  const { data: fetchedOutfits, error, isLoading } = useFetchCreatedOutfits(userId || '');
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "Your Profile",
    bio: "Passionate about fashion and style."
  });

  // Helper function to format the fetched outfits
  const outfits = fetchedOutfits?.map(outfit => ({
    ...outfit,
    likes: 0,
    comments: 0,
    isLiked: false,
    isSaved: false,
    created_by: outfit.created_by || 'Anonymous',
    created_at: formatDate(outfit.created_at),
    outfit_name: outfit.outfit_name || 'Untitled Outfit',
    outfit_tags: Array.isArray(outfit.outfit_tags) ?
      outfit.outfit_tags :
      typeof outfit.outfit_tags === 'string' ?
        [outfit.outfit_tags] :
        [],
    outfit_elements_data: outfit.outfit_elements_data || []
  })) || [];

  // Helper function to format date
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  }

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

  const handleCreateOutfit = () => {
    setShowOutfitCreate(true);
  };

  const handleSaveOutfit = (newOutfitData: any) => {
    // TODO: Implement actual outfit creation with API call

    console.log('Outfit created:');
  };

  const handleCloseOutfitCreate = () => {
    setShowOutfitCreate(false);
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

  const handleOutfitPress = (outfit: OutfitData) => {
    setSelectedOutfit(outfit);
    setShowOutfitDetail(true);
  };

  const handleCloseOutfitDetail = () => {
    setShowOutfitDetail(false);
    setSelectedOutfit(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <ScrollView
            className="flex-1 px-4"
            refreshControl={
              <RefreshControl refreshing={refreshing} />
            }
          >
            <View className="pt-6 pb-20">
              {outfits.length > 0 ? (
                outfits.map(outfit => (
                  <OutfitCard
                    key={outfit.outfit_id}
                    outfit={outfit}
                    onToggleLike={toggleLike}
                    onToggleSave={toggleSave}
                    onComment={handleComment}
                    onShare={handleShare}
                    onPress={handleOutfitPress}
                  />
                ))
              ) : (
                <EmptyState
                  icon={Grid}
                  title="No outfits yet"
                  description="Create your first outfit or follow others to see their creations"
                  actionText="Create Outfit"
                  onAction={handleCreateOutfit}
                />
              )}
            </View>
          </ScrollView>
        );

      case 'saved':
        const savedOutfits = outfits.filter(outfit => outfit.isSaved);
        return (
          <ScrollView
            className="flex-1 px-4"
            refreshControl={
              <RefreshControl refreshing={refreshing} />
            }
          >
            <View className="pt-6 pb-20">
              <Text className="text-white text-xl font-semibold mb-6">Saved Outfits</Text>
              {savedOutfits.length > 0 ? (
                savedOutfits.map(outfit => (
                  <OutfitCard
                    key={outfit.outfit_id}
                    outfit={outfit}
                    onToggleLike={toggleLike}
                    onToggleSave={toggleSave}
                    onComment={handleComment}
                    onShare={handleShare}
                    onPress={handleOutfitPress}
                  />
                ))
              ) : (
                <EmptyState
                  icon={Bookmark}
                  title="No saved outfits yet"
                  description="Start saving outfits you love!"
                />
              )}
            </View>
          </ScrollView>
        );

      case 'created':
        const createdOutfits = outfits.filter(outfit => outfit.created_by === userId);
        return (
          <ScrollView
            className="flex-1 px-4"
            refreshControl={
              <RefreshControl refreshing={refreshing} />
            }
          >
            <View className="pt-6 pb-20">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-white text-xl font-semibold">Your Creations</Text>
                <Button
                  onPress={handleCreateOutfit}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl px-4 py-2"
                >
                  <View className="flex-row items-center">
                    <Plus size={16} color="#FFFFFF" />
                    <Text className="text-white ml-2 font-medium text-sm">Create</Text>
                  </View>
                </Button>
              </View>
              {createdOutfits.length > 0 ? (
                createdOutfits.map(outfit => (
                  <OutfitCard
                    key={outfit.outfit_id}
                    outfit={outfit}
                    onToggleLike={toggleLike}
                    onToggleSave={toggleSave}
                    onComment={handleComment}
                    onShare={handleShare}
                    onPress={handleOutfitPress}
                  />
                ))
              ) : (
                <EmptyState
                  icon={Plus}
                  title="No outfits created yet"
                  description="Start creating your first outfit!"
                  actionText="Create Outfit"
                  onAction={handleCreateOutfit}
                />
              )}
            </View>
          </ScrollView>
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
      {selectedOutfit && (
        <OutfitDetail
          outfit={selectedOutfit}
          isVisible={showOutfitDetail}
          onClose={handleCloseOutfitDetail}
          onToggleLike={() => { }}
          onToggleSave={() => { }}
        />
      )}

      {/* Profile Edit Modal */}
      <ProfileEdit
        isVisible={showProfileEdit}
        onClose={handleCloseProfileEdit}
        onSave={handleSaveProfile}
        initialData={profileData}
      />

      {/* Outfit Create Modal */}
      <OutfitCreate
        isVisible={showOutfitCreate}
        onClose={handleCloseOutfitCreate}
      />
    </SafeAreaView>
  );
}
import { EmptyState } from '@/components/dashboard/EmptyState';
import { OutfitCard, type OutfitData } from '@/components/dashboard/OutfitCard';
import { OutfitCreate, type NewOutfitData } from '@/components/dashboard/OutfitCreate';
import { OutfitDetail } from '@/components/dashboard/OutfitDetail';
import { ProfileEdit, type ProfileData } from '@/components/dashboard/ProfileEdit';
import { UserProfile } from '@/components/dashboard/UserProfile';
import { Button } from '@/components/ui/button';
import { Bookmark, Grid, Plus, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data - to be replaced with Supabase data
const mockOutfits: OutfitData[] = [
  {
    id: 1,
    title: "Summer Casual Look",
    image: "https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=Outfit+1",
    likes: 142,
    comments: 23,
    isLiked: false,
    isSaved: true,
    creator: "You",
    createdAt: "2 hours ago",
    tags: ["Casual", "Summer", "Comfortable"]
  },
  {
    id: 2,
    title: "Business Professional",
    image: "https://via.placeholder.com/300x400/4ECDC4/FFFFFF?text=Outfit+2",
    likes: 89,
    comments: 12,
    isLiked: true,
    isSaved: false,
    creator: "cycki_69",
    createdAt: "1 day ago",
    tags: ["Formal", "Business", "Professional"]
  },
  {
    id: 3,
    title: "Street Style Vibes",
    image: "https://via.placeholder.com/300x400/45B7D1/FFFFFF?text=Outfit+3",
    likes: 267,
    comments: 45,
    isLiked: true,
    isSaved: true,
    creator: "dupajasiukaruzela",
    createdAt: "3 days ago",
    tags: ["Streetwear", "Urban", "Cool"]
  },
  {
    id: 4,
    title: "Elegant Smoking Style",
    image: "https://via.placeholder.com/300x400/F7DC6F/FFFFFF?text=Outfit+4",
    likes: 198,
    comments: 31,
    isLiked: false,
    isSaved: true,
    creator: "david_duck",
    createdAt: "5 days ago",
    tags: ["Elegant", "Evening", "Formal"]
  }
];

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
  const [outfits, setOutfits] = useState(mockOutfits);
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitData | null>(null);
  const [showOutfitDetail, setShowOutfitDetail] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showOutfitCreate, setShowOutfitCreate] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "Your Profile",
    bio: "Passionate about fashion and style. Love creating unique outfit combinations and exploring new trends. Always looking for inspiration! ✨"
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const toggleLike = (outfitId: number) => {
    setOutfits(prev => prev.map(outfit => 
      outfit.id === outfitId 
        ? { 
            ...outfit, 
            isLiked: !outfit.isLiked,
            likes: outfit.isLiked ? outfit.likes - 1 : outfit.likes + 1
          }
        : outfit
    ));
  };

  const toggleSave = (outfitId: number) => {
    setOutfits(prev => prev.map(outfit => 
      outfit.id === outfitId 
        ? { ...outfit, isSaved: !outfit.isSaved }
        : outfit
    ));
  };

  const handleComment = (outfitId: number) => {
    // TODO: Implement comment functionality
    console.log('Comment on outfit:', outfitId);
  };

  const handleShare = (outfitId: number) => {
    // TODO: Implement share functionality
    console.log('Share outfit:', outfitId);
  };

  const handleCreateOutfit = () => {
    setShowOutfitCreate(true);
  };

  const handleSaveOutfit = (data: NewOutfitData) => {
    const newOutfit: OutfitData = {
      id: Date.now(),
      title: data.title,
      image: data.images[0] || "https://via.placeholder.com/300x400/4ECDC4/FFFFFF?text=New+Outfit",
      likes: 0,
      comments: 0,
      isLiked: false,
      isSaved: false,
      creator: "You",
      createdAt: "now",
      tags: [...data.tags, ...data.colors, ...data.elements].slice(0, 3)
    };
    setOutfits(prev => [newOutfit, ...prev]);
    console.log('Outfit created:', data);
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
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View className="pt-6 pb-20">
              {outfits.map(outfit => (
                <OutfitCard
                  key={outfit.id}
                  outfit={outfit}
                  onToggleLike={toggleLike}
                  onToggleSave={toggleSave}
                  onComment={handleComment}
                  onShare={handleShare}
                  onPress={handleOutfitPress}
                />
              ))}
            </View>
          </ScrollView>
        );

      case 'saved':
        const savedOutfits = outfits.filter(outfit => outfit.isSaved);
        return (
          <ScrollView className="flex-1 px-4">
            <View className="pt-6 pb-20">
              <Text className="text-white text-xl font-semibold mb-6">Saved Outfits</Text>
              {savedOutfits.length > 0 ? (
                savedOutfits.map(outfit => (
                  <OutfitCard
                    key={outfit.id}
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
        const createdOutfits = outfits.filter(outfit => outfit.creator === "You");
        return (
          <ScrollView className="flex-1 px-4">
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
                    key={outfit.id}
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
      {/* Minimal Header - just status bar space */}
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
            className={`flex-1 items-center py-3 rounded-full ${
              activeTab === key ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''
            }`}
          >
            <Icon 
              size={18} 
              color={activeTab === key ? "#FFFFFF" : "#9CA3AF"} 
            />
            <Text 
              className={`text-xs mt-1 font-medium ${
                activeTab === key ? 'text-white' : 'text-gray-400'
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
          onToggleLike={toggleLike}
          onToggleSave={toggleSave}
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
        onCreate={handleSaveOutfit}
      />
    </SafeAreaView>
  );
}

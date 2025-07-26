import { Button } from '@/components/ui/button';
import { Camera, Save, User, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProfileEditProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (data: ProfileData) => void;
  initialData?: ProfileData;
}

export interface ProfileData {
  name: string;
  bio: string;
  avatar?: string;
}

export const ProfileEdit: React.FC<ProfileEditProps> = ({
  isVisible,
  onClose,
  onSave,
  initialData = { name: '', bio: '' }
}) => {
  const [profileData, setProfileData] = useState<ProfileData>(initialData);

  const handleSave = () => {
    if (!profileData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    onSave(profileData);
    onClose();
  };

  const handleImagePicker = () => {
    // TODO: Implement image picker
    Alert.alert('Image Picker', 'Image picker functionality will be implemented');
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-white/10">
          <Pressable onPress={onClose} className="p-2">
            <X size={24} color="white" />
          </Pressable>
          <Text className="text-white font-bold text-lg">Edit Profile</Text>
          <Pressable onPress={handleSave} className="p-2">
            <Save size={24} color="#4CAF50" />
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-4">
          <View className="pt-8 pb-20">
            {/* Avatar Section */}
            <View className="items-center mb-8">
              <View className="relative">
                <View className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full items-center justify-center">
                  {profileData.avatar ? (
                    <Image 
                      source={{ uri: profileData.avatar }} 
                      className="w-24 h-24 rounded-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <User size={40} color="white" />
                  )}
                </View>
                <Pressable 
                  onPress={handleImagePicker}
                  className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-full"
                >
                  <Camera size={16} color="white" />
                </Pressable>
              </View>
              <Text className="text-white/60 text-sm mt-2">Tap to change photo</Text>
            </View>

            {/* Name Field */}
            <View className="mb-6">
              <Text className="text-white font-semibold text-lg mb-3">Display Name</Text>
              <TextInput
                value={profileData.name}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
                placeholder="Enter your name"
                placeholderTextColor="rgba(255,255,255,0.5)"
                className="bg-black/20 backdrop-blur-xl text-white px-4 py-4 rounded-2xl border border-white/10"
                maxLength={50}
              />
              <Text className="text-white/40 text-sm mt-1">{profileData.name.length}/50</Text>
            </View>

            {/* Bio Field */}
            <View className="mb-6">
              <Text className="text-white font-semibold text-lg mb-3">Bio</Text>
              <TextInput
                value={profileData.bio}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, bio: text }))}
                placeholder="Tell us about your style..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                className="bg-black/20 backdrop-blur-xl text-white px-4 py-4 rounded-2xl border border-white/10"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={200}
              />
              <Text className="text-white/40 text-sm mt-1">{profileData.bio.length}/200</Text>
            </View>

            {/* Style Preferences */}
            <View className="mb-6">
              <Text className="text-white font-semibold text-lg mb-3">Style Preferences</Text>
              <View className="bg-black/20 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                <Text className="text-white/80 text-base">
                  Coming soon! Set your favorite styles, colors, and brands.
                </Text>
              </View>
            </View>

            {/* Privacy Settings */}
            <View className="mb-6">
              <Text className="text-white font-semibold text-lg mb-3">Privacy</Text>
              <View className="bg-black/20 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-white/80">Public Profile</Text>
                  <View className="bg-green-600 w-12 h-6 rounded-full justify-center">
                    <View className="bg-white w-5 h-5 rounded-full self-end mr-0.5" />
                  </View>
                </View>
                <Text className="text-white/60 text-sm">
                  Others can see your profile and created outfits
                </Text>
              </View>
            </View>

            <Button 
              onPress={handleSave}
              className="bg-blue-600 py-4 rounded-2xl"
            >
              <Text className="text-white font-bold text-lg">Save Changes</Text>
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

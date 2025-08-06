import { useRequestPermission } from '@/hooks/useRequestPermission';
import { supabaseAdmin } from '@/lib/admin';
import { useEditProfileMutation } from '@/mutations/dashboard/EditProfileMutation';
import { useUserContext } from '@/providers/userContext';
import { DevTool } from '@hookform/devtools';
import { Camera, User, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProfileEditProps {
  isVisible: boolean;
  onClose: () => void;
  currentUserData?: {
    name?: string;
    bio?: string;
    avatar?: string;
    email?: string;
    socials?: string[];
  };
}

interface PendingImage {
  uri: string;
  type?: string;
  fileName?: string;
}

interface FormData {
  name: string;
  bio: string;
  avatar?: string;
  email?: string;
  socials: string[];
}

export const ProfileEdit = ({
  isVisible,
  onClose,
  currentUserData
}: ProfileEditProps) => {
  const { userId } = useUserContext();
  const { mutate: editProfile, isPending } = useEditProfileMutation(userId || '');
  const [selectedImage, setSelectedImage] = useState<PendingImage | null>(null);
  const [profileData, setProfileData] = useState<FormData>({
    name: currentUserData?.name || '',
    bio: currentUserData?.bio || '',
    avatar: currentUserData?.avatar,
    email: currentUserData?.email,
    socials: currentUserData?.socials || []
  });

  const { control, handleSubmit, formState: { errors, isValid } } = useForm<FormData>({
    defaultValues: {
      name: currentUserData?.name || '',
      bio: currentUserData?.bio || '',
      avatar: currentUserData?.avatar,
      email: currentUserData?.email,
      socials: currentUserData?.socials || []
    },
    mode: 'onChange'
  });

  const handleImageSelect = async () => {
    const hasPermission = await useRequestPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Storage permission is required to select images.');
      return;
    }

    try {
      launchImageLibrary(
        {
          mediaType: 'photo',
          maxWidth: 1024,
          maxHeight: 1024,
          quality: 1,
          includeBase64: false,
        },
        (response) => {
          if (response.didCancel) {
            console.log('User cancelled image picker');
          } else if (response.errorCode) {
            console.error('Image picker error:', response.errorMessage);
            Alert.alert('Error', `Image picker error: ${response.errorMessage}`);
          } else if (response.assets && response.assets[0]) {
            const { uri, fileName, type } = response.assets[0];
            if (uri) {
              setSelectedImage({ uri, fileName: fileName || 'image.jpg', type });
              setProfileData(prev => ({ ...prev, avatar: uri }));
              console.log('Selected image:', { uri, fileName, type });
            } else {
              console.error('No URI in image picker response');
              Alert.alert('Error', 'Failed to select image');
            }
          } else {
            console.error('No assets in image picker response');
            Alert.alert('Error', 'No image selected');
          }
        }
      );
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to open image picker');
    }
  };

  const handleSave = async () => {
    if (!profileData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    let avatarUrl = profileData.avatar;

    if (selectedImage && selectedImage.uri) {
      try {
        const fileExt = selectedImage.fileName?.split('.').pop() || 'jpg';
        const fileName = `${userId}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const response = await fetch(selectedImage.uri);
        const blob = await response.blob();

        const { error: uploadError } = await supabaseAdmin.storage
          .from('profile-pictures')
          .upload(filePath, blob, {
            contentType: selectedImage.type || 'image/jpeg',
          });

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          Alert.alert('Error', 'Failed to upload image');
          return;
        }

        const { data: publicUrlData } = supabaseAdmin.storage
          .from('profile-pictures')
          .getPublicUrl(filePath);

        if (!publicUrlData?.publicUrl) {
          console.error('Failed to get public URL');
          Alert.alert('Error', 'Failed to retrieve image URL');
          return;
        }

        avatarUrl = publicUrlData.publicUrl;
      } catch (error) {
        console.error('Image upload error:', error);
        Alert.alert('Error', 'Failed to upload image');
        return;
      }
    }

    editProfile({
      userName: profileData.name,
      userBio: profileData.bio,
      userImage: avatarUrl || '',
      userEmail: profileData.email || '',
      userSocials: profileData.socials
    }, {
      onSuccess: () => {
        Alert.alert('Success', 'Profile updated successfully');
        setSelectedImage(null);
        onClose();
      },
      onError: (error) => {
        Alert.alert('Error', error.message || 'Failed to update profile');
      }
    });
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-gradient-to-b from-black to-gray-900">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800/50">
          <Pressable onPress={onClose} className="p-2">
            <X size={24} color="#9CA3AF" />
          </Pressable>
          <Text className="text-white font-semibold text-lg">Edit Profile</Text>
          <Pressable
            onPress={handleSave}
            className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full"
            disabled={isPending}
          >
            <Text className="text-white font-medium text-sm">
              {isPending ? 'Saving...' : 'Save'}
            </Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-4">
          <View className="pt-8 pb-20">
            {/* Avatar Section */}
            <View className="items-center mb-8">
              <View className="relative">
                <View className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-gray-700/50 rounded-full items-center justify-center">
                  {profileData.avatar ? (
                    <Image
                      source={{ uri: profileData.avatar }}
                      className="w-24 h-24 rounded-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <User size={32} color="#9CA3AF" />
                  )}
                </View>
                <Pressable
                  onPress={handleImageSelect}
                  className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-full border-2 border-black"
                >
                  <Camera size={14} color="white" />
                </Pressable>
              </View>
              <Text className="text-gray-400 text-sm mt-2">Tap to change photo</Text>
            </View>

            {/* Name Field */}
            <View className="mb-6">
              <Text className="text-gray-300 font-medium text-base mb-3">Display Name</Text>
              <Controller
                control={control}
                name="name"
                rules={{ required: "Name is required" }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder="Enter your name"
                    placeholderTextColor="#6B7280"
                    className={`bg-gray-800/50 border ${errors.name ? 'border-pink-600' : 'border-gray-700/50'} text-white px-4 py-3 rounded-lg text-base`}
                    maxLength={50}
                  />
                )}
              />
              <View className="flex-row items-center justify-between mt-1">
                {errors.name ? (
                  <Text className="text-pink-600 text-xs">{errors.name.message}</Text>
                ) : (
                  <Text className="text-gray-500 text-sm mt-1">{profileData.name.length || 0}/50</Text>
                )}
              </View>
            </View>

            {/* Bio Field */}
            <View className="mb-6">
              <Text className="text-gray-300 font-medium text-base mb-3">Bio</Text>
              <Controller
                control={control}
                name="bio"
                rules={{
                  maxLength: 200,
                  validate: (value) => value.length <= 200 || 'Bio should not exceed 200 characters',
                  required: "Bio is required"
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder="Tell us about your style..."
                    placeholderTextColor="#6B7280"
                    className="bg-gray-800/50 border border-gray-700/50 text-white px-4 py-3 rounded-lg text-base"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    maxLength={200}
                  />
                )}
              />
              <View className="flex-row items-center justify-between mt-1">
                {errors.bio ? (
                  <Text className="text-pink-600 text-xs">{errors.bio.message}</Text>
                ) : (
                  <Text className="text-gray-500 text-sm mt-1">{profileData.bio.length || 0}/200</Text>
                )}
              </View>
            </View>

            {/* Style Preferences */}
            <View className="mb-6">
              <Text className="text-gray-300 font-medium text-base mb-3">Style Preferences</Text>
              <View className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-4">
                <Text className="text-gray-400 text-base">
                  Coming soon! Set your favorite styles, colors, and brands.
                </Text>
              </View>
            </View>

            {/* Privacy Settings */}
            <View className="mb-8">
              <Text className="text-gray-300 font-medium text-base mb-3">Privacy</Text>
              <View className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-300">Public Profile</Text>
                  <View className="bg-gradient-to-r from-purple-600 to-pink-600 w-12 h-6 rounded-full justify-center">
                    <View className="bg-white w-5 h-5 rounded-full self-end mr-0.5" />
                  </View>
                </View>
                <Text className="text-gray-500 text-sm">
                  Others can see your profile and created outfits
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleSave}
              className="bg-gradient-to-r from-purple-600 to-pink-600 py-4 rounded-lg"
              disabled={isPending}
            >
              <Text className="text-white font-semibold text-base text-center">
                {isPending ? 'Saving...' : 'Save Changes'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
      <DevTool control={control} />
    </Modal>
  );
};
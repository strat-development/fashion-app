import { useRequestPermission } from '@/hooks/useRequestPermission';
import { supabaseAdmin } from '@/lib/admin';
import { useEditProfileMutation } from '@/mutations/dashboard/EditProfileMutation';
import { useTheme } from '@/providers/themeContext';
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
    isPublic?: boolean;
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
  isPublic: boolean;
}

export const ProfileEdit = ({
  isVisible,
  onClose,
  currentUserData,
}: ProfileEditProps) => {
  const { colors } = useTheme();
  const { userId, setUserName, setUserBio, setUserImage, setUserEmail, setUserSocials, isPublic: currentIsPublic, setIsPublic } = useUserContext();
  const { mutate: editProfile, isPending } = useEditProfileMutation(userId || '');
  const [selectedImage, setSelectedImage] = useState<PendingImage | null>(null);


  const { control, handleSubmit, formState: { errors, isValid }, setValue, watch } = useForm<FormData>({

    defaultValues: {
      name: currentUserData?.name || '',
      bio: currentUserData?.bio || '',
      avatar: currentUserData?.avatar,
      email: currentUserData?.email,
      socials: currentUserData?.socials || [],
      isPublic: currentUserData?.isPublic ?? currentIsPublic ?? true,
    },
    mode: 'onChange',
  });

  const watchIsPublic = watch('isPublic');

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


              setValue('avatar', uri);
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


  const onSubmit = async (data: FormData) => {

    if (!data.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    let avatarUrl = data.avatar;

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

    console.log('Submitting profile data:', data);

    editProfile(
      {
        userName: data.name,
        userBio: data.bio,
        userImage: avatarUrl || '',
        userEmail: data.email || '',
        userSocials: data.socials,
        isPublic: data.isPublic,
      },
      {
        onSuccess: (result) => {
          console.log('Profile update successful:', result);
          setUserName(data.name);
          setUserBio(data.bio);
          setUserImage(avatarUrl || '');
          setUserEmail(data.email || '');
          setUserSocials(data.socials);
          setIsPublic(data.isPublic);
          
          Alert.alert('Success', 'Profile updated successfully');
          setSelectedImage(null);
          onClose();
        },
        onError: (error) => {
          console.error('Profile update failed:', error);
          Alert.alert('Error', error.message || 'Failed to update profile');
        },
      }
    );
  };


  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          paddingHorizontal: 16, 
          paddingVertical: 12, 
          borderBottomWidth: 1, 
          borderBottomColor: colors.border
        }}>
          <Pressable onPress={onClose} style={{ padding: 8 }}>
            <X size={24} color={colors.textMuted} />
          </Pressable>
          <Text style={{ color: colors.text, fontWeight: '600', fontSize: 18 }}>Edit Profile</Text>
          <Pressable
            onPress={handleSubmit(onSubmit)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full"
            disabled={isPending || !isValid}
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
                  {selectedImage?.uri || currentUserData?.avatar ? (
                    <Image
                      source={{ uri: selectedImage?.uri || currentUserData?.avatar }}

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
              <Text style={{ color: colors.text }} className="font-medium text-base mb-3">Display Name</Text>
              <Controller
                control={control}
                name="name"
                rules={{ required: 'Name is required' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Enter your name"
                    placeholderTextColor={colors.textSecondary}
                    style={{
                      backgroundColor: colors.surfaceVariant,
                      borderColor: errors.name ? colors.error : colors.border,
                      borderWidth: 1,
                      color: colors.text,
                      padding: 12,
                      borderRadius: 8,
                      fontSize: 16
                    }}
                    maxLength={50}
                  />
                )}
              />
              <View className="flex-row items-center justify-between mt-1">
                {errors.name ? (
                  <Text className="text-pink-600 text-xs">{errors.name.message}</Text>
                ) : (
                  <Text className="text-gray-500 text-sm mt-1">
                    {control._formValues.name?.length || 0}/50
                  </Text>

                )}
              </View>
            </View>

            {/* Bio Field */}
            <View className="mb-6">
              <Text style={{ color: colors.text }} className="font-medium text-base mb-3">Bio</Text>
              <Controller
                control={control}
                name="bio"
                rules={{
                  maxLength: { value: 200, message: 'Bio should not exceed 200 characters' },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Tell us about your style..."
                    placeholderTextColor={colors.textSecondary}
                    style={{
                      backgroundColor: colors.surfaceVariant,
                      borderColor: errors.bio ? colors.error : colors.border,
                      borderWidth: 1,
                      color: colors.text,
                      padding: 12,
                      borderRadius: 8,
                      fontSize: 16,
                      textAlignVertical: 'top',
                    }}
                    multiline
                    numberOfLines={4}
                    maxLength={200}
                  />
                )}
              />
              <View className="flex-row items-center justify-between mt-1">
                {errors.bio ? (
                  <Text className="text-pink-600 text-xs">{errors.bio.message}</Text>
                ) : (
                  <Text className="text-gray-500 text-sm mt-1">
                    {control._formValues.bio?.length || 0}/200
                  </Text>

                )}
              </View>
            </View>

            {/* Style Preferences */}
            <View className="mb-6">
              <Text style={{ color: colors.text }} className="font-medium text-base mb-3">Style Preferences</Text>
              <View style={{ backgroundColor: colors.surfaceVariant, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 16 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
                  Coming soon! Set your favorite styles, colors, and brands.
                </Text>
              </View>
            </View>

            {/* Privacy Settings */}
            <View className="mb-8">
              <Text style={{ color: colors.text }} className="font-medium text-base mb-3">Privacy</Text>
              <View style={{ backgroundColor: colors.surfaceVariant, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 16 }}>
                <Controller
                  control={control}
                  name="isPublic"
                  render={({ field: { onChange, value } }) => (
                    <Pressable
                      onPress={() => onChange(!value)}
                      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontWeight: '500' }}>Public Profile</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
                          {value 
                            ? "Others can see your profile and created outfits" 
                            : "Only your nickname and avatar will be visible"
                          }
                        </Text>
                      </View>
                      <View style={{ marginLeft: 16 }}>
                        <View 
                          style={{ width: 48, height: 24, borderRadius: 12, justifyContent: 'center', backgroundColor: value ? colors.accent : colors.borderVariant }}
                        >
                          <View 
                            style={{ backgroundColor: colors.background, width: 20, height: 20, borderRadius: 10, alignSelf: value ? 'flex-end' : 'flex-start', margin: 2 }} 
                          />
                        </View>
                      </View>
                    </Pressable>
                  )}
                />
                {!watchIsPublic && (
                  <View style={{ backgroundColor: colors.warning + '22', borderColor: colors.warning, borderWidth: 1, borderRadius: 8, padding: 12, marginTop: 12 }}>
                    <Text style={{ color: colors.warning, fontSize: 14, fontWeight: '500' }}>Private Account</Text>
                    <Text style={{ color: colors.warning, fontSize: 12, marginTop: 4 }}>
                      When private, only your username and profile picture will be visible to others. Your bio and outfits will be hidden.
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            <Pressable
              onPress={handleSubmit(onSubmit)} 
              className="bg-gradient-to-r from-purple-600 to-pink-600 py-4 rounded-lg"
              disabled={isPending || !isValid}
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

import { ThemedText } from '@/components/ThemedText';
import { useUserContext } from '@/features/auth/context/UserContext';
import { supabase } from '@/lib/supabase';
import { useEditProfileMutation } from '@/mutations/dashboard/EditProfileMutation';
import { ThemedGradient, useTheme } from '@/providers/themeContext';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { User, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
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
  const { t } = useTranslation();
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
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('profileEdit.alerts.permissionDenied.title'), t('profileEdit.alerts.permissionDenied.message'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const { uri } = result.assets[0];
        const fileName = uri.split('/').pop();
        const type = `image/${fileName?.split('.').pop()}`;
        setSelectedImage({ uri, fileName, type });
        setValue('avatar', uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert(t('profileEdit.alerts.imagePickerError.title'), t('profileEdit.alerts.imagePickerError.message'));
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!data.name.trim()) {
      Alert.alert(t('profileEdit.alerts.error.title'), t('profileEdit.errors.nameRequired'));
      return;
    }

    let avatarUrl = data.avatar;

    if (selectedImage && selectedImage.uri) {
      try {
        const fileExt = selectedImage.fileName?.split('.').pop() || 'jpg';
        const fileName = `${userId}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const base64 = await FileSystem.readAsStringAsync(selectedImage.uri, { encoding: 'base64' });
        const arrayBuffer = decode(base64);

        const { error: uploadError } = await supabase.storage
          .from('profile-pictures')
          .upload(filePath, arrayBuffer, {
            contentType: selectedImage.type || 'image/jpeg',
          });

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          Alert.alert(t('profileEdit.alerts.imageUploadError.title'), t('profileEdit.alerts.imageUploadError.message'));
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(filePath);

        if (!publicUrlData?.publicUrl) {
          console.error('Failed to get public URL');
          Alert.alert(t('profileEdit.alerts.imageUrlError.title'), t('profileEdit.alerts.imageUrlError.message'));
          return;
        }

        avatarUrl = publicUrlData.publicUrl;
      } catch (error) {
        console.error('Image upload error:', error);
        Alert.alert(t('profileEdit.alerts.imageUploadError.title'), t('profileEdit.alerts.imageUploadError.message'));
        return;
      }
    }

    editProfile(
      {
        userName: data.name,
        userBio: data.bio,
        userImage: avatarUrl || '',
        userEmail: data.email || '',
        userSocials: data.socials,
        isPublic: data.isPublic
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

          Alert.alert(t('profileEdit.alerts.success.title'), t('profileEdit.alerts.success.message'));
          setSelectedImage(null);
          onClose();
        },
        onError: (error) => {
          console.error('Profile update failed:', error);
          Alert.alert(t('profileEdit.alerts.error.title'), error.message || t('profileEdit.alerts.error.message'));
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
          <ThemedText type="subtitle" style={{ color: colors.text }}>{t('profileEdit.title')}</ThemedText>
          <Pressable
            onPress={handleSubmit(onSubmit)}
            className="px-4 py-2 rounded-full overflow-hidden"
            style={{
              opacity: isValid && !isPending ? 1 : 0.5,
            }}
            disabled={isPending || !isValid}
          >
            <ThemedGradient active={isValid && !isPending} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
            <Text className="font-medium text-sm" style={{ color: colors.white }}>{isPending ? t('profileEdit.saving') : t('profileEdit.save')}</Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-4">
          <View className="pt-8 pb-20">
            {/* Avatar Section */}
            <View className="items-center mb-8">
              <Pressable onPress={handleImageSelect}>
                <View className="relative">
                  <View className="w-24 h-24 border border-gray-700/50 rounded-full items-center justify-center">
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
                </View>
              </Pressable>
              <Text className="text-gray-400 text-sm mt-2">{t('profileEdit.changePhoto')}</Text>
            </View>

            {/* Name Field */}
            <View className="mb-6">
              <ThemedText type="defaultSemiBold" style={{ color: colors.text, marginBottom: 12 }}>{t('profileEdit.displayName')}</ThemedText>
              <Controller
                control={control}
                name="name"
                rules={{ required: t('profileEdit.errors.nameRequired') }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('profileEdit.placeholders.name')}
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
                    {control._formValues.name?.length || 0} / 50
                  </Text>
                )}
              </View>
            </View>

            {/* Bio Field */}
            <View className="mb-6">
              <ThemedText type="defaultSemiBold" style={{ color: colors.text, marginBottom: 12 }}>{t('profileEdit.bio')}</ThemedText>
              <Controller
                control={control}
                name="bio"
                rules={{
                  maxLength: { value: 200, message: t('profileEdit.errors.bioMaxLength') },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('profileEdit.placeholders.bio')}
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
                    {control._formValues.bio?.length || 0} / 200
                  </Text>
                )}
              </View>
            </View>

            {/* Style Preferences */}
            <View className="mb-6">
              <ThemedText type="defaultSemiBold" style={{ color: colors.text, marginBottom: 12 }}>{t('profileEdit.stylePreferences')}</ThemedText>
              <View style={{ backgroundColor: colors.surfaceVariant, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 16 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
                  {t('profileEdit.stylePreferencesComingSoon')}
                </Text>
              </View>
            </View>

            {/* Privacy Settings */}
            <View className="mb-8">
              <ThemedText type="defaultSemiBold" style={{ color: colors.text, marginBottom: 12 }}>{t('profileEdit.privacy')}</ThemedText>
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
                        <ThemedText type="defaultSemiBold" style={{ color: colors.text }}>{t('profileEdit.publicProfile')}</ThemedText>
                        <ThemedText type="default" style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
                          {value ? t('profileEdit.publicProfileDescription') : t('profileEdit.privateProfileDescription')}
                        </ThemedText>
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
                    <ThemedText type="defaultSemiBold" style={{ color: colors.warning, fontSize: 14 }}>{t('profileEdit.privateAccount')}</ThemedText>
                    <ThemedText type="default" style={{ color: colors.warning, fontSize: 12, marginTop: 4 }}>
                      {t('profileEdit.privateAccountDescription')}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>

            <Pressable
              onPress={handleSubmit(onSubmit)}
              className="py-4 rounded-lg overflow-hidden"
              style={{
                opacity: isValid && !isPending ? 1 : 0.5,
                backgroundColor: isValid && !isPending ? colors.primary : colors.borderVariant,
              }}
              disabled={isPending || !isValid}
            >
              <ThemedGradient active={isValid && !isPending} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
              <Text className="text-white font-semibold text-base text-center">
                {isPending ? t('profileEdit.saving') : t('profileEdit.save')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};
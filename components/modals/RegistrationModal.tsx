import { useRequestPermission } from "@/hooks/useRequestPermission";
import { supabase } from "@/lib/supabase";
import { ThemedGradient, useTheme } from "@/providers/themeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { Camera, User } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, Image, Modal, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";

interface RegistrationData {
    username: string;
    fullName: string;
    bio: string;
    profilePicture?: string;
}

interface PendingImage {
    uri: string;
    type?: string;
    fileName?: string;
}

interface RegistrationModalProps {
    isVisible: boolean;
    onClose: () => void;
    userId: string | null;
}

export default function RegistrationModal({ isVisible, onClose, userId }: RegistrationModalProps) {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const [registrationStep, setRegistrationStep] = useState(1);
    const [selectedImage, setSelectedImage] = useState<PendingImage | null>(null);
    const [isPending, setIsPending] = useState(false);

    const { control, handleSubmit, formState: { errors, isValid }, setValue } = useForm<RegistrationData>({
        defaultValues: {
            username: '',
            fullName: '',
            bio: '',
            profilePicture: '',
        },
        mode: 'onChange',
    });

    const handleImageSelect = async () => {
        const hasPermission = await useRequestPermission();
        if (!hasPermission) {
            Alert.alert(t('registrationModal.alerts.permissionDenied.title'), t('registrationModal.alerts.permissionDenied.message'));
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
                        Alert.alert(t('registrationModal.alerts.imagePickerErrorMessage.title'), t('registrationModal.alerts.imagePickerErrorMessage.message' + response.errorMessage ));
                    } else if (response.assets && response.assets[0]) {
                        const { uri, fileName, type } = response.assets[0];
                        if (uri) {
                            setSelectedImage({ uri, fileName: fileName || 'image.jpg', type });
                            setValue('profilePicture', uri, { shouldValidate: true });
                        } else {
                            console.error('No URI in image picker response');
                            Alert.alert(t('registrationModal.alerts.imageSelectError.title'), t('registrationModal.alerts.imageSelectError.message'));
                        }
                    } else {
                        console.error('No assets in image picker response');
                        Alert.alert(t('registrationModal.alerts.noImageSelected.title'), t('registrationModal.alerts.noImageSelected.message'));
                    }
                }
            );
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert(t('registrationModal.alerts.imagePickerError.title'), t('registrationModal.alerts.imagePickerError.message'));
        }
    };

    const handleNextStep = async (data: RegistrationData) => {
        if (!userId) {
            Alert.alert(t('registrationModal.alerts.error.title'), t('registrationModal.errors.userIdMissing'));
            setIsPending(false);
            return;
        }

        if (registrationStep === 1) {
            setRegistrationStep(2);
        } else if (registrationStep === 2) {
            setRegistrationStep(3);
        } else if (registrationStep === 3) {
            setIsPending(true);
            let avatarUrl = data.profilePicture;

            if (selectedImage && selectedImage.uri) {
                try {
                    const fileExt = selectedImage.fileName?.split('.').pop() || 'jpg';
                    const fileName = `${userId}_${Date.now()}.${fileExt}`;
                    const filePath = `${fileName}`;

                    const response = await fetch(selectedImage.uri);
                    const blob = await response.blob();

                    const { error: uploadError } = await supabase.storage
                        .from('profile-pictures')
                        .upload(filePath, blob, {
                            contentType: selectedImage.type || 'image/jpeg',
                        });

                    if (uploadError) {
                        console.error('Image upload error:', uploadError);
                        Alert.alert(t('registrationModal.alerts.imageUploadError.title'), t('registrationModal.alerts.imageUploadError.message'));
                        setIsPending(false);
                        return;
                    }

                    const { data: publicUrlData } = supabase.storage
                        .from('profile-pictures')
                        .getPublicUrl(filePath);

                    if (!publicUrlData?.publicUrl) {
                        console.error('Failed to get public URL');
                        Alert.alert(t('registrationModal.alerts.imageUrlError.title'), t('registrationModal.alerts.imageUrlError.message'));
                        setIsPending(false);
                        return;
                    }

                    avatarUrl = publicUrlData.publicUrl;
                } catch (error) {
                    console.error('Image upload error:', error);
                    Alert.alert(t('registrationModal.alerts.imageUploadError.title'), t('registrationModal.alerts.imageUploadError.message'));
                    setIsPending(false);
                    return;
                }
            }

            try {
                const { error } = await supabase
                    .from('users')
                    .upsert({
                        user_id: userId,
                        nickname: data.username,
                        full_name: data.fullName,
                        bio: data.bio,
                        user_avatar: avatarUrl,
                        created_at: new Date().toISOString()
                    });

                if (error) {
                    Alert.alert(t('registrationModal.alerts.error.title'), error.message);
                    setIsPending(false);
                    return;
                }

                onClose();
                setRegistrationStep(1);
                setSelectedImage(null);
                setIsPending(false);
            } catch (error) {
                Alert.alert(t('registrationModal.alerts.registrationError.title'), t('registrationModal.alerts.registrationError.message'));
                setIsPending(false);
            }
        }
    };

    const handlePreviousStep = () => {
        setRegistrationStep(registrationStep - 1);
    };

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Logout error:', error);
                Alert.alert(t('registrationModal.alerts.logoutError.title'), t('registrationModal.alerts.logoutError.message'));
                return;
            }
            try {
                const { data } = await supabase.auth.getSession();
                const userId = data?.session?.user?.id;
                
                if (userId) {
                    await AsyncStorage.removeItem(`user_ctx:${userId}`);
                }
            } catch {}
            onClose();
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert(t('registrationModal.alerts.logoutError.title'), t('registrationModal.alerts.logoutError.message'));
        }
    };

    return (
        <Modal
            visible={isVisible}
            animationType="fade"
            transparent
        >
            <BlurView
                style={{ flex: 1 }}
                tint={colors.background === '#121212' ? 'dark' : 'light'}
            >
                <SafeAreaView
                    className="flex-1 opacity-100 mx-4 my-16 rounded-lg"
                    style={{ backgroundColor: colors.background, borderColor: colors.border }}
                >
                    <ScrollView className="flex-1 px-4">
                        <View className="pt-8 pb-20">
                            {registrationStep === 1 && (
                                <View>
                                    <View className="items-center mb-8">
                                        <Text className="text-lg font-semibold text-center" style={{ color: colors.text }}>
                                            {t('registrationModal.welcome')}
                                        </Text>
                                        <Text className="text-base text-center mt-4" style={{ color: colors.textSecondary }}>
                                            {t('registrationModal.welcomeDescription')}
                                        </Text>
                                        <Text className="text-sm text-center mt-2" style={{ color: colors.textMuted }}>
                                            {t('registrationModal.provideDetails')}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center justify-between mt-6">
                                        <Pressable
                                            onPress={handleLogout}
                                            className="px-4 py-2 rounded-full overflow-hidden"
                                            style={{ backgroundColor: 'transparent' }}
                                        >
                                            <ThemedGradient style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                                                <Text className="font-medium text-sm text-center" style={{ color: colors.white }}>{t('registrationModal.logout')}</Text>
                                            </ThemedGradient>
                                        </Pressable>
                                        <Pressable
                                            onPress={handleSubmit(handleNextStep)}
                                            className="px-4 py-2 rounded-full overflow-hidden"
                                        >
                                            <ThemedGradient style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                                                <Text className="font-medium text-sm text-center" style={{ color: colors.white }}>{t('registrationModal.proceed')}</Text>
                                            </ThemedGradient>
                                        </Pressable>
                                    </View>
                                </View>
                            )}

                            {registrationStep === 2 && (
                                <View>
                                    {/* Avatar Section */}
                                    <View className="items-center mb-8">
                                        <View className="relative">
                                            <View className="w-24 h-24 rounded-full items-center justify-center" style={{ backgroundColor: colors.surfaceVariant, borderColor: colors.border, borderWidth: 1 }}>
                                                {selectedImage?.uri || control._formValues.profilePicture ? (
                                                    <Image
                                                        source={{ uri: selectedImage?.uri || control._formValues.profilePicture }}
                                                        className="w-24 h-24 rounded-full"
                                                        resizeMode="cover"
                                                    />
                                                ) : (
                                                    <User size={32} color={colors.textMuted} />
                                                )}
                                            </View>
                                            <Pressable
                                                onPress={handleImageSelect}
                                                className="absolute -bottom-2 -right-2 p-2 rounded-full border-2"
                                                style={{ borderColor: colors.black, backgroundColor: colors.accent }}
                                            >
                                                <Camera size={14} color={colors.white} />
                                            </Pressable>
                                        </View>
                                        <Text className="text-sm mt-2" style={{ color: colors.textMuted }}>{t('registrationModal.setPhoto')}</Text>
                                        {errors.profilePicture && (
                                            <Text className="text-xs mt-1" style={{ color: colors.accentSecondary }}>{errors.profilePicture.message}</Text>
                                        )}
                                    </View>

                                    <View className="mb-6">
                                        <Text className="font-medium text-base mb-3" style={{ color: colors.text }}>{t('registrationModal.username')}</Text>
                                        <Controller
                                            control={control}
                                            name="username"
                                            rules={{
                                                required: t('registrationModal.errors.usernameRequired'),
                                                minLength: { value: 3, message: t('registrationModal.errors.usernameMinLength') },
                                                maxLength: { value: 20, message: t('registrationModal.errors.usernameMaxLength') },
                                                pattern: {
                                                    value: /^[a-zA-Z0-9_]+$/,
                                                    message: t('registrationModal.errors.usernamePattern'),
                                                },
                                            }}
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <TextInput
                                                    value={value}
                                                    onChangeText={onChange}
                                                    onBlur={onBlur}
                                                    placeholder={t('registrationModal.placeholders.username')}
                                                    placeholderTextColor={colors.textMuted}
                                                    className="px-4 py-3 rounded-lg text-base"
                                                    style={{ backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: errors.username ? colors.accentSecondary : colors.border, color: colors.text }}
                                                    maxLength={20}
                                                />
                                            )}
                                        />
                                        <View className="flex-row items-center justify-between mt-1">
                                            {errors.username ? (
                                                <Text className="text-xs" style={{ color: colors.accentSecondary }}>{errors.username.message}</Text>
                                            ) : (
                                                <Text className="text-sm" style={{ color: colors.textMuted }}>
                                                    {control._formValues.username?.length || 0}
                                                </Text>
                                            )}
                                        </View>
                                    </View>

                                    <View className="mb-6">
                                        <Text className="font-medium text-base mb-3" style={{ color: colors.text }}>{t('registrationModal.fullName')}</Text>
                                        <Controller
                                            control={control}
                                            name="fullName"
                                            rules={{
                                                required: t('registrationModal.errors.fullNameRequired'),
                                                maxLength: { value: 50, message: t('registrationModal.errors.fullNameMaxLength') },
                                            }}
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <TextInput
                                                    value={value}
                                                    onChangeText={onChange}
                                                    onBlur={onBlur}
                                                    placeholder={t('registrationModal.placeholders.fullName')}
                                                    placeholderTextColor={colors.textMuted}
                                                    className="px-4 py-3 rounded-lg text-base"
                                                    style={{ backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: errors.fullName ? colors.accentSecondary : colors.border, color: colors.text }}
                                                    maxLength={50}
                                                />
                                            )}
                                        />
                                        <View className="flex-row items-center justify-between mt-1">
                                            {errors.fullName ? (
                                                <Text className="text-xs" style={{ color: colors.accentSecondary }}>{errors.fullName.message}</Text>
                                            ) : (
                                                <Text className="text-sm" style={{ color: colors.textMuted }}>
                                                    {control._formValues.fullName?.length || 0} / 50
                                                </Text>
                                            )}
                                        </View>
                                    </View>

                                    <View className="mb-6">
                                        <Text className="font-medium text-base mb-3" style={{ color: colors.text }}>{t('registrationModal.bio')}</Text>
                                        <Controller
                                            control={control}
                                            name="bio"
                                            rules={{
                                                maxLength: { value: 200, message: t('registrationModal.errors.bioMaxLength') },
                                            }}
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <TextInput
                                                    value={value}
                                                    onChangeText={onChange}
                                                    onBlur={onBlur}
                                                    placeholder={t('registrationModal.placeholders.bio')}
                                                    placeholderTextColor={colors.textMuted}
                                                    className="px-4 py-3 rounded-lg text-base"
                                                    style={{ backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: errors.bio ? colors.accentSecondary : colors.border, color: colors.text }}
                                                    multiline
                                                    numberOfLines={4}
                                                    textAlignVertical="top"
                                                    maxLength={200}
                                                />
                                            )}
                                        />
                                        <View className="flex-row items-center justify-between mt-1">
                                            {errors.bio ? (
                                                <Text className="text-xs" style={{ color: colors.accentSecondary }}>{errors.bio.message}</Text>
                                            ) : (
                                                <Text className="text-sm" style={{ color: colors.textMuted }}>
                                                    { control._formValues.bio?.length || 0 } / 200
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            )}

                            {registrationStep === 3 && (
                                <View className="mb-6">
                                    <Text className="font-medium text-base mb-3" style={{ color: colors.text }}>{t('registrationModal.reviewInfo')}</Text>
                                    <View className="rounded-lg p-4" style={{ backgroundColor: colors.surfaceVariant, borderColor: colors.border, borderWidth: 1 }}>
                                        {control._formValues.profilePicture && (
                                            <View className="mb-4">
                                                <Text className="mb-2" style={{ color: colors.textSecondary }}>{t('registrationModal.profilePicture')}:</Text>
                                                <Image
                                                    source={{ uri: control._formValues.profilePicture }}
                                                    className="w-16 h-16 rounded-full"
                                                    resizeMode="cover"
                                                />
                                            </View>
                                        )}
                                        <Text className="mb-2" style={{ color: colors.textSecondary }}>{t('registrationModal.username')}: {control._formValues.username}</Text>
                                        <Text className="mb-2" style={{ color: colors.textSecondary }}>{t('registrationModal.fullName')}: {control._formValues.fullName}</Text>
                                        <Text style={{ color: colors.textSecondary }}>{t('registrationModal.bio')}: {control._formValues.bio || t('registrationModal.notProvided')}</Text>
                                    </View>
                                </View>
                            )}

                            <View className="flex-row items-center justify-between mt-6">
                                {registrationStep > 1 && (
                                    <Pressable
                                        onPress={handlePreviousStep}
                                        className="px-4 py-2 rounded-full"
                                        style={{ backgroundColor: colors.surface }}
                                    >
                                        <Text className="font-medium text-sm" style={{ color: colors.text }}>{t('registrationModal.previous')}</Text>
                                    </Pressable>
                                )}
                                {registrationStep === 2 && isValid && (
                                    <Pressable
                                        onPress={handleSubmit(handleNextStep)}
                                        className="px-4 py-2 rounded-full overflow-hidden"
                                        disabled={isPending}
                                    >
                                        <ThemedGradient style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                                            <Text className="font-medium text-sm text-center" style={{ color: colors.white }}>
                                                {isPending ? t('registrationModal.saving') : t('registrationModal.next')}
                                            </Text>
                                        </ThemedGradient>
                                    </Pressable>
                                )}
                                {registrationStep === 3 && (
                                    <Pressable
                                        onPress={handleSubmit(handleNextStep)}
                                        className="px-4 py-2 rounded-full overflow-hidden"
                                        disabled={isPending}
                                    >
                                        <ThemedGradient style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                                            <Text className="font-medium text-sm text-center" style={{ color: colors.white }}>
                                                {isPending ? t('registrationModal.saving') : t('registrationModal.complete')}
                                            </Text>
                                        </ThemedGradient>
                                    </Pressable>
                                )}
                            </View>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </BlurView>
        </Modal>
    );
}
import { useRequestPermission } from "@/hooks/useRequestPermission";
import { supabase } from "@/lib/supabase";
import { BlurView } from "expo-blur";
import { Camera, User } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
                            setValue('profilePicture', uri, { shouldValidate: true });
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

    const handleNextStep = async (data: RegistrationData) => {
        if (!userId) {
            Alert.alert('Error', 'User ID is missing. Please sign in again.');
            setIsPending(false);
            return;
        }

        if (registrationStep === 1) {
            setRegistrationStep(2);
        } else if (registrationStep === 2) {
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
                        Alert.alert('Error', 'Failed to upload image');
                        setIsPending(false);
                        return;
                    }

                    const { data: publicUrlData } = supabase.storage
                        .from('profile-pictures')
                        .getPublicUrl(filePath);

                    if (!publicUrlData?.publicUrl) {
                        console.error('Failed to get public URL');
                        Alert.alert('Error', 'Failed to retrieve image URL');
                        setIsPending(false);
                        return;
                    }

                    avatarUrl = publicUrlData.publicUrl;
                } catch (error) {
                    console.error('Image upload error:', error);
                    Alert.alert('Error', 'Failed to upload image');
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
                        created_at: new Date().toISOString(),
                    });

                if (error) {
                    Alert.alert('Error', error.message);
                    setIsPending(false);
                    return;
                }

                onClose();
                setRegistrationStep(1);
                setSelectedImage(null);
                setIsPending(false);
            } catch (error) {
                Alert.alert('Error', 'Failed to complete registration. Please try again.');
                setIsPending(false);
            }
        }
    };

    const handlePreviousStep = () => {
        setRegistrationStep(1);
    };

    return (
        <Modal
            visible={isVisible}
            animationType="fade"
            transparent
        >
            <BlurView
                style={{ flex: 1 }}
                tint="dark"
            >
                <SafeAreaView className="flex-1 opacity-100 mx-4 my-16 bg-gradient-to-b from-black to-gray-900 rounded-lg">
                    <ScrollView className="flex-1 px-4">
                        <View className="pt-8 pb-20">
                            {registrationStep === 1 && (
                                <View>
                                    {/* Avatar Section */}
                                    <View className="items-center mb-8">
                                        <View className="relative">
                                            <View className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-gray-700/50 rounded-full items-center justify-center">
                                                {selectedImage?.uri || control._formValues.profilePicture ? (
                                                    <Image
                                                        source={{ uri: selectedImage?.uri || control._formValues.profilePicture }}
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
                                        {errors.profilePicture && (
                                            <Text className="text-pink-600 text-xs mt-1">{errors.profilePicture.message}</Text>
                                        )}
                                    </View>

                                    <View className="mb-6">
                                        <Text className="text-gray-300 font-medium text-base mb-3">Username</Text>
                                        <Controller
                                            control={control}
                                            name="username"
                                            rules={{
                                                required: 'Username is required',
                                                minLength: { value: 3, message: 'Username must be at least 3 characters' },
                                                maxLength: { value: 20, message: 'Username cannot exceed 20 characters' },
                                                pattern: {
                                                    value: /^[a-zA-Z0-9_]+$/,
                                                    message: 'Username can only contain letters, numbers, and underscores',
                                                },
                                            }}
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <TextInput
                                                    value={value}
                                                    onChangeText={onChange}
                                                    onBlur={onBlur}
                                                    placeholder="Enter your username"
                                                    placeholderTextColor="#6B7280"
                                                    className={`bg-gray-800/50 border ${
                                                        errors.username ? 'border-pink-600' : 'border-gray-700/50'
                                                    } text-white px-4 py-3 rounded-lg text-base`}
                                                    maxLength={20}
                                                />
                                            )}
                                        />
                                        <View className="flex-row items-center justify-between mt-1">
                                            {errors.username ? (
                                                <Text className="text-pink-600 text-xs">{errors.username.message}</Text>
                                            ) : (
                                                <Text className="text-gray-500 text-sm">
                                                    {control._formValues.username?.length || 0}/20
                                                </Text>
                                            )}
                                        </View>
                                    </View>

                                    <View className="mb-6">
                                        <Text className="text-gray-300 font-medium text-base mb-3">Full Name</Text>
                                        <Controller
                                            control={control}
                                            name="fullName"
                                            rules={{
                                                required: 'Full name is required',
                                                maxLength: { value: 50, message: 'Full name cannot exceed 50 characters' },
                                            }}
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <TextInput
                                                    value={value}
                                                    onChangeText={onChange}
                                                    onBlur={onBlur}
                                                    placeholder="Enter your full name"
                                                    placeholderTextColor="#6B7280"
                                                    className={`bg-gray-800/50 border ${
                                                        errors.fullName ? 'border-pink-600' : 'border-gray-700/50'
                                                    } text-white px-4 py-3 rounded-lg text-base`}
                                                    maxLength={50}
                                                />
                                            )}
                                        />
                                        <View className="flex-row items-center justify-between mt-1">
                                            {errors.fullName ? (
                                                <Text className="text-pink-600 text-xs">{errors.fullName.message}</Text>
                                            ) : (
                                                <Text className="text-gray-500 text-sm">
                                                    {control._formValues.fullName?.length || 0}/50
                                                </Text>
                                            )}
                                        </View>
                                    </View>

                                    <View className="mb-6">
                                        <Text className="text-gray-300 font-medium text-base mb-3">Bio</Text>
                                        <Controller
                                            control={control}
                                            name="bio"
                                            rules={{
                                                maxLength: { value: 200, message: 'Bio cannot exceed 200 characters' },
                                            }}
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <TextInput
                                                    value={value}
                                                    onChangeText={onChange}
                                                    onBlur={onBlur}
                                                    placeholder="Tell us about your style..."
                                                    placeholderTextColor="#6B7280"
                                                    className={`bg-gray-800/50 border ${
                                                        errors.bio ? 'border-pink-600' : 'border-gray-700/50'
                                                    } text-white px-4 py-3 rounded-lg text-base`}
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
                                                <Text className="text-gray-500 text-sm">
                                                    {control._formValues.bio?.length || 0}/200
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            )}

                            {registrationStep === 2 && (
                                <View className="mb-6">
                                    <Text className="text-gray-300 font-medium text-base mb-3">Review Your Information</Text>
                                    <View className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-4">
                                        {control._formValues.profilePicture && (
                                            <View className="mb-4">
                                                <Text className="text-gray-300 mb-2">Profile Picture:</Text>
                                                <Image
                                                    source={{ uri: control._formValues.profilePicture }}
                                                    className="w-16 h-16 rounded-full"
                                                    resizeMode="cover"
                                                />
                                            </View>
                                        )}
                                        <Text className="text-gray-300 mb-2">Username: {control._formValues.username}</Text>
                                        <Text className="text-gray-300 mb-2">Full Name: {control._formValues.fullName}</Text>
                                        <Text className="text-gray-300">Bio: {control._formValues.bio}</Text>
                                    </View>
                                </View>
                            )}

                            <View className="flex-row items-center justify-between mt-6">
                                {registrationStep > 1 && (
                                    <Pressable
                                        onPress={handlePreviousStep}
                                        className="bg-gray-700 px-4 py-2 rounded-full"
                                    >
                                        <Text className="text-white font-medium text-sm">Previous</Text>
                                    </Pressable>
                                )}
                                <Pressable
                                    onPress={handleSubmit(handleNextStep)}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full"
                                    disabled={isPending || (registrationStep === 1 && !isValid)}
                                >
                                    <Text className="text-white font-medium text-sm">
                                        {isPending ? 'Saving...' : registrationStep === 2 ? 'Complete' : 'Next'}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </BlurView>
        </Modal>
    );
}
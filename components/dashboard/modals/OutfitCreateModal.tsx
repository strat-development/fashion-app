import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from '@/components/ui/select';
import { OutfitElements, OutfitStylesTags } from '@/consts/chatFilterConsts';
import { useRequestPermission } from '@/hooks/useRequestPermission';
import { useCreateOutfitMutation } from '@/mutations/dashboard/CreateOutfitMutation';
import { useUserContext } from '@/providers/userContext';
import { ModalProps, OutfitElementData } from '@/types/createOutfitTypes';

import { DevTool } from '@hookform/devtools';
import { Plus, Trash2, X } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface OutfitState {
  outfit_name: string;
  description: string | null;
  outfit_tags: string[];
  outfit_elements_data: OutfitElementData[];
  created_at: string;
  created_by: string | null;
  outfit_id: string;
}

interface PendingImage {
  uri: string;
  type?: string;
  fileName?: string;
}

export const OutfitCreateModal = ({
  isVisible,
  onClose,
  isAnimated
}: ModalProps) => {
  const [elementModalVisible, setElementModalVisible] = useState(false);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);

  const pendingImagesRef = useRef<Record<string, PendingImage>>({});
  const { userId } = useUserContext();
  const URL_PATTERN = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?(\?[^\s]*)?$/;

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue,
    getValues
  } = useForm<OutfitState>({
    defaultValues: {
      outfit_name: '',
      description: '',
      outfit_tags: [],
      outfit_elements_data: [],
      created_at: new Date().toISOString(),
      created_by: userId || null,
      outfit_id: ""
    },
    mode: 'onChange'
  });

  const {
    control: elementControl,
    handleSubmit: handleElementSubmit,
    formState: { errors: elementErrors, isValid: isElementValid },
    reset: resetElementForm,
    watch: watchElement,
    trigger,
    setValue: setElementValue
  } = useForm<OutfitElementData>({
    defaultValues: {
      type: '',
      price: null,
      imageUrl: '',
      siteUrl: ''
    },
    mode: 'onChange'
  });

  const { mutate: createOutfit } = useCreateOutfitMutation(
    () => {
      reset();
      resetElementForm();
      setSelectedImageName(null);
      pendingImagesRef.current = {};
      onClose?.();
      Alert.alert('Success', 'Outfit saved successfully!');
    },
    (error) => {
      Alert.alert('Error', error.message);
    }
  );

  const onSubmit = async (data: OutfitState) => {
    if (data.outfit_elements_data.length === 0) {
      Alert.alert('Error', 'At least one outfit element is required');
      return;
    }

    try {
      const enrichedElements = data.outfit_elements_data.map(el => {
        if (el.imageUrl.startsWith('temp://')) {
          const pending = pendingImagesRef.current[el.imageUrl];
          if (pending?.uri) {
            return { ...el, _localUri: pending.uri, _fileName: pending.fileName, _type: pending.type } as any;
          }
        }
        return el as any;
      });

      createOutfit({
        ...data,
        outfit_elements_data: enrichedElements as any,
        created_by: userId || null
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message || 'Failed to create outfit');
      } else {
        Alert.alert('Error', 'An unknown error occurred');
      }
    }
  };

  const onElementSubmit = (data: OutfitElementData) => {
    const currentElements = getValues('outfit_elements_data') || [];
    setValue('outfit_elements_data', [...currentElements, data], {
      shouldValidate: true
    });
    resetElementForm();
    setSelectedImageName(null);
    setElementModalVisible(false);
  };

  const removeImage = (index: number) => {
    const currentElements = getValues('outfit_elements_data') || [];
    const elementToRemove = currentElements[index];

    if (elementToRemove.imageUrl.startsWith('temp://')) {
      delete pendingImagesRef.current[elementToRemove.imageUrl];
    }

    setValue('outfit_elements_data', currentElements.filter((_, i) => i !== index), {
      shouldValidate: true
    });
  };

  const toggleTag = (tag: string) => {
    const currentTags = getValues('outfit_tags') || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    setValue('outfit_tags', newTags, {
      shouldValidate: true
    });
  };

  const calculateTotalPrice = (elements: OutfitElementData[]): number => {
    if (!Array.isArray(elements)) return 0;
    return elements.reduce((total, element) => {
      return total + (element.price || 0);
    }, 0);
  };

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
          console.log('Image picker response:', response);
          if (response.didCancel) {
            console.log('User cancelled image picker');
          } else if (response.errorCode) {
            console.error('Image picker error:', response.errorMessage);
            Alert.alert('Error', `Image picker error: ${response.errorMessage}`);
          } else if (response.assets && response.assets[0]) {
            const { uri, fileName, type } = response.assets[0];
            console.log('Selected image:', { uri, fileName, type });
            if (uri) {
              const tempUrl = `temp://${Date.now()}`;
              pendingImagesRef.current[tempUrl] = { uri, fileName: fileName || 'image.jpg', type };
              setElementValue('imageUrl', tempUrl, { shouldValidate: true });
              setSelectedImageName(fileName || 'image.jpg');
              trigger('imageUrl');
              console.log('Image set in form state:', tempUrl);
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

  const outfitElements = watch('outfit_elements_data') || [];
  const outfitName = watch('outfit_name');
  const description = watch('description');
  const outfitTags = watch('outfit_tags') || [];

  return (
    <>
      <Modal
        visible={isVisible}
        animationType={isAnimated ? 'slide' : 'none'}
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-gradient-to-b from-black to-gray-900">
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800/50">
            <Pressable onPress={onClose} className="p-2">
              <X size={24} color="#9CA3AF" />
            </Pressable>
            <Text className="text-white font-semibold text-lg">Create Outfit</Text>
            <Pressable
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || outfitElements.length === 0}
              className={`px-4 py-2 rounded-full ${isValid && outfitElements.length > 0 ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-600'}`}
            >
              <Text className="text-white font-medium text-sm">Save</Text>
            </Pressable>
          </View>

          <ScrollView className="flex-1 px-4">
            <View className="pt-6 pb-20">
              {/* Images Section */}
              <View className="mb-6">
                <Text className="text-gray-300 font-medium text-base mb-3">Outfit Elements</Text>
                <View className='flex flex-col gap-4'>
                  <ScrollView horizontal 
                  showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-4">
                      <Pressable
                        onPress={() => setElementModalVisible(true)}
                        className="w-24 h-32 bg-gray-800/50 border-2 border-dashed border-gray-700/50 rounded-xl items-center justify-center"
                      >
                        <Plus size={24} color="#9CA3AF" />
                        <Text className="text-gray-400 text-xs mt-1">Add Element</Text>
                      </Pressable>
                      {outfitElements.map((element, index) => (
                        <View key={index} className="relative border-2 border-gray-700/50 rounded-xl overflow-hidden">
                          <Image
                            source={{ uri: element?.imageUrl.startsWith('temp://') ? pendingImagesRef.current[element.imageUrl]?.uri : element.imageUrl }}
                            className="w-24 h-32 rounded-xl"
                            resizeMode="cover"
                          />
                          <Pressable
                            onPress={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600 p-1 rounded-full border-2 border-black"
                          >
                            <Trash2 size={12} color="white" />
                          </Pressable>
                          <View className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                            <Text className="text-white text-xs">{element?.type}</Text>
                            <Text className="text-gray-400 text-xs">
                              {element?.price !== null ? `$${element?.price.toFixed(2)}` : 'Free'}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                  <View className="flex-row items-center justify-between self-end w-full">
                    <Text className={`text-sm ${outfitElements.length === 0 ? 'text-pink-600' : 'text-gray-400'}`}>
                      {outfitElements.length === 0 ? 'Add at least 1 element' : `${outfitElements.length} elements added`}
                    </Text>
                    <Text className={`text-gray-400 text-sm ${outfitElements.length === 0 ? 'hidden' : ''}`}>
                      Total price: ${calculateTotalPrice(outfitElements).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Title Field */}
              <View className="mb-6">
                <Text className="text-gray-300 font-medium text-base mb-3">Name</Text>
                <Controller
                  control={control}
                  name="outfit_name"
                  rules={{ required: 'Outfit name is required' }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Enter outfit name"
                      placeholderTextColor="#6B7280"
                      className={`bg-gray-800/50 border ${errors.outfit_name ? 'border-pink-600' : 'border-gray-700/50'} text-white px-4 py-3 rounded-lg text-base`}
                      maxLength={50}
                    />
                  )}
                />
                <View className="flex-row items-center justify-between mt-1">
                  {errors.outfit_name ? (
                    <Text className="text-pink-600 text-xs">{errors.outfit_name.message}</Text>
                  ) : (
                    <Text className="text-gray-400 text-xs">
                      {outfitName?.length || 0} / 50
                    </Text>
                  )}
                </View>
              </View>

              {/* Description Field */}
              <View className="mb-6">
                <Text className="text-gray-300 font-medium text-base mb-3">Description</Text>
                <Controller
                  control={control}
                  name="description"
                  rules={{ required: 'Description is required' }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      value={value || ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Describe your outfit..."
                      placeholderTextColor="#6B7280"
                      className={`bg-gray-800/50 border ${errors.description ? 'border-pink-600' : 'border-gray-700/50'} text-white px-4 py-3 rounded-lg text-base`}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      maxLength={200}
                    />
                  )}
                />
                <View className="flex-row items-center justify-between mt-1">
                  {errors.description ? (
                    <Text className="text-pink-600 text-xs">{errors.description.message}</Text>
                  ) : (
                    <Text className="text-gray-400 text-xs">
                      {description?.length || 0} / 200
                    </Text>
                  )}
                </View>
              </View>

              {/* Style Tags */}
              <View className="mb-6">
                <Text className="text-gray-300 font-medium text-base mb-3">Style Tags</Text>
                <View className="flex-row flex-wrap">
                  {OutfitStylesTags.map((style) => (
                    <Pressable
                      key={style.name}
                      onPress={() => toggleTag(style.name)}
                      className={`px-3 py-2 rounded-full mr-2 mb-2 border ${outfitTags.includes(style.name)
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500/50'
                        : 'bg-gray-800/30 border-gray-700/30'
                        }`}
                    >
                      <Text className="text-gray-200 text-sm">{style.name}</Text>
                    </Pressable>
                  ))}
                  {errors.outfit_tags && (
                    <Text className="text-pink-600 text-xs w-full">
                      Please select at least one style tag
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
        <DevTool control={control} />
      </Modal>

      {/* Element Modal */}
      <Modal
        visible={elementModalVisible}
        animationType="fade"
        transparent={true}
      >
        <View className="flex-1 bg-black/50 backdrop-blur-sm justify-center items-center px-4">
          <View className="bg-gradient-to-b from-black to-gray-900 rounded-2xl p-4 w-full border border-gray-800/50">
            <View className="flex-row items-center justify-between mb-4">
              <Pressable onPress={() => {
                setElementModalVisible(false);
                setSelectedImageName(null);
                setElementValue('imageUrl', '');
                trigger('imageUrl');
              }} className="p-2">
                <X size={24} color="#9CA3AF" />
              </Pressable>
              <Text className="text-white font-semibold text-lg">Add Outfit Element</Text>
              <Pressable
                onPress={handleElementSubmit(onElementSubmit)}
                disabled={!isElementValid}
                className={`px-4 py-2 rounded-full ${isElementValid ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-600'}`}
              >
                <Text className="text-white font-medium text-sm">Save</Text>
              </Pressable>
            </View>

            <ScrollView>
              <View className="mb-6">
                <Text className="text-gray-300 font-medium text-base mb-3">Element Type</Text>
                <Controller
                  control={elementControl}
                  name="type"
                  rules={{ required: 'Element type is required' }}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      selectedValue={value}
                      onValueChange={(val) => {
                        onChange(val);
                        trigger('type');
                      }}
                    >
                      <SelectTrigger className={`bg-gray-800/50 border ${elementErrors.type ? 'border-pink-600' : 'border-gray-700/50'} rounded-lg`}>
                        <SelectInput
                          placeholder="Select element type"
                          placeholderTextColor="#6B7280"
                          value={value}
                        />
                      </SelectTrigger>
                      <SelectPortal>
                        <SelectBackdrop className="bg-black/50 backdrop-blur-sm" />
                        <SelectContent className="bg-gray-800/50 border border-gray-700/50 rounded-lg">
                          {OutfitElements.map((element, index) => (
                            <SelectItem
                              key={index}
                              label={element.name}
                              value={element.name}
                              className="px-4 py-3 text-white hover:bg-gradient-to-r hover:from-purple-600/50 hover:to-pink-600/50 active:bg-gradient-to-r active:from-purple-600 active:to-pink-600 border-b border-gray-700/30 last:border-b-0"
                            />
                          ))}
                        </SelectContent>
                      </SelectPortal>
                    </Select>
                  )}
                />
                {elementErrors.type && (
                  <Text className="text-pink-600 text-xs mt-1">
                    {elementErrors.type.message}
                  </Text>
                )}
              </View>

              <View className="mb-6">
                <Text className="text-gray-300 font-medium text-base mb-3">Price</Text>
                <Controller
                  control={elementControl}
                  name="price"
                  rules={{
                    validate: (value) => {
                      if (value === null) return true;
                      if (isNaN(value)) return 'Price must be a number';
                      if (value < 0) return 'Price cannot be negative';
                      return true;
                    }
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      placeholder="Enter price (optional)"
                      placeholderTextColor="#6B7280"
                      value={value !== null ? value.toString() : ''}
                      onChangeText={(text) => {
                        const num = text ? parseFloat(text) : null;
                        onChange(num);
                        trigger('price');
                      }}
                      keyboardType="numeric"
                      className={`bg-gray-800/50 border ${elementErrors.price ? 'border-pink-600' : 'border-gray-700/50'} text-white px-4 py-3 rounded-lg text-base`}
                    />
                  )}
                />
                {elementErrors.price && (
                  <Text className="text-pink-600 text-xs mt-1">
                    {elementErrors.price.message}
                  </Text>
                )}
              </View>

              <View className="mb-6">
                <Text className="text-gray-300 font-medium text-base mb-3">Site URL</Text>
                <Controller
                  control={elementControl}
                  name="siteUrl"
                  rules={{
                    required: 'Site URL is required',
                    pattern: {
                      value: URL_PATTERN,
                      message: 'Please enter a valid URL'
                    }
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={(text) => {
                        onChange(text);
                        trigger('siteUrl');
                      }}
                      onBlur={onBlur}
                      placeholder="Enter site URL"
                      placeholderTextColor="#6B7280"
                      className={`bg-gray-800/50 border ${elementErrors.siteUrl ? 'border-pink-600' : 'border-gray-700/50'} text-white px-4 py-3 rounded-lg text-base`}
                    />
                  )}
                />
                {elementErrors.siteUrl && (
                  <Text className="text-pink-600 text-xs mt-1">
                    {elementErrors.siteUrl.message}
                  </Text>
                )}
              </View>

              <View className="mb-6">
                <Text className="text-gray-300 font-medium text-base mb-3">Image</Text>
                <Controller
                  control={elementControl}
                  name="imageUrl"
                  rules={{
                    required: 'Image is required'
                  }}
                  render={({ field: { onChange, value } }) => (
                    <>
                      {value && selectedImageName ? (
                        <View className="mb-4">
                          <View className="relative bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                            <Text className="text-white text-sm font-medium truncate">
                              {selectedImageName}
                            </Text>
                            <Pressable
                              onPress={() => {
                                if (value.startsWith('temp://')) {
                                  delete pendingImagesRef.current[value];
                                }
                                onChange('');
                                setSelectedImageName(null);
                                trigger('imageUrl');
                              }}
                              className="absolute top-2 right-2 bg-red-500 p-2 rounded-full"
                            >
                              <Trash2 size={16} color="white" />
                            </Pressable>
                          </View>
                          <View className="mt-2 flex-row items-center justify-center bg-green-500/10 py-1 px-2 rounded-full">
                            <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                            <Text className="text-green-500 text-xs">
                              Image selected successfully
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <View className="flex-col items-center">
                          <Pressable
                            onPress={handleImageSelect}
                            className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 items-center justify-center"
                          >
                            <View className="items-center justify-center mb-2">
                              <Plus size={24} color="#9CA3AF" />
                            </View>
                            <Text className="text-gray-300 text-sm font-medium">Select Image</Text>
                            <Text className="text-gray-500 text-xs mt-1">JPG, PNG (max 5MB)</Text>
                          </Pressable>
                          {elementErrors.imageUrl && (
                            <Text className="text-pink-600 text-xs mt-2 text-center">
                              {elementErrors.imageUrl.message}
                            </Text>
                          )}
                        </View>
                      )}
                    </>
                  )}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};
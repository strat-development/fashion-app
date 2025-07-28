import { Button, ButtonText } from '@/components/ui/button';
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
import { supabase } from '@/lib/supabase';
import { useCreateOutfitMutation } from '@/mutations/CreateOutfitMutation';
import { useUserContext } from '@/providers/userContext';
import { ModalProps, OutfitElementData } from '@/types/createOutfitTypes';

import { Plus, Trash2, X } from 'lucide-react-native';
import React, { useState } from 'react';
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

export const OutfitCreateModal = ({
  isVisible,
  onClose,
  isAnimated
}: ModalProps) => {
  const { userId } = useUserContext();
  const [elementData, setElementData] = useState<OutfitElementData>({
    type: '',
    price: null,
    imageUrl: '',
    siteUrl: ''
  });

  const [outfitData, setOutfitData] = useState<OutfitState>({
    outfit_name: '',
    description: null,
    outfit_tags: [],
    outfit_elements_data: [],
    created_at: new Date().toISOString(),
    created_by: userId || null,
    outfit_id: ""
  });

  const [elementModalVisible, setElementModalVisible] = useState(false);



  const { mutate: createOutfit } = useCreateOutfitMutation(
    () => {
      setOutfitData({
        outfit_name: '',
        description: '',
        outfit_tags: [],
        outfit_elements_data: [],
        created_at: new Date().toISOString(),
        created_by: userId || null,
        outfit_id: ""
      });
      onClose?.();
      Alert.alert('Success', 'Outfit saved successfully!');
    },
    (error) => {
      Alert.alert('Error', error.message);
    }
  );

  const handleSave = () => {
    if (!outfitData.outfit_name?.trim()) {
      Alert.alert('Error', 'Outfit name is required');
      return;
    }
    if (!outfitData.outfit_elements_data || outfitData.outfit_elements_data.length === 0) {
      Alert.alert('Error', 'At least one outfit element is required');
      return;
    }

    createOutfit({
      ...outfitData,
      created_by: userId || null
    });
  };

  const handleImagePicker = () => {
    setElementModalVisible(true);
  };

  const handleElementSave = () => {
    if (!elementData.type) {
      Alert.alert('Error', 'Element type is required');
      return;
    }
    if (!elementData.imageUrl) {
      Alert.alert('Error', 'Image is required');
      return;
    }
    if (elementData.price !== null && (isNaN(elementData.price) || elementData.price < 0)) {
      Alert.alert('Error', 'Price must be a valid number');
      return;
    }
    if (!elementData.siteUrl.trim()) {
      Alert.alert('Error', 'Site URL is required');
      return;
    }

    setOutfitData((prev) => ({
      ...prev,
      outfit_elements_data: [
        ...(Array.isArray(prev.outfit_elements_data) ? prev.outfit_elements_data : []),
        elementData
      ],
    }));

    setElementData({
      type: '',
      price: null,
      imageUrl: '',
      siteUrl: '',
    });

    setElementModalVisible(false);
  };

  const handleSelectImage = async () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert('Error', `Failed to pick image: ${response.errorMessage}`);
      } else if (response.assets && response.assets[0].uri) {
        const uri = response.assets[0].uri;
        const fileName = `outfit-element-${Date.now()}.jpg`;

        try {
          const response = await fetch(uri);
          const blob = await response.blob();

          if (!supabase) {
            Alert.alert('Supabase client is not initialized.');
            return;
          }
          const { data, error } = await supabase.storage
            .from('outfit-images')
            .upload(fileName, blob, {
              contentType: 'image/jpeg',
            });

          if (error) {
            Alert.alert('Error', `Failed to upload image: ${error.message}`);
            return;
          }

          const { data: publicUrlData } = supabase.storage
            .from('outfit-images')
            .getPublicUrl(fileName);

          setElementData((prev) => ({
            ...prev,
            imageUrl: publicUrlData.publicUrl,
          }));
        } catch (error) {
          Alert.alert('Error', `Failed to upload image:` + (error instanceof Error ? `: ${error.message}` : ''));
        }
      }
    });
  };

  const removeImage = (index: number) => {
    setOutfitData((prev) => {
      const elementsData = Array.isArray(prev.outfit_elements_data)
        ? prev.outfit_elements_data
        : [];

      return {
        ...prev,
        outfit_elements_data: elementsData.filter((_, i) => i !== index),
      };
    });
  };

  const toggleTag = (tag: string) => {
    setOutfitData((prev) => {
      const currentTags = Array.isArray(prev.outfit_tags) ? prev.outfit_tags : [];
      return {
        ...prev,
        outfit_tags: currentTags.includes(tag)
          ? currentTags.filter((t) => t !== tag)
          : [...currentTags, tag],
      };
    });
  };

  const calculateTotalPrice = (elements: JSON | null): number => {
    if (!Array.isArray(elements)) return 0;
    return elements.reduce((total, element) => {
      if (typeof element === 'object' && element !== null && 'price' in element) {
        return total + (element.price || 0);
      }
      return total;
    }, 0);
  }

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
              onPress={handleSave}
              className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full"
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
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-4">
                      <Pressable
                        onPress={handleImagePicker}
                        className="w-24 h-32 bg-gray-800/50 border-2 border-dashed border-gray-700/50 rounded-xl items-center justify-center"
                      >
                        <Plus size={24} color="#9CA3AF" />
                        <Text className="text-gray-400 text-xs mt-1">Add Element</Text>
                      </Pressable>
                      {Array.isArray(outfitData.outfit_elements_data) &&
                        outfitData.outfit_elements_data.map((element, index) => (
                          <View key={index} className="relative border-2 border-gray-700/50 rounded-xl overflow-hidden">
                            <Image
                              source={{ uri: element?.imageUrl }}
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
                  <View className="flex-row items-center justify-between self-end">
                    <Text className='text-gray-400'>
                      Total price: ${calculateTotalPrice(outfitData.outfit_elements_data as any ?? []).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Title Field */}
              <View className="mb-6">
                <Text className="text-gray-300 font-medium text-base mb-3">Name</Text>
                <TextInput
                  value={outfitData.outfit_name ?? ''}
                  onChangeText={(text) => setOutfitData((prev) => ({ ...prev, outfit_name: text }))}
                  placeholder="Enter outfit name"
                  placeholderTextColor="#6B7280"
                  className="bg-gray-800/50 border border-gray-700/50 text-white px-4 py-3 rounded-lg text-base"
                  maxLength={50}
                />
              </View>

              {/* Description Field */}
              <View className="mb-6">
                <Text className="text-gray-300 font-medium text-base mb-3">Description</Text>
                <TextInput
                  value={outfitData.description ?? ''}
                  onChangeText={(text) => setOutfitData((prev) => ({ ...prev, description: text }))}
                  placeholder="Describe your outfit..."
                  placeholderTextColor="#6B7280"
                  className="bg-gray-800/50 border border-gray-700/50 text-white px-4 py-3 rounded-lg text-base"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  maxLength={200}
                />
              </View>

              {/* Style Tags */}
              <View className="mb-6">
                <Text className="text-gray-300 font-medium text-base mb-3">Style Tags</Text>
                <View className="flex-row flex-wrap">
                  {OutfitStylesTags.map((style) => (
                    <Pressable
                      key={style.name}
                      onPress={() => toggleTag(style.name)}
                      className={`px-3 py-2 rounded-full mr-2 mb-2 border ${Array.isArray(outfitData.outfit_tags) &&
                        outfitData.outfit_tags.includes(style.name)
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500/50'
                        : 'bg-gray-800/30 border-gray-700/30'
                        }`}
                    >
                      <Text className="text-gray-200 text-sm">{style.name}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={elementModalVisible}
        animationType="fade"
        transparent={true}
      >
        <View className="flex-1 bg-black/50 backdrop-blur-sm justify-center items-center px-4">
          <View className="bg-gradient-to-b from-black to-gray-900 rounded-2xl p-4 w-full border border-gray-800/50">
            <View className="flex-row items-center justify-between mb-4">
              <Pressable onPress={() => setElementModalVisible(false)} className="p-2">
                <X size={24} color="#9CA3AF" />
              </Pressable>
              <Text className="text-white font-semibold text-lg">Add Outfit Element</Text>
              <Pressable
                onPress={handleElementSave}
                className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full"
              >
                <Text className="text-white font-medium text-sm">Save</Text>
              </Pressable>
            </View>

            <ScrollView>
              <View className="mb-6">
                <Text className="text-gray-300 font-medium text-base mb-3">Element Type</Text>
                <Select
                  onValueChange={(value) => setElementData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="bg-gray-800/50 border border-gray-700/50 text-white px-4 py-3 rounded-lg">
                    <SelectInput
                      placeholder="Select element type"
                      placeholderTextColor="#6B7280"
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
              </View>

              <View className="mb-6">
                <Text className="text-gray-300 font-medium text-base mb-3">Price</Text>
                <TextInput
                  placeholder="Enter price"
                  placeholderTextColor="#6B7280"
                  value={elementData.price !== null ? elementData.price.toString() : ''}
                  onChangeText={(text) => {
                    const value = text ? parseFloat(text) : null;
                    setElementData(prev => ({ ...prev, price: value }));
                  }}
                  keyboardType="numeric"
                  className="bg-gray-800/50 border border-gray-700/50 text-white px-4 py-3 rounded-lg text-base"
                />
              </View>

              <View className="mb-6">
                <Text className="text-gray-300 font-medium text-base mb-3">Image</Text>
                <View className="flex-row items-center space-x-2">
                  <TextInput
                    value={elementData.imageUrl}
                    onChangeText={(text) => setElementData(prev => ({ ...prev, imageUrl: text }))}
                    placeholder="Enter image URL"
                    placeholderTextColor="#6B7280"
                    className="flex-1 bg-gray-800/50 border border-gray-700/50 text-white px-4 py-3 rounded-lg text-base"
                  />
                  <Text className="text-gray-300 font-medium text-base">OR</Text>
                  <Button
                    onPress={handleSelectImage}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full"
                  >
                    <ButtonText className="text-white font-medium text-sm">Pick Image</ButtonText>
                  </Button>
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-gray-300 font-medium text-base mb-3">Site URL</Text>
                <TextInput
                  value={elementData.siteUrl}
                  onChangeText={(text) => setElementData(prev => ({ ...prev, siteUrl: text }))}
                  placeholder="Enter site URL"
                  placeholderTextColor="#6B7280"
                  className="bg-gray-800/50 border border-gray-700/50 text-white px-4 py-3 rounded-lg text-base"
                />
              </View>

              <Button
                onPress={handleElementSave}
                className="bg-gradient-to-r from-purple-600 to-pink-600 py-4 rounded-lg"
              >
                <ButtonText className="text-white font-semibold text-base text-center">Add Element</ButtonText>
              </Button>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};
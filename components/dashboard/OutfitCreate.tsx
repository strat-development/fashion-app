import { Button } from '@/components/ui/button';
import { OutfitColors, OutfitElements, OutfitStylesTags } from '@/consts/chatFilterConsts';
import { Plus, Save, Trash2, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface OutfitCreateProps {
  isVisible: boolean;
  onClose: () => void;
  onCreate: (outfit: NewOutfitData) => void;
}

export interface NewOutfitData {
  title: string;
  description: string;
  tags: string[];
  colors: string[];
  elements: string[];
  images: string[];
}

export const OutfitCreate: React.FC<OutfitCreateProps> = ({
  isVisible,
  onClose,
  onCreate
}) => {
  const [outfitData, setOutfitData] = useState<NewOutfitData>({
    title: '',
    description: '',
    tags: [],
    colors: [],
    elements: [],
    images: []
  });

  const handleSave = () => {
    if (!outfitData.title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    if (outfitData.images.length === 0) {
      Alert.alert('Error', 'At least one image is required');
      return;
    }
    onCreate(outfitData);
    onClose();
    // Reset form
    setOutfitData({
      title: '',
      description: '',
      tags: [],
      colors: [],
      elements: [],
      images: []
    });
  };

  const handleImagePicker = () => {
    // TODO: Implement image picker
    const placeholderImage = `https://via.placeholder.com/300x400/${Math.floor(Math.random()*16777215).toString(16)}/FFFFFF?text=New+Outfit`;
    setOutfitData(prev => ({
      ...prev,
      images: [...prev.images, placeholderImage]
    }));
  };

  const removeImage = (index: number) => {
    setOutfitData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const toggleTag = (tag: string) => {
    setOutfitData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const toggleColor = (color: string) => {
    setOutfitData(prev => ({
      ...prev,
      colors: prev.colors.includes(color) 
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const toggleElement = (element: string) => {
    setOutfitData(prev => ({
      ...prev,
      elements: prev.elements.includes(element) 
        ? prev.elements.filter(e => e !== element)
        : [...prev.elements, element]
    }));
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
          <Text className="text-white font-bold text-lg">Create Outfit</Text>
          <Pressable onPress={handleSave} className="p-2">
            <Save size={24} color="#4CAF50" />
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-4">
          <View className="pt-6 pb-20">
            {/* Images Section */}
            <View className="mb-6">
              <Text className="text-white font-semibold text-lg mb-3">Photos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                  {outfitData.images.map((image, index) => (
                    <View key={index} className="relative mr-4">
                      <Image 
                        source={{ uri: image }} 
                        className="w-24 h-32 rounded-xl"
                        resizeMode="cover"
                      />
                      <Pressable 
                        onPress={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-600 p-1 rounded-full"
                      >
                        <Trash2 size={12} color="white" />
                      </Pressable>
                    </View>
                  ))}
                  <Pressable 
                    onPress={handleImagePicker}
                    className="w-24 h-32 bg-black/20 backdrop-blur-xl rounded-xl border-2 border-dashed border-white/30 items-center justify-center"
                  >
                    <Plus size={24} color="white" />
                    <Text className="text-white/60 text-xs mt-1">Add Photo</Text>
                  </Pressable>
                </View>
              </ScrollView>
            </View>

            {/* Title Field */}
            <View className="mb-6">
              <Text className="text-white font-semibold text-lg mb-3">Title</Text>
              <TextInput
                value={outfitData.title}
                onChangeText={(text) => setOutfitData(prev => ({ ...prev, title: text }))}
                placeholder="Enter outfit title"
                placeholderTextColor="rgba(255,255,255,0.5)"
                className="bg-black/20 backdrop-blur-xl text-white px-4 py-4 rounded-2xl border border-white/10"
                maxLength={50}
              />
            </View>

            {/* Description Field */}
            <View className="mb-6">
              <Text className="text-white font-semibold text-lg mb-3">Description</Text>
              <TextInput
                value={outfitData.description}
                onChangeText={(text) => setOutfitData(prev => ({ ...prev, description: text }))}
                placeholder="Describe your outfit..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                className="bg-black/20 backdrop-blur-xl text-white px-4 py-4 rounded-2xl border border-white/10"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={200}
              />
            </View>

            {/* Style Tags */}
            <View className="mb-6">
              <Text className="text-white font-semibold text-lg mb-3">Style Tags</Text>
              <View className="flex-row flex-wrap">
                {OutfitStylesTags.map((style) => (
                  <Pressable
                    key={style.name}
                    onPress={() => toggleTag(style.name)}
                    className={`px-3 py-2 rounded-full mr-2 mb-2 ${
                      outfitData.tags.includes(style.name) 
                        ? 'bg-blue-600' 
                        : 'bg-white/10'
                    }`}
                  >
                    <Text className="text-white text-sm">{style.name}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Colors */}
            <View className="mb-6">
              <Text className="text-white font-semibold text-lg mb-3">Dominant Colors</Text>
              <View className="flex-row flex-wrap">
                {OutfitColors.map((color) => (
                  <Pressable
                    key={color.name}
                    onPress={() => toggleColor(color.name)}
                    className={`flex-row items-center px-3 py-2 rounded-full mr-2 mb-2 ${
                      outfitData.colors.includes(color.name) 
                        ? 'bg-white/20' 
                        : 'bg-white/10'
                    }`}
                  >
                    <View 
                      style={{ backgroundColor: color.hex }}
                      className="w-4 h-4 rounded-full mr-2"
                    />
                    <Text className="text-white text-sm">{color.name}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Elements */}
            <View className="mb-8">
              <Text className="text-white font-semibold text-lg mb-3">Outfit Elements</Text>
              <View className="flex-row flex-wrap">
                {OutfitElements.map((element) => (
                  <Pressable
                    key={element.name}
                    onPress={() => toggleElement(element.name)}
                    className={`px-3 py-2 rounded-full mr-2 mb-2 ${
                      outfitData.elements.includes(element.name) 
                        ? 'bg-green-600' 
                        : 'bg-white/10'
                    }`}
                  >
                    <Text className="text-white text-sm">{element.name}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Button 
              onPress={handleSave}
              className="bg-blue-600 py-4 rounded-2xl"
            >
              <Text className="text-white font-bold text-lg">Create Outfit</Text>
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

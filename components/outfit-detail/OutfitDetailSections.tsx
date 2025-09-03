import { Json } from "@/types/supabase";
import { Tag } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

interface OutfitDetailSectionsProps {
  description?: string | null;
  tags: (Json | string)[];
}

export default function OutfitDetailSections({ description, tags }: OutfitDetailSectionsProps) {
  return (
    <>
      {/* Description */}
      {description && (
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-2">Description</Text>
          <Text className="text-gray-300 text-base leading-relaxed">
            {description}
          </Text>
        </View>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <Tag size={18} color="#A855F7" />
            <Text className="text-white text-lg font-semibold ml-2">Tags</Text>
          </View>
          <View className="flex-row flex-wrap">
            {tags.map((tag, index) => (
              <View 
                key={index}
                className="bg-purple-600/20 border border-purple-500/30 rounded-full px-3 py-1 mr-2 mb-2"
              >
                <Text className="text-purple-300 text-sm">{String(tag)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </>
  );
}

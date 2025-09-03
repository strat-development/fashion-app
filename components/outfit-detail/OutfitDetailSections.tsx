import { Json } from "@/types/supabase";
import { Tag } from "lucide-react-native";
import React from "react";
import { Text, View, useWindowDimensions } from "react-native";

interface OutfitDetailSectionsProps {
  description?: string | null;
  tags: (Json | string)[];
}

export default function OutfitDetailSections({ description, tags }: OutfitDetailSectionsProps) {
  const { width } = useWindowDimensions();
  const scale = Math.min(1.2, Math.max(0.9, width / 390));
  const heading = Math.round(18 * scale);
  const body = Math.round(15 * scale);
  const chip = Math.round(12 * scale);
  return (
    <>
      {/* Description */}
      {description && (
        <View className="mb-6 bg-gray-800/30 rounded-2xl p-4 border border-white/5">
          <Text className="text-white font-semibold mb-2" style={{ fontSize: heading }}>Description</Text>
          <Text className="text-gray-300" style={{ fontSize: body, lineHeight: body + 6 }}>
            {description}
          </Text>
        </View>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <View className="mb-6 bg-gray-800/30 rounded-2xl p-4 border border-white/5">
          <View className="flex-row items-center mb-3">
            <Tag size={18} color="#A855F7" />
            <Text className="text-white font-semibold ml-2" style={{ fontSize: heading }}>Tags</Text>
          </View>
          <View className="flex-row flex-wrap">
            {tags.map((tag, index) => (
              <View
                key={index}
                className="bg-purple-600/20 border border-purple-500/30 rounded-full px-3 py-1 mr-2 mb-2"
              >
                <Text className="text-purple-300" style={{ fontSize: chip }}>{String(tag)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </>
  );
}

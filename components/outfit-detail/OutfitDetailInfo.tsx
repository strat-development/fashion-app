import { formatDate } from "@/helpers/helpers";
import { Database, Json } from "@/types/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar, User } from "lucide-react-native";
import React from "react";
import { Image, Text, View, useWindowDimensions } from "react-native";

type UserData = {
  nickname?: string | null;
  user_avatar?: string | null;
};

type OutfitData = Database["public"]["Tables"]["created-outfits"]["Row"] & {
  likes: number;
  comments: number;
  isLiked?: boolean;
  isSaved?: boolean;
};

interface OutfitDetailInfoProps {
  outfit: OutfitData;
  userData: UserData | undefined;
  tags: (Json | string)[];
}

export default function OutfitDetailInfo({ outfit, userData, tags }: OutfitDetailInfoProps) {
  const { width } = useWindowDimensions();
  const scale = Math.min(1.25, Math.max(0.85, width / 390));
  const titleSize = Math.round(24 * scale);
  const nameSize = Math.round(16 * scale);
  const metaSize = Math.max(12, Math.round(13 * scale));

  return (
    <>
      {/* Header Card */}
      <View style={{
        backgroundColor: '#1f1f1fcc',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#2a2a2a'
      }}>
        {/* Creator Info */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          {userData?.user_avatar ? (
            <Image
              source={{ uri: userData.user_avatar }}
              style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }}
            />
          ) : (
            <LinearGradient
              colors={['#7e22ce', '#db2777']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}
            >
              <User size={20} color="#FFFFFF" />
            </LinearGradient>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: nameSize }}>
              {userData?.nickname || "Anonymous"}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Calendar size={14} color="#9CA3AF" />
              <Text style={{ color: '#9CA3AF', marginLeft: 4, fontSize: metaSize }}>
                {formatDate(outfit.created_at || "")}
              </Text>
            </View>
          </View>
        </View>

        {/* Outfit Title */}
        {outfit.outfit_name && (
          <Text
            style={{
              color: '#fff',
              fontWeight: '700',
              fontSize: titleSize,
              lineHeight: titleSize + 6
            }}
          >
            {outfit.outfit_name}
          </Text>
        )}

      </View>
    </>
  );
}

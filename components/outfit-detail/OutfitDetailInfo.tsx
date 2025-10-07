import { formatDate } from "@/helpers/helpers";
import { useTheme } from "@/providers/themeContext";
import { Database, Json } from "@/types/supabase";
import { Calendar, User } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const scale = Math.min(1.25, Math.max(0.85, width / 390));
  const titleSize = Math.round(24 * scale);
  const nameSize = Math.round(16 * scale);
  const metaSize = Math.max(12, Math.round(13 * scale));
  const [avatarOk, setAvatarOk] = useState<boolean>(!!userData?.user_avatar);

  return (
    <>
      {/* Header Card */}
      <View style={{
        marginBottom: 16,
      }}>
        {/* Creator Info */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          {avatarOk && userData?.user_avatar ? (
            <Image
              source={{ uri: userData.user_avatar }}
              onError={() => setAvatarOk(false)}
              style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12, backgroundColor: colors.surfaceVariant }}
            />
          ) : (
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
                backgroundColor: colors.surfaceVariant,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <User size={20} color={colors.textMuted} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: nameSize }}>
              {userData?.nickname || t('outfitDetail.info.anonymous')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Calendar size={14} color="#9CA3AF" />
              <Text style={{ color: colors.textMuted, marginLeft: 4, fontSize: metaSize }}>
                {formatDate(outfit.created_at || "")}
              </Text>
            </View>
          </View>
        </View>

        {/* Outfit Title */}
        {outfit.outfit_name && (
          <Text
            style={{
              color: colors.text,
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
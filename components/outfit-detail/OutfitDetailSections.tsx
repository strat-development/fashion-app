import { useTheme } from "@/providers/themeContext";
import { Json } from "@/types/supabase";
import { Tag } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View, useWindowDimensions } from "react-native";

interface OutfitDetailSectionsProps {
  description?: string | null;
  tags: (Json | string)[];
}

export default function OutfitDetailSections({ description, tags }: OutfitDetailSectionsProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const scale = Math.min(1.2, Math.max(0.9, width / 390));
  const heading = Math.round(18 * scale);
  const body = Math.round(15 * scale);
  const chip = Math.round(12 * scale);
  
  return (
    <View style={{ paddingHorizontal: 16 }}>
      {/* Description */}
      {description && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 8, fontSize: heading }}>
            {t('outfitDetail.sections.description')}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: body, lineHeight: body + 6 }}>
            {description}
          </Text>
        </View>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Tag size={18} color={colors.textMuted} />
            <Text style={{ color: colors.text, fontWeight: '600', marginLeft: 8, fontSize: heading }}>
              {t('outfitDetail.sections.tags')}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {tags.map((tag, index) => (
              <View
                key={index}
                style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 8 }}
              >
                <Text style={{ color: colors.textSecondary, fontSize: chip }}>{String(tag)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
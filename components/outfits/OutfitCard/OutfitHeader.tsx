import { formatDate } from "@/helpers/helpers";
import { ThemedGradient, useTheme } from "@/providers/themeContext";
import { Database } from "@/types/supabase";
import { Link } from "expo-router";
import { Delete, User } from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";

type UserData = Database["public"]["Tables"]["users"]["Row"];

interface OutfitHeaderProps {
  userData?: UserData;
  createdAt: string;
  createdBy: string;
  currentUserId?: string;
  isDeleteVisible?: boolean;
  onDelete?: (outfitId: string) => void;
  outfitId: string;
}

export const OutfitHeader = ({
  userData,
  createdAt,
  createdBy,
  currentUserId,
  isDeleteVisible,
  onDelete,
  outfitId,
}: OutfitHeaderProps) => {
  const { colors } = useTheme();

  return (
    <View style={{ 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      paddingHorizontal: 16, 
      paddingVertical: 12 
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {userData?.user_avatar ? (
          <View style={{
            width: 32,
            height: 32,
            backgroundColor: colors.surfaceVariant,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12
          }}>
            <Image 
              source={{ uri: userData.user_avatar }} 
              style={{ width: '100%', height: '100%', borderRadius: 16 }}
            />
          </View>
        ) : (
          <View style={{
            width: 32,
            height: 32,
            backgroundColor: colors.accent,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12
          }}>
            <User size={16} color={colors.white} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Link
            href={{
              pathname: "/userProfile/[id]",
              params: { id: createdBy },
            }}
            asChild
          >
            <Pressable>
              <Text style={{ 
                color: colors.text, 
                fontWeight: '600' 
              }}>
                {userData?.nickname || 'Anonymous'}
              </Text>
            </Pressable>
          </Link>
          <Text style={{ 
            color: colors.textSecondary, 
            fontSize: 12 
          }}>{formatDate(createdAt)}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {createdBy === currentUserId && (
          <ThemedGradient
            style={{
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: `${colors.accent}4D`
            }}
          >
            <Text style={{ 
              color: 'white', 
              fontSize: 12, 
              fontWeight: '500' 
            }}>Your creation</Text>
          </ThemedGradient>
        )}

        {isDeleteVisible && (
          <Pressable
            style={{
              backgroundColor: `${colors.error}33`,
              borderWidth: 1,
              borderColor: `${colors.error}4D`,
              padding: 8,
              borderRadius: 999
            }}
            onPress={() => onDelete?.(outfitId)}
          >
            <Delete size={16} color={colors.error} />
          </Pressable>
        )}
      </View>
    </View>
  );
};
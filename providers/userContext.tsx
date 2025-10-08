import i18n from "@/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    useSessionContext
} from "@supabase/auth-helpers-react";
import { createContext, useContext, useEffect, useState } from "react";

type UserContextType = {
    userName: string;
    setUserName: (userName: string) => void;
    userBio: string;
    setUserBio: (userBio: string) => void;
    userImage: string;
    setUserImage: (userImage: string) => void;
    userEmail: string;
    setUserEmail: (userEmail: string) => void;
    userSocials: string[];
    setUserSocials: (userSocials: string[]) => void;
    userJoinedAt: string;
    setUserJoinedAt: (userJoinedAt: string) => void;
    preferredLanguage: string;
    setPreferredLanguage: (lang: string) => void;
    preferredCurrency: string;
    setPreferredCurrency: (currency: string) => void;
    userId: string | null;
    loading: boolean;
    isPublic: boolean;
    setIsPublic: (isPublic: boolean) => void;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);

export default function UserContextProvider({ children }: { children: React.ReactNode }) {
    const [userName, setUserName] = useState<string>("");
    const [userBio, setUserBio] = useState<string>("");
    const [userImage, setUserImage] = useState<string>("");
    const [userEmail, setUserEmail] = useState<string>("");
    const [userSocials, setUserSocials] = useState<string[]>([]);
    const [userJoinedAt, setUserJoinedAt] = useState<string>("");
    const [preferredLanguage, setPreferredLanguage] = useState<string>("en");
    const [preferredCurrency, setPreferredCurrency] = useState<string>("USD");
    const [isPublic, setIsPublic] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(true);
    const { supabaseClient: supabase, session } = useSessionContext();
    const userId = session?.user?.id || "";

    useEffect(() => {
        if (preferredLanguage) {
            i18n.changeLanguage(preferredLanguage);
        }
    }, [preferredLanguage]);

    useEffect(() => {
        const hydrateFromCacheAndMaybeFetch = async () => {
            if (!session?.user) {
                setLoading(false);
                return;
            }

            const cacheKey = `user_ctx:${session.user.id}`;
            try {
                // Try hydrate from cache first to avoid flicker
                const cached = await AsyncStorage.getItem(cacheKey);
                let isStale = true;
                if (cached) {
                    const parsed = JSON.parse(cached);
                    setUserName(parsed.userName || "");
                    setUserBio(parsed.userBio || "");
                    setUserImage(parsed.userImage || "");
                    setUserEmail(parsed.userEmail || "");
                    setUserSocials(Array.isArray(parsed.userSocials) ? parsed.userSocials : []);
                    setUserJoinedAt(parsed.userJoinedAt || "");
                    setIsPublic(typeof parsed.isPublic === 'boolean' ? parsed.isPublic : true);
                    setPreferredLanguage(parsed.preferredLanguage || "en");
                    setPreferredCurrency(parsed.preferredCurrency || "USD");
                    setLoading(false);

                    const updatedAt = typeof parsed.updatedAt === 'number' ? parsed.updatedAt : 0;
                    const STALE_MS = 5 * 60 * 1000; // 5 minutes
                    isStale = Date.now() - updatedAt > STALE_MS;
                } else {
                    // No cache; show loader until first fetch completes
                    setLoading(true);
                }

                if (!isStale) {
                    // Fresh enough; skip network fetch
                    return;
                }

                // Fetch latest user profile
                const { data: userData, error } = await supabase
                    .from("users")
                    .select("*")
                    .eq("user_id", session.user.id)
                    .single();

                if (error) {
                    console.log(error);
                }

                if (userData) {
                    setUserName(userData.full_name);
                    setUserBio(userData.bio);
                    setUserImage(userData.user_avatar);
                    setUserEmail(userData.email);
                    setUserSocials(userData.socials);
                    setUserJoinedAt(userData.created_at);
                    setIsPublic(userData.is_public ?? true);
                    setPreferredLanguage(userData.preferred_language || "en");
                    setPreferredCurrency(userData.preferred_currency || "USD");

                    // Persist to cache
                    const toCache = {
                        userName: userData.full_name,
                        userBio: userData.bio,
                        userImage: userData.user_avatar,
                        userEmail: userData.email,
                        userSocials: userData.socials,
                        userJoinedAt: userData.created_at,
                        isPublic: userData.is_public ?? true,
                        preferredLanguage: userData.preferred_language || "en",
                        preferredCurrency: userData.preferred_currency || "USD",
                        updatedAt: Date.now(),
                    };
                    await AsyncStorage.setItem(cacheKey, JSON.stringify(toCache));
                }

                setLoading(false);
            } catch (e) {
                console.log("UserContext cache/fetch error", e);
                setLoading(false);
            }
        };

        hydrateFromCacheAndMaybeFetch();
    }, [session, supabase]);

    return (
        <UserContext.Provider value={{
            userName, setUserName,
            userBio, setUserBio,
            userImage, setUserImage,
            userEmail, setUserEmail,
            userSocials, setUserSocials,
            userJoinedAt, setUserJoinedAt,
            userId, loading,
            isPublic, setIsPublic,
            preferredLanguage, setPreferredLanguage,
            preferredCurrency, setPreferredCurrency
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUserContext() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error(
            "useUserContext must be used within a UserContextProvider"
        );
    }
    return context;
}
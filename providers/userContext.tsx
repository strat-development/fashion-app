import { useFetchUser } from "@/fetchers/fetchUser";
import i18n from "@/i18n";
import {
    useSessionContext
} from "@supabase/auth-helpers-react";
import React, { createContext, useContext, useEffect, useState } from "react";

type UserContextType = {
    userName: string;
    setUserName: (userName: string) => void;
    nickname: string;
    setNickname: (nickname: string) => void;
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
    const [nickname, setNickname] = useState<string>("");
    const [userBio, setUserBio] = useState<string>("");
    const [userImage, setUserImage] = useState<string>("");
    const [userEmail, setUserEmail] = useState<string>("");
    const [userSocials, setUserSocials] = useState<string[]>([]);
    const [userJoinedAt, setUserJoinedAt] = useState<string>("");
    const [preferredLanguage, setPreferredLanguage] = useState<string>("en");
    const [preferredCurrency, setPreferredCurrency] = useState<string>("USD");
    const [isPublic, setIsPublic] = useState<boolean>(true);
    const { supabaseClient: supabase, session } = useSessionContext();
    const userId = session?.user?.id || "";
    const { data: userData, isLoading: loading } = useFetchUser(userId);

    useEffect(() => {
        if (preferredLanguage) {
            i18n.changeLanguage(preferredLanguage);
        }
    }, [preferredLanguage]);

    useEffect(() => {
        if (userData) {
            setUserName(userData.full_name || "");
            setNickname(userData.nickname || "");
            setUserBio(userData.bio || "");
            setUserImage(userData.user_avatar || "");
            setUserEmail(userData.email || "");
            setUserSocials(
                Array.isArray(userData.socials)
                    ? userData.socials.map(String)
                    : []
            );
            setUserJoinedAt(userData.created_at || "");
            setIsPublic(userData.is_public ?? true);
            setPreferredLanguage(userData.preferred_language || "en");
            setPreferredCurrency(userData.preferred_currency || "USD");
        }
    }, [userData]);

    return (
        <UserContext.Provider value={{
            userName, setUserName,
            nickname, setNickname,
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
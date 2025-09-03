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
    const [isPublic, setIsPublic] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(true);
    const { supabaseClient: supabase, session } = useSessionContext();
    const userId = session?.user?.id || "";

    useEffect(() => {
        if (session?.user) {
            setLoading(true);
            const getUserRole = async () => {
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
                }

                setLoading(false);
            };

            getUserRole();
        }
    }, [session, supabase]);

    return (
        <UserContext.Provider value={{
            userName,
            setUserName,
            userBio,
            setUserBio,
            userImage,
            setUserImage,
            userEmail,
            setUserEmail,
            userSocials,
            setUserSocials,
            userJoinedAt,
            setUserJoinedAt,
            userId,
            loading,
            isPublic,
            setIsPublic
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
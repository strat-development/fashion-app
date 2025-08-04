import {
    useSessionContext
} from "@supabase/auth-helpers-react";
import { createContext, useContext, useEffect, useState } from "react";

type UserContextType = {
    userName: string;
    setUserName: (userName: string) => void;
    userId: string | null;
    loading: boolean;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);

export default function UserContextProvider({ children }: { children: React.ReactNode }) {
    const [userName, setUserName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const { supabaseClient: supabase, session } = useSessionContext();
    const userId = session?.user?.id || "";

    useEffect(() => {
        if (session?.user) {
            setLoading(true);
            const getUserRole = async () => {
                const { data: userData, error } = await supabase
                    .from("users")
                    .select("full_name, id")
                    .eq("id", session.user.id)
                    .single();

                if (error) {
                    console.log(error);
                }

                if (userData) {
                    setUserName(userData.full_name);
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
            userId,
            loading
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
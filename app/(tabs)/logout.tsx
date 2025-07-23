import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { supabase } from "@/lib/supabase";
import { Button } from "@rneui/themed";
import { router } from "expo-router";

export default function LogoutScreen() {
    const handleLogout = async () => {
        try {
            await supabase?.auth.signOut();
            router.replace('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <ThemedView className="flex-1 items-center justify-center p-4">
            <ThemedText type="title">Logout</ThemedText>
            <ThemedText>Are you sure you want to log out?</ThemedText>
            <Button title="Logout" onPress={handleLogout} />
        </ThemedView>
    );
}
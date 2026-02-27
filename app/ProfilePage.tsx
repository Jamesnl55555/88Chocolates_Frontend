import { useAuth } from "@/contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";
import api from "./services/api";


export default function ProfilePage() {
    const router = useRouter();
    const auth = useAuth();
    const logoutMutation = useMutation({
        mutationFn: () => {
            return api.post('/api/logout').then(res => res.data);
        },
        onSuccess: async (data) => {
            console.log('Logged out!', data);
            // Clear token via auth context
            await auth.signOut();
            router.push('/LoginPage');
        },
        onError: (error) => {
            console.error('Logout failed', error);
        }
    });
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Profile Page</Text>
            <Text style={{ marginTop: 10 }}>This is where user profile information will be displayed.</Text>
            <Button
                title="Logout"
                onPress={() => {
                logoutMutation.mutate();
                }}
            />
        </View>
    );
}

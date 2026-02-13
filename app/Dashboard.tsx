//temporary dashboard
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Button, Text } from "react-native";
import api from "./services/api"; // Your Axios instance

export default function Dashboard() {
    const router = useRouter();
    
    const logoutMutation = useMutation({
        mutationFn: () => {
            return api.post('/api/logout').then(res => res.data);
        },
        onSuccess: async (data) => {
            console.log('Logged out!', data);
            // Remove the token
            await AsyncStorage.removeItem('userToken');
            router.push('/LoginPage');
        },
        onError: (error) => {
            console.error('Logout failed', error);
        }
    });
    return (
        <>
        <Text>Dashboard</Text>
        <Button title="Logout" onPress={() => {
            logoutMutation.mutate();
        }
        } />
        </>

    );
}
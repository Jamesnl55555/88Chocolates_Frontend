//temporary dashboard
import NavigationBar from '@/components/NavigationBar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from "expo-router";
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from "react-native";


export default function Dashboard() {
    const router = useRouter();
    const auth = useAuth();
    useEffect(() => {
        if (!auth.restoring && !auth.isAuthenticated) {
            router.replace('/LoginPage');
        }
    }, [auth.restoring, auth.isAuthenticated]);
    
    
    return (
    <>
        <Text>Welcome, {auth.user?.name ?? 'User'}!</Text>
        <Pressable style={styles.makeButton} onPress={() => router.push('/MakeTransactionPage')}>
            <Text style={styles.makeText}>MAKE A TRANSACTION</Text>
        </Pressable>
        <Pressable style={styles.makeButton} onPress={() => router.push('/MakeTransactionPage')}>
            <Text style={styles.makeText}>MAKE AN INVENTORY</Text>
        </Pressable>
        <NavigationBar />
        
    </>

    );
}

const styles = StyleSheet.create({
    makeButton: {
        backgroundColor: '#e2b480',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 20,
    },
    makeText: {
        color: '#5e3f17',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
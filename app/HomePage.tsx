import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from "expo-router";
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from "react-native";
import api from './services/api';


export default function HomePage() {
    const [customerCount, setCustomerCount] = useState(0);
    const [revenue, setRevenue] = useState(0);
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    const router = useRouter();
    const auth = useAuth();
    useEffect(() => {
        if (!auth.restoring && !auth.isAuthenticated) {
            router.replace('/LoginPage');
        }
    }, [auth.restoring, auth.isAuthenticated]);
    
    useEffect(() => {
    api.get('/api/fetchLatestTransactions')
    .then(res => {
      setCustomerCount(res.data.distinct_minutes ?? 0);
      setRevenue(Number(res.data.total_amount) ?? 0);
    })
    .catch(err => {
      console.error('Error fetching latest transactions:', err);
      setCustomerCount(0);
      setRevenue(0);
    });
    }, []);
    
    return (
    <View>
        <View style={styles.container}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 5, marginTop: 40 }}>Welcome, {auth.user?.name ?? 'User'}!</Text>
        <Pressable style={styles.makeButton} onPress={() => router.push('/MakeTransactionPage')}>
            <Text style={styles.makeText}>NEW TRANSACTION</Text>
        </Pressable>
        <Pressable style={styles.makeButton} onPress={() => router.push('/InventoryPage')}>
            <Text style={styles.makeText}>MANAGE INVENTORY</Text>
        </Pressable>
        <View style={styles.date}>
            <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
        <View style={styles.boxesContainer}>
            <View style={styles.box}>
                <Text style={styles.boxHeadText}>{customerCount ?? 0}</Text>
                <Text style={styles.boxText}>Customer Count</Text>
            </View>
            <View style={styles.box}>
                <Text style={styles.boxHeadText}>₱{revenue?.toFixed(2) ?? '0.00'}</Text>
                <Text style={styles.boxText}>Revenue</Text>
            </View>
        </View>
        </View>
    </View>

    );
}

const styles = StyleSheet.create({
    container: {
      padding: 20,  
    },
    makeButton: {
        backgroundColor: '#FFEDD9',
        borderColor: '#411C0E',
        borderWidth: 2,
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
    date: {
        marginTop: 20,
    },
    dateText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#411C0E',
    },
    boxesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    box: {
        backgroundColor: '#FFEDD9',
        width: '48%',
        height: 100,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#411C0E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    boxHeadText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#411C0E',
    },
    boxText: {
        maxWidth: '100%',
        fontSize: 16,
        color: '#411C0E',
    },
});
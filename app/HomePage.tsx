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
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.container}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10, marginTop: 20, color: '#411C0E' }}>WELCOME, {(auth.user?.name ?? 'User').toUpperCase()}!</Text>
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
      backgroundColor: '#fff',
    },
    makeButton: {
        backgroundColor: '#FFEDD9',
        borderColor: '#411C0E',
        borderWidth: 2,
        paddingVertical: 19,
        paddingHorizontal: 24,
        borderRadius: 10,
        marginTop: 10,
        fontWeight: 800,
    },
    makeText: {
        color: '#411C0E',
        fontSize: 20,
        fontWeight: 'bold',
    },
    date: {
        marginTop: 30,
    },
    dateText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#411C0E',
    },
    boxesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    box: {
        backgroundColor: '#FFFFFF',
        width: '49%',
        height: 100,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#411C0E',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
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
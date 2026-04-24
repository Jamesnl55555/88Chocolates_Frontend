import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from "expo-router";
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import api from './services/api';


export default function HomePage() {
    const [customerCount, setCustomerCount] = useState(0);
    const [revenue, setRevenue] = useState(0);
    const [dailyTransactions, setDailyTransactions] = useState([]);
    const [lastFetchedDate, setLastFetchedDate] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [outOfStockCount, setOutOfStockCount] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(0);
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    const localTodayDate = today.toLocaleDateString("en-CA");
    const router = useRouter();
    const auth = useAuth();
    useEffect(() => {
        if (!auth.restoring && !auth.isAuthenticated) {
            router.replace('/LoginPage');
        }
    }, [auth.restoring, auth.isAuthenticated]);
    
    const fetchDailyStats = async () => {
      const todayDate = localTodayDate;

      if (lastFetchedDate !== null && todayDate !== lastFetchedDate) {
        // New day hit: reset to zero immediately
        setCustomerCount(0);
        setRevenue(0);
        setDailyTransactions([]);
        setLastFetchedDate(todayDate);
      }

      setRefreshing(true);
      try {
        const res = await api.get('/api/fetchtransactions', {
          params: { page: 1, date: todayDate },
        });
        const txns = res.data.transactions || [];
        setLowStockCount(res.data.low_stock_count || 0);
        setOutOfStockCount(res.data.out_of_stock_count || 0);

        setDailyTransactions(txns);
        setCustomerCount(txns.length);
        setRevenue(txns.reduce((sum: number, t: any) => sum + Number(t.total_amount || 0), 0));
        setLastFetchedDate(todayDate);
      } catch (err) {
        console.error('Error fetching daily transactions:', err);
        setCustomerCount(0);
        setRevenue(0);
        setLastFetchedDate(todayDate);
      } finally {
        setRefreshing(false);
      }
    };

    useEffect(() => {
      fetchDailyStats();
    }, []);
    
    useEffect(() => {
      const interval = setInterval(() => {
        fetchDailyStats();
      }, 30000); // Poll every 30 seconds

      return () => clearInterval(interval);
    }, []);

    return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.container}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10, marginTop: 20, color: '#411C0E' }}>WELCOME, {(auth.user?.name ?? 'User').toUpperCase()}!</Text>
        <Pressable
            style={({ pressed }) => [
                styles.makeButton,
                pressed && styles.makeButtonPressed,
            ]}
            onPress={() => router.push('/MakeTransactionPage')}
        >
            <Text style={styles.makeText}>NEW TRANSACTION</Text>
        </Pressable>
        <Pressable
            style={({ pressed }) => [
                styles.makeButton,
                pressed && styles.makeButtonPressed,
            ]}
            onPress={() => router.push('/AddProductsPage')}
        >
            <Text style={styles.makeText}>ADD PRODUCT</Text>
        </Pressable>

        <View style={styles.date}>
            <Text style={styles.dateText}>{formattedDate}</Text>
        </View>

        <View style={[styles.boxesContainer, { position: 'relative' }]}>
            <TouchableOpacity 
              style={{ position: 'absolute', top: -10, right: 0, zIndex: 1, padding: 5 }} 
              onPress={fetchDailyStats}
              disabled={refreshing}
            >
              <ActivityIndicator size="small" color="#411C0E" animating={refreshing} />
            </TouchableOpacity>
            <View style={styles.box}>
                <Text style={styles.boxHeadText}>{customerCount ?? 0}</Text>
                <Text style={styles.boxText}>Customers Today</Text>
            </View>
            <View style={styles.box}>
                <Text style={styles.boxHeadText}>₱{revenue?.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}</Text>
                <Text style={styles.boxText}>Revenue Today</Text>
            </View>
            
        </View>
        <View style={{ flexDirection: "row" }}>
            <View style={styles.box}>
                <Text style={styles.boxHeadText}>{outOfStockCount}</Text>
                <Text style={styles.boxText}>Out of Stock</Text>
            </View>
            <View style={styles.box}>
                <Text style={styles.boxHeadText}>{lowStockCount}</Text>
                <Text style={styles.boxText}>Low Stock</Text>
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
    makeButtonPressed: {
        backgroundColor: '#E9D2B6',
        borderColor: '#331205',
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
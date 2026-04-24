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

    const fetchStockCounts = async () => {
      try {
        let allProducts: any[] = [];
        const firstRes = await api.get('/api/fetchproducts', {
          params: { page: 1, search: '' },
        });
        allProducts = [...firstRes.data.products];
        const lastPage = firstRes.data.last_page;

        const pageRequests = [];
        for (let p = 2; p <= lastPage; p++) {
          pageRequests.push(api.get('/api/fetchproducts', {
            params: { page: p, search: '' },
          }));
        }

        const responses = await Promise.all(pageRequests);
        responses.forEach(res => {
          allProducts = [...allProducts, ...res.data.products];
        });

        const lowStock = allProducts.filter((p: any) => p.quantity > 0 && p.quantity <= 10).length;
        const outOfStock = allProducts.filter((p: any) => p.quantity <= 0).length;

        setLowStockCount(lowStock);
        setOutOfStockCount(outOfStock);
      } catch (err) {
        console.error('Error fetching stock counts:', err);
      }
    };

    useEffect(() => {
      fetchDailyStats();
      fetchStockCounts();
    }, []);
    
    useEffect(() => {
      const interval = setInterval(() => {
        fetchDailyStats();
        fetchStockCounts();
      }, 30000); // Poll every 30 seconds

      return () => clearInterval(interval);
    }, []);

    return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.container}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginVertical: 10, color: '#411C0E' }}>WELCOME, {(auth.user?.name ?? 'User').toUpperCase()}!</Text>
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
                pressed && styles.makeButtonPressed, , {marginBottom: -2,}
            ]}
            onPress={() => router.push('/AddProductsPage')}
        >
            <Text style={styles.makeText}>ADD PRODUCT</Text>
        </Pressable>


        <View style={styles.date}>
            <Text style={styles.dateText}>{formattedDate}</Text>
            <ActivityIndicator size="small" color="#411C0E" animating={refreshing} />
        </View>
 

        <View style={[styles.boxesContainer, { position: 'relative' }]}>
            
            <TouchableOpacity 
              style={{ position: 'absolute', top: -10, right: 0, zIndex: 1, padding: 5 }} 
              onPress={fetchDailyStats}
              disabled={refreshing}
            >
                
            
            </TouchableOpacity>
            <View style={styles.box}>
                <Text style={styles.boxHeadText}>{customerCount ?? 0}</Text>
                <Text style={styles.boxText}>Transaction/s Today</Text>
            </View>
            <View style={styles.box}>
                <Text style={styles.boxHeadText}>₱{revenue?.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}</Text>
                <Text style={styles.boxText}>Revenue Today</Text>
            </View>
        </View>

            <View style={[styles.stockBox, { backgroundColor: '#fefba1' }]}>
                <Text style={styles.boxHeadText}>{lowStockCount}</Text>
                <Text style={styles.boxText}>Low Stock Item/s</Text>
            </View>

            <View style={[styles.stockBox, { backgroundColor: '#FFB4B4' }]}>
                <Text style={styles.boxHeadText}>{outOfStockCount}</Text>
                <Text style={styles.boxText}>Out of Stock Item/s</Text>
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
        flexDirection: 'row',
    },
    dateText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#411C0E',
        marginRight: 50
    },
    boxesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5,
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
    stockBox: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        height: 100,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#411C0E',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
        marginVertical: 3,
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
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api from "./services/api";
import Svg, { Path } from 'react-native-svg';

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [date] = useState(new Date());
  const isFetchingRef = useRef(false);

  const fetchTransactions = async (page = 1, term = "", retry = true) => {
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);

    try {
      const response = await api.get("/api/fetchtransactions", {
        params: { page, search: term },
      });

      const newData = response.data.transactions;

      const mergeUniqueByProductNumber = (prev: any[], incoming: any[]) => {
      const map = new Map();

      [...prev, ...incoming].forEach((item) => {
        if (!map.has(item.product_number)) {
          map.set(item.product_number, item);
        }
      });

      return Array.from(map.values());
    };

    if (page === 1) {
      setTransactions(mergeUniqueByProductNumber([], newData));
    } else {
      setTransactions((prev) =>
        mergeUniqueByProductNumber(prev, newData)
      );
    }

      setCurrentPage(response.data.current_page);
      setLastPage(response.data.last_page);
    } catch (error: any) {
      if (!error.response && retry) {
        return fetchTransactions(page, term, false);
      }
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchTransactions(1, searchTerm);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const loadMore = () => {
    if (loading) return;
    if (currentPage >= lastPage) return;
    fetchTransactions(currentPage + 1, searchTerm);
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };
  const goToReceiptPage = (productNumber: number) => {
  router.push({
    pathname: "/RecordReceiptPage",
    params: {
      product_number: productNumber,
    },
    });
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity style={styles.row} onPress={() => goToReceiptPage(item.product_number)}>
        <View style={styles.cell}>
          <Text>{String(item.product_number).padStart(5, "0")}</Text>
        </View>
        <View style={styles.cell}>
          <Text>{formatTime(item.created_at)}</Text>
        </View>
        <View style={styles.cell}>
          <Text>₱{item.total_amount}</Text>
        </View>
        <View style={styles.cell}>
          <Text>{item.payment_method || "Cash"}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.navbar}>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search transactions..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={{ flex: 1 }}
          />
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="#411C0E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
        </View>
        <View style={styles.date}>
          <Text>{date.toLocaleDateString()}</Text>
            <Svg width={15} height={15} viewBox="0 -1 15 13" fill="none">
                <Path d="M10 1.08301V3.24967M5 1.08301V3.24967M1.875 5.41634H13.125M3.125 2.16634H11.875C12.5654 2.16634 13.125 2.65137 13.125 3.24967V10.833C13.125 11.4313 12.5654 11.9163 11.875 11.9163H3.125C2.43464 11.9163 1.875 11.4313 1.875 10.833V3.24967C1.875 2.65137 2.43464 2.16634 3.125 2.16634Z" 
                    stroke="#1E1E1E" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
        </View>
      </View>

      <ScrollView horizontal>
        <View>
          <View style={styles.header}>
            <View style={styles.headerCell}>
              <Text>Transaction No.</Text>
            </View>
            <View style={styles.headerCell}>
              <Text>Time</Text>
            </View>
            <View style={styles.headerCell}>
              <Text>Total Amount</Text>
            </View>
            <View style={styles.headerCell}>
              <Text>Payment Method</Text>
            </View>
          </View>

          <FlatList
            contentContainerStyle={{ paddingBottom: 100 }}
            data={transactions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={loading ? <ActivityIndicator size="small" /> : null}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const CELL_WIDTH = 140;

const styles = StyleSheet.create({
  navbar: { paddingHorizontal: 10, paddingTop: 10, backgroundColor: "#fff", zIndex: 1 },
  searchContainer: { 
    margin: 7,
    borderRadius: 40,
    width: '80%',
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 10,
    borderWidth: 1,
    alignSelf: 'center',
    borderColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center'
   },
  date: { 
    marginTop: 15,
    marginBottom: 5,
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 10,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    gap: 10,
   },
  header: { 
    flexDirection: "row", 
    backgroundColor: "#eee", 
    borderBottomWidth: 1, 
    borderColor: "#2b2828" 
  },
  headerCell: { 
    width: CELL_WIDTH, 
    padding: 10, 
    borderRightWidth: 1,
    borderColor: "#2b2828", 
    backgroundColor: "#FFEDD9" 
  },
  row: { 
    flexDirection: "row", 
    alignItems: "stretch", 
    borderBottomWidth: 1, 
    borderColor: "#2b2828", 
    minHeight: 60 
  },
  cell: { 
    width: CELL_WIDTH, 
    justifyContent: "center", 
    alignItems: "center", 
    borderRightWidth: 1, 
    borderColor: "#2b2828", 
    flexDirection: "row", 
    height: "100%" 
  },
});
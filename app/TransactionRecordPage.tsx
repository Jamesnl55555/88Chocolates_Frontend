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
import Svg, { Path } from 'react-native-svg';
import api from "./services/api";

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

      const mergeUniqueByTransactionNumber = (prev: any[], incoming: any[]) => {
      const map = new Map();

      [...prev, ...incoming].forEach((item) => {
        if (!map.has(item.transaction_number)) {
          map.set(item.transaction_number, item);
        }
      });

      return Array.from(map.values());
    };

    if (page === 1) {
      setTransactions(mergeUniqueByTransactionNumber([], newData));
    } else {
      setTransactions((prev) =>
        mergeUniqueByTransactionNumber(prev, newData)
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
  const goToReceiptPage = (transactionNumber: number) => {
  router.push({
    pathname: "/RecordReceiptPage",
    params: {
      transaction_number: transactionNumber,
    },
    });
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity style={styles.row} onPress={() => goToReceiptPage(item.transaction_number)}>
        <View style={styles.cell}>
          <Text>{String(item.transaction_number).padStart(5, "0")}</Text>
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
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.navbar}>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search transactions..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={{ flex: 1, marginLeft: 5 }}
          />
            <Svg width="25" height="25" viewBox="0 0 25 25" fill="none">
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

      <ScrollView horizontal style={{ width: '90%', alignSelf: 'center', backgroundColor: '#fff' }}>
      <View>
          <View style={styles.header}>
            <View style={styles.headerCell}>
              <Text style={styles.headerText}>Transaction No.</Text>
            </View>
            <View style={styles.headerCell}>
              <Text style={styles.headerText}>Time</Text>
            </View>
            <View style={styles.headerCell}>
              <Text style={styles.headerText}>Total Amount</Text>
            </View>
            <View style={styles.headerCell}>
              <Text style={styles.headerText}>Payment Method</Text>
            </View>
          </View>

          <FlatList
            contentContainerStyle={{ paddingBottom: 100 }}
            data={transactions}
            keyExtractor={(item) => item.transaction_number.toString()}
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
  navbar: { 
    paddingHorizontal: 10, 
    paddingTop: 10, 
    backgroundColor: "#fff", 
    zIndex: 1 
  },
  searchContainer: { 
    marginVertical: 15,
    borderRadius: 40,
    width: '95%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    alignSelf: 'center',
    borderColor: '#411C0E',
    flexDirection: 'row',
    alignItems: 'center',
   },
  date: { 
    marginTop: 15,
    marginBottom: 10,
    marginRight: 10,
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 10,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#F4F4F4',
   },
  header: { 
    flexDirection: "row", 
    backgroundColor: "#eee", 
    borderBottomWidth: 1, 
    borderColor: "#2b2828",
  },
  headerCell: { 
    width: CELL_WIDTH, 
    padding: 10, 
    borderWidth: 1,
    borderRightWidth: 1, 
    borderLeftWidth: 1, 
    borderColor: "#411C0E", 
    backgroundColor: "#FFEDD9",
    alignItems: "center", 
    justifyContent: "center",
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    color: '#411C0E'
  },
  row: { 
    flexDirection: "row", 
    alignItems: "center", 
    borderBottomWidth: 1, 
    borderColor: "#411C0E", 
    minHeight: 60,
    justifyContent: "center",
  },
  cell: { 
    width: CELL_WIDTH, 
    justifyContent: "center", 
    alignItems: "center", 
    borderRightWidth: 1, 
    borderLeftWidth: 1, 
    borderColor: "#411C0E", 
    flexDirection: "row", 
    height: "100%",
    
  },
});
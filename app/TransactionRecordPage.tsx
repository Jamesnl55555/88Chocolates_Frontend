import { IconCalendar, IconSearch } from "@tabler/icons-react-native";
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
          <IconSearch size={18} color="gray" />
        </View>
        <View style={styles.date}>
          <Text>{date.toLocaleDateString()}</Text>
          <IconCalendar size={18} />
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
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    padding: 10,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    gap: 10
   },
  header: { flexDirection: "row", backgroundColor: "#eee", borderBottomWidth: 1, borderColor: "#2b2828" },
  headerCell: { width: CELL_WIDTH, padding: 10, borderRightWidth: 1, borderColor: "#2b2828", backgroundColor: "#FFEDD9" },
  row: { flexDirection: "row", alignItems: "stretch", borderBottomWidth: 1, borderColor: "#2b2828", minHeight: 60 },
  cell: { width: CELL_WIDTH, justifyContent: "center", alignItems: "center", borderRightWidth: 1, borderColor: "#2b2828", flexDirection: "row", height: "100%" },
});
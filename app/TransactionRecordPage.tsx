import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View
} from "react-native";
import api from "./services/api";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async (page = 1) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await api.get("/api/fetchtransactions", {
        params: { page },
      });

      const newData = response.data.transactions;

      if (page === 1) {
        setTransactions(newData);
      } else {
        setTransactions((prev) => [...prev, ...newData]);
      }

      setCurrentPage(response.data.current_page);
      setLastPage(response.data.last_page);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const loadMore = () => {
    if (currentPage < lastPage && !loading) {
      fetchTransactions(currentPage + 1);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Transaction #{item.id}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Product:</Text>
          <Text style={styles.value} numberOfLines={1}>
            {item.name}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Category:</Text>
          <Text style={styles.value}>{item.category}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Quantity:</Text>
          <Text style={styles.value}>{item.quantity}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Price:</Text>
          <Text style={styles.value}>₱{item.price}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator size="small" /> : null
        }
        contentContainerStyle={{ padding: 10 }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    fontWeight: "bold",
    width: 100,
  },
  value: {
    flex: 1,
  },
});


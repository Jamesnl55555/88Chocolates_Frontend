import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import api from "./services/api";

export default function TransactionsPage() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState("");
  const [markedDates, setMarkedDates] = useState<any>({});

  const isFetchingRef = useRef(false);

  const fetchTransactions = async (
    page = 1,
    date = selectedDate,
    retry = true
  ) => {
    if (isFetchingRef.current && page !== 1) return;

    isFetchingRef.current = true;
    setLoading(true);

    try {
      const res = await api.get("/api/fetchtransactions", {
        params: {
          page,
          date,
        },
      });

      const newData = res.data.transactions;

      setCurrentPage(res.data.current_page);
      setLastPage(res.data.last_page);

      if (page === 1) {
        setTransactions(newData);
      } else {
        setTransactions((prev) => [...prev, ...newData]);
      }
    } catch (err: any) {
      if (!err.response && retry) {
        return fetchTransactions(page, date, false);
      }
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  };

  const fetchMarkedDates = async () => {
    try {
      const res = await api.get("/api/transaction-dates");

      const marks: any = {};

      res.data.forEach((date: string) => {
        marks[date] = {
          marked: true,
          dotColor: "#411C0E",
        };
      });

      setMarkedDates(marks);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    fetchTransactions(1, today);
    fetchMarkedDates();
  }, []);

  const loadMore = () => {
    if (loading) return;
    if (currentPage >= lastPage) return;

    fetchTransactions(currentPage + 1, selectedDate);
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const goToReceiptPage = (transactionNumber: number) => {
    router.push({
      pathname: "/RecordReceiptPage",
      params: { transaction_number: transactionNumber },
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => goToReceiptPage(item.transaction_number)}
    >
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

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.calendarContainer}>
        <Calendar
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              selected: true,
              selectedColor: "#411C0E",
            },
          }}
          onDayPress={(day) => {
            setSelectedDate(day.dateString);
            setCurrentPage(1);
            fetchTransactions(1, day.dateString);
          }}
        />
      </View>

      <View style={{ flex: 1 }}>
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
          data={transactions}
          keyExtractor={(item) =>
            item.transaction_number.toString()
          }
          renderItem={renderItem}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? <ActivityIndicator size="small" /> : null
          }
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      </View>
    </View>
  );
}

const CELL_WIDTH = 140;

const styles = StyleSheet.create({
  calendarContainer: {
    padding: 10,
    backgroundColor: "#fff",
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
    borderColor: "#411C0E",
    backgroundColor: "#FFEDD9",
    alignItems: "center",
    justifyContent: "center",
  },

  headerText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#411C0E",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#411C0E",
    minHeight: 60,
  },

  cell: {
    width: CELL_WIDTH,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderColor: "#411C0E",
  },
});
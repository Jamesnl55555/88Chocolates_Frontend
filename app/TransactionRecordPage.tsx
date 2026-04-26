import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Calendar } from "react-native-calendars";
import Svg, { Path } from 'react-native-svg';
import api from "./services/api";

export default function TransactionsPage() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState("");
  const [date, setDate] = useState(new Date());
  const [markedDates, setMarkedDates] = useState<any>({});
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const isFetchingRef = useRef(false);

  // Fetch transactions for a given page and date, with retry logic on network failure
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

//  Fetch dates with transactions to mark on calendar
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

  // On component mount, set today's date and fetch transactions + marked dates
  useEffect(() => {
    const today = new Date().toLocaleDateString("en-CA");
    setSelectedDate(today);
    fetchTransactions(1, today);
    fetchMarkedDates();
  }, []);

  // Sync date display with selectedDate
  useEffect(() => {
    if (selectedDate) {
      setDate(new Date(selectedDate));
    }
  }, [selectedDate]);

// Load more transactions when reaching end of list
  const loadMore = () => {
    if (loading) return;
    if (currentPage >= lastPage) return;

    fetchTransactions(currentPage + 1, selectedDate);
  };

  // Format time to show only hours and minutes
  const formatTime = (dateString: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Navigate to receipt page with transaction number as param
  const goToReceiptPage = (transactionNumber: number) => {
    router.push({
      pathname: "/RecordReceiptPage",
      params: { transaction_number: transactionNumber },
    });
  };


  // Render each transaction row, making it clickable to go to receipt page
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => goToReceiptPage(item.transaction_number)}
    >
      <View style={styles.cell}>
        <Text style={{fontWeight: 'bold'}}>{String(item.transaction_number).padStart(6, "0")}</Text>
      </View>
      <View style={styles.cell}>
        <Text>{formatTime(item.created_at)}</Text>
      </View>
      <View style={styles.cell}>
        <Text>₱{item.total_amount}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
  <View style={{ flex: 1, backgroundColor: "#fff", paddingBottom: 30 }}>
    {/* Clickable Date Picker */}
    <TouchableOpacity onPress={() => setShowCalendarModal(true)} >
      <View style={styles.date}>
        <Text>{date.toLocaleDateString()}</Text>
            <Svg width={15} height={15} viewBox="0 -1 15 13" fill="none">
                <Path d="M10 1.08301V3.24967M5 1.08301V3.24967M1.875 5.41634H13.125M3.125 2.16634H11.875C12.5654 2.16634 13.125 2.65137 13.125 3.24967V10.833C13.125 11.4313 12.5654 11.9163 11.875 11.9163H3.125C2.43464 11.9163 1.875 11.4313 1.875 10.833V3.24967C1.875 2.65137 2.43464 2.16634 3.125 2.16634Z" 
                    stroke="#1E1E1E" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>

            <Svg width={15} height={18} viewBox="5 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-down">
              <Path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <Path d="M6 9l6 6l6 -6" />
            </Svg>
      </View>
    </TouchableOpacity>

    {/* Calendar Modal */}
    <Modal
      visible={showCalendarModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowCalendarModal(false)}
    >
      <Pressable 
        style={styles.modalOverlay} 
        onPress={() => setShowCalendarModal(false)}
      >
        <Pressable style={styles.modalContent}>
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
                setShowCalendarModal(false);
              }}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>

    {/* Horizontal scroll for table */}
    <ScrollView horizontal style={{ width: '90%', alignSelf: 'center', backgroundColor: '#fff',  }}>
      <View style={{ flex: 1, marginBottom: 80 }}>
        {/* Header row */}
        <View style={styles.header}>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Receipt No.</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Time</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Total Amount</Text>
          </View>
        </View>

        {/* FlatList rows */}
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.transaction_number.toString()}
          renderItem={renderItem}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? <ActivityIndicator size="large" color="#411C0E" style={{ marginTop: 20, }} /> : null
          }
          contentContainerStyle={{ paddingBottom: 5 }}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <Path d="M44 38C44 39.0609 43.5786 40.0783 42.8284 40.8284C42.0783 41.5786 41.0609 42 40 42H8C6.93913 42 5.92172 41.5786 5.17157 40.8284C4.42143 40.0783 4 39.0609 4 38V10C4 8.93913 4.42143 7.92172 5.17157 7.17157C5.92172 6.42143 6.93913 6 8 6H18L22 12H40C41.0609 12 42.0783 12.4214 42.8284 13.1716C43.5786 13.9217 44 14.9391 44 16V38Z" stroke="#411C0E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M30 22L18 34M18 22L30 34" stroke="#411C0E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
                <Text style={{ fontWeight: 'bold', fontSize: 16, textAlign: 'center', color: '#411C0E', marginTop: 15 }}>There&apos;s nothing here yet.</Text>
                    <Text style={styles.emptyText}>Please make a transaction to proceed.</Text>
              </View>
            ) : null
          }
        />
      </View>
    </ScrollView>
  </View>
);
}

const CELL_WIDTH = 117.8;

const styles = StyleSheet.create({
  calendarContainer: {
    width: '100%',
    flex: 1,
    backgroundColor: "#fff",
    alignSelf: 'flex-end',
    borderWidth: 1,
    height: 'auto',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    top: 105,
  },
  modalContent: {
    alignSelf: 'flex-end',
    justifyContent: 'center',
    marginRight: 5,
    height: '39%',
    width: '90%',
    backgroundColor: 'white',
    shadowColor: '#411C0E',
    shadowOffset: { width: 5, height: -5 },
    shadowOpacity: 0.50,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 0.5,
    borderColor: '#411C0E',
  },
    date: { 
      marginTop: 15,
      marginBottom: 10,
      marginRight: 20,
      borderWidth: 1,
      paddingVertical: 2,
      paddingLeft: 10,
      paddingRight: 3,
      alignSelf: 'flex-end',
      flexDirection: 'row',
      gap: 10,
      backgroundColor: '#F4F4F4',
   },

  header: {
    flexDirection: "row", 
    backgroundColor: "#eee", 
    borderBottomWidth: 1, 
    borderColor: "#411C0E",
    
  },

  headerCell: {
    width: CELL_WIDTH, 
    padding: 15, 
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

  emptyContainer: {
    alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
  },
  emptyText: {
    fontSize: 15,
        color: '#411C0E',
        fontWeight: '400',
        marginTop: 5, 
        textAlign: 'center',
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
    paddingVertical: 5,
  },
});

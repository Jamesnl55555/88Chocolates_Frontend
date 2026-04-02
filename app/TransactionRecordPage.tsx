import { IconCalendar, IconEdit, IconSearch, IconTrash } from "@tabler/icons-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api from "./services/api";

import AlertModal from "@/components/AlertModal";
import CheckboxComponent from "@/components/CheckboxComponent";
import ConfirmAlertModal from "@/components/ConfirmAlertModal";
import EditTransactionModal from "@/components/EditTransactionModal";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [date] = useState(new Date());

  const [alertVisible, setAlertVisible] = useState(false);
  const [confirmAlertVisible, setConfirmAlertVisible] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<any>(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertHeader, setAlertHeader] = useState("");

  const [selectedTransactions, setSelectedTransactions] = useState<any[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<any>(null);

  // Fetch transactions
  const fetchTransactions = async (page = 1, term = "") => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await api.get("/api/fetchtransactions", {
        params: { page, search: term },
      });
      const newData = response.data.transactions;
      if (page === 1) setTransactions(newData);
      else setTransactions((prev) => [...prev, ...newData]);

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

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchTransactions(1, searchTerm);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const loadMore = () => {
    if (currentPage < lastPage && !loading) fetchTransactions(currentPage + 1, searchTerm);
  };

  const toggleSelect = (transaction: any) => {
    setSelectedTransactions((prev) => {
      const exists = prev.find((t) => t.id === transaction.id);
      if (exists) return prev.filter((t) => t.id !== transaction.id);
      return [...prev, { id: transaction.id }];
    });
  };

  const toggleSelectAll = () => {
    if (selectedTransactions.length === transactions.length) setSelectedTransactions([]);
    else setSelectedTransactions(transactions.map((t) => ({ id: t.id })));
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/delete-transaction/${id}`);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setAlertHeader("Deleted!");
      setAlertMessage("Transaction removed successfully");
      setConfirmAlertVisible(true);
    } catch (error) {
      console.error(error);
      setAlertHeader("Error!");
      setAlertMessage("Failed to delete transaction.");
      setConfirmAlertVisible(true);
    }
  };

  const openEditModal = (transaction: any) => {
    setCurrentTransaction(transaction);
    setModalVisible(true);
  };

  // CENTRALIZED EDIT SUBMIT HANDLER
  const handleEditSubmit = async (editTransaction: any) => {
    try {
      await api.put(`/api/update-transaction/${editTransaction.id}`, {
        total_amount: Number(editTransaction.total_amount),
        payment_method: editTransaction.payment_method,
      });

      // Update local state
      setTransactions((prev) =>
        prev.map((t) => (t.id === editTransaction.id ? { ...t, ...editTransaction } : t))
      );

      setAlertHeader("Success!");
      setAlertMessage("Transaction updated successfully.");
      setConfirmAlertVisible(true);
      setModalVisible(false);
    } catch (err: unknown) {
      console.error("Error updating transaction:", err);

      let message = "Failed to update transaction.";
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as any;
        message = axiosErr.response?.data?.message || message;
      }

      setAlertHeader("Error!");
      setAlertMessage(message);
      setConfirmAlertVisible(true);
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = selectedTransactions.some((t) => t.id === item.id);
    return (
      <View style={styles.row}>
        <View style={styles.cell}>
            <CheckboxComponent isChecked={isSelected} onPress={() => toggleSelect(item)} />
          <Image style={styles.image} source={{ uri: item.file_path }} />
        </View>
        <View style={styles.cell}>
          <Text>{item.id}</Text>
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
        <View style={styles.cell}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity onPress={() => openEditModal(item)}>
              <IconEdit size={18} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setTransactionToDelete(item.id);
                setAlertVisible(true);
              }}
            >
              <IconTrash size={18} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Navbar */}
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

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <CheckboxComponent
          isChecked={selectedTransactions.length === transactions.length && transactions.length > 0}
          onPress={toggleSelectAll}
        />
        <Text style={{ marginLeft: 5 }}>Select All</Text>
        {selectedTransactions.length > 0 && (
          <TouchableOpacity
            style={{ marginLeft: "auto", marginRight: 10 }}
            onPress={() => selectedTransactions.forEach((t) => handleDelete(t.id))}
          >
            <IconTrash size={20} color="red" />
          </TouchableOpacity>
        )}
      </View>

      {/* Table */}
      <ScrollView horizontal>
        <View>
          <View style={styles.header}>
            <View style={styles.headerCell}>
              <Text>Select / Image</Text>
            </View>
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
            <View style={styles.headerCell}>
              <Text>Actions</Text>
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

      {/* Edit Modal */}
      {modalVisible && currentTransaction && (
        <View style={styles.overlay}>
          <EditTransactionModal
            visible={modalVisible}
            transaction={currentTransaction}
            onClose={() => setModalVisible(false)}
            onSubmit={handleEditSubmit}
          />
        </View>
      )}

      {/* Confirm Delete */}
      {alertVisible && (
        <View style={styles.overlay}>
          <ConfirmAlertModal
            onConfirm={() => {
              setAlertVisible(false);
              handleDelete(transactionToDelete);
            }}
            onCancel={() => setAlertVisible(false)}
          />
        </View>
      )}

      {/* Alert */}
      {confirmAlertVisible && (
        <View style={styles.overlay}>
          <AlertModal
            message={alertMessage}
            headertext={alertHeader}
            onConfirm={() => setConfirmAlertVisible(false)}
          />
        </View>
      )}
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
  toolbar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderBottomWidth: 1, borderColor: "#ccc", backgroundColor: "#f9f9f9", marginBottom: '10%' },
  header: { flexDirection: "row", backgroundColor: "#eee", borderBottomWidth: 1, borderColor: "#2b2828" },
  headerCell: { width: CELL_WIDTH, padding: 10, borderRightWidth: 1, borderColor: "#2b2828" },
  row: { flexDirection: "row", alignItems: "stretch", borderBottomWidth: 1, borderColor: "#2b2828", minHeight: 60 },
  cell: { width: CELL_WIDTH, justifyContent: "center", alignItems: "center", borderRightWidth: 1, borderColor: "#2b2828", flexDirection: "row", height: "100%" },
  image: { width: 80, height: 80, borderRadius: 5, marginLeft: 5 },
  overlay: { position: "absolute", width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
});
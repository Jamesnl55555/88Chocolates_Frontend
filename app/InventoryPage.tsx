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
import EditProductModal from "@/components/EditProductModal";

export default function InventoryPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(new Date());
    const [modalVisible, setModalVisible] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<any>(null);

    const [alertVisible, setAlertVisible] = useState(false);
    const [confirmAlertVisible, setConfirmAlertVisible] = useState(false);
    const [productToDelete, setProductToDelete] = useState<any>(null);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertHeader, setAlertHeader] = useState("");

    // --- Functions from MakeTransactionPage ---

    // Fetch products with pagination and search
    const fetchProducts = async (page = 1, term = "") => {
    if (loading) return;
    setLoading(true);
    try {
    const response = await api.get("/api/fetchproducts", {
    params: { search: term, page },
    });
    const newProducts = response.data.products;

    if (page === 1) setProducts(newProducts);
    else setProducts((prev) => [...prev, ...newProducts]);

    setCurrentPage(response.data.current_page);
    setLastPage(response.data.last_page);
    } catch (error) {
    console.error("Error fetching products:", error);
    } finally {
    setLoading(false);
    }
    };

    useEffect(() => {
    const timeout = setTimeout(() => fetchProducts(1, searchTerm), 300);
    return () => clearTimeout(timeout);
    }, [searchTerm]);

    const loadMore = () => {
    if (currentPage < lastPage && !loading) fetchProducts(currentPage + 1, searchTerm);
    };

    // Toggle select a product
    const toggleSelect = (product: any) => {
    setSelectedProducts((prev) => {
    const exists = prev.find((p) => p.id === product.id);
    if (exists) return prev.filter((p) => p.id !== product.id);
    return [...prev, { id: product.id }];
    });
    };

    const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) setSelectedProducts([]);
    else setSelectedProducts(products.map((p) => ({ id: p.id })));
    };

    // Delete product
    const handleDelete = async (id: number) => {
    try {
    await api.post(`/api/delete-item/${id}`);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setAlertHeader("Deleted!");
    setAlertMessage("Product removed successfully");
    setConfirmAlertVisible(true);
    } catch (error) {
    console.error("Error deleting product:", error);
    setAlertHeader("Error!");
    setAlertMessage("Failed to delete product.");
    setConfirmAlertVisible(true);
    }
    };

    const formatTime = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    };

    // Open Edit Modal
    const openEditModal = (product: any) => {
    setCurrentProduct(product);
    setModalVisible(true);
    };

    // Render each product row
    const renderItem = ({ item }: { item: any }) => {
    const isSelected = selectedProducts.some((p) => p.id === item.id);
    return (
    <View style={styles.row}>
        <View style={styles.cell}>
        <CheckboxComponent isChecked={isSelected} onPress={() => toggleSelect(item)} />
        <Image style={styles.image} source={{ uri: item.file_path }} />
        </View>
        <View style={styles.cell}><Text>{item.name}</Text></View>
        <View style={styles.cell}><Text>{item.category}</Text></View>
        <View style={styles.cell}><Text>₱{item.price}</Text></View>
        <View style={styles.cell}><Text>{item.quantity <= 0 ? "Out of stock" : item.quantity}</Text></View>
        <View style={styles.cell}>
        <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity onPress={() => openEditModal(item)}>
            <IconEdit size={18} />
            </TouchableOpacity>
            <TouchableOpacity
            onPress={() => {
                setProductToDelete(item.id);
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
    {/* Search */}
    <View style={styles.navbar}>
        <View style={styles.searchContainer}>
        <TextInput
            placeholder="Search products..."
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
        isChecked={selectedProducts.length === products.length && products.length > 0}
        onPress={toggleSelectAll}
        />
        <Text style={{ marginLeft: 5 }}>Select All</Text>
        {selectedProducts.length > 0 && (
        <TouchableOpacity
            style={{ marginLeft: "auto", marginRight: 10 }}
            onPress={() => selectedProducts.forEach((p) => handleDelete(p.id))}
        >
            <IconTrash size={20} color="red" />
        </TouchableOpacity>
        )}
    </View>

    {/* Table */}
    <ScrollView horizontal>
        <View>
        <View style={styles.header}>
            <View style={styles.headerCell}><Text>Images</Text></View>
            <View style={styles.headerCell}><Text>Product Name</Text></View>
            <View style={styles.headerCell}><Text>Category</Text></View>
            <View style={styles.headerCell}><Text>Price</Text></View>
            <View style={styles.headerCell}><Text>Stock</Text></View>
            <View style={styles.headerCell}><Text>Actions</Text></View>
        </View>

        <FlatList
            contentContainerStyle={{ paddingBottom: 100 }}
            data={products}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={loading ? <ActivityIndicator size="small" /> : null}
        />
        </View>
    </ScrollView>

    {/* Edit Modal */}
    {modalVisible && currentProduct && (
        <View style={styles.overlay}>
        <EditProductModal
            visible={modalVisible}
            product={currentProduct}
            onClose={() => setModalVisible(false)}
            onUpdate={() => fetchProducts()}
        />
        </View>
    )}

    {/* Confirm Delete */}
    {alertVisible && (
        <View style={styles.overlay}>
        <ConfirmAlertModal
            onConfirm={() => { setAlertVisible(false); handleDelete(productToDelete); }}
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
  headerCell: { width: CELL_WIDTH, padding: 20, borderRightWidth: 1, borderColor: "#2b2828" },
  row: { flexDirection: "row", alignItems: "stretch", borderBottomWidth: 1, borderColor: "#2b2828", minHeight: 60 },
  cell: { width: CELL_WIDTH, justifyContent: "center", alignItems: "center", borderRightWidth: 1, borderColor: "#2b2828", flexDirection: "row", height: "100%" },
  image: { width: 80, height: 80, borderRadius: 5, marginLeft: 5 },
  overlay: { position: "absolute", width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
});
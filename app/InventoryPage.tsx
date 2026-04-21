import AlertModal from "@/components/AlertModal";
import CheckboxComponent from "@/components/CheckboxComponent";
import ConfirmAlertModal from "@/components/ConfirmAlertModal";
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import api from "./services/api";

export default function InventoryPage() {
    const router = useRouter();
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

    useFocusEffect(
    useCallback(() => {
    fetchProducts(1, searchTerm);
    }, [searchTerm])
    );

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

    const handleBulkDelete = async () => {
    try {
    await Promise.all(selectedProducts.map(p => api.post(`/api/delete-item/${p.id}`)));
    setProducts((prev) => prev.filter((p) => !selectedProducts.some((sp) => sp.id === p.id)));
    setSelectedProducts([]);
    setAlertHeader("Deleted!");
    setAlertMessage("Selected products removed successfully");
    setConfirmAlertVisible(true);
    } catch (error) {
    console.error("Error deleting products:", error);
    setAlertHeader("Error!");
    setAlertMessage("Failed to delete some products.");
    setConfirmAlertVisible(true);
    }
    };

    const formatTime = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    };

    // Open Edit Modal
    const openEditProductPage = (product: any) => {
    setCurrentProduct(product);
    router.push({
        pathname: "/EditProductPage",
        params: {
        product: JSON.stringify(product),
        },
    });
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
            <TouchableOpacity onPress={() => openEditProductPage(item)}>
                <Svg width={25} height={25} viewBox="0 -2 24 24" fill="none">
                    <G clipPath="url(#clip0_884_4043)">
                        <Path d="M9.1665 3.3332H3.33317C2.89114 3.3332 2.46722 3.50879 2.15466 3.82135C1.8421 4.13391 1.6665 4.55784 1.6665 4.99986V16.6665C1.6665 17.1086 1.8421 17.5325 2.15466 17.845C2.46722 18.1576 2.89114 18.3332 3.33317 18.3332H14.9998C15.4419 18.3332 15.8658 18.1576 16.1783 17.845C16.4909 17.5325 16.6665 17.1086 16.6665 16.6665V10.8332M15.4165 2.0832C15.748 1.75168 16.1977 1.56543 16.6665 1.56543C17.1353 1.56543 17.585 1.75168 17.9165 2.0832C18.248 2.41472 18.4343 2.86436 18.4343 3.3332C18.4343 3.80204 18.248 4.25168 17.9165 4.5832L9.99984 12.4999L6.6665 13.3332L7.49984 9.99986L15.4165 2.0832Z" 
                        stroke="#411C0E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </G>
                    <Defs>
                        <ClipPath id="clip0_884_4043">
                            <Rect width="20" height="20" fill="white"/>
                        </ClipPath>
                    </Defs>
                </Svg>
            </TouchableOpacity>
            <TouchableOpacity
            onPress={() => {
                setProductToDelete(item.id);
                setAlertVisible(true);
            }}
            >
            <Svg width={25} height={25} viewBox="-3 0 24 24" fill="none">
                <Path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z" 
                    fill="#B00B0B" fillOpacity="0.8"/>
            </Svg>
            </TouchableOpacity>
        </View>
        </View>
    </View>
    );
    };

    return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
    {/* Search */}
    <View style={styles.navbar}>
        <View style={styles.searchContainer}>
        <TextInput
            placeholder="Search products..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={{ flex: 1, marginLeft: 5 }}
        />
            <Svg width="25" height="25" viewBox="0 0 25 25" fill="none">
                <Path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="#411C0E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
        </View>
        
        {/* Date */}
        <View style={styles.date}>
        <Text>{date.toLocaleDateString()}</Text>
            <Svg width={15} height={15} viewBox="0 -1 15 13" fill="none">
                <Path d="M10 1.08301V3.24967M5 1.08301V3.24967M1.875 5.41634H13.125M3.125 2.16634H11.875C12.5654 2.16634 13.125 2.65137 13.125 3.24967V10.833C13.125 11.4313 12.5654 11.9163 11.875 11.9163H3.125C2.43464 11.9163 1.875 11.4313 1.875 10.833V3.24967C1.875 2.65137 2.43464 2.16634 3.125 2.16634Z" 
                    stroke="#1E1E1E" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
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
            onPress={() => { setProductToDelete(null); setAlertVisible(true); }}
        >
            <Svg width={25} height={25} viewBox="-3 0 24 24" fill="none">
                <Path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z" 
                    fill="#B00B0B" fillOpacity="0.8"/>
            </Svg>
        </TouchableOpacity>
        )}
    </View>

    {/* Table */}
    <ScrollView horizontal style={{ width: '90%', alignSelf: 'center', backgroundColor: '#fff'}}>
        <View>
        <View style={styles.header}>
            <View style={styles.headerCell}>
                <Text style={styles.headerText}>Images</Text>
            </View>
            <View style={styles.headerCell}>
                <Text style={styles.headerText}>Product Name</Text>
            </View>
            <View style={styles.headerCell}>
                <Text style={styles.headerText}>Category</Text>
            </View>
            <View style={styles.headerCell}>
                <Text style={styles.headerText}>Price</Text>
            </View>
            <View style={styles.headerCell}>
                <Text style={styles.headerText}>Stock</Text>
            </View>
            <View style={styles.headerCell}>
                <Text style={styles.headerText}>Actions</Text>
            </View>
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
    {/* Confirm Delete */}
    {alertVisible && (
        <View style={styles.overlay}>
        <ConfirmAlertModal
            onConfirm={() => { setAlertVisible(false); if (productToDelete) { handleDelete(productToDelete); } else { handleBulkDelete(); } }}
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
  toolbar: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderWidth: 1, 
    borderColor: "#411C0E", 
    backgroundColor: "#f9f9f9", 
    marginHorizontal: 20,
    marginBottom: 10,
},
  header: { 
    flexDirection: "row", 
    backgroundColor: "#eee", 
    borderBottomWidth: 1, 
    borderColor: "#411C0E" 
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
  image: { 
    width: 70, 
    height: 70, 
    borderRadius: 5, 
    marginLeft: 5 
},
  overlay: { 
    position: 'absolute', 
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center', 
    justifyContent: 'center', 
    zIndex: 999,
},
});
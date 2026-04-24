import AlertModal from "@/components/AlertModal";
import CheckboxComponent from "@/components/CheckboxComponent";
import ConfirmAlertModal from "@/components/ConfirmAlertModal";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    // const [date, setDate] = useState(new Date());
    const [modalVisible, setModalVisible] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<any>(null);

    const [alertVisible, setAlertVisible] = useState(false);
    const [confirmAlertVisible, setConfirmAlertVisible] = useState(false);
    const [productToDelete, setProductToDelete] = useState<any>(null);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertHeader, setAlertHeader] = useState("");
    const [confirmMessage, setConfirmMessage] = useState("");
    const [productName, setProductName] = useState(""); 

    const searchTermRef = useRef(searchTerm);
    useEffect(() => {
        searchTermRef.current = searchTerm;
    }, [searchTerm]);

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    useFocusEffect(
    useCallback(() => {
    fetchProducts(1, searchTermRef.current);
    }, [])
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

    // Debounce search input
    useEffect(() => {
    const timeout = setTimeout(() => fetchProducts(1, searchTerm), 300);
    return () => clearTimeout(timeout);
    }, [searchTerm]);

    // Load more products when reaching end of list
    const loadMore = () => {
    if (currentPage < lastPage && !loading) fetchProducts(currentPage + 1, searchTerm);
    };

    // Case-insensitive filtering for displayed products
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        const term = searchTerm.toLowerCase();
        return products.filter((p: any) =>
            p.name?.toLowerCase().includes(term) ||
            p.category?.toLowerCase().includes(term) ||
            String(p.product_number).padStart(6, '0').includes(term)
        );
    }, [products, searchTerm]);

    // Toggle select a product
    const toggleSelect = (product: any) => {
    setSelectedProducts((prev) => {
    const exists = prev.find((p) => p.id === product.id);
    if (exists) return prev.filter((p) => p.id !== product.id);
    return [...prev, { id: product.id }];
    });
    };

    // Toggle select all products
    const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) setSelectedProducts([]);
    else setSelectedProducts(products.map((p) => ({ id: p.id })));
    };

    // Delete product
    const handleDelete = async (id: number) => {
    try {
        await api.post(`/api/delete-item/${id}`);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setAlertHeader("Success");
        setAlertMessage("Product removed successfully!");
        setAlertVisible(true);
        } 
        catch (error) {
            console.error("Error deleting product:", error);
            setAlertHeader("Error");
            setAlertMessage("Failed to delete product!");
            setAlertVisible(true);
        }
    };

    // Bulk delete products
    const handleBulkDelete = async () => {
    try {
        await Promise.all(selectedProducts.map(p => api.post(`/api/delete-item/${p.id}`)));
        setProducts((prev) => prev.filter((p) => !selectedProducts.some((sp) => sp.id === p.id)));
        setSelectedProducts([]);
        setAlertHeader("Success");
        setAlertMessage("Selected products removed successfully!");
        setAlertVisible(true);
        } 
        catch (error) {
            console.error("Error deleting products:", error);
            setAlertHeader("Error");
            setAlertMessage("Failed to delete some products!");
            setAlertVisible(true);
            }
    };

    // Format time for display
    // Confirm delete handlers
    const confirmDelete = () => {
      if (productToDelete && productToDelete.id) {
        handleDelete(productToDelete.id);
      } else {
        handleBulkDelete();
      }
      setConfirmAlertVisible(false);
      setProductToDelete(null);
      setProductName("");
      setConfirmMessage("");
    }; 

    const cancelDelete = () => {
      setConfirmAlertVisible(false);
      setProductToDelete(null);
      setProductName("");
      setConfirmMessage("");
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
    <View style={[styles.row, item.quantity <=10 && item.quantity > 0 ? 
                { backgroundColor: '#fefba1' } 
                : 
                item.quantity <= 0 ? 
                { backgroundColor: '#FFB4B4' } 
                : {}
                ]}>
        <View style={{ justifyContent: "space-around", 
                        width: CELL_WIDTH, 
                        alignItems: "center", 
                        borderRightWidth: 1, 
                        borderLeftWidth: 1, 
                        borderColor: "#411C0E", 
                        flexDirection: "row", 
                        height: "100%",
                        paddingVertical: 5, paddingRight: 40,}}>
            <CheckboxComponent isChecked={isSelected} onPress={() => toggleSelect(item)} />
            <Text style={{fontWeight: 'bold'}}>{String(item.product_number).padStart(6, '0')}</Text>
        </View>
        <View style={styles.cell}>
        
        {item.file_path && item.file_path.trim() !== '' ? (
          <Image style={styles.image} source={{ uri: item.file_path }} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>No Image</Text>
          </View>
        )}
        </View>
        <View style={styles.cell}><Text style={{ flex: 1, textAlign: 'center', flexWrap: 'wrap' }}>{item.name}</Text></View>
        <View style={styles.cell}><Text style={{ flex: 1, textAlign: 'center', flexWrap: 'wrap' }}>{item.category}</Text></View>
        <View style={styles.cell}><Text style={{ flex: 1, textAlign: 'center', flexWrap: 'wrap' }}>₱{item.price}</Text></View>
        <View style={styles.cell}><Text style={{ flex: 1, textAlign: 'center', flexWrap: 'wrap' }}>{item.quantity <= 0 ? "Out of stock" : item.quantity}</Text></View>
        <View style={styles.cell}>
        <View style={{ flexDirection: "row", gap: 15 }}>
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
                    setProductToDelete(item);
                    setProductName(item.name || "this product");
                    setConfirmAlertVisible(true);
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
    <View style={{ flex: 1, backgroundColor: '#fff', paddingBottom: 30 }}>
    {/* Search */}
    <View style={styles.navbar}>
        <View style={styles.searchContainer}>
        <TextInput
            placeholder="Search products..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={{ flex: 1, marginLeft: 5 }}
        />
            <Svg width="25" height="25" viewBox="0 0 25 25" fill="none" style={{ margin: 5 }}>
                <Path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="#411C0E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
        </View>
        
        {/* Date */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'  }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 20 }}>
            </View>

            <View style={styles.date}>
                <Text style={styles.dateText}>{formattedDate}</Text>
            </View>
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
        onPress={() => { 
              setProductToDelete(null); 
              setProductName("");
              setConfirmMessage(`Delete ${selectedProducts.length} selected product(s)? This action cannot be undone.`);
              setConfirmAlertVisible(true); 
            }} 
        >
            <Svg width={25} height={25} viewBox="-3 0 24 24" fill="none">
                <Path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z" 
                    fill="#B00B0B" fillOpacity="0.8"/>
            </Svg>
        </TouchableOpacity>
        )}
    </View>

    {/* Table */}
    <ScrollView horizontal style={{ width: '90%', alignSelf: 'center', backgroundColor: '#fff',  }}>
        <View style={{ paddingBottom: 80 }}>
            <View style={styles.header}>
            <View style={styles.headerCell}>
                <Text style={styles.headerText}>Product No.</Text>
            </View>
            <View style={styles.headerCell}>
                <Text style={styles.headerText}>Image</Text>
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
            contentContainerStyle={{ paddingBottom: 5 }}
            data={filteredProducts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={loading ? <ActivityIndicator size="large" color="#411C0E" style={{ marginTop: 20 }} /> : null}
            ListEmptyComponent={
                !loading ? (
                    <View style={styles.emptyContainer}>
                        <Svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            <Path d="M44 38C44 39.0609 43.5786 40.0783 42.8284 40.8284C42.0783 41.5786 41.0609 42 40 42H8C6.93913 42 5.92172 41.5786 5.17157 40.8284C4.42143 40.0783 4 39.0609 4 38V10C4 8.93913 4.42143 7.92172 5.17157 7.17157C5.92172 6.42143 6.93913 6 8 6H18L22 12H40C41.0609 12 42.0783 12.4214 42.8284 13.1716C43.5786 13.9217 44 14.9391 44 16V38Z" stroke="#411C0E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                            <Path d="M30 22L18 34M18 22L30 34" stroke="#411C0E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                        </Svg>
                        <Text style={{ fontWeight: 'bold', fontSize: 16, textAlign: 'center', color: '#411C0E', marginTop: 15 }}>There&apos;s nothing here yet.</Text>
                            <Text style={styles.emptyText}>Please add a product to proceed with a transaction.</Text>
                    </View>
                ) : null
            }
        />
        </View>
    </ScrollView>
    

    {/* Confirm Delete Modal */}
    {confirmAlertVisible && (
        <View style={styles.overlay}>
        <ConfirmAlertModal 
            headertext="Confirm Delete" 
            message={confirmMessage}
            productName={productName}
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
        />

        </View>
    )}
    {/* Success/Error Alert */}
    {alertVisible && (
        <View style={styles.overlay}>
        <AlertModal
            message={alertMessage}
            headertext={alertHeader}
            onConfirm={() => setAlertVisible(false)}
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
    marginVertical: 10,
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
        marginTop: 5,
        marginRight: 10,
        marginBottom: 3,
    },
    dateText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#411C0E',
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#411C0E',
        padding: 5
    },
  toolbar: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: 10, 
    paddingVertical: 3, 
    borderWidth: 1, 
    borderColor: "#411C0E", 
    backgroundColor: "#f9f9f9", 
    marginHorizontal: 20,
    marginBottom: 5,
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
    paddingHorizontal: 10,
},
  image: { 
    width: 65, 
    height: 65, 
    borderRadius: 5, 
    marginLeft: 5 
  },
  placeholderImage: {
    width: 65,
    height: 65,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 15,
        color: '#411C0E',
        fontWeight: '400',
        marginTop: 5, 
        textAlign: 'center',
        
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
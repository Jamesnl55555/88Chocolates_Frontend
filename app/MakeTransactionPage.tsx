
import AlertModal from '@/components/AlertModal';
import CheckboxComponent from '@/components/CheckboxComponent';
import ConfirmAlertModal from '@/components/ConfirmAlertModal';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import api from './services/api';

export default function MakeTransactionPage() {
    
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [date, setDate] = useState(new Date());
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertHeader, setAlertHeader] = useState('');
    const [confirmAlertVisible, setConfirmAlertVisible] = useState(false);
    const [productToDelete, setProductToDelete] = useState<any>(null);
    const [latestTransactionNumber, setLatestTransactionNumber] = useState<number | null>(null);

    useFocusEffect(
    useCallback(() => {
        fetchProducts(1, searchTerm);
        fetchLatestTransactionNumber();
    }, [searchTerm])
    );

    const openEditProductPage = (product: any) => {
    router.push({
        pathname: "/EditProductPage",
        params: {
        product: JSON.stringify(product),
        },
    });
    };

    const total = selectedProducts.reduce((acc, p) => acc + p.quantity * (p.price || 0), 0);

    const toggleSelect = (product: any) => {
        setSelectedProducts(prev => {
            const exists = prev.find(p => p.id === product.id);
            if (exists) {
                return prev.filter(p => p.id !== product.id);
            } else {
                return [...prev, { id: product.id, quantity: 1, price: product.price }];
            }
        });
    };

    const ensureSelected = (product: any) => {
        setSelectedProducts(prev => {
            const exists = prev.find(p => p.id === product.id);
            if (exists) return prev;

            return [...prev, { id: product.id, quantity: 0, price: product.price }];
        });
    };

    const increaseQuantity = (item: any) => {
        ensureSelected(item);

        setSelectedProducts(prev =>
            prev.map(p => {
                if (p.id !== item.id) return p;

                return {
                    ...p,
                    quantity: clampQuantity(p.quantity + 1, item.quantity)
                };
            })
        );
    };

    const decreaseQuantity = (item: any) => {
        ensureSelected(item);

        setSelectedProducts(prev =>
            prev.map(p => {
                if (p.id !== item.id) return p;

                return {
                    ...p,
                    quantity: Math.max(1, p.quantity - 1)
                };
            })
        );
    };

    const updateQuantity = (item: any, value: string) => {
        const numeric = value.replace(/[^0-9]/g, '');

        ensureSelected(item);

        const parsed = numeric === '' ? 0 : parseInt(numeric);

        setSelectedProducts(prev =>
            prev.map(p => {
                if (p.id !== item.id) return p;

                return {
                    ...p,
                    quantity: clampQuantity(parsed, item.quantity)
                };
            })
        );
    };
    const fetchLatestTransactionNumber = async () => {
        try {
            const response = await api.get('/api/fetchLatestTransactionNumber');
            setLatestTransactionNumber(response.data.latest_transaction_number + 1);
        } catch (error) {
            console.error('Error fetching latest transaction number:', error);
            return null;
        }
    };


    const fetchProducts = async (page = 1, term = '') => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await api.get('/api/fetchproducts', {
                params: { search: term, page }
            });

            const newProducts = response.data.products.filter((p: any) => p.quantity > 0);

            if (page === 1) {
                setProducts(newProducts);
            } else {
                setProducts(prev => [...prev.filter((p: any) => p.quantity > 0), ...newProducts]);
            }

            setCurrentPage(response.data.current_page);
            setLastPage(response.data.last_page);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchProducts(1, searchTerm);
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchTerm]);

    const loadMore = () => {
        if (currentPage < lastPage && !loading) {
            fetchProducts(currentPage + 1, searchTerm);
        }
    };

    const toggleSelectAll = () => {
        if (selectedProducts.length === products.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(products.map(p => ({
                id: p.id,
                quantity: 1,
                price: p.price
            })));
        }
    };

    const clampQuantity = (value: number, max: number) => {
        return Math.max(0, Math.min(value, max));
    };

    const handleDelete = async (id: number) => {
        try {
            await api.post(`/api/delete-item/${id}`);
            setProducts(prev => prev.filter(p => p.id !== id));
            setAlertHeader('Deletion Successfull');
            setAlertMessage('Transaction has been removed!');
            setConfirmAlertVisible(true);
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleBulkDelete = async () => {
        try {
            await Promise.all(selectedProducts.map(p => api.post(`/api/delete-item/${p.id}`)));
            setProducts(prev => prev.filter(p => !selectedProducts.some(sp => sp.id === p.id)));
            setSelectedProducts([]);
            setAlertHeader('Deleted');
            setAlertMessage('Selected transactions have been removed!');
            setConfirmAlertVisible(true);
        } catch (error) {
            console.error('Error deleting products:', error);
            setAlertHeader('Error');
            setAlertMessage('Failed to delete some products!');
            setConfirmAlertVisible(true);
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const selectedItem = selectedProducts.find(p => p.id === item.id);

        return (
            <View style={styles.product}>
                <View style={styles.productHeader}>
                    <CheckboxComponent
                        isChecked={!!selectedItem}
                        onPress={() => toggleSelect(item)}
                    />
                    <Text style={{ fontWeight: 'bold', fontSize: 20, maxWidth: '70%', color: '#411C0E' }} numberOfLines={1} ellipsizeMode="tail">{item.category}</Text>

                    <TouchableOpacity onPress={() => openEditProductPage(item)} style={{ marginLeft: 'auto', marginRight: 10 }}>
                        <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
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
                </View>

                <View style={{ flexDirection: 'row', marginBottom: 15 }}>
                    <Text style={{ fontWeight: 'bold', color: '#411C0E', fontSize: 20 }}>Product No.</Text>
                    <Text style={{ marginLeft: 'auto', marginRight: 10 }}>{String(item.id).padStart(5, '0')}</Text>
                </View>

                <View style={styles.info}>
                    {item.file_path && item.file_path.trim() !== '' ? (
                      <Image source={{ uri: item.file_path }} style={styles.image} />
                    ) : (
                      <View style={styles.placeholderImage}>
                        <Text style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>No Image</Text>
                      </View>
                    )}


                    <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">{item.name}</Text>
                        <Text style={styles.details}>₱{item.price}</Text>
                    </View>

                    <View style={{ marginLeft: 20, alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                            <TouchableOpacity
                                onPress={() => decreaseQuantity(item)}
                                disabled={selectedItem?.quantity <= 1}
                                style={[
                                    styles.qtyButton,
                                    (selectedItem?.quantity <= 1) && { opacity: 0.5 }
                                ]}
                                >
                                <Text style={styles.qtyText}>-</Text>
                            </TouchableOpacity>

                            <TextInput
                                keyboardType="numeric"
                                value={selectedItem ? String(selectedItem.quantity) : ''}
                                onChangeText={(text) => updateQuantity(item, text)}
                                style={styles.input}
                            />
                            <TouchableOpacity
                                onPress={() => increaseQuantity(item)}
                                disabled={selectedItem?.quantity >= item.quantity}
                                style={[
                                    styles.qtyButton,
                                    selectedItem?.quantity >= item.quantity && { opacity: 0.5 }
                                ]}
                                >
                                <Text style={styles.qtyText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => { setProductToDelete(item.id); setAlertVisible(true)}}
                        style={{ marginLeft: 'auto', marginRight: 10, marginTop: 50 }}
                    >
                        <Svg width={25} height={25} viewBox="-3 0 24 24" fill="none">
                            <Path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z" 
                                fill="#B00B0B" fillOpacity="0.8"/>
                        </Svg>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const handleSubmitMutation = async () => {
        const cartItems = selectedProducts.map(p => {
            const product = products.find(prod => prod.id === p.id);
            return {
                id: product?.id,
                name: product?.name,
                price: product?.price,
                netWeightNumber: product?.netWeightNumber,
                netWeightUnit: product?.netWeightUnit,
                quantity: p.quantity,
                category: product?.category,
                file_path: product?.file_path,
            };
        });

        router.push({
            pathname: '/ReceiptPage',
            params: { cart: JSON.stringify(cartItems) }
        });
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#fff', }}>
            <View style={styles.searchContainer}>
                <TextInput
                    placeholder="Search"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    style={{ flex: 1, marginLeft: 10 }}
                />
                <Svg width="25" height="25" viewBox="0 0 25 25" fill="none">
                    <Path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="#411C0E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'  }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 20 }}>
                {/* <Text style={styles.label}>Receipt No. 88CM-</Text>
                <Text>
                    {latestTransactionNumber !== null ? String(latestTransactionNumber).padStart(5, '0') : '00001'}
                </Text> */}
            </View>
            <View style={styles.date}>
                <Text>{date.toLocaleDateString()}</Text>
                <Svg width={15} height={15} viewBox="0 -1 15 13" fill="none">
                    <Path d="M10 1.08301V3.24967M5 1.08301V3.24967M1.875 5.41634H13.125M3.125 2.16634H11.875C12.5654 2.16634 13.125 2.65137 13.125 3.24967V10.833C13.125 11.4313 12.5654 11.9163 11.875 11.9163H3.125C2.43464 11.9163 1.875 11.4313 1.875 10.833V3.24967C1.875 2.65137 2.43464 2.16634 3.125 2.16634Z" 
                        stroke="#1E1E1E" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
            </View>
            </View>
            <View style={styles.container}>
                <View style={styles.selectAll}>
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

                <View style={styles.productContainer}>
                    <FlatList
                        data={products}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={loading ? <ActivityIndicator size="small" /> : null}
                    />
                </View>

                <View style={styles.total}>
                    <Text style={styles.totalText}>Grandtotal:</Text>
                    <Text style={{ fontWeight: 'bold' }}>P {total}</Text>
                </View>

                <TouchableOpacity style={[styles.button, { backgroundColor: selectedProducts.length === 0 ? '#8a8686' : '#411C0ECC' }]} onPress={handleSubmitMutation} disabled={selectedProducts.length === 0}>
                    <Text style={styles.buttonText}>Checkout</Text>
                </TouchableOpacity>
            </View>
           
            {alertVisible && (
                <View style={{position: 'absolute', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                <ConfirmAlertModal
                    onConfirm={() =>{setAlertVisible(false); if (productToDelete) { handleDelete(productToDelete); } else { handleBulkDelete(); }}}
                    onCancel={() => setAlertVisible(false)}
                />
                </View>
            )}
            {confirmAlertVisible && (
                <View style={{position: 'absolute', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%'}}>
                <AlertModal
                    message= {alertMessage}
                    headertext= {alertHeader}
                    onConfirm={() => setConfirmAlertVisible(false)}
                />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        alignItems: 'center', 
        marginBottom: '30%',
        backgroundColor: '#fff',
    },
    productHeader: { 
        flexDirection: 'row', 
        alignItems: 'center' 
    },
    searchContainer: {
        marginVertical: 15,
        borderRadius: 40,
        width: '90%',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderWidth: 1,
        alignSelf: 'center',
        borderColor: '#411C0E',
        flexDirection: 'row',
        alignItems: 'center',
    },
    product: { 
        padding: 10, 
        marginBottom: 10, 
        borderWidth: 1, 
        width: '100%' 
    },
    date: {
        marginTop: 15,
        marginBottom: 10,
        marginRight: 20,
        borderWidth: 1,
        paddingVertical: 2,
        paddingHorizontal: 10,
        alignSelf: 'flex-end',
        flexDirection: 'row',
        gap: 10,
        backgroundColor: '#F4F4F4',
    },
    selectAll: {
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
        padding: 3,
        marginBottom: 5, 
    },
    productContainer: { 
        width: '90%', 
        flex: 1 
    },
    info: { 
        flexDirection: 'row', 
        alignItems: 'center' 
    },
    name: { 
        fontSize: 15,
        maxWidth: '70%',
        flexShrink: 1,
        flexWrap: 'wrap',
    },
    details: { 
        fontSize: 15, 
        fontWeight: 'bold', 
        color: '#411C0E' 
    },
    input: {
        borderWidth: 1,
        padding: 5,
        width: 50,
        textAlign: 'center'
    },
    qtyButton: {
        paddingHorizontal: 10,
        paddingVertical: 5
    },
    qtyText: { 
        fontSize: 18, 
        fontWeight: 'bold' 
    },
    button: {
        padding: 15,
        alignItems: 'center',
        width: '50%',
        borderRadius: 40
    },
    buttonText: { 
        color: '#fff', 
        fontWeight: 'bold' 
    },
    total: {
        marginBottom: 10,
        borderWidth: 1,
        padding: 10,
        width: '90%',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    totalText: { fontSize: 16 },
    image: { width: 70, height: 70 },
    placeholderImage: {
      width: 70,
      height: 70,
      borderRadius: 5,
      backgroundColor: '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#411C0E',
    },
});
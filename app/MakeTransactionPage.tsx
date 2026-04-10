
import AlertModal from '@/components/AlertModal';
import CheckboxComponent from '@/components/CheckboxComponent';
import ConfirmAlertModal from '@/components/ConfirmAlertModal';
import { useFocusEffect } from '@react-navigation/native';
import { IconCalendar, IconEdit, IconSearch, IconTrash } from '@tabler/icons-react-native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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

    useFocusEffect(
    useCallback(() => {
        fetchProducts(1, searchTerm);
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

            return [...prev, { id: product.id, quantity: 1, price: product.price }];
        });
    };

    const increaseQuantity = (item: any) => {
        ensureSelected(item);
        setSelectedProducts(prev =>
            prev.map(p =>
                p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p
            )
        );
    };

    const decreaseQuantity = (item: any) => {
        ensureSelected(item);
        setSelectedProducts(prev =>
            prev.map(p =>
                p.id === item.id
                    ? { ...p, quantity: Math.max(1, p.quantity - 1) }
                    : p
            )
        );
    };

    const updateQuantity = (item: any, value: string) => {
        const numeric = value.replace(/[^0-9]/g, '');
        ensureSelected(item);

        setSelectedProducts(prev =>
            prev.map(p =>
                p.id === item.id
                    ? { ...p, quantity: numeric === '' ? 1 : parseInt(numeric) }
                    : p
            )
        );
    };

    const fetchProducts = async (page = 1, term = '') => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await api.get('/api/fetchproducts', {
                params: { search: term, page }
            });

            const newProducts = response.data.products;

            if (page === 1) {
                setProducts(newProducts);
            } else {
                setProducts(prev => [...prev, ...newProducts]);
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

    const handleDelete = async (id: number) => {
        try {
            await api.post(`/api/delete-item/${id}`);
            setProducts(prev => prev.filter(p => p.id !== id));
            setAlertHeader('Deletion Successfull!');
            setAlertMessage('Transaction has been removed');
            setConfirmAlertVisible(true);
        } catch (error) {
            console.error('Error deleting product:', error);
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
                    <Text style={{ fontWeight: 'bold', fontSize: 20, maxWidth: '70%' }} numberOfLines={1} ellipsizeMode="tail">{item.category}</Text>

                    <TouchableOpacity onPress={() => openEditProductPage(item)} style={{ marginLeft: 'auto', marginRight: 10 }}>
                        <IconEdit size={20} />
                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', marginBottom: 15 }}>
                    <Text style={{ fontWeight: 'bold', color: '#411C0E', fontSize: 20 }}>Product No.</Text>
                    <Text style={{ marginLeft: 'auto', marginRight: 10 }}>{String(item.id).padStart(5, '0')}</Text>
                </View>

                <View style={styles.info}>
                    <Image source={{ uri: item.file_path }} style={styles.image} />

                    <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">{item.name}</Text>
                        <Text style={styles.details}>₱{item.price}</Text>
                    </View>
                    <View style={{ marginLeft: 20, alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                            <TouchableOpacity onPress={() => decreaseQuantity(item)} style={styles.qtyButton}>
                                <Text style={styles.qtyText}>-</Text>
                            </TouchableOpacity>

                            <TextInput
                                keyboardType="numeric"
                                value={String(selectedItem?.quantity ?? 1)}
                                onChangeText={(text) => updateQuantity(item, text)}
                                style={styles.input}
                            />

                            <TouchableOpacity onPress={() => increaseQuantity(item)} style={styles.qtyButton}>
                                <Text style={styles.qtyText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => { setProductToDelete(item.id); setAlertVisible(true)}}
                        style={{ marginLeft: 'auto', marginRight: 10, marginTop: 50 }}
                    >
                        <IconTrash size={20} color={'red'} />
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
                quantity: p.quantity,
                category: product?.category,
                file_path: product?.file_path
            };
        });

        router.push({
            pathname: '/ReceiptPage',
            params: { cart: JSON.stringify(cartItems) }
        });
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.searchContainer}>
                <TextInput
                    placeholder="Search"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    style={{ flex: 1 }}
                />
                <IconSearch size={20} color={'grey'} />
            </View>

            <View style={styles.date}>
                <Text>{date.toLocaleDateString()}</Text>
                <IconCalendar size={20} />
            </View>

            <View style={styles.container}>
                <View style={styles.selectAll}>
                    <CheckboxComponent
                        isChecked={selectedProducts.length === products.length && products.length > 0}
                        onPress={toggleSelectAll}
                    />
                    <Text>Select All</Text>
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

                <TouchableOpacity style={styles.button} onPress={handleSubmitMutation}>
                    <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
            </View>
           
            {alertVisible && (
                <View style={{position: 'absolute', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
                <ConfirmAlertModal
                    onConfirm={() =>{setAlertVisible(false); handleDelete(productToDelete)}}
                    onCancel={() => setAlertVisible(false)}
                />
                </View>
            )}
            {confirmAlertVisible && (
                <View style={{position: 'absolute', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
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
    container: { flex: 1, alignItems: 'center', marginBottom: '30%' },
    productHeader: { flexDirection: 'row', alignItems: 'center' },
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
    product: { padding: 10, marginBottom: 10, borderWidth: 1, width: '100%' },
    date: {
        marginTop: 10,
        marginBottom: 10,
        borderWidth: 1,
        padding: 10,
        alignSelf: 'flex-end',
        flexDirection: 'row',
        gap: 10
    },
    selectAll: {
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
        padding: 3
    },
    productContainer: { width: '90%', flex: 1 },
    info: { flexDirection: 'row', alignItems: 'center' },
    name: { 
        fontSize: 15,
        maxWidth: '70%',
        flexShrink: 1,
        flexWrap: 'wrap',
    },
    details: { fontSize: 15, fontWeight: 'bold', color: '#666' },
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
    qtyText: { fontSize: 18, fontWeight: 'bold' },
    button: {
        backgroundColor: '#411C0ECC',
        padding: 15,
        alignItems: 'center',
        width: '50%',
        borderRadius: 40
    },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    total: {
        marginBottom: 10,
        borderWidth: 1,
        padding: 10,
        width: '90%',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    totalText: { fontSize: 16 },
    image: { width: 70, height: 70 }
});
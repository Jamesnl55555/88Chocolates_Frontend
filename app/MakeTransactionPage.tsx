
import AlertModal from '@/components/AlertModal';
import CheckboxComponent from '@/components/CheckboxComponent';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, SectionList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Svg, { Path } from 'react-native-svg';
import api from './services/api';

export default function MakeTransactionPage() {
    
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    // const [date, setDate] = useState(new Date());
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [sections, setSections] = useState<{ title: string; data: any[] }[]>([]);
    const router = useRouter();
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertHeader, setAlertHeader] = useState('');
    const [confirmAlertVisible, setConfirmAlertVisible] = useState(false);
    const [productToDelete, setProductToDelete] = useState<any>(null);
    const [latestTransactionNumber, setLatestTransactionNumber] = useState<number | null>(null);

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

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
            
            // Group products by category
            const grouped = newProducts.reduce((acc: { [key: string]: any[] }, product: any) => {
                const cat = product.category || 'Uncategorized';
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(product);
                return acc;
            }, {} as { [key: string]: any[] });
            
            const sectionsData = Object.keys(grouped)
                .sort()
                .map(category => ({ title: category, data: grouped[category] }));
            
            if (page === 1) {
                setSections(sectionsData);
            } else {
                setSections(prev => {
                    const newGrouped: { [key: string]: any[] } = {};
                    prev.forEach(sec => {
                        newGrouped[sec.title] = [...sec.data];
                    });
                    sectionsData.forEach(sec => {
                        if (newGrouped[sec.title]) {
                            newGrouped[sec.title].push(...sec.data);
                        } else {
                            newGrouped[sec.title] = [...sec.data];
                        }
                    });
                    return Object.keys(newGrouped)
                        .sort()
                        .map(cat => ({ title: cat, data: newGrouped[cat] }));
                });
            }
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
        // Regroup after select all to sync
        groupProducts();
    };

    const clampQuantity = (value: number, max: number) => {
        return Math.max(0, Math.min(value, max));
    };

    const groupProducts = () => {
        const grouped = products.reduce((acc: { [key: string]: any[] }, product: any) => {
            const cat = product.category || 'Uncategorized';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(product);
            return acc;
        }, {} as { [key: string]: any[] });

        const sectionsData = Object.keys(grouped)
            .sort()
            .map(category => ({ title: category, data: grouped[category] }));
        
        setSections(sectionsData);
    };


    const renderProduct = (item: any) => {
        if (!item) return null;
        const selectedItem = selectedProducts.find(p => p.id === item.id);

        return (
            <View style={[styles.product, { marginBottom: 5 }]}>
                <View style={styles.productHeader}>
                    <CheckboxComponent
                        isChecked={!!selectedItem}
                        onPress={() => toggleSelect(item)}
                    />
                    <Text style={{ fontWeight: 'bold', color: '#411C0E', fontSize: 20 }}>Product No.</Text>
                    <Text style={{ marginLeft: 'auto', marginRight: 10 }}>{String(item.product_number).padStart(6, '0')}</Text>
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
                                value={selectedItem ? String(selectedItem.quantity) : '0'}
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
                </View>
            </View>
        );
    };

    const renderItem = () => null; // No-op since products rendered in section header
    

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
                product_number: product?.product_number,
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
                <Svg width="25" height="25" viewBox="0 0 25 25" fill="none" style={{ margin: 5 }}>
                    <Path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" 
                        stroke="#411C0E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
            </View>

<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'  }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 20 }}>
            </View>

            <View style={styles.date}>
                <Text style={styles.dateText}>{formattedDate}</Text>
            </View>

            </View>
            
            <View style={styles.container}>
                <View style={styles.selectAll}>
                    <CheckboxComponent
                            isChecked={selectedProducts.length === products.length && products.length > 0}
                            onPress={toggleSelectAll}
                            />
                            <Text style={{ marginLeft: 5 }}>Select All</Text>
                            {/* {selectedProducts.length > 0 && (
                            <TouchableOpacity
                                style={{ marginLeft: "auto", marginRight: 10 }}
                                onPress={() => { setProductToDelete(null); setAlertVisible(true); }}
                            >
                                <Svg width={25} height={25} viewBox="-3 0 24 24" fill="none">
                                    <Path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z" 
                                        fill="#B00B0B" fillOpacity="0.8"/>
                                </Svg>
                            </TouchableOpacity>
                            )} */}
                </View>

                <View style={styles.productContainer}>
                    <SectionList
                        sections={sections}
                        keyExtractor={(item, index) => item?.id?.toString() ?? index.toString()}
                        renderItem={renderItem}
                        renderSectionHeader={({ section }: { section: { title: string; data: any[] } }) => (
                            // Render section header with category title and products in that category
                            <View style={styles.sectionHeader}>
                                <View style={{ backgroundColor: '#56565620', paddingVertical: 10, paddingHorizontal: 15,  }}>
                                    <Text style={{ fontWeight: '800', fontSize: 18, color: '#411C0E', }}>
                                    {section.title.toLocaleUpperCase()} ({section.data.length})
                                </Text>
                                </View>
                                {/* Products based on their category */}
                                <View style={styles.sectionItems}>
                                    {Array.isArray(section.data) && section.data.map((item) => (
                                        <View key={item.id}>
                                            {renderProduct(item)}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
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
        marginTop: 15,
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
        borderTopWidth: 1, 
        width: '100%' 
    },
    date: {
        marginTop: 17,
        marginRight: 20,
        marginBottom: 3,
    },
    dateText: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#411C0E',
    },
    selectAll: {
        borderWidth: 2,
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
        fontSize: 16,
        maxWidth: '70%',
        flexShrink: 1,
        flexWrap: 'wrap',
        marginBottom: 3,
        marginTop: 5,
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
    totalText: { 
        fontSize: 16 
    },
    image: { 
        width: 70, 
        height: 70,
        marginTop: 10,
        marginLeft: 5, 
    },
    placeholderImage: {
      width: 70,
      height: 70,
      marginTop: 10, 
      marginLeft: 5, 
      backgroundColor: '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#411C0E',
    },
    sectionHeader: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#411C0E',
        marginBottom: 10,
        borderRadius: 3,
    },
    sectionItems: {
        borderTopWidth: 0.5,
        borderColor: '#411C0E',
    },
});

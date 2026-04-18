import AlertModal from '@/components/AlertModal';
import { IconCalendar } from '@tabler/icons-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import api from "./services/api";

export default function RecordReceiptPage() {
    const { transaction_number } = useLocalSearchParams();
    const router = useRouter();

    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [alertHeader, setAlertHeader] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertModalVisible, setAlertModalVisible] = useState(false);

    const date = new Date();

    useEffect(() => {
        const fetchReceipt = async () => {
            try {
                setIsLoading(true);

                const response = await api.get('/api/fetchTransactionNumber', {
                    params: {
                        transaction_number: transaction_number,
                    },
                });

                setItems(response.data.items || []);
            } catch (error: any) {
                console.log(error.response?.data);
                setAlertHeader('Error');
                setAlertMessage('Failed to load receipt');
                setAlertModalVisible(true);
            } finally {
                setIsLoading(false);
            }
        };

        if (transaction_number) fetchReceipt();
    }, [transaction_number]);

    const total = items.reduce(
        (acc: number, item: any) =>
            acc + item.quantity * (item.price || 0),
        0
    );

    const handleClose = () => {
        setAlertModalVisible(false);
        router.push('/TransactionRecordPage');
    };
    const renderItem = ({ item }: { item: any }) => {
        return (
            <View style={styles.product}>
                <View style={styles.productHeader}>
                    <Text style={{ fontWeight: 'bold', fontSize: 20 }}>
                        {item.category}
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                    <Text style={{ fontWeight: 'bold' }}>Product No.</Text>
                    <Text style={{ marginLeft: 'auto', marginRight: 10, fontSize: 16 }}>
                        {item.id}
                    </Text>
                </View>

                <View style={styles.info}>
                    <Image
                        source={{ uri: item.file_path }}
                        style={styles.image}
                    />

                    <View style={{ marginLeft: 10 }}>
                        <Text style={styles.name}>{item.product_name}</Text>
                        <Text style={styles.details}>₱{item.price}</Text>
                    </View>

                    <View style={{ marginLeft: 'auto', marginRight: 10, marginTop: 30 }}>
                        <Text style={{ fontSize: 16 }}>
                            X{item.quantity}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={{ flex: 1 }}>

            {/* DATE (same design) */}
            <View style={styles.date}>
                <Text>{date.toLocaleDateString()}</Text>
                <IconCalendar size={20} />
            </View>

            <View style={styles.container}>

                <View style={styles.productContainer}>
                    <FlatList
                        data={items}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                </View>

                {/* TOTAL */}
                <View style={styles.total}>
                    <Text style={styles.totalText}>Grandtotal:</Text>
                    <Text style={styles.totalAmount}>₱ {total}</Text>
                </View>

                <TouchableOpacity
                    style={styles.buttonCancel}
                    onPress={handleClose}
                >
                    <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>

            </View>

            {/* ALERT MODAL */}
            {alertModalVisible && (
                <View style={{
                    position: 'absolute',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)'
                }}>
                    <AlertModal
                        message={alertMessage}
                        headertext={alertHeader}
                        onConfirm={handleClose}
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
        marginBottom: '30%'
    },
    product: {
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        width: '100%'
    },
    productHeader: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    productContainer: {
        width: '90%',
        alignSelf: 'center',
        flex: 1
    },
    info: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    name: {
        fontSize: 15
    },
    details: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#666'
    },
    image: {
        width: 70,
        height: 70,
        borderRadius: 5
    },
    date: {
        marginTop: 10,
        marginBottom: 10,
        borderWidth: 1,
        padding: 10,
        alignSelf: 'flex-end',
        flexDirection: 'row',
        gap: 10,
        right: 20
    },
    total: {
        borderWidth: 1,
        padding: 10,
        marginTop: 10,
        marginBottom: 10,
        width: '90%',
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    totalText: {
        fontSize: 16
    },
    totalAmount: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#411C0E'
    },
    button: {
        backgroundColor: '#411C0ECC',
        padding: 10,
        alignItems: 'center',
        width: '50%',
        borderRadius: 40,
        marginBottom: 5
    },
    buttonCancel: {
        backgroundColor: '#565656CC',
        padding: 10,
        alignItems: 'center',
        width: '50%',
        borderRadius: 40,
        marginBottom: 5
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    }
});
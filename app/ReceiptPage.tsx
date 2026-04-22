import AlertModal from '@/components/AlertModal';
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
import Svg, { Path } from 'react-native-svg';
import api from "./services/api";

export default function ReceiptPage() {
    const { cart } = useLocalSearchParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [alertHeader, setAlertHeader] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertModalVisible, setAlertModalVisible] = useState(false);
    const [latestTransactionNumber, setLatestTransactionNumber] = useState<number | null>(null);

    const parsedCart = cart ? JSON.parse(cart as string) : [];
    const date = new Date();

    const total = parsedCart.reduce(
        (acc: number, item: any) => acc + item.quantity * (item.price || 0), 0);

    useEffect(() => {
        const fetchLatestTransactionNumber = async () => {
            try {
                const response = await api.get('/api/fetchLatestTransactionNumber');
                setLatestTransactionNumber(response.data.latest_transaction_number + 1);
                console.log('Latest Transaction Number:', latestTransactionNumber);
            } catch (error) {
                console.error('Error fetching latest transaction number:', error);
            }
        };
        fetchLatestTransactionNumber();
    }, []);

    const handleSubmitMutation = async () => {
        if (isLoading){
            setAlertHeader('Processing...');
            setAlertMessage('Saving transaction details...');
            setAlertModalVisible(true);
        }

        try {
            const response = await api.post('/api/checkout', {
                cart: parsedCart
            });
            setIsLoading(false);
            if (response.data.success === true) {
                setAlertHeader('Successful Transaction');
                setAlertMessage('Transaction has been recorded!');
                setAlertModalVisible(true);
            }
        } catch (error: any) {
            console.log(error.response?.data);
            setAlertHeader('Failed Transaction');
            setAlertMessage(error.response?.data.message);
            setAlertModalVisible(true);
        } finally {
        setIsLoading(false);
        }
    };

    const handleClose = () => {
        setAlertModalVisible(false);
        router.push('/MakeTransactionPage');
    };

    const handleCancel = () => {
        setAlertModalVisible(false);
        router.push('/MakeTransactionPage');
    };

    const renderItem = ({ item }: { item: any }) => {
        return (
            <View style={styles.product}>
                <View style={styles.productHeader}>
                    <Text style={{ fontWeight: 'bold', fontSize: 20 }}>
                        {item.name}
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                    <Text style={{ fontWeight: 'bold' }}>Product ID:</Text>
                    <Text style={{ marginLeft: 'auto', marginRight: 10, fontSize: 16 }}>{item.id}</Text>
                </View>

                <View style={styles.info}>
                    {item.file_path && item.file_path.trim() !== '' ? (
                        <Image
                            source={{ uri: item.file_path }}
                            style={styles.image}
                        />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Text style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>No Image</Text>
                        </View>
                    )}

                    <View style={{ marginLeft: 10 }}>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.details}>₱{item.price}</Text>
                    </View>

                    <View style={{ marginLeft: 'auto', marginRight: 10, marginTop: 30, bottom: -5 }}>
                        <Text style={{ fontSize: 16}}>
                            X{item.quantity}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            {/* DATE */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'  }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 20, paddingTop: 20 }}>
                    <Text style={styles.label}>Receipt No. 88CM-</Text>
                    <Text>
                        {latestTransactionNumber !== null ? String(latestTransactionNumber).padStart(5, '0') : '00001'}
                    </Text>
                </View>
                <View style={styles.date}>
                    <Text style={{ color: '#411C0E' }}>{date.toLocaleDateString()}</Text>
                    <Svg width={15} height={15} viewBox="0 -1 15 13" fill="none">
                        <Path d="M10 1.08301V3.24967M5 1.08301V3.24967M1.875 5.41634H13.125M3.125 2.16634H11.875C12.5654 2.16634 13.125 2.65137 13.125 3.24967V10.833C13.125 11.4313 12.5654 11.9163 11.875 11.9163H3.125C2.43464 11.9163 1.875 11.4313 1.875 10.833V3.24967C1.875 2.65137 2.43464 2.16634 3.125 2.16634Z" 
                            stroke="#411C0E" strokeLinecap="round" strokeLinejoin="round"/>
                    </Svg>
                </View>
            </View>
            

            <View style={styles.container}>
                <View style={styles.productContainer}>
                    <FlatList
                        data={parsedCart}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                </View>
                <View style={styles.total}>
                    <Text style={styles.totalText}>Grandtotal:</Text>
                    <Text style={styles.totalAmount}>₱ {total}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.button, isLoading && { opacity: 0.5 }]}
                    onPress={handleSubmitMutation}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>
                        {isLoading ? 'Processing...' : 'Checkout'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonCancel} onPress={handleCancel}>
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>      
            </View>
                {alertModalVisible && (
                <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
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
        marginBottom: '30%',
        backgroundColor: '#fff',
    },
    product: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginBottom: 10,
        borderWidth: 1,
        width: '100%'
    },
    productHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        color: '#411C0E',
        marginBottom: 10
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
        fontSize: 15,
        top: -15
    },
    details: {
        fontSize: 15,
        fontWeight: 700,
        color: '#411C0E',
        bottom: -12
    },
    image: {
        width: 70,
        height: 70,
        borderRadius: 5
    },
    placeholderImage: {
        width: 70,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    date: {
        marginTop: 20,
        marginBottom: 5,
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 2,
        alignSelf: 'flex-end',
        flexDirection: 'row',
        gap: 10,
        right: 20,
        backgroundColor: '#F4F4F4'
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
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#411C0E',
    },
});
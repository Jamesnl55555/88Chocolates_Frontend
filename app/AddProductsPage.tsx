import AlertModal from "@/components/AlertModal";
import { IconCamera } from '@tabler/icons-react-native';
import { useMutation } from '@tanstack/react-query';
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { uploadImage } from "../app/services/cloudinary";
import api from './services/api';

export default function AddProductsPage() {
    const [category, setCategory] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [color, setColor] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertHeader, setAlertHeader] = useState("");
    const [latestProductId, setLatestProductId] = useState<number | null>(null);

    useEffect(() => {
        const fetchLatestProductId = async () => {
            try {
                const response = await api.get('/api/fetchLatestProductNumber');
                setLatestProductId(response.data.latest_product_number + 1);
                console.log('Latest Product ID:', latestProductId);
            } catch (error) {
                console.error('Error fetching latest product ID:', error);
            }
        };
        fetchLatestProductId();
    }, []);
    const increaseQuantity = () => {
        setQuantity(prev => String(Number(prev || 0) + 1));
    };

    const decreaseQuantity = () => {
        setQuantity(prev => String(Math.max(1, Number(prev || 1) - 1)));
    };

    const updateQuantity = (value: string) => {
        const numeric = value.replace(/[^0-9]/g, '');
        setQuantity(numeric === '' ? '1' : numeric);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            try {
                const upload = await uploadImage(uri);
                setImageUrl(upload.secure_url);
            } catch (err) {
                setAlertHeader("Error!");
                setAlertMessage("Image upload failed.");
                setAlertVisible(true);
            }
        }
    };

    const addProduct = useMutation({
        mutationFn: ({ category, name, price, quantity, color }: any) =>
            api.post('/api/postproducts', {
                category,
                name,
                price,
                quantity,
                color,
                file_path: imageUrl
            }).then(res => res.data),
        onSuccess: () => {
            setCategory('');
            setName('');
            setPrice('');
            setQuantity('1');
            setColor('');
            setImageUrl(null);
            setAlertHeader("Success!");
            setAlertMessage("Product added successfully");
            setAlertVisible(true);
        },
        onError: () => {
            setAlertHeader("Error!");
            setAlertMessage("Error adding product");
            setAlertVisible(true);
        }
    });

    const handleSubmit = () => {
        if (category && name && price && quantity && color && imageUrl) {
            addProduct.mutate({
                category,
                name,
                price: Number(price),
                quantity: Number(quantity),
                color
            });
        } else {
            setAlertHeader("Error!");
            setAlertMessage("Please fill in all fields correctly");
            setAlertVisible(true);
        }
    };

    const handleClose = () => {
        setAlertVisible(false);
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={{ margin: 20, padding: 20, borderWidth: 1, borderRadius: 10, marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.label}>Product No.</Text>
                        <Text style={{ color: '#411C0E' }}>
                            {latestProductId !== null ? String(latestProductId).padStart(5, '0') : '00001'}
                        </Text>
                    </View>
                    <View style={styles.imageContainer}>
                        {imageUrl ? (
                            <Image source={{ uri: imageUrl }} style={styles.image} />
                        ) : (
                            <Text style={styles.imagePlaceholder}>+</Text>
                        )}
                        <TouchableOpacity onPress={pickImage} style={styles.imageIconCamera}>
                            <IconCamera size={24} color="#ffffff" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Category:</Text>
                    <TextInput
                        style={styles.input}
                        value={category}
                        onChangeText={setCategory}
                    />

                    <Text style={styles.label}>Product Name:</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.label}>Net Weight:</Text>
                    <TextInput
                        style={styles.input}
                        value={color}
                        onChangeText={setColor}
                    />

                    <View style={styles.quantityPriceContainer}>
                        <View style={styles.quantityContainer}>
                            <Text style={styles.label}>Price:</Text>
                            <TextInput
                                style={[styles.input, { width: 100 }]}
                                keyboardType="numeric"
                                value={price}
                                onChangeText={setPrice}
                            />
                        </View>

                        <View style={styles.PriceContainer}>
                            <Text style={[styles.label, { alignSelf: 'center' }]}>Quantity:</Text>

                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity onPress={decreaseQuantity} style={styles.qtyButton}>
                                    <Text style={styles.qtyText}>-</Text>
                                </TouchableOpacity>

                                <TextInput
                                    keyboardType="numeric"
                                    value={quantity}
                                    onChangeText={updateQuantity}
                                    style={styles.qtyInput}
                                />

                                <TouchableOpacity onPress={increaseQuantity} style={styles.qtyButton}>
                                    <Text style={styles.qtyText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={styles.buttons}>
                        <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
                            <Text style={styles.save}>Add Product</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {alertVisible && (
                <View style={styles.alert}>
                    <AlertModal
                        headertext={alertHeader}
                        message={alertMessage}
                        onConfirm={handleClose}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 2,
        borderColor: '#411C0E',
        padding: 10,
        marginBottom: 10,
        borderRadius: 25,
    },
    image: {
        alignSelf: 'center',
        justifyContent: 'center',
        width: 100,
        height: 100,
        marginBottom: 10
    },
    label: {
        color: '#411C0E',
        fontWeight: 'bold',
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20
    },
    save: {
        color: 'green'
    },
    saveButton: {
        backgroundColor: '#C8E6C9',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    quantityPriceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginHorizontal: 5,
        padding: 10,
    },
    PriceContainer: {
        flexDirection: 'column',
    },
    quantityContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    qtyButton: {
        backgroundColor: '#eee',
        padding: 5,
        borderRadius: 5,
        width: 30,
        alignItems: 'center',
    },
    qtyText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    qtyInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 5,
        width: 60,
        textAlign: 'center',
        borderRadius: 5,
    },
    imageIconCamera: {
        position: 'absolute',
        bottom: 0,
        right: -15,
        backgroundColor: '#565656',
        width: 35,
        height: 35,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        width: 100,
        height: 100,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignSelf: 'center',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#411C0E',
    },
    alert: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholder: {
        alignSelf: 'center',
        justifyContent: 'center',
        fontSize: 24,
        color: '#411C0E',
    },
});
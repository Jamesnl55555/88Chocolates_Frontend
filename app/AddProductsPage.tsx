import AlertModal from "@/components/AlertModal";
import { IconCamera, IconCaretDownFilled, IconCaretUpFilled } from '@tabler/icons-react-native';
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
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertHeader, setAlertHeader] = useState("");
    const [latestProductId, setLatestProductId] = useState<number | null>(null);
    const [netWeightNumber, setNetWeightNumber] = useState('')
    const [netWeightUnit, setNetWeightUnit] = useState("");

    const [showDropdown, setShowDropdown] = useState(false);
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);

    const units = ['g', 'kg', 'ml', 'L'];
    const categories = ['Chocolates', 'Candies', 'Drinks', 'Canned Goods', 'Instant Noodles', 'Chip Snacks']; 

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
        mutationFn: ({ category, name, price, quantity, netWeightNumber, netWeightUnit }: any) =>
            api.post('/api/postproducts', {
                category,
                name,
                price,
                quantity,
                netWeightNumber,
                netWeightUnit,
                file_path: imageUrl
            }).then(res => res.data),
        onSuccess: () => {
            setCategory('');
            setName('');
            setPrice('');
            setQuantity('1');
            setNetWeightNumber('');
            setNetWeightUnit('');
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
        if (category && name && price && quantity && netWeightNumber && netWeightUnit && imageUrl) {
            addProduct.mutate({
                category,
                name,
                price: Number(price),
                quantity: Number(quantity),
                netWeightNumber: Number(netWeightNumber),
                netWeightUnit: netWeightUnit,
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
        <View style={{ backgroundColor: '#fff', flex: 1 }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.container}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
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
                    <View style={styles.dropdownContainer}>
                    <Text style={[styles.label, {marginTop: 20}]}>Category:</Text>
                    <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowDropdown(prev => !prev)}
                    >
                    <Text style={{ color: category ? '#000' : '#999' }}>
                        {category || 'Category'}
                    </Text>
                    {showDropdown ? <IconCaretUpFilled size={16} /> : <IconCaretDownFilled size={16} />}
                    </TouchableOpacity>

                    {showDropdown && (
                    <View style={styles.dropdown}>
                        {categories.map((item) => (
                        <TouchableOpacity
                            key={item}
                            onPress={() => {
                            setCategory(item);
                            setShowDropdown(false);
                            }}
                            style={styles.dropdownItem}
                        >
                            <Text>{item}</Text>
                        </TouchableOpacity>
                        ))}
                    </View>
                    )}
                    </View>

                    <Text style={styles.label}>Product Name:</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                    />
                    <View style={styles.netWeightQuantityContainer}>
                        <View>
                            <Text style={styles.label}>Net Weight:</Text>

                        <View style={styles.netWeightContainer}>
                        <TextInput
                            style={styles.netWeightInput}
                            keyboardType="numeric"
                            value={netWeightNumber}
                            onChangeText={setNetWeightNumber}
                            placeholder="0"
                        />

                        <TouchableOpacity
                            style={styles.unitButton}
                            onPress={() => setShowUnitDropdown(prev => !prev)}
                        >
                            <Text style={{ color: netWeightUnit ? '#000' : '#999' }}>
                            {netWeightUnit || 'Unit'}
                            </Text>
                            {showUnitDropdown ? (
                            <IconCaretUpFilled size={16} />
                            ) : (
                            <IconCaretDownFilled size={16} />
                            )}
                        </TouchableOpacity>

                        {showUnitDropdown && (
                            <View style={styles.unitDropdown}>
                            {units.map((unit) => (
                                <TouchableOpacity
                                key={unit}
                                onPress={() => {
                                    setNetWeightUnit(unit);
                                    setShowUnitDropdown(false);
                                }}
                                style={styles.dropdownItem}
                                >
                                <Text>{unit}</Text>
                                </TouchableOpacity>
                            ))}
                            </View>
                        )}
                        </View>
                        </View>
                        
                        <View style={styles.quantityContainer}>
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

                    <View style={styles.quantityPriceContainer}>
                        <View style={styles.PriceContainer}>
                            <Text style={styles.label}>Price:</Text>
                            <TextInput
                                style={[styles.input, { width: 100 }]}
                                keyboardType="numeric"
                                value={price}    
                                placeholder="₱"
                                onChangeText={setPrice}
                            />
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
    container: { 
        marginHorizontal: 18, 
        marginTop: 20,
        padding: 20, 
        borderWidth: 1, 
        backgroundColor: '#fff',
    },
    input: {
        borderWidth: 2,
        borderColor: '#411C0E',
        padding: 10,
        marginBottom: 12,
        borderRadius: 50,
    },
    image: {
        alignSelf: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    label: {
        color: '#411C0E',
        fontWeight: 'bold',
        marginBottom: 3,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: -5,
    },
    save: {
        color: '#FFFFFF',
        fontWeight: 700
    },
    saveButton: {
        backgroundColor: '#2FA262CC',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 50,
    },
    quantityPriceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    PriceContainer: {
        flexDirection: 'column',
    },
    netWeightQuantityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 5,
    },
    quantityContainer: {
        flexDirection: 'column',
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
        bottom: -12,
        right: -15,
        backgroundColor: '#565656',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        width: 130,
        height: 130,
        backgroundColor: '#D9D9D9',
        justifyContent: 'center',
        alignSelf: 'center',
        borderWidth: 2,
        borderColor: '#411C0E',
        marginBottom: 20,
        marginTop: 5,
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
        fontSize: 50,
        color: '#411C0E',
    },
    dropdownContainer: {
        zIndex: 10,
        position: 'relative',
        marginBottom: 20,
    },
    dropdownButton: {
        padding: 10,
        borderWidth: 1,
        marginTop: 10,
        borderColor: '#411C0E',
        backgroundColor: '#fff',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    dropdown: {
        position: 'absolute',
        width: '100%',
        top: '100%',
        borderWidth: 1,
        borderColor: '#411C0E',
        backgroundColor: '#fff',
    },
    dropdownItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    netWeightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#411C0E',
        borderRadius: 50,
        marginBottom: 12,
        alignSelf: 'flex-start',
    },

    netWeightInput: {
        width: '30%',
        padding: 10,
    },

    unitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 12,
        height: '100%',
    },

    unitDropdown: {
        position: 'absolute',
        top: '100%',
        borderWidth: 1,
        borderColor: '#411C0E',
        backgroundColor: '#fff',
        zIndex: 999,
        left: 50,
        elevation: 10,
    },
});
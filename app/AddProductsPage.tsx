import AlertModal from "@/components/AlertModal";
import { IconCaretDownFilled, IconCaretUpFilled, IconPhotoEdit } from '@tabler/icons-react-native';
import { useMutation } from '@tanstack/react-query';
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { uploadImage } from "../app/services/cloudinary";
import api from './services/api';

export default function AddProductsPage() {
    const [category, setCategory] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState<number>(0);
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
    const categories = ['Chocolates', 'Candies', 'Drinks', 'Canned Goods', 'Instant Noodles', 'Chip Snacks', 'Miscalleneous']; 

    
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
    const MAX_QTY = 9999;
    setQuantity(prev => Math.min(MAX_QTY, prev + 1));
    };

    const decreaseQuantity = () => {
        setQuantity(prev => Math.max(0, prev - 1));
    };

    const updateQuantity = (value: string) => {
        let numeric = value.replace(/\D/g, '');
        numeric = numeric.slice(0, 4);
        if (numeric === '') {
            setQuantity(0);
            return;
        }
        setQuantity(Number(numeric));
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
                setAlertHeader("Error");
                setAlertMessage("Image upload failed!");
                setAlertVisible(true);
            }
        }
    };


    const addProduct = useMutation({
        mutationFn: ({ category, name, price, quantity }: any) =>
            api.post('/api/postproducts', {
                category,
                name,
                price,
                quantity,
                netWeightNumber: Number(netWeightNumber),
                netWeightUnit: netWeightUnit,
                file_path: imageUrl
            }).then(res => res.data),
        onSuccess: () => {
            setCategory('');
            setName('');
            setPrice('');
            setQuantity(0);
            setNetWeightNumber('');
            setNetWeightUnit('');
            setImageUrl(null);
            setAlertHeader("Success");
            setAlertMessage("Product added successfully!");
            setAlertVisible(true);
        },
        onError: (error : any) => {
            console.log("ADD PRODUCT ERROR:", error?.response?.data || error);

            setAlertHeader("Error");
            setAlertMessage(
                error?.response?.data?.message ||
                error?.message ||
                "Error adding product!"
            );
        }
    });
    const limit4Digits = (text: string) =>
    text.replace(/\D/g, '').slice(0, 4);

    const handleSubmit = () => {

        if (category && name && price && quantity) {
            addProduct.mutate({
                category,
                name,
                price: Number(price),
                quantity: quantity,
                netWeightNumber: Number(netWeightNumber),
                netWeightUnit: netWeightUnit,
            });
        } else {
            setAlertHeader("Error");
            setAlertMessage("Some fields are missing or incorrect. Please review and try again.");
            setAlertVisible(true);
        }
    };

    const handleClose = () => {
        setAlertVisible(false);
    };

    return (
        <View style={{ backgroundColor: '#fff', flex: 1 }}>
            <KeyboardAvoidingView 
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            style={{ flex: 1 }}
                            keyboardVerticalOffset={100}
                        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.container}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                        <Text style={styles.label}>Product No.</Text>
                        <Text style={{ color: '#411C0E' }}>
                            {latestProductId !== null ? String(latestProductId).padStart(5, '0') : '00001'}
                        </Text>
                    </View>

                    {/* image */}
                    <View style={styles.imageContainer}>
                        <TouchableOpacity 
                            style={styles.touchableOverlay} 
                            onPress={pickImage}
                            activeOpacity={0.7}
                        >
                            {imageUrl ? (
                                <Image source={{ uri: imageUrl }} style={styles.image} />
                            ) : (
                                <Text style={styles.imagePlaceholder}>+</Text>
                            )}
                            <View style={styles.photoIcon}>
                                <IconPhotoEdit size={22} strokeWidth={2} color={'#fff'}/>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.dropdownContainer}>
                    <Text style={[styles.label, {marginTop: 20}]}>Category:</Text>
                    <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowDropdown(prev => !prev)}
                    >
                    <Text style={{ color: category ? '#000' : '#0000007f' }}>
                        {category || 'Select Category'}
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
                            onChangeText={(text) => setNetWeightNumber(limit4Digits(text))}
                            placeholder="0"
                            maxLength={4}
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
                                <TouchableOpacity onPress={decreaseQuantity} disabled={quantity <= 0} style={[
                                                                                    styles.qtyButton,
                                                                                    (quantity <= 0) && { opacity: 0.5 }
                                                                                ]}>
                                    <Text style={styles.qtyText}>-</Text>
                                </TouchableOpacity>

                                <TextInput
                                    keyboardType="number-pad"
                                    value={quantity === 0 ? '0' : String(quantity)}
                                    onChangeText={updateQuantity}
                                    style={styles.qtyInput}
                                    selectTextOnFocus
                                    maxLength={4}
                                />

                                <TouchableOpacity onPress={increaseQuantity} disabled={quantity === 9999} style={[styles.qtyButton, quantity === 9999 && { backgroundColor: '#c9bdbd',opacity: 0.5 }]}>
                                    <Text style={styles.qtyText}>+</Text>    
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={styles.quantityPriceContainer}>
                        <View style={styles.PriceContainer}>
                            <Text style={styles.label}>Price:</Text>
                            <View style={{ width: 135, borderWidth: 2, borderColor: '#411C0E', alignItems: 'center', flexDirection: 'row', borderRadius: 50, marginBottom: 12, }}>
                                <Text style={{ fontWeight: 'bold', marginLeft: 10, color: '#411C0E',  }}>₱</Text>
                                    <TextInput
                                    keyboardType="numeric"
                                    value={price} 
                                    style={{ width: 135,  }}
                                    onChangeText={(text) => setPrice(limit4Digits(text))}
                                    maxLength={4}
                                />
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
            </KeyboardAvoidingView>

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
        marginTop: 10,
        borderRadius: 50,
    },
    quantityPriceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    PriceContainer: {
        flexDirection: 'column',
    },
    netWeightQuantityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    quantityContainer: {
        flexDirection: 'column',
        marginRight: 15,
        marginTop: 3,
    },
    qtyButton: {
        backgroundColor: '#411c0eea',
        paddingHorizontal: 3,
        paddingVertical: 3,
        borderRadius: 5,
        width: 30,
        alignItems: 'center',
    },
    qtyText: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#FFEDD9',
    },
    qtyInput: {
        borderWidth: 1,
        padding: 5,
        width: 60,
        textAlign: 'center',
        borderRadius: 5,
        marginHorizontal: 1
    },
    touchableOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoIcon: {
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
        width: 125,
        height: 125,
        backgroundColor: '#D9D9D9',
        justifyContent: 'center',
        alignSelf: 'center',
        borderWidth: 3,
        borderColor: '#411C0E',
        marginBottom: 10,
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
        marginTop: 3,
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
        width: '38%',
        padding: 10,
        marginLeft: 3,
    },

    unitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 5,
        height: '100%',
    },

    unitDropdown: {
        position: 'absolute',
        top: '100%',
        borderWidth: 1,
        borderColor: '#411C0E',
        backgroundColor: '#fff',
        zIndex: 999,
        left: 70,
        elevation: 10,
    },
});
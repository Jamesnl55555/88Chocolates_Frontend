import AlertModal from "@/components/AlertModal";
import { IconCamera, IconCaretDownFilled, IconCaretUpFilled } from '@tabler/icons-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from './services/api';
import { uploadImage } from './services/cloudinary';

export default function EditProductModal() {
    const navigation = useNavigation();
    const { product } = useLocalSearchParams();
    const parsedProduct = product ? JSON.parse(product as string) : null;
    const [editProduct, setEditProduct] = useState<any>(parsedProduct);
    const [editImageUrl, setEditImageUrl] = useState<string | null>(parsedProduct?.file_path || null);
 
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertHeader, setAlertHeader] = useState("");

    const [netWeightNumber, setNetWeightNumber] = useState(String(parsedProduct?.netWeightNumber || ''));
    const [netWeightUnit, setNetWeightUnit] = useState(parsedProduct?.netWeightUnit || '');

    const [showDropdown, setShowDropdown] = useState(false);
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);

    const categories = ['Chocolates', 'Candies', 'Drinks', 'Canned Goods', 'Instant Noodles', 'Chip Snacks']; 
    const units = ['g', 'kg', 'ml', 'L'];

    useEffect(() => {
        setEditProduct(parsedProduct);
        setEditImageUrl(parsedProduct?.file_path || null);
        setNetWeightNumber(String(parsedProduct?.netWeightNumber || ''));
        setNetWeightUnit(parsedProduct?.netWeightUnit || '');
    }, [product]);

    function validateInputs() {
        if (!editProduct.name) {
            setAlertHeader("Error");
            setAlertMessage("Please enter a product name.");
            setAlertVisible(true);
            return false;
        }
        if (!editProduct.category) {
            setAlertHeader("Error");
            setAlertMessage("Please select a category.");
            setAlertVisible(true);
            return false;
        }
        if (isNaN(Number(editProduct.price)) || Number(editProduct.price) <= 0) {
            setAlertHeader("Error");
            setAlertMessage("Please enter a valid price.");
            setAlertVisible(true);
            return false;
        }
        if (!netWeightNumber || isNaN(Number(netWeightNumber)) || Number(netWeightNumber) <= 0) {
            setAlertHeader("Error");
            setAlertMessage("Please enter a valid net weight.");
            setAlertVisible(true);
            return false;   
        }
        if (isNaN(Number(editProduct.quantity)) || Number(editProduct.quantity) <= 0) {
            setAlertHeader("Error");
            setAlertMessage("Please enter a valid quantity.");
            setAlertVisible(true);
            return false;
        }
        return true;
    }

    const increaseQuantity = () => {
        setEditProduct((prev: any) => ({
            ...prev,
            quantity: Number(prev.quantity || 0) + 1
        }));
    };

    const decreaseQuantity = () => {
        setEditProduct((prev: any) => ({
            ...prev,
            quantity: Math.max(1, Number(prev.quantity || 1) - 1)
        }));
    };

    const updateQuantity = (value: string) => {
        const numeric = value.replace(/[^0-9]/g, '');

        setEditProduct((prev: any) => ({
            ...prev,
            quantity: numeric === '' ? 1 : parseInt(numeric)
        }));
    };

    const pickImageForEdit = async () => {
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
                setEditImageUrl(upload.secure_url);
            } catch (err) {
                console.error('Upload failed', err);
                alert('Image upload failed!');
            }
        }
    };

    const handleClose = () => {
        setAlertVisible(false);
        navigation.goBack();
    };

    const handleEditSubmit = async () => {
        if (!editProduct) return;
        if (!validateInputs()) return;

        try {
            await api.post(`/api/update-product/${editProduct.id}`, {
                name: editProduct.name,
                category: editProduct.category,
                price: Number(editProduct.price),
                quantity: Number(editProduct.quantity),
                netWeightNumber: Number(netWeightNumber),
                netWeightUnit: netWeightUnit,
                file_path: editImageUrl,
                is_archived: editProduct.is_archived ?? 0,
                color_size: editProduct.color_size
            });
            setAlertHeader("Success");
            setAlertMessage("Product updated successfully!");
            setAlertVisible(true);

        } catch (error: any) {
            console.error('Error updating product:', error.response?.data || error);
            setAlertHeader("Error");
            setAlertMessage("Failed to update product!");
            setAlertVisible(true);
        }
    };
    const onClose = () => {
        navigation.goBack();
    };

    if (!editProduct) return null;

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ margin: 20, padding: 20, borderWidth: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={styles.label}>Product No.</Text>
                <Text>{String(editProduct.product_number).padStart(5, '0')}</Text>
            </View>
            <View style={styles.imageContainer}>
                {editImageUrl ? (
                    <Image source={{ uri: editImageUrl }} style={styles.image} />
                ) : (
                    <Text>Upload Image</Text>
                )}
                <TouchableOpacity onPress={pickImageForEdit} style={styles.imageIconCamera}>
                    <IconCamera size={22} color="#ffffff" />
                </TouchableOpacity>
            </View>
            
            <View style={styles.dropdownContainer}>
                <Text style={[styles.label, { marginBottom: -5 }]}>Category:</Text>

                <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowDropdown(prev => !prev)}
                >
                    <Text style={{ color: editProduct.category ? '#000' : '#999' }}>
                        {editProduct.category || 'Category'}
                    </Text>

                    {showDropdown
                        ? <IconCaretUpFilled size={16} />
                        : <IconCaretDownFilled size={16} />
                    }
                </TouchableOpacity>

                {showDropdown && (
                    <View style={styles.dropdown}>
                        {categories.map((item) => (
                            <TouchableOpacity
                                key={item}
                                onPress={() => {
                                    setEditProduct({
                                        ...editProduct,
                                        category: item
                                    });
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

            <Text style={styles.label}>Name:</Text>
            <TextInput
                style={styles.input}
                value={editProduct.name}
                onChangeText={(text) => setEditProduct({ ...editProduct, name: text })}
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
                        <Text>{netWeightUnit || 'Unit'}</Text>
                        {showUnitDropdown ? <IconCaretUpFilled size={16} /> : <IconCaretDownFilled size={16} />}
                    </TouchableOpacity>

                    {showUnitDropdown && (
                        <View style={styles.unitDropdown}>
                            {units.map(unit => (
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
                        <TouchableOpacity onPress={() => decreaseQuantity()} style={styles.qtyButton}>
                            <Text style={styles.qtyText}>-</Text>
                        </TouchableOpacity>

                        <TextInput
                            keyboardType="numeric"
                            value={String(editProduct.quantity)}
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
                    value={String(editProduct.price)}
                    onChangeText={(text) => setEditProduct({ ...editProduct, price: text })}
                    />
                   
                </View>     
            </View>
            <View style={styles.buttons}>
                <TouchableOpacity onPress={handleEditSubmit} style={styles.saveButton}>
                    <Text style={styles.save}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} style={styles.cancelButon}>
                    <Text style={styles.cancel}>Cancel</Text>
                </TouchableOpacity>
            </View>
            </View>
            {alertVisible && (
            <View style={styles.alert}>
            <AlertModal
                headertext={alertHeader}
                message={alertMessage}
                onConfirm={ handleClose }
            />
            </View>
    )}
        </View>
    );
}

const styles = StyleSheet.create({
    modalBackdrop: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    modalContainer: { 
        width: '90%', 
        backgroundColor: '#fff', 
        padding: 20, 
        borderRadius: 10, 
        maxHeight: '90%' 
    },
    title: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        marginBottom: 10 
    },
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
        width: '100%', 
        height: '100%', 
    },
    label: {
        color: '#411C0E',
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 2,
    },
    buttons: { 
        flexDirection: 'row', 
        justifyContent: 'space-evenly',
         marginTop: 15,
        },
    cancel: { 
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    cancelButon: {
        backgroundColor: '#565656CC',
        padding: 10,
        width: '38%',
        borderRadius: 50,
    },
    save: { 
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',

    },
    saveButton: {
        backgroundColor: '#2FA262CC',
        padding: 10,
        width: '38%',
        borderRadius: 50,
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
        marginLeft: -10,
        marginTop: -10,
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
        bottom: -10,
        right: -15,
        backgroundColor: '#565656',
        width: 35,
        height: 35,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        position: 'relative',
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: '#411C0E',
        width: 120, 
        height: 120, 
        marginBottom: 15,
        marginTop: 5,
    },
    alert: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    dropdownContainer: {
        zIndex: 10,
        position: 'relative',
        marginBottom: 10,
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
    netWeightQuantityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 5,
    },
    netWeightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#411C0E',
        borderRadius: 50,
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
        zIndex: 995,
        left: 50,
        elevation: 10,
    },
});
import AlertModal from "@/components/AlertModal";
import { IconCamera } from '@tabler/icons-react-native';
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

    useEffect(() => {
        setEditProduct(parsedProduct);
        setEditImageUrl(parsedProduct?.file_path || null);
    }, [product]);

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
                alert('Image upload failed');
            }
        }
    };

    const handleClose = () => {
        setAlertVisible(false);
        navigation.goBack();
    };

    const handleEditSubmit = async () => {
        if (!editProduct) return;

        try {
            await api.post(`/api/update-product/${editProduct.id}`, {
                name: editProduct.name,
                category: editProduct.category,
                price: Number(editProduct.price),
                quantity: Number(editProduct.quantity),
                file_path: editImageUrl,
                is_archived: editProduct.is_archived ?? 0,
                color_size: editProduct.color_size
            });
            setAlertHeader("Success!");
            setAlertMessage("Product updated successfully");
            setAlertVisible(true);

        } catch (error: any) {
            console.error('Error updating product:', error.response?.data || error);
            setAlertHeader("Error!");
            setAlertMessage("Failed to update product.");
            setAlertVisible(true);
        }
    };
    const onClose = () => {
        navigation.goBack();
    };

    if (!editProduct) return null;

    return (
        <View>
            <View style={{ margin: 20, padding: 20, borderWidth: 1, borderRadius: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={styles.label}>Transaction No.</Text>
                <Text>{String(editProduct.id).padStart(5, '0')}</Text>
            </View>
            <View style={styles.imageContainer}>
                {editImageUrl ? (
                    <Image source={{ uri: editImageUrl }} style={styles.image} />
                ) : (
                    <Text>Upload Image</Text>
                )}
                <TouchableOpacity onPress={pickImageForEdit} style={styles.imageIconCamera}>
                    <IconCamera size={24} color="#ffffff" />
                </TouchableOpacity>
            </View>
            
            <Text style={styles.label}>Category:</Text>
            <TextInput
                style={styles.input}
                value={editProduct.category}
                onChangeText={(text) => setEditProduct({ ...editProduct, category: text })}
            />

            <Text style={styles.label}>Name:</Text>
            <TextInput
                style={styles.input}
                value={editProduct.name}
                onChangeText={(text) => setEditProduct({ ...editProduct, name: text })}
            />

            <Text>Color/Size:</Text>
            <TextInput
                style={styles.input}
                value={editProduct.color_size}
                onChangeText={(text) => setEditProduct({ ...editProduct, color_size: text })}
            />
            <View style={styles.quantityPriceContainer}>
                <View style={styles.quantityContainer}>
                    <Text style={styles.label}>Price:</Text>
                    <TextInput
                    style={[styles.input, { width: 100 }]}
                    keyboardType="numeric"
                    value={String(editProduct.price)}
                    onChangeText={(text) => setEditProduct({ ...editProduct, price: text })}
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
            <View style={styles.buttons}>
                <TouchableOpacity onPress={onClose} style={styles.cancelButon}>
                    <Text style={styles.cancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleEditSubmit} style={styles.saveButton}>
                    <Text style={styles.save}>Save</Text>
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
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { width: '90%', backgroundColor: '#fff', padding: 20, borderRadius: 10, maxHeight: '90%' },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
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
    buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    cancel: { color: 'red' },
    cancelButon: {
        backgroundColor: '#FFCDD2',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    save: { color: 'green' },
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
        position: 'relative',
        alignSelf: 'center',
    },
    alert: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
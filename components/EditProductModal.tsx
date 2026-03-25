import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../app/services/api';
import { uploadImage } from '../app/services/cloudinary';

interface EditProductModalProps {
    visible: boolean;
    product: any;
    onClose: () => void;
    onUpdate: () => void;
}

export default function EditProductModal({ visible, product, onClose, onUpdate }: EditProductModalProps) {
    const [editProduct, setEditProduct] = useState<any>(product);
    const [editImageUrl, setEditImageUrl] = useState<string | null>(product?.file_path || null);

    useEffect(() => {
        setEditProduct(product);
        setEditImageUrl(product?.file_path || null);
    }, [product]);

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
            alert('Product updated successfully');
            onClose();
            onUpdate();
        } catch (error: any) {
            console.error('Error updating product:', error.response?.data || error);
            alert('Error updating product');
        }
    };

    if (!editProduct) return null;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalBackdrop}>
                <View style={styles.modalContainer}>
                    <ScrollView>
                        <Text style={styles.title}>Edit Product</Text>

                        <TouchableOpacity onPress={pickImageForEdit}>
                            {editImageUrl ? (
                                <Image source={{ uri: editImageUrl }} style={styles.image} />
                            ) : (
                                <Text>Upload Image</Text>
                            )}
                        </TouchableOpacity>

                        <Text>Name:</Text>
                        <TextInput
                            style={styles.input}
                            value={editProduct.name}
                            onChangeText={(text) => setEditProduct({ ...editProduct, name: text })}
                        />

                        <Text>Category:</Text>
                        <TextInput
                            style={styles.input}
                            value={editProduct.category}
                            onChangeText={(text) => setEditProduct({ ...editProduct, category: text })}
                        />

                        <Text>Price:</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={String(editProduct.price)}
                            onChangeText={(text) => setEditProduct({ ...editProduct, price: text })}
                        />

                        <Text>Quantity:</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={String(editProduct.quantity)}
                            onChangeText={(text) => setEditProduct({ ...editProduct, quantity: text })}
                        />
                        <Text>Color/Size:</Text>
                        <TextInput
                            style={styles.input}
                            value={editProduct.color_size}
                            onChangeText={(text) => setEditProduct({ ...editProduct, color_size: text })}
                        />

                        <View style={styles.buttons}>
                            <TouchableOpacity onPress={onClose}>
                                <Text style={styles.cancel}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleEditSubmit}>
                                <Text style={styles.save}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { width: '90%', backgroundColor: '#fff', padding: 20, borderRadius: 10, maxHeight: '90%' },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 5, marginBottom: 10 },
    image: { width: 100, height: 100, marginBottom: 10 },
    buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    cancel: { color: 'red' },
    save: { color: 'green' },
});
import { useMutation } from '@tanstack/react-query';
import * as ImagePicker from "expo-image-picker";
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { uploadImage } from "../app/services/cloudinary";
import api from './services/api';

export default function AddProductsPage() {
    const [category, setCategory] = useState('');
    const [name, setName] = useState(''); 
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [color, setColor] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);

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
            console.log("Uploading image from URI:", uri);
            console.log('UPLOAD URL', upload.secure_url);
            setImageUrl(upload.secure_url);
            } catch (err) {
            console.error('Upload failed', err);
            alert('Image upload failed. Try again.');
            }
        }
    };
     
    const handleSubmit = () => {
        if (category && name && price && quantity && color && imageUrl) {
            addProduct.mutate({ category, name, price: Number(price), quantity: Number(quantity), color });
        }
        else {
            alert('Please fill in all fields CORRECTLY');
        }
    }
    const addProduct = useMutation({
        mutationFn: ({ category, name, price, quantity, color }: any) => api.post('/api/postproducts', { category, name, price, quantity, color, file_path: imageUrl }).then(res => res.data),
        onSuccess: async (data, variables) => {
            setCategory('');
            setName('');
            setPrice('');
            setQuantity('');
            setColor('');
            setImageUrl(null);
            console.log('Product added successfully');
            alert('Product added successfully');
        },
        onError: (error) => {
            console.log(error);
            alert('Error adding product');
        }
    })


    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={styles.container}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Add Products Page</Text>
            <Text style={{ marginTop: 10 }}>This is where users can add products to their Inventory</Text>
            <View>
            <TouchableOpacity onPress={pickImage}>
                <Text>Upload Image</Text>
            </TouchableOpacity>
            <Text>Category:</Text>
            <TextInput placeholder="Category" style={{ height: 40, borderColor: 'gray', borderWidth: 1 }} value={category} onChangeText={setCategory} />
            <Text>Product Name: </Text>
            <TextInput placeholder="Product Name" style={{ height: 40, borderColor: 'gray', borderWidth: 1 }} value={name} onChangeText={setName} />
            <Text>Price: </Text>
            <TextInput placeholder="Price" style={{ height: 40, borderColor: 'gray', borderWidth: 1 }} value={price} onChangeText={setPrice} />
            <Text>Quantity: </Text>
            <TextInput placeholder="Quantity" style={{ height: 40, borderColor: 'gray', borderWidth: 1 }} value={quantity} onChangeText={setQuantity} />
            <Text>Color/Size:</Text>
            <TextInput placeholder="Color/Size" style={{ height: 40, borderColor: 'gray', borderWidth: 1 }} value={color} onChangeText={setColor} />
            </View>

            <TouchableOpacity style={{ marginTop: 20 }} onPress={handleSubmit} >
                <Text>Add Product</Text>
            </TouchableOpacity>
            </View>
        </View>
    );
} 

const styles = StyleSheet.create({
    container: {
      flex: 1,
      margin: 5,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
      padding: 20,
    },
  });
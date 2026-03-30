import { useMutation } from '@tanstack/react-query';
import * as ImagePicker from "expo-image-picker";
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
            <View style={styles.card}>
            <TouchableOpacity onPress={pickImage}>
                <View style={styles.imageContainer}>
                    {imageUrl && <Image source={{ uri: imageUrl }} resizeMode="cover" style={styles.image} />}
                    {!imageUrl ? <Text style={styles.addIcon}>+</Text> : null}
                </View>
            </TouchableOpacity>
            <Text>Category:</Text>
            <TextInput placeholder="Category" style={styles.input} value={category} onChangeText={setCategory} />
            <Text>Product Name: </Text>
            <TextInput placeholder="Product Name" style={styles.input} value={name} onChangeText={setName} />
            <Text>Price: </Text>
            <TextInput placeholder="Price" style={styles.input} value={price} onChangeText={setPrice} />
            <Text>Quantity: </Text>
            <TextInput placeholder="Quantity" style={styles.input} value={quantity} onChangeText={setQuantity} />
            <Text>Net Weight:</Text>
            <TextInput placeholder="Color/Size" style={styles.input} value={color} onChangeText={setColor} />
            
            <TouchableOpacity style={styles.button} onPress={handleSubmit} >
                <Text>Add Product</Text>
            </TouchableOpacity>
            </View>
            </View>
        </ScrollView>
    );
} 

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      padding: 20,
      width: '100%',
    },
    card: {
      backgroundColor: '#f5f5f5',
      borderRadius: 10,
      borderWidth: 1,
      padding: 20,
      height: '85%',
      width: '100%',
    },
    imageContainer: {
      alignItems: 'center',
      marginBottom: 10,
      width: '50%',
      height: 150,
      justifyContent: 'center',
      borderWidth: 1,
      backgroundColor: '#f5f5f5',
      borderRadius: 10,
      alignSelf: 'center',
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: 10,
    },
    addIcon: {
      fontSize: 24,
      color: '#ccc',
    },
    input: {
      width: '100%',
      height: 40,
      borderRadius: 45,
      borderWidth: 2,
      borderColor: '#402424',
      marginBottom: 10,
      paddingHorizontal: 10,
    },
    button: {
      backgroundColor: '#FFEDD9',
      borderColor: '#411C0E',
      borderWidth: 2,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
    }
    
  });
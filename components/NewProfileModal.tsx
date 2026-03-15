import { useAuth } from "@/contexts/AuthContext";
import { IconCamera, IconUserFilled } from "@tabler/icons-react-native";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { uploadImage } from "../app/services/cloudinary";
type Props = {
    onSubmit: (storename: string, name: string, imageUrl?: string | null) => void;
    onCancel?: () => void;
    isSaving?: boolean;
};

export default function NewProfileModal({ onSubmit, onCancel, isSaving }: Props){
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const auth = useAuth();
    const [storename, setStoreName] = useState(auth.user?.storeName ?? "88 Chocolates and more");
    const [name, setName] = useState(auth.user?.name ?? "user.user");
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
        onSubmit(storename, name, imageUrl);
        setImageUrl(null);
    };

    return (
        <View style={styles.container}>
            <View style={styles.profile}>
                {auth.user?.profile_image ? (
                        <Image
                            source={{ uri: auth.user.profile_image }}
                            style={{ width: 100, height: 100, borderRadius: 50 }}
                        />
                    ) : (
                        <IconUserFilled size={90} />
                )}
                <TouchableOpacity onPress={pickImage} style={styles.edit }>
                    <IconCamera size={20} color="#fff" />
                </TouchableOpacity>
            </View>
            <View style={styles.inputArea}>
                <Text style={styles.label}>Store Name:</Text>
                <View style={styles.input}>
                    <TextInput placeholder={storename} value={storename} onChangeText={setStoreName} />
                </View>
                <Text style={styles.label}>Username:</Text>
                <View style={styles.input}>
                    <TextInput placeholder={name} value={name} onChangeText={setName} />
                </View>
            </View>
            <View style={styles.buttonArea}>
                <TouchableOpacity style={styles.buttonSave} onPress={handleSubmit} disabled={isSaving}>
                    <Text style={styles.text}>{isSaving ? "Saving..." : "Save"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonCancel} onPress={onCancel}>
                    <Text style={styles.text}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container:{
        position: 'absolute',
        backgroundColor: '#fff',
        width: '90%',
        padding: 20,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profile: {
        width: 120,
        height: 120,
        backgroundColor: '#ffffff',
        borderColor: '#000',
        borderWidth: 8,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    edit: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputArea: {
        marginTop: 30,
        width: '100%',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 35,
        padding: 10,
        marginBottom: 10,
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 5,
        marginTop: 20,
    },
    buttonArea: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 10,
    },
    buttonSave: {
        backgroundColor: 'green',
        padding: 10,
        width: '40%',
        borderRadius: 45,
    },
    buttonCancel: {
        backgroundColor: 'grey',
        padding: 10,
        width: '40%',
        borderRadius: 45,
    },
    text: {
        color: '#fff',
        textAlign: 'center',
    },
});
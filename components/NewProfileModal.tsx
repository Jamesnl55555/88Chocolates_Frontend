import { useAuth } from "@/contexts/AuthContext";
import { IconLibraryPhoto , IconUserFilled } from "@tabler/icons-react-native";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { uploadImage } from "../app/services/cloudinary";
type Props = {
    onSubmit: (imageUrl?: string | null) => void;
    onCancel?: () => void;
    isSaving?: boolean;
    image?: string | null;
};

export default function NewProfileModal({ onSubmit, onCancel, isSaving, image }: Props){
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const auth = useAuth();
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
        alert('Image upload failed! Please try again.');
        }
    }
    };
    const handleSubmit = () => {
        onSubmit(imageUrl ?? null);
        setImageUrl(null);
    };

    return (
        <View style={styles.backdrop}>
            <View style={styles.container}>
                <Text style={{ fontWeight: 'bold', fontSize: 20 ,marginVertical: 15, color: '#411C0E' }}>Change Profile Picture</Text>
                <View style={styles.profile}>
                    {auth.user?.profile_image ? (
                        imageUrl ? (
                            <Image
                                source={{ uri: imageUrl }}
                                style={{ width: '100%', height: '100%', borderRadius: 100}}
                            />
                        ) : (
                            <Image
                                source={{ uri: auth.user.profile_image }}
                                style={{ width: '100%', height: '100%', borderRadius: 100}}
                            />
                        )
                        ) : (
                            <IconUserFilled size={90} />
                    )}
                    <TouchableOpacity onPress={pickImage} style={styles.edit }>
                        <IconLibraryPhoto size={22} strokeWidth={2} color={'#fff'} />
                    </TouchableOpacity>
                </View>

                <View style={styles.buttonArea}>
                    <TouchableOpacity style={styles.buttonCancel} onPress={onCancel}>
                        <Text style={styles.text}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonSave} onPress={handleSubmit} disabled={isSaving}>
                        <Text style={styles.text}>{isSaving ? "Saving..." : "Save"}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#411C0E80',
    },
    container:{
        backgroundColor: '#fff',
        width: '90%',
        padding: 20,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        top: -30,
    },
    profile: {
        width: 150,
        height: 150,
        backgroundColor: '#ffffff',
        borderColor: '#411C0E',
        borderWidth: 10,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    edit: {
        position: 'absolute',
        bottom: -5,
        right: -10,
        width: 40,
        height: 40,
        borderWidth: 1,
        borderRadius: 20,
        borderColor: '#fff',
        backgroundColor: '#565656',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonArea: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
        gap: 15,
    },
    buttonSave: {
        backgroundColor: '#2FA262CC',
        padding: 10,
        width: '38%',
        borderRadius: 45,
        fontWeight: 'bold',
    },
    buttonCancel: {
        backgroundColor: '#565656CC',
        padding: 10,
        width: '38%',
        borderRadius: 45,
        fontWeight: 'bold',
    },
    text: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});
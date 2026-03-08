import { useAuth } from "@/contexts/AuthContext";
import { IconCamera, IconUserFilled } from "@tabler/icons-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
type Props = {
    onSubmit: (storename: string, name: string) => void;
    onCancel?: () => void;
    isSaving?: boolean;
};

export default function NewProfileModal({ onSubmit, onCancel, isSaving }: Props){
    const auth = useAuth();
    const [storename, setStoreName] = useState(auth.user?.storeName ?? "88 Chocolates and more");
    const [name, setName] = useState(auth.user?.name ?? "user.user");

    const handleSubmit = () => {
        onSubmit(storename, name);
    };

    return (
        <View style={styles.container}>
            <View style={styles.profile}>
                <IconUserFilled size={90} />
                <View style={styles.edit}>
                    <IconCamera size={20} color="#fff" />
                </View>
            </View>
            <View>
                <Text>Store Name:</Text>
                <View style={styles.input}>
                    <TextInput placeholder={storename} value={storename} onChangeText={setStoreName} />
                </View>
                <Text>Username:</Text>
                <View style={styles.input}>
                    <TextInput placeholder={name} value={name} onChangeText={setName} />
                </View>
            </View>
            <View style={styles.buttonArea}>
                <Pressable style={styles.buttonSave} onPress={handleSubmit} disabled={isSaving}>
                    <Text>{isSaving ? "Saving..." : "Save"}</Text>
                </Pressable>
                <Pressable style={styles.buttonCancel} onPress={onCancel}>
                    <Text>Cancel</Text>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container:{
        position: 'absolute',
        backgroundColor: '#fff',
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
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    buttonArea: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    buttonSave: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
    },
    buttonCancel: {
        backgroundColor: 'grey',
        padding: 10,
        borderRadius: 5,
    },

});
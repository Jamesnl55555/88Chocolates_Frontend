import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import EyeComponent from "./EyeComponent";
type Props = {
    onSubmit: (password: string) => void;
    onCancel?: () => void;
    isLoading: boolean;
}

export default function ConfirmCurrPassModal( { onSubmit, onCancel, isLoading }: Props ) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [password, setPassword] = useState("");
    return (
        <View style={styles.backdrop}>
            <View style={styles.container}>
            <View style={styles.header}>
                <Text style={{ fontSize: 20, fontWeight: 800, marginBottom: 9, color: '#411C0E'}}>Current Password</Text>
                <Text style={{ color: '#411C0E', fontSize: 15 }}>Please enter your previous</Text>
                <Text style={{ color: '#411C0E', fontSize: 15 }}> password from your account.</Text>
            </View>
            <View style={{width: '100%'}}>
                <Text style={{marginBottom: 5, fontWeight: 800, color: '#411C0E'}}>Password:</Text>
                <View style={styles.inputWrapper}>
                    <TextInput style={styles.input} placeholder="***********" secureTextEntry={!isPasswordVisible} onChangeText={setPassword}/>
                    <EyeComponent toggleVisibility= {() => {setIsPasswordVisible(!isPasswordVisible)}} isVisible={false} />
                </View>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.confirmbutton} onPress={() => onSubmit(password)} disabled={isLoading}>
                    <Text style={styles.text}>{isLoading ? "Confirming..." : "Continue"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelbutton} onPress={onCancel}>
                    <Text style={styles.text}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
        </View>
    )
}

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
        top: -20,
    },
    header:{
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10
    },
    input: {
        flex: 1, 
        height: 40, 
        color: "#222",
        paddingHorizontal: 3,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#411C0E",
        paddingHorizontal: 12,
        marginBottom: 10,
        width: "100%",
        height: 50,
    },
    cancelbutton: {
        width: '60%',
        backgroundColor: '#565656CC',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        padding: 12,
        marginTop: 5,
    },
    confirmbutton: {
        width: '60%',
        padding: 12,
        backgroundColor: '#411C0ECC',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        marginTop: 10,
    },
    text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 800,
        letterSpacing: 0.5,
    },
    buttonContainer:{
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    }
});
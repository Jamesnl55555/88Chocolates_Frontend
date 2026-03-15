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
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={{fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#5c3406'}}>Current Password:</Text>
                <Text>Please enter your previous</Text><Text> password from your account</Text>
            </View>
            <View style={{width: '100%'}}>
                <Text style={{marginBottom: 10, fontWeight: 'bold', color: '#5c3406'}}>Password:</Text>
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
    )
}

const styles = StyleSheet.create({
    container:{
        position: 'absolute',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        width: '90%',
    },
    header:{
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10
    },
    input: {
        flex: 1, height: 40, color: "#222"
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#ccc",
        paddingHorizontal: 12,
        marginBottom: 10,
        width: "100%",
        height: 50,
    },
    cancelbutton: {
        width: '60%',
        backgroundColor: '#aaa6a6',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        padding: 15,
        marginTop: 10
    },
    confirmbutton: {
        width: '60%',
        padding: 15,
        backgroundColor: '#55514d',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
    },
    text: {
        color: '#fff',
        fontSize: 15
    },
    buttonContainer:{
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    }
});
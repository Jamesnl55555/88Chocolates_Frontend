import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Keyboard,
    Platform,
    Pressable,
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
    error?: string | null;
}

export default function ConfirmCurrPassModal( { onSubmit, onCancel, isLoading, error }: Props ) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [password, setPassword] = useState("");

    // Animated shift for keyboard
    const contentTranslateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSub = Keyboard.addListener(showEvent, (e) => {
            const kbHeight = e.endCoordinates.height;
            Animated.timing(contentTranslateY, {
                toValue: -kbHeight / 2,
                duration: 250,
                useNativeDriver: true,
            }).start();
        });

        const hideSub = Keyboard.addListener(hideEvent, () => {
            Animated.timing(contentTranslateY, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start();
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    return (
        <View style={styles.backdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={Keyboard.dismiss} />
            <Animated.View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    transform: [{ translateY: contentTranslateY }],
                }}
            >
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
                            <EyeComponent toggleVisibility= {() => {setIsPasswordVisible(!isPasswordVisible)}} isVisible={isPasswordVisible} />
                        </View>
                        {error && <Text style={styles.error}>{error}</Text>}
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.confirmbutton]} onPress={() => onSubmit(password)} disabled={isLoading}>
                            <Text style={styles.text}>{isLoading ? "Confirming..." : "Continue"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelbutton} onPress={onCancel}>
                            <Text style={styles.text}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
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
        marginBottom: 5,
        width: "100%",
        height: 50,
    },
    cancelbutton: {
        width: 180,
        backgroundColor: '#565656CC',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        padding: 13,
        marginTop: 8,
    },
    confirmbutton: {
        width: 180,
        padding: 13,
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
    },
    error: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'left',
        fontSize: 12,
    }
});


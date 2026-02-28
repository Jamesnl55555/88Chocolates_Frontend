import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function ForgotPassModal() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Forgot Password</Text>
            <TextInput style={styles.input} placeholder="Enter your email" keyboardType="email-address" />
            <Pressable style={styles.button}>
                <Text style={styles.buttonText}>Send Reset Link</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3e1d0',
        padding: 20,
        borderRadius: 45,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#411C0E',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    }
});

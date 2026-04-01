import { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import EyeComponent from './EyeComponent';

type Props = {
    onSubmit: (password: string, passwordConfirmation: string) => void;
    onCancel?: () => void;
    isLoading: boolean;
    confirmError?: string | null;
    passwordError?: string | null;
}

export default function ChangePassModal({ onSubmit, onCancel, isLoading, confirmError, passwordError }: Props) {
    const [password, setPassword] = useState("");
    const [password_confirmation, setPasswordConfirmation] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Create New Password</Text>
                <Text>Please enter your new strong password from your account.</Text>
            </View>

            <View style={{ width: '100%' }}>
                {/* Password */}
                <Text style={styles.label}>Password:</Text>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        secureTextEntry={!isPasswordVisible}
                        onChangeText={setPassword}
                        value={password}
                    />
                    <EyeComponent
                        toggleVisibility={() => setIsPasswordVisible(!isPasswordVisible)}
                        isVisible={isPasswordVisible}
                    />
                </View>
                {passwordError && <Text style={styles.error}>{passwordError}</Text>}

                {/* Confirm Password */}
                <Text style={styles.label}>Confirm Password:</Text>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        secureTextEntry={!isConfirmVisible}
                        onChangeText={setPasswordConfirmation}
                        value={password_confirmation}
                    />
                    <EyeComponent
                        toggleVisibility={() => setIsConfirmVisible(!isConfirmVisible)}
                        isVisible={isConfirmVisible}
                    />
                </View>
                {confirmError && <Text style={styles.error}>{confirmError}</Text>}
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => onSubmit(password, password_confirmation)}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>{isLoading ? "Changing..." : "Continue"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onCancel}
                >
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        width: '90%',
    },
    header: {
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#5c3406',
    },
    label: {
        marginBottom: 8,
        fontWeight: 'bold',
        color: '#5c3406',
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
    input: {
        flex: 1,
        height: 40,
        color: "#222",
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButton: {
        width: '60%',
        padding: 15,
        backgroundColor: '#55514d',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        marginTop: 10,
    },
    cancelButton: {
        width: '60%',
        backgroundColor: '#aaa6a6',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        padding: 15,
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 15,
    },
    error: {
        color: '#ff4d4d',
        marginBottom: 8,
        fontSize: 12,
    }
});
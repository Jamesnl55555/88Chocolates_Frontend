import { validatePassword } from '@/utils/passwordValidation';
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
}
type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function ChangePassModal({ onSubmit, onCancel, isLoading }: Props) {
    const [password, setPassword] = useState("");
    const [password_confirmation, setPasswordConfirmation] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const handleRegister = () => {
        const newErrors: any = {};
        if (!password) newErrors.password = 'Password is required.';
        if (!password_confirmation)
          newErrors.confirmPassword = 'Please confirm your password.';
    
        if (password) {
          const passwordErrors = validatePassword(password);
          if (passwordErrors.length > 0) {
            newErrors.password = passwordErrors.join('\n');
          }
        }
    
        if (password && password_confirmation && password !== password_confirmation) {
          newErrors.confirmPassword = 'Passwords do not match. Please try again.';
        }
    
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return;
        }

        setErrors({});
        onSubmit(password, password_confirmation);
    };
    return (
        <View style={styles.backdrop}>
            <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Create New Password</Text>
                <Text style={{ textAlign: 'center', color: '#411C0E', paddingHorizontal: 20, marginBottom: 10 }}>
                    Please enter your new strong password from your account.
                </Text>
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
                {errors.password && (
                    <Text style={styles.error}>{errors.password}</Text>
                )}

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
                {errors.confirmPassword && (
                    <Text style={styles.error}>{errors.confirmPassword}</Text>
                )}
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleRegister}
                    disabled={isLoading || !password || !password_confirmation}
                >
                    <Text style={styles.buttonText}>{isLoading ? "Changing..." : "Change Password"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onCancel}
                >
                    <Text style={styles.buttonText}>Cancel</Text>
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
    container: {
        backgroundColor: '#fff',
        width: '90%',
        padding: 20,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        top: -20,
    },
    header: {
        marginVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 800,
        marginBottom: 10,
        color: '#411C0E',
    },
    label: {
        marginBottom: 5,
        fontWeight: 800,
        color: '#411C0E',
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#411C0E",
        paddingHorizontal: 12,
        marginBottom: 20,
        width: "100%",
        height: 50,
    },
    input: {
        flex: 1,
        height: 40,
        color: "#411C0E",
    },
    buttonContainer: {
        width: '120%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButton: {
        width: '60%',
        padding: 13,
        backgroundColor: '#411C0ECC',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        marginTop: 10,
    },
    cancelButton: {
        width: '60%',
        backgroundColor: '#565656CC',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        padding: 13,
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 800,
        letterSpacing: 0.5,
    },
    error: {
        color: '#ff4d4d',
        marginBottom: 8,
        fontSize: 12,
    }
});
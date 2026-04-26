import { validatePassword } from '@/utils/passwordValidation';
import { useEffect, useRef, useState } from 'react';
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
import EyeComponent from './EyeComponent';

type Props = {
    onSubmit: (password: string, passwordConfirmation: string) => void;
    onCancel?: () => void;
    isLoading: boolean;
}
type FormErrors = {
  password?: string;
  confirmPassword?: string;
};

export default function ChangePassModal({ onSubmit, onCancel, isLoading }: Props) {
    const [password, setPassword] = useState("");
    const [password_confirmation, setPasswordConfirmation] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

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

    const isButtonDisabled = isLoading || !password || !password_confirmation;

    const validatePasswordField = (value: string) => {
        if (!value) {
            return 'Password is required.';
        }
        const passwordErrors = validatePassword(value);
        if (passwordErrors.length > 0) {
            return passwordErrors.join('\n');
        }
        return undefined;
    };

    const validateConfirmPasswordField = (pass: string, confirm: string) => {
        if (!confirm) {
            return 'Please confirm your password.';
        }
        if (pass && confirm && pass !== confirm) {
            return 'Passwords do not match. Please try again.';
        }
        return undefined;
    };

    const handlePasswordBlur = () => {
        const error = validatePasswordField(password);
        setErrors((prev) => ({ ...prev, password: error }));

        // Also re-validate confirm password if it already has a value
        if (password_confirmation) {
            const confirmError = validateConfirmPasswordField(password, password_confirmation);
            setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
        }
    };

    const handleConfirmPasswordBlur = () => {
        const error = validateConfirmPasswordField(password, password_confirmation);
        setErrors((prev) => ({ ...prev, confirmPassword: error }));
    };

    const handleRegister = () => {
        const newErrors: FormErrors = {};

        const passwordError = validatePasswordField(password);
        if (passwordError) newErrors.password = passwordError;

        const confirmError = validateConfirmPasswordField(password, password_confirmation);
        if (confirmError) newErrors.confirmPassword = confirmError;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        onSubmit(password, password_confirmation);
    };

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
                        <Text style={styles.headerTitle}>Create New Password</Text>
                        <Text style={{ textAlign: 'center', color: '#411C0E', paddingHorizontal: 20, marginBottom: 10 }}>
                            Please enter your new strong password from your account.
                        </Text>
                    </View>

                    <View style={{ width: '100%' }}>
                        {/* Password */}
                        <Text style={styles.label}>Password:</Text>
                        <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                secureTextEntry={!isPasswordVisible}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    setErrors((prev) => ({ ...prev, password: undefined }));
                                }}
                                onBlur={handlePasswordBlur}
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
                        <Text style={[styles.label, {marginTop: 15}]}>Confirm Password:</Text>
                        <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                secureTextEntry={!isConfirmVisible}
                                onChangeText={(text) => {
                                    setPasswordConfirmation(text);
                                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                                }}
                                onBlur={handleConfirmPasswordBlur}
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

                    <View style={[styles.buttonContainer]}>
                        <TouchableOpacity
                            style={[styles.confirmButton, isButtonDisabled && styles.confirmButtonDisabled,]}
                            onPress={handleRegister}
                            disabled={isButtonDisabled}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.buttonText}>{isLoading ? "Changing..." : "Change Password"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onCancel}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
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
        marginBottom: 3,
        width: "100%",
        height: 50,
    },
    inputError: {
        borderColor: 'red',
    },
    input: {
        flex: 1,
        height: 40,
        color: "#411C0E",
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10
    },
    confirmButton: {
        width: 180,
        padding: 13,
        backgroundColor: '#411C0ECC',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        marginTop: 10,
    },
    confirmButtonDisabled: {
        opacity: 0.5,
    },
    cancelButton: {
        width: 180,
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
        fontSize: 12,
    }
});


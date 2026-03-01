import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import EyeComponent from "./EyeComponent";

type Props = {
  email: string;
  code: string;
  onSubmit: (password: string, password_confirmation: string) => void;
  isLoading: boolean;
  onCancel?: () => void;
  confirmError?: string | null;
  passwordError?: string | null;
};

export default function ResetPasswordModal({
  email,
  code,
  onSubmit,
  isLoading,
  onCancel,
  confirmError,
  passwordError,
}: Props) {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const handlePress = () => {
    if (!password || !passwordConfirmation) return alert("Please fill both fields");
    if (password !== passwordConfirmation) return alert("Passwords do not match");
    onSubmit(password, passwordConfirmation);
  };

  return (
    <View style={styles.modalOverlay}>
      {/* Dismiss keyboard on background press */}
      <Pressable style={StyleSheet.absoluteFill} onPress={Keyboard.dismiss} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        style={styles.modalContainer}
      >
        <Text style={styles.title}>Create New Password</Text>
        <Text style={styles.subtitle}>Please enter your new password</Text>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            secureTextEntry={!isPasswordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <EyeComponent toggleVisibility={() => setIsPasswordVisible(!isPasswordVisible)} isVisible={isPasswordVisible} />
        </View>
        {passwordError && <Text style={styles.error}>{passwordError}</Text>}

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry={!isConfirmPasswordVisible}
            value={passwordConfirmation}
            onChangeText={setPasswordConfirmation}
          />
          <EyeComponent toggleVisibility={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} isVisible={isConfirmPasswordVisible} />
        </View>
        {confirmError && <Text style={styles.error}>{confirmError}</Text>}

        <Pressable style={styles.button} onPress={handlePress} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? "Resetting..." : "Change Password"}</Text>
        </Pressable>

        {onCancel && (
          <Pressable style={styles.cancelContainer} onPress={onCancel}>
            <Text style={styles.cancelText}>Back to login</Text>
          </Pressable>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 1000,
  },
  modalContainer: {
    width: 320,
    minHeight: 350,
    maxHeight: 420,
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 25,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 14, color: "#333", textAlign: "center", marginBottom: 15 },
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
  input: { flex: 1, height: 40, color: "#222" },
  error: { color: "#a34e09", marginBottom: 10, fontSize: 12, alignSelf: "flex-start" },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#411C0E",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  cancelContainer: { width: "100%", alignItems: "center", marginTop: 5 },
  cancelText: { color: "#3c0af0", fontWeight: "600" },
});
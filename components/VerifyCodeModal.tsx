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

type Props = {
  email: string;
  onSubmit: (code: string) => void;
  isLoading: boolean;
  onCancel?: () => void;
};

export default function VerifyCodeModal({ email, onSubmit, isLoading, onCancel }: Props) {
  const [code, setCode] = useState("");

  const handlePress = () => {
    if (!code) return alert("Please enter the code sent to your email");
    onSubmit(code);
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
        <Text style={styles.title}>Verify Code</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to {email}</Text>

        <TextInput
          style={styles.input}
          placeholder="123456"
          keyboardType="number-pad"
          value={code}
          onChangeText={setCode}
          maxLength={6}
          returnKeyType="done"
        />

        <Pressable style={styles.button} onPress={handlePress} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? "Verifying..." : "Verify Code"}</Text>
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
    minHeight: 250,
    maxHeight: 350,
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
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 15,
    fontSize: 18,
    letterSpacing: 4,
    textAlign: "center",
    marginBottom: 20,
  },
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
  cancelContainer: { width: "100%", alignItems: "center" },
  cancelText: { color: "#3c0af0", fontWeight: "600" },
});
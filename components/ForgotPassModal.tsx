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
  onSubmit: (email: string) => void;
  onCancel?: () => void;
  isLoading: boolean;
};

export default function ForgotPassModal({ onSubmit, onCancel, isLoading }: Props) {
  const [email, setEmail] = useState("");

  const handlePress = () => {
    if (!email) return alert("Please enter your email");
    onSubmit(email);
  };

  return (
    <View style={styles.modalOverlay}>
      {/* Background to dismiss keyboard */}
      <Pressable style={StyleSheet.absoluteFill} onPress={Keyboard.dismiss} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0} // adjust if modal top changes
        style={styles.modalContainer}
      >
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.description}>
          Please enter your verified email address from your account.
        </Text>

        <Text style={styles.subheading}>E-mail:</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="user@example.com"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            returnKeyType="done"
          />
        </View>

        <Pressable
          style={styles.button}
          onPress={handlePress}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Sending..." : "Send Verification"}
          </Text>
        </Pressable>

        {onCancel && (
          <Pressable style={styles.cancelContainer} onPress={onCancel}>
            <Text style={styles.cancelButton}>Back to login</Text>
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
    width: 345,
    minHeight: 350,
    maxHeight: 420,
    backgroundColor: "#fff",
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 10,
    paddingHorizontal: 10, 
    marginTop: '7%',
    color: '#411C0E',
  },
  description: { 
    fontSize: 15, 
    color: "#411C0E", 
    textAlign: "center", 
    marginBottom: 15,
    paddingHorizontal: 10, 
  },
  subheading: {
    fontSize: 16,
    fontWeight: "900",
    color: "#411C0E",
    marginTop: 10,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  inputWrapper: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 45,
    borderColor: "#411C0E",
    borderWidth: 1,
    marginBottom: 15,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  input: { 
    width: "100%", 
    height: 40, 
    color: "#565656"
  },
  button: {
    width: "60%",
    height: 50,
    backgroundColor: "#411C0E",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 7,
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelContainer: { 
    width: "60%", 
    alignItems: "center", 
    marginTop: 5 
  },
  cancelButton: { 
    color: "#1A00FF", 
    fontWeight: "600",
  },
});
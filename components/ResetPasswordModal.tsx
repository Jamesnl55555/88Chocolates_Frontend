import { validatePassword } from "@/utils/passwordValidation";
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
import AlertModal from "./AlertModal";
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
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertHeader, setAlertHeader] = useState("");
  const [pError, setPError] = useState<string | null>(null);

  const handlePress = () => {
    if (!password || !passwordConfirmation) {
      setAlertHeader("Error");
      setAlertMessage("Please fill both fields.");
      setAlertVisible(true);
      return;
    }
    if (password !== passwordConfirmation) {
      setAlertHeader("Error");
      setAlertMessage("Passwords do not match.");
      setAlertVisible(true);
      return;
    }
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setPError(passwordErrors.join("\n"));
      return;
    }
    
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
        <Text style={styles.subtitle}>Please enter your new password.</Text>

        <Text style={styles.label}>Password:</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            secureTextEntry={!isPasswordVisible}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPError(null);
            }}
          />
          <EyeComponent toggleVisibility={() => setIsPasswordVisible(!isPasswordVisible)} isVisible={isPasswordVisible} />
        </View>
        {pError && <Text style={styles.error}>{pError}</Text>}

        <Text style={styles.label}>Confirm Password:</Text>
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

      {alertVisible && (
        <View style={styles.modalOverlay}>
          <AlertModal
            message={alertMessage}
            headertext={alertHeader}
            onConfirm={() => setAlertVisible(false)}
          />
        </View>
      )}
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
    width: '90%',
    minHeight: 350,
    flexGrow: 0,
    backgroundColor: "#fff",
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 17,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  title: { 
    fontSize: 21, 
    fontWeight: "800", 
    marginTop: 15, 
    marginBottom: 7,
    color: '#411C0E',
  },
  subtitle: { 
    fontSize: 15, 
    color: '#411C0E',
    textAlign: "center", 
    marginBottom: 21, 
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
  label: {
    fontWeight: "800",
    color: '#411C0E',
    marginRight: 10,
    alignSelf: "flex-start",
    marginBottom: 3,
  },
  input: { 
    flex: 1, 
    height: 40, 
    color: "#222" 
  },
  error: { 
    color: "#a34e09", 
    marginBottom: 10, 
    fontSize: 12, 
    alignSelf: "flex-start" 
  },
  button: {
    width: "60%",
    height: 50,
    backgroundColor: "#411C0ECC",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 7,
    marginTop: 10,
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "800",
    fontSize: 15,
  },
  cancelContainer: { 
    width: "100%", 
    alignItems: "center", 
    marginTop: 5 
  },
  cancelText: { 
    color: "#3c0af0", 
    fontWeight: "600" 
  },
  alertOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
});

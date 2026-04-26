import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
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
  emailError?: string | null;
};

export default function ForgotPassModal({ onSubmit, onCancel, isLoading, emailError }: Props) {
  const [email, setEmail] = useState("");
  const [emptyError, setEmptyError] = useState<string | null>(null);

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

  const handlePress = () => {
    if (!email.trim()) {
      setEmptyError("Please enter your email.");
      return;
    }
    setEmptyError(null);
    onSubmit(email);
  };

  return (
    <View style={styles.modalOverlay}>
      {/* Background to dismiss keyboard */}
      <Pressable style={StyleSheet.absoluteFill} onPress={Keyboard.dismiss} />

      <Animated.View
        style={[
          styles.modalContainer,
          { 
          justifyContent: 'center',
          alignItems: 'center',
          transform: [{ translateY: contentTranslateY }] },
        ]}
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

        {(emptyError || emailError) && (
          <Text style={styles.error}>{emptyError || emailError}</Text>
        )}

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={handlePress}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Sending..." : "Send Verification"}
          </Text>
        </Pressable>

        {onCancel && (
          <Pressable style={({ pressed }) => [styles.cancelContainer, pressed && styles.buttonPressed]} onPress={onCancel}>
            <Text style={styles.cancelButton}>Back to login</Text>
          </Pressable>
        )}
      </Animated.View>
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
    maxHeight: 450,
    backgroundColor: "#fff",
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    marginBottom: 10,
    paddingHorizontal: 10,
    marginTop: '6%',
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
    marginBottom: 3,
    alignSelf: "flex-start",
  },
  inputWrapper: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 45,
    borderColor: "#411C0E",
    borderWidth: 1,
    marginBottom: 5,
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
    backgroundColor: "#411C0ECC",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 7,
  },
  buttonPressed: {
    opacity: 0.6,
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
    marginBottom: 2,
  },
  error: {
    color: 'red',
    fontSize: 12,
    alignSelf: "flex-start"
  },
});

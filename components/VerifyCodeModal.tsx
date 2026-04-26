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
  email: string;
  onSubmit: (code: string) => void;
  isLoading: boolean;
  onCancel?: () => void;
  onResend?: () => void;
};

export default function VerifyCodeModal({ email, onSubmit, isLoading, onCancel, onResend }: Props) {
  const [code, setCode] = useState("");
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(30);

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

  useEffect(() => {
  let interval: any;

  if (!canResend) {
    interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
  }

  return () => clearInterval(interval);
  }, [canResend]);

  useEffect(() => {
    setCode('');
  }, [email]);

  useEffect(() => {
    if (code.length === 6) {
      handlePress();
    }
  }, [code]);
  const handlePress = () => {
    if (!code) return alert("Please enter the code sent to your email.");
    onSubmit(code);
  };

  return (
    <View style={styles.modalOverlay}>
      {/* Dismiss keyboard on background press */}
      <Pressable style={StyleSheet.absoluteFill} onPress={Keyboard.dismiss} />

      <Animated.View
        style={[
          styles.modalContainer,
          { transform: [{ translateY: contentTranslateY }] },
        ]}
      >
        <Text style={styles.title}>Verify Code</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to {email}</Text>

        <Text style={styles.subheading}>Code:</Text>
        <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="123456"
              keyboardType="number-pad"
              value={code}
              onChangeText={(text) => setCode(text.replace(/[^0-9]/g, ''))}
              maxLength={6}
              returnKeyType="done"
            />
        </View>
        

        <Pressable style={styles.button} onPress={handlePress} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? "Verifying..." : "Verify Code"}</Text>
        </Pressable>

        <Pressable
          style={styles.resendButton}
          onPress={() => {
            if (!canResend) return;

            onResend?.();
            setCanResend(false);
            setTimer(30);
          }}
        >
          <Text style={[styles.resendText, { opacity: canResend ? 1 : 0.5 }]}>
            {canResend ? "Resend Code" : `Resend in ${timer}s`}
          </Text>
        </Pressable>

        {onCancel && (
          <Pressable style={styles.cancelContainer} onPress={onCancel}>
            <Text style={styles.cancelButton}>Cancel</Text>
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
    width: 360,
    minHeight: 350,
    maxHeight: 420,
    backgroundColor: "#fff",
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingTop: 15,
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
  subtitle: {
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
    color: "#565656",
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
    marginVertical: 5
  },
  cancelButton: {
    color: "#B00B0BCC",
    fontWeight: "600",
  },
  resendButton: {
    marginTop: 10,
    marginBottom: 5,
  },
  resendText: {
    color: "#1A00FF",
    fontWeight: "600",
  },
});

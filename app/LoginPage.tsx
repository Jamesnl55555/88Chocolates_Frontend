import CheckboxComponent from '@/components/CheckboxComponent';
import EyeComponent from '@/components/EyeComponent';
import ForgotPassModal from '@/components/ForgotPassModal';
import ResetPasswordModal from '@/components/ResetPasswordModal';
import VerifyCodeModal from '@/components/VerifyCodeModal';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import api from './services/api';

export default function LoginPage() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const router = useRouter();
  const auth = useAuth();

  // Modal states
  const [forgotPassVisible, setForgotPassVisible] = useState(false);
  const [verifyCodeVisible, setVerifyCodeVisible] = useState(false);
  const [resetPasswordVisible, setResetPasswordVisible] = useState(false);
  const [emailForReset, setEmailForReset] = useState('');
  const [code, setCode] = useState('');
  const [rememberMeChecked, setRememberMeChecked] = useState(false);

  // Error states
  const [fillError, setFillError] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [resetConfirmPassError, setResetConfirmPassError] = useState<string | null>(null);
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);

  // Animated shift for keyboard
  const contentTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!auth.restoring && auth.isAuthenticated) {
      router.replace('/Dashboard');
    }
  }, [auth.restoring, auth.isAuthenticated]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      if (forgotPassVisible || verifyCodeVisible || resetPasswordVisible) return;

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
  }, [forgotPassVisible, verifyCodeVisible, resetPasswordVisible]);

  // Toggle functions
  const togglePasswordVisibility = () => setPasswordVisible(prev => !prev);
  const toggleForgotPassVisible = () => setForgotPassVisible(prev => !prev);

  // LOGIN MUTATION
  const loginMutation = useMutation({
    mutationFn: ({ email, pass }: { email: string; pass: string }) =>
      api.post('/api/login', { email, password: pass, remember: rememberMeChecked }).then(res => res.data),
    onSuccess: async (data) => {
      setEmailError(null);
      setPasswordError(null);
      await auth.signIn(data.token, data.user);
      router.push('/Dashboard');
    },
    onError: (error: any) => {
      const errors = error.response?.data?.errors;
      setEmailError(errors?.email?.[0] ?? 'Invalid email');
      setPasswordError(errors?.password?.[0] ?? 'Invalid password');
    },
  });

  const handleLogin = () => {
    if (!email || !pass) {
      setFillError('Please fill in all fields');
      return;
    }
    loginMutation.mutate({ email, pass });
  };

  // FORGOT PASSWORD MUTATION
  const forgotPassMutation = useMutation({
    mutationFn: (email: string) => api.post('/api/forgot-password', { email }).then(res => res.data),
    onSuccess: (_, variables) => {
      setEmailForReset(variables);
      setForgotPassVisible(false);
      setVerifyCodeVisible(true);
    },
    onError: (error: any) => alert(error.response?.data?.message ?? 'Failed to send reset code.'),
  });

  // VERIFY CODE MUTATION
  const verifyCodeMutation = useMutation({
    mutationFn: (code: string) => api.post('/api/verify-code', { email: emailForReset, code }).then(res => res.data),
    onSuccess: (_, inputCode) => {
      setVerifyCodeVisible(false);
      setCode(inputCode);
      setResetPasswordVisible(true);
    },
    onError: () => alert('Invalid code. Try again.'),
  });

  // RESET PASSWORD MUTATION
  type ResetPasswordPayload = { password: string; password_confirmation: string };
  const resetPasswordMutation = useMutation({
    mutationFn: ({ password, password_confirmation }: ResetPasswordPayload) =>
      api.post('/api/reset-password', { email: emailForReset, code, password, password_confirmation }).then(res => res.data),
    onSuccess: () => {
      alert('Password reset successful!');
      setResetPasswordVisible(false);
    },
    onError: () => {
      setResetConfirmPassError('Invalid confirmation');
      setResetPasswordError('Invalid password');
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#f3e1d0' }}>
      <Animated.View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          transform: [{ translateY: contentTranslateY }],
        }}
      >
        {/* Logo */}
        <View style={styles.logo}>
          <View style={styles.badge}>
            <Image source={require('../assets/images/logo.png')} style={styles.logoImage} />
          </View>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>E-mail:</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="user@example.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {emailError && <Text style={styles.error}>{emailError}</Text>}
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={styles.label}>Password:</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                value={pass}
                onChangeText={setPass}
                secureTextEntry={!passwordVisible}
              />
              <EyeComponent toggleVisibility={togglePasswordVisibility} isVisible={passwordVisible} />
            </View>
            {passwordError && <Text style={styles.error}>{passwordError}</Text>}
          </View>

          {/* Remember + Forgot */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <View style={styles.checkboxContainer}>
              <CheckboxComponent isChecked={rememberMeChecked} />
              <Text style={styles.checkboxText}> Remember Me</Text>
            </View>
            <Pressable onPress={toggleForgotPassVisible}>
              <Text style={styles.forgotPass}>Forgot Password?</Text>
            </Pressable>
          </View>

          {/* Login Button */}
          <Pressable style={styles.loginButton} onPress={handleLogin} disabled={loginMutation.isPending}>
            <Text style={styles.buttonText}>{loginMutation.isPending ? 'Logging in...' : 'LOG IN'}</Text>
          </Pressable>

          {/* Footer */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12 }}>
            <Text style={styles.text}>Don&apos;t have an account?</Text>
            <Link href="/RegisterPage" asChild>
              <Text style={styles.registerLink}>Sign Up</Text>
            </Link>
          </View>

          {fillError && <Text style={{ color: '#e20505', alignSelf: 'center' }}>{fillError}</Text>}
        </View>
      </Animated.View>

      {/* Modals */}
      {forgotPassVisible && (
        <ForgotPassModal
          onSubmit={(email) => forgotPassMutation.mutate(email)}
          isLoading={forgotPassMutation.isPending}
          onCancel={() => setForgotPassVisible(false)}
        />
      )}
      {verifyCodeVisible && (
        <VerifyCodeModal
          email={emailForReset}
          onSubmit={(code) => verifyCodeMutation.mutate(code)}
          isLoading={verifyCodeMutation.isPending}
          onCancel={() => setVerifyCodeVisible(false)}
        />
      )}
      {resetPasswordVisible && (
        <ResetPasswordModal
          email={emailForReset}
          code={code}
          onSubmit={(password, password_confirmation) =>
            resetPasswordMutation.mutate({ password, password_confirmation })
          }
          isLoading={resetPasswordMutation.isPending}
          onCancel={() => setResetPasswordVisible(false)}
          confirmError={resetConfirmPassError}
          passwordError={resetPasswordError}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { 
    marginBottom: 50, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  badge: { 
    width: 160, 
    height: 96, 
    backgroundColor: '#f3e1d0', 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  logoImage: { 
    width: 270, 
    height: 180 
  },
  card: {
    width: '90%',
    maxWidth: 700,
    backgroundColor: '#411C0E',
    borderRadius: 50,
    padding: 24,
    paddingTop: 30,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 5,
  },
  field: { 
    marginVertical: 10 
  },
  label: { 
    color: '#fff', 
    fontWeight: '700', 
    marginBottom: 8, 
    letterSpacing: 0.2 
  },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    paddingHorizontal: 12 
  },
  input: { 
    flex: 1, 
    height: 40, 
    color: '#222' 
  },
  error: { 
    color: 'red', 
    marginTop: 10, 
    fontSize: 12, 
    alignSelf: 'center',
  },
  registerLink: { 
    color: '#6251FF', 
    fontWeight: '500', 
    marginLeft: 4 
  },
  text: { 
    color: '#fff' 
  },
  loginButton: { 
    marginTop: 10, 
    backgroundColor: '#f1dfcf', 
    paddingVertical: 12, 
    borderRadius: 24, 
    alignItems: 'center', 
    width: '85%',
    alignSelf: 'center',
  },
  buttonText: { 
    color: '#411C0E', 
    fontWeight: '900', 
    letterSpacing: 0.5 
  },
  checkboxText: { 
    color: '#fff', 
  },
  checkboxContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  forgotPass: { 
    color: '#fff', 
    textAlign: 'right' 
  },
  modalOverlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.3)', 
    zIndex: 1000 
  },

  
});
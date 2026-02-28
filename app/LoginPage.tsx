import CheckboxComponent from '@/components/CheckboxComponent';
import EyeComponent from '@/components/EyeComponent';
import ForgotPassModal from '@/components/ForgotPassModal';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
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
  const [forgotPassVisible, setForgotPassVisible] = useState(false);
  const forgotPassMutation = useMutation({
    mutationFn: (email: string) => {
      return api.post('/api/forgot-password', { email }).then(res => res.data);
    },
    onSuccess: (data) => {
      alert('If an account with that email exists, a reset link has been sent.');
    },
    onError: (error) => {
      console.error('Forgot password request failed', error);
      alert('Failed to send reset link. Please try again later.');
    }
  });
  // Redirect if already authenticated
  React.useEffect(() => {
    if (!auth.restoring && auth.isAuthenticated) {
      router.replace('/Dashboard');
    }
  }, [auth.restoring, auth.isAuthenticated]);

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  const toggleForgotPassVisible = () => setForgotPassVisible(!forgotPassVisible);

  const loginMutation = useMutation({
    mutationFn: ({ email, pass }: { email: string; pass: string }) =>
      api.post('/api/login', { email, password: pass, remember: false }).then(res => res.data),
    onSuccess: async (data) => {
      if (!data || !data.token) {
        console.error('Login succeeded but no token returned', data);
        return;
      }
      const serverUser = data.user ?? (data.email ? { email: data.email } : null);
      await auth.signIn(data.token, serverUser);
      router.push('/Dashboard');
    },
    onError: (error) => console.error('Login failed', error),
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {/* Logo */}
      <View style={styles.logo}>
        <View style={styles.badge}>
          <Image source={require('../assets/images/logo.png')} style={styles.logoImage} />
        </View>
      </View>

      {/* Card */}
      <View style={styles.card}>
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
        </View>

        {/* Password Field */}
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
            <Pressable style={styles.eyeIcon} onPress={togglePasswordVisibility}>
              <EyeComponent />
            </Pressable>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <View style={styles.checkboxContainer}>
            <CheckboxComponent/>
            <Text style={styles.checkboxText}> Remember Me</Text>
          </View>
          <Pressable onPress={toggleForgotPassVisible}>
            <Text style={styles.forgotPass}>
              Forgot Password?
            </Text>
          </Pressable>
        </View>

        {/* Buttons */}
        <View>
          <Pressable
          style={styles.loginButton}
          onPress={() => loginMutation.mutate({ email, pass })}
          disabled={loginMutation.isPending}
          >
          <Text style={styles.buttonText}>
          {loginMutation.isPending ? 'Logging in...' : 'LOG IN'}</Text>
          </Pressable>
        </View>
        

        <Link href="/RegisterPage" asChild>
          <Text style={styles.registerLink}>
            Don't have an account? Sign Up
          </Text>
        </Link>

        {loginMutation.isError && <Text style={styles.error}>Login failed. Please try again.</Text>}
      </View>
      {forgotPassVisible ? (
        <View style={styles.forgotPassModal}>
          <ForgotPassModal />
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3e1d0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  logo: {
    marginBottom: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    width: 160,
    height: 96,
    backgroundColor: '#f3e1d0',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 270,
    height: 180,
  },
  card: {
    width: '100%',
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
    marginVertical: 10,
  },
  label: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 40,
    color: '#222',
  },
  eyeIcon: {
    padding: 6,
    marginLeft: 6,
  },
  error: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
  registerLink: {
    color: '#6251FF',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  loginButton: {
    marginTop: 20,
    backgroundColor: '#f1dfcf',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#411C0E',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  checkboxText: {
    color: '#fff',
    marginLeft: 2,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forgotPass: {
    color: '#fff',
    textAlign: 'right',
  },
  forgotPassModal: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

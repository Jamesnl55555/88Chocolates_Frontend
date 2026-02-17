import EyeComponent from '@/components/EyeComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from '@tanstack/react-query';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Button,
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

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  const loginMutation = useMutation({
    mutationFn: ({ email, pass }: { email: string; pass: string }) =>
      api.post('/api/login', { email, password: pass, remember: false }).then(res => res.data),
    onSuccess: async (data) => {
      if (data.token) await AsyncStorage.setItem('userToken', data.token);
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
          <Image source={require('../assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
        </View>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <View style={styles.grab} />

        {/* Email Field */}
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

        {/* Buttons */}
        <Button
          title={loginMutation.isPending ? 'Logging in...' : 'LOG IN'}
          onPress={() => loginMutation.mutate({ email, pass })}
          disabled={loginMutation.isPending}
          color="#f1dfcf"
        />

        <Link href="/RegisterPage" style={styles.registerLink}>
          Don't have an account? Sign Up
        </Link>

        {loginMutation.isError && <Text style={styles.error}>Login failed. Please try again.</Text>}
      </View>
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
    marginBottom: -50,
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
    width: 140,
    height: 80,
  },
  card: {
    width: '100%',
    maxWidth: 700,
    backgroundColor: '#411C0E',
    borderRadius: 50,
    padding: 24,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 5,
  },
  grab: {
    width: 40,
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 999,
    marginBottom: 20,
    alignSelf: 'center',
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
});

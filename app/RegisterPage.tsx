import EyeComponent from '@/components/EyeComponent';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation } from '@tanstack/react-query';
import axios from "axios";
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import api from './services/api';

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const auth = useAuth();

  React.useEffect(() => {
    if (!auth.restoring && auth.isAuthenticated) {
      router.replace('/Dashboard');
    }
  }, [auth.restoring, auth.isAuthenticated]);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const registerMutation = useMutation({
    mutationFn: ({ name, email, password, confirmPassword }: { name: string; email: string; password: string; confirmPassword: string }) => {
      return api.post('/api/register', { name, email, password, password_confirmation: confirmPassword, remember: false }).then(res => res.data);
    },
    onSuccess: (data) => {
      console.log('Registered!', data);
      router.push('/LoginPage');
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data;
        alert(
          "Status: " + (status ?? "No status") +
          "\nMessage: " + JSON.stringify(data ?? "No response data")
        );
      } else {
        alert("Unexpected error occurred");
      }
    }
  });

  const handleRegister = () => {
    if (!name || !email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    registerMutation.mutate({ name, email, password, confirmPassword });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {/* Logo badge */}
      <View style={styles.logo}>
        <View style={styles.badge}>
          <Image source={require('../assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
        </View>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <View style={styles.grab} />

        {/* Username */}
        <View style={styles.field}>
          <Text style={styles.label}>Username:</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="user.user"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

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
        </View>

        {/* Password */}
        <View style={styles.field}>
          <Text style={styles.label}>Password:</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry={!passwordVisible}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable style={styles.eyeIcon} onPress={togglePasswordVisibility}>
              <EyeComponent />
            </Pressable>
          </View>
        </View>

        {/* Confirm Password */}
        <View style={styles.field}>
          <Text style={styles.label}>Confirm Password:</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor="#999"
              secureTextEntry={!confirmPasswordVisible}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <Pressable style={styles.eyeIcon} onPress={toggleConfirmPasswordVisibility}>
              <EyeComponent />
            </Pressable>
          </View>
        </View>

        {/* Register Button */}
        <Button
          title={registerMutation.isPending ? "Registering..." : "SIGN UP"}
          onPress={handleRegister}
          color="#f1dfcf"
        />

        {/* Footer */}
        <Text style={styles.footer}>
          Already have an account? <Link href="/LoginPage" style={styles.link}>Log In</Link>
        </Text>

        {registerMutation.isError && <Text style={styles.error}>Registration failed. Please try again.</Text>}
      </View>
    </KeyboardAvoidingView>
  );
};

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
  footer: {
    marginTop: 12,
    textAlign: 'center',
    color: '#fff',
    fontSize: 13,
  },
  link: {
    color: '#6251FF',
    fontWeight: '500',
  },
  error: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default RegisterPage;

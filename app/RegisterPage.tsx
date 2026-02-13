import EyeComponent from '@/components/EyeComponent';
import { useMutation } from '@tanstack/react-query';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import api from './services/api'; // Your Axios instance
import axios from "axios";

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  // Define the mutation
  const registerMutation = useMutation({
    mutationFn: ({ name, email, password, confirmPassword }: { name: string; email: string; password: string; confirmPassword: string }) => {
      return api.post('/api/register', { name, email, password, password_confirmation: confirmPassword, remember: false }).then(res => res.data);
    },
    onSuccess: (data) => {
      console.log('Registered!', data);
      console.log("API URL:", process.env.EXPO_PUBLIC_API_URL);

      // Navigate to login page
      router.push('/LoginPage');
    },
    onError: (error: unknown) => {
    console.log("API URL:", process.env.EXPO_PUBLIC_API_URL);

    if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    console.log("Status:", status);
    console.log("Data:", data);

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
    // Basic validations
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
      <Text style={styles.title}>Create Account</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!passwordVisible}
        />
        <Pressable style={styles.eyeIcon} onPress={togglePasswordVisibility}>
          <EyeComponent />
        </Pressable>
      </View>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!confirmPasswordVisible}
        />
        <Pressable style={styles.eyeIcon} onPress={toggleConfirmPasswordVisibility}>
          <EyeComponent />
        </Pressable>
      </View>
      
      <Button
        title={registerMutation.isPending ? "Registering..." : "Register"}
        onPress={handleRegister}
        disabled={registerMutation.isPending}
      />
      <Link href="/LoginPage">Already have an account? Login</Link>
      {registerMutation.isError && <Text style={styles.error}>Registration failed. Please try again.</Text>}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  error: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default RegisterPage;
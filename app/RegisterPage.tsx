import { useMutation } from '@tanstack/react-query';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import api from './services/api'; // Your Axios instance

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Define the mutation
  const registerMutation = useMutation({
    mutationFn: ({ name, email, password, confirmPassword }: { name: string; email: string; password: string; confirmPassword: string }) => {
      return api.post('/api/register', { name, email, password, password_confirmation: confirmPassword, remember: false }).then(res => res.data);
    },
    onSuccess: (data) => {
      console.log('Registered!', data);
      // Navigate to login page
      router.push('/LoginPage');
    },
    onError: (error) => {
      console.error('Registration failed', error);
      // Handle error, e.g., show alert
      alert('Registration failed. Please try again.');
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
    <View style={styles.container}>
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
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      <Button
        title={registerMutation.isPending ? "Registering..." : "Register"}
        onPress={handleRegister}
        disabled={registerMutation.isPending}
      />
      <Link href="/LoginPage">Already have an account? Login</Link>
      {registerMutation.isError && <Text style={styles.error}>Registration failed. Please try again.</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
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
  error: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default RegisterPage;
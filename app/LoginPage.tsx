import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from '@tanstack/react-query';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import api from './services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const router = useRouter();
  // Define the mutation
  const loginMutation = useMutation({
    mutationFn: ({ email, pass }: { email: string; pass: string }) => {
      return api.post('/api/login', { email, password: pass, remember: false }).then(res => res.data);
    },
    onSuccess: async (data) => {
      console.log('Logged in!', data);
      // Store the token
      if (data.token) {
        await AsyncStorage.setItem('userToken', data.token);
      }
      router.push('/Dashboard');
    },
    onError: (error) => {
      console.error('Login failed', error);
      // Handle error, e.g., show alert
    }
  });

  return (
    <View style={styles.container}>
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
        value={pass}
        onChangeText={setPass}
        secureTextEntry
      />
      <Button
        title={loginMutation.isPending ? "Logging in..." : "Login"}
        onPress={() => loginMutation.mutate({ email, pass })}
        disabled={loginMutation.isPending}
      />
      <Link href="/RegisterPage">Don't have an account? Register</Link>
      {loginMutation.isError && <Text style={styles.error}>Login failed. Please try again.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
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
  },
});
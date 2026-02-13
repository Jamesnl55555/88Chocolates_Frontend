import EyeComponent from '@/components/EyeComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from '@tanstack/react-query';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Button, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import api from './services/api';

export default function LoginPage() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const router = useRouter();
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
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
          value={pass}
          onChangeText={setPass}
          secureTextEntry={!passwordVisible}
        />
        <Pressable style={styles.eyeIcon} onPress={togglePasswordVisibility}>
          <EyeComponent />
        </Pressable>
      </View>
      
      <Button
        title={loginMutation.isPending ? "Logging in..." : "Login"}
        onPress={() => loginMutation.mutate({ email, pass })}
        disabled={loginMutation.isPending}
      />
      <Link href="/RegisterPage">Don't have an account? Register</Link>
      {loginMutation.isError && <Text style={styles.error}>Login failed. Please try again.</Text>}
    </KeyboardAvoidingView>
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
  },
});
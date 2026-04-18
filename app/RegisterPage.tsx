import EyeComponent from '@/components/EyeComponent';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import api from './services/api';

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const auth = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (!auth.restoring && auth.isAuthenticated) {
      router.replace('/HomePage');
    }
  }, [auth.restoring, auth.isAuthenticated]);

  const registerMutation = useMutation({
    mutationFn: ({ name, email, password, confirmPassword }: any) => api.post('/api/register', { name, email, password, password_confirmation: confirmPassword }).then(res => res.data),
    onSuccess: () => router.push('/LoginPage'),
    onError: (error: any) => {
      if (!error.response) {
        alert('Network error. Please try again.');
        return;
      }

      const backendErrors = error.response?.data?.errors || {};
      setErrors({
        name: backendErrors?.name?.[0],
        email: backendErrors?.email?.[0],
        password: backendErrors?.password?.[0],
        confirmPassword: backendErrors?.password_confirmation?.[0],
      });
    },
  });

  const validatePassword = (password: string) => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Must be at least 8 characters.');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Must contain at least one uppercase letter.');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Must contain at least one lowercase letter.');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Must contain at least one number.');
    }

    return errors;
  };
  const handleRegister = () => {
    const newErrors: any = {};

    if (!name.trim()) newErrors.name = 'Username is required.';
    if (!email.trim()) newErrors.email = 'E-mail is required.';
    if (!password) newErrors.password = 'Password is required.';
    if (!confirmPassword)
      newErrors.confirmPassword = 'Please confirm your password.';

    if (password) {
      const passwordErrors = validatePassword(password);

      if (passwordErrors.length > 0) {
        newErrors.password = passwordErrors.join('\n');
      }
    }
    
    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match. Please try again.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    registerMutation.mutate({ name, email, password, confirmPassword });
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.badge}>
              <Image
                source={require('../assets/images/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Username */}
            <View style={styles.field}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="user.user"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                />
              </View>
              {errors.name && <Text style={styles.error}>{errors.name}</Text>}
            </View>

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>E-mail</Text>
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
              {errors.email && <Text style={styles.error}>{errors.email}</Text>}
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  secureTextEntry={!passwordVisible}
                  value={password}
                  onChangeText={setPassword}
                />
                <EyeComponent
                  toggleVisibility={() =>
                    setPasswordVisible(prev => !prev)
                  }
                  isVisible={passwordVisible}
                />
              </View>
              {errors.password && (
                <Text style={styles.error}>{errors.password}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.field}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor="#999"
                  secureTextEntry={!confirmPasswordVisible}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <EyeComponent
                  toggleVisibility={() =>
                    setConfirmPasswordVisible(prev => !prev)
                  }
                  isVisible={confirmPasswordVisible}
                />
              </View>
              {errors.confirmPassword && (
                <Text style={styles.error}>
                  {errors.confirmPassword}
                </Text>
              )}
            </View>

            {/* Button */}
            <Pressable
              style={styles.signUpButton}
              onPress={handleRegister}
              disabled={registerMutation.isPending}
            >
              <Text style={styles.buttonText}>
                {registerMutation.isPending
                  ? 'Registering...' : 'Sign Up'}
              </Text>
            </Pressable>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account?
              </Text>
              <Link href="/LoginPage" asChild>
                <Text style={styles.link}> Log in</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default RegisterPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3e1d0',
    paddingTop: '10%'
  },

  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },

  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },

  badge: {
    width: 160,
    height: 96,
    backgroundColor: '#f3e1d0',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },

  logoImage: {
    width: 270, 
    height: 250,
  },

  card: {
    width: '90%',
    maxWidth: 700,
    backgroundColor: '#411C0E',
    borderRadius: 40,
    paddingTop: 33,
    paddingHorizontal: 20,
    paddingBottom: 24,
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
    marginBottom: 6,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 14,
  },

  input: {
    flex: 1,
    height: 44,
    color: '#222',
  },

  signUpButton: {
    marginTop: 20, 
    backgroundColor: '#f1dfcf', 
    paddingVertical: 12, 
    borderRadius: 50, 
    alignItems: 'center', 
    width: '65%',
    alignSelf: 'center',
  },

  buttonText: {
    color: '#411C0E', 
    fontWeight: '800', 
    letterSpacing: 0.4,
    fontSize: 15,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },

  footerText: {
    color: '#fff',
  },

  link: {
    color: '#6251FF',
    fontWeight: '600',
  },

  error: {
    color: '#ffb3b3',
    marginTop: 6,
    fontSize: 12,
  },
});
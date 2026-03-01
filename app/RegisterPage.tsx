import EyeComponent from '@/components/EyeComponent';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const auth = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPassError, setConfirmPassError] = useState('');
  const [fillError, setFillError] = useState('');

  // Animated value controlling the vertical position of entire content
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
      const kbHeight = e.endCoordinates.height;

      // Calculate offset to lift card + logo above keyboard
      const desiredOffset = kbHeight + 40; // extra padding
      Animated.timing(contentTranslateY, {
        toValue: -desiredOffset,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      Animated.timing(contentTranslateY, {
        toValue: 0, // return fully to original position
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const togglePasswordVisibility = () => setPasswordVisible(prev => !prev);
  const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible(prev => !prev);

  const registerMutation = useMutation({
    mutationFn: ({ name, email, password, confirmPassword }: any) =>
      api
        .post('/api/register', { name, email, password, password_confirmation: confirmPassword })
        .then(res => res.data),
    onSuccess: () => router.push('/LoginPage'),
    onError: (error: any) => {
      if (!error.response) {
        alert('Network error. Please try again.');
        return;
      }
      const errors = error.response?.data?.errors;
      if (!errors) {
        alert(error.response?.data?.message ?? 'Something went wrong.');
        return;
      }
      setUsernameError(errors?.name?.[0] ?? '');
      setEmailError(errors?.email?.[0] ?? '');
      setPasswordError(errors?.password?.[0] ?? '');
      setConfirmPassError(errors?.password_confirmation?.[0] ?? '');
    },
  });

  const handleRegister = () => {
    if (!name || !email || !password || !confirmPassword) {
      setFillError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPassError('Passwords do not match. Please try again');
      return;
    }
    setUsernameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPassError('');
    setFillError('');
    registerMutation.mutate({ name, email, password, confirmPassword });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f3e1d0' }}>
      {/* Entire content wrapped in Animated.View */}
      <Animated.View
        style={[
          { flex: 1, justifyContent: 'center', alignItems: 'center', transform: [{ translateY: contentTranslateY }] },
        ]}
      >
        {/* Logo */}
        <View style={styles.logo}>
          <View style={styles.badge}>
            <Image source={require('../assets/images/logo.png')} style={styles.logoImage} />
          </View>
        </View>

        {/* Card */}
        <View style={styles.card}>
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
            {usernameError && <Text style={styles.error}>{usernameError}</Text>}
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
                secureTextEntry={!passwordVisible}
                value={password}
                onChangeText={setPassword}
              />
              <EyeComponent toggleVisibility={togglePasswordVisibility} isVisible={passwordVisible} />
            </View>
            {passwordError && <Text style={styles.error}>{passwordError}</Text>}
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
              <EyeComponent toggleVisibility={toggleConfirmPasswordVisibility} isVisible={confirmPasswordVisible} />
            </View>
            {confirmPassError && <Text style={styles.error}>{confirmPassError}</Text>}
          </View>

          {/* Register Button */}
          <View>
            <Pressable
              style={styles.SignUpButton}
              onPress={handleRegister}
              disabled={registerMutation.isPending}
            >
              <Text style={styles.buttonText}>
                {registerMutation.isPending ? 'Registering...' : 'SIGN UP'}
              </Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12 }}>
            <Text style={styles.text}>Already have an account?</Text>
            <Link href="/LoginPage" asChild>
              <Text style={styles.link}>Log in</Text>
            </Link>
          </View>

          {fillError && <Text style={{ color: '#e20505', alignSelf: 'center' }}>{fillError}</Text>}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  logo: { marginBottom: 50, justifyContent: 'center', alignItems: 'center' },
  badge: { width: 160, height: 96, backgroundColor: '#f3e1d0', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  logoImage: { width: 270, height: 180 },
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
  field: { marginVertical: 10 },
  label: { color: '#fff', fontWeight: '700', marginBottom: 8, letterSpacing: 0.2 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 24, paddingHorizontal: 12 },
  input: { flex: 1, height: 40, color: '#222' },
  SignUpButton: { marginTop: 20, backgroundColor: '#f1dfcf', paddingVertical: 12, borderRadius: 24, alignItems: 'center' },
  buttonText: { color: '#411C0E', fontWeight: '900', letterSpacing: 0.5 },
  link: { color: '#6251FF', fontWeight: '500', marginLeft: 4 },
  text: { color: '#fff' },
  error: { color: '#fff', marginTop: 10, marginLeft: 10, fontSize: 10, alignSelf: 'flex-start' },
});

export default RegisterPage;
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type User = {
  email: string;
  name: string;
  storeName: string;
} | null;

export type AuthContextType = {
  userToken: string | null;
  user: User;
  isAuthenticated: boolean;
  restoring: boolean;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  signIn: (token: string, userData: User) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (userData: User) => Promise<void>; // NEW helper
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [user, setUser] = useState<User>(null);

  // Restore token & user from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userJson = await AsyncStorage.getItem('user');
        if (token) {
          setUserToken(token);
          if (userJson) {
            const parsedUser = JSON.parse(userJson);
            setUser({
              email: parsedUser.email ?? '',
              name: parsedUser.name ?? '',
              storeName: parsedUser.storeName ?? '',
            });
          }
        }
      } catch (err) {
        console.warn('Failed to restore session', err);
      } finally {
        setRestoring(false);
      }
    })();
  }, []);

  // Sign in: store token & user in AsyncStorage
  const signIn = async (token: string, userData: User) => {
    if (!userData) throw new Error('User data must be provided');
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setUserToken(token);
  };

  

  // Sign out: remove token & user from AsyncStorage
  const signOut = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('user');
    setUser(null);
    setUserToken(null);
  };

  // NEW: Update user in memory AND AsyncStorage
  const updateUser = async (userData: User) => {
    if (!userData) return;
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        user,
        isAuthenticated: !!userToken,
        setUser,
        restoring,
        signIn,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
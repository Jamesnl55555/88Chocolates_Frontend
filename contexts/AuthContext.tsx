import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type User = { email: string; name?: string } | null;

type AuthContextType = {
  userToken: string | null;
  user: User;
  isAuthenticated: boolean;
  restoring: boolean;
  signIn: (token: string, user: User | string | null) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userJson = await AsyncStorage.getItem('user');
        if (token) {
          setUserToken(token);
          if (userJson) {
            try {
              setUser(JSON.parse(userJson));
            } catch (err) {
              // fallback — if older code stored only an email string
              setUser({ email: userJson });
            }
          }
        }
      } catch (e) {
        console.warn('Failed to restore session', e);
      } finally {
        setRestoring(false);
      }
    })();
  }, []);

  const signIn = async (token: string, userData: User | string | null) => {
    await AsyncStorage.setItem('userToken', token);
    if (userData) {
      if (typeof userData === 'string') {
        const userObj = { email: userData };
        await AsyncStorage.setItem('user', JSON.stringify(userObj));
        setUser(userObj);
      } else {
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
    } else {
      await AsyncStorage.removeItem('user');
      setUser(null);
    }
    setUserToken(token);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('user');
    setUserToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        user,
        isAuthenticated: !!userToken,
        restoring,
        signIn,
        signOut,
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

import { setLogoutHandler } from '@/utils/authEvents';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

export type User = {
  email: string;
  name: string;
  storeName: string;
  profile_image?: string | null;
} | null;

type LogoutType = 'manual' | 'expired' | 'invalid';

export type AuthContextType = {
  userToken: string | null;
  user: User;
  isAuthenticated: boolean;
  restoring: boolean;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  signIn: (token: string, userData: User) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (userData: User) => Promise<void>;
  sessionExpiredVisible: boolean;
  dismissSessionExpired: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [user, setUser] = useState<User>(null);
  const [sessionExpiredVisible, setSessionExpiredVisible] = useState(false);
  const sessionExpiredTriggered = useRef(false);

  const dismissSessionExpired = () => {
    sessionExpiredTriggered.current = false;
    setSessionExpiredVisible(false);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('user');
    setUser(null);
    setUserToken(null);
  };

  useEffect(() => {
    setLogoutHandler((type?: LogoutType) => {
      if (type === 'expired') {
        if (sessionExpiredTriggered.current) return;

        sessionExpiredTriggered.current = true;
        signOut();
        setSessionExpiredVisible(true);
        return;
      }

      signOut();
    });
  }, []);

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
              profile_image: parsedUser.profile_image ?? null,
            });
          }
        }
      } catch {
        console.warn('Failed to restore session');
      } finally {
        setRestoring(false);
      }
    })();
  }, []);

  const signIn = async (token: string, userData: User) => {
    if (!userData) return;

    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(userData));

    setUser(userData);
    setUserToken(token);
  };

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
        sessionExpiredVisible,
        dismissSessionExpired,
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
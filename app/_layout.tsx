import AppHeader from '@/components/AppHeader';
import Loading from '@/components/Loader/Loading';
import NavigationBar from '@/components/NavigationBar';
import SessionExpiredModal from '@/components/SessionExpiredModal';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import SplashScreen from '@/screens/SplashScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

const queryClient = new QueryClient();

function LayoutContent() {
  const { splashDone, isLoading } = useApp();
  const { restoring, isAuthenticated, sessionExpiredVisible, dismissSessionExpired } = useAuth();

  if (restoring) return null;

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          header: ({ route }) => <AppHeader routeName={route.name} />,
          headerStyle: { backgroundColor: '#724848' },
          headerShown: true,
          animation: 'fade',
          animationDuration: 100,
          gestureEnabled: false,
        }}
      />

      {!splashDone && (
        <View style={[styles.absoluteFillObject, { zIndex: 1000 }]}>
          <SplashScreen onFinish={() => {}} />
        </View>
      )}

      {isLoading && (
        <View style={[styles.absoluteFillObject, { zIndex: 1001 }]}>
          <Loading onFinish={() => {}} />
        </View>
      )}

      {sessionExpiredVisible && (
        <View style={[styles.absoluteFillObject, { zIndex: 2002 }]}>
          <SessionExpiredModal
            onLogin={() => {
              dismissSessionExpired();
              router.replace('/LoginPage');
            }}
          />
        </View>
      )}

      {isAuthenticated && <NavigationBar />}
    </View>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <LayoutContent />
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  absoluteFillObject: {
    ...StyleSheet.absoluteFillObject,
  },
});
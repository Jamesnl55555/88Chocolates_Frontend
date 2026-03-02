import Loading from '@/components/Loader/Loading';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import SplashScreen from '@/screens/SplashScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

const queryClient = new QueryClient();

function LayoutContent() {
  const { splashDone, isLoading } = useApp();
  const { restoring } = useAuth();

  // Prevent rendering stack while restoring auth state
  if (restoring) return null;

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 100,
          gestureEnabled: false,
        }}
      />

      {/* Splash Overlay */}
      {!splashDone && (
        <View style={[styles.absoluteFillObject, { zIndex: 1000 }]}>
          <SplashScreen onFinish={() => {}} />
        </View>
      )}

      {/* Global Loader Overlay */}
      {isLoading && (
        <View style={[styles.absoluteFillObject, { zIndex: 1001 }]}>
          <Loading onFinish={() => {}} />
        </View>
      )}
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
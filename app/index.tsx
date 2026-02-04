import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';
import SplashScreen from '../screens/SplashScreen';
import RegisterPage from './RegisterPage';

// 1. Create a client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Automatically retry failed requests twice
      staleTime: 1000 * 60 * 5, // Data stays "fresh" for 5 minutes
    },
  },
});

export default function Index() {
    const [splash, setSplash] = useState(true);

    return (
    // 2. Wrap your app to provide the query context
    <QueryClientProvider client={queryClient}>
      {splash ? (
        <SplashScreen onFinish={() => setSplash(false)} />
      ) : (
        <RegisterPage />
      )}
    </QueryClientProvider>
  );
}

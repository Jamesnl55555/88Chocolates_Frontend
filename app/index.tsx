import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  const router = useRouter();
  const { splashDone, isLoading } = useApp();

  useEffect(() => {
    if (splashDone && !isLoading) {
      router.replace('/RegisterPage');
    }
  }, [splashDone, isLoading]);

  return null;
}

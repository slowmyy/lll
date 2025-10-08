import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { authService } from '@/services/auth';

export function useAuthRedirect() {
  const router = useRouter();
  const segments = useSegments();
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    checkAuthAndRedirect();
  }, [isReady]);

  const checkAuthAndRedirect = async () => {
    try {
      const isAuthenticated = await authService.isAuthenticated();
      const inAuthGroup = segments[0] === 'auth';

      console.log('🔍 Auth check:', {
        isAuthenticated,
        inAuthGroup,
        segments: segments.join('/'),
        isReady
      });

      if (!isAuthenticated && !inAuthGroup) {
        console.log('➡️ Redirection vers login');
        setTimeout(() => router.replace('/auth/login'), 100);
      } else if (isAuthenticated && inAuthGroup) {
        console.log('➡️ Redirection vers app');
        setTimeout(() => router.replace('/(tabs)'), 100);
      }
    } catch (error) {
      console.error('❌ Erreur auth redirect:', error);
      setTimeout(() => router.replace('/auth/login'), 100);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading };
}
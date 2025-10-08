import { useEffect } from 'react';
import { Platform } from 'react-native';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    setTimeout(() => {
      if (window.frameworkReady) {
        console.log('🚀 Framework ready signal sent');
        window.frameworkReady();
      } else {
        console.warn('⚠️ window.frameworkReady not available');
      }
    }, 100);
  }, []);
}
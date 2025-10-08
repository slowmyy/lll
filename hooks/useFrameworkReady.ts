import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  const hasCalledRef = useRef(false);
  const retryCountRef = useRef(0);
  const maxRetries = 10;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const attemptSignal = () => {
      if (hasCalledRef.current) {
        return;
      }

      if (document.readyState === 'loading') {
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          console.log(`⏳ DOM still loading, retry ${retryCountRef.current}/${maxRetries}`);
          setTimeout(attemptSignal, 200);
        }
        return;
      }

      if (window.frameworkReady) {
        console.log('✅ Framework ready signal sent successfully');
        window.frameworkReady();
        hasCalledRef.current = true;
      } else {
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          console.log(`⏳ window.frameworkReady not ready, retry ${retryCountRef.current}/${maxRetries}`);
          setTimeout(attemptSignal, 200);
        } else {
          console.warn('❌ window.frameworkReady not available after max retries');
        }
      }
    };

    if (document.readyState === 'complete') {
      setTimeout(attemptSignal, 500);
    } else {
      window.addEventListener('load', () => {
        setTimeout(attemptSignal, 500);
      });
    }

    return () => {
      hasCalledRef.current = false;
      retryCountRef.current = 0;
    };
  }, []);
}
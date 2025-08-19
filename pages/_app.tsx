import React, { useEffect } from 'react';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { registerServiceWorker } from '../lib/pushNotifications';
import InstallPrompt from '../components/PWA/InstallPrompt';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Register service worker when app loads
    if (typeof window !== 'undefined') {
      registerServiceWorker();
    }
  }, []);

  return (
    <>
      <Component {...pageProps} />
      <InstallPrompt />
    </>
  );
}

export default MyApp;
import React, { useEffect } from 'react';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { registerServiceWorker } from '../lib/pushNotifications';
import InstallPrompt from '../components/PWA/InstallPrompt';
import IframePopup from '../components/Popup/IframePopup';
import { Toaster } from 'react-hot-toast';

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
      <IframePopup />
      <InstallPrompt />
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            fontSize: '14px',
            fontWeight: 500,
          },
        }}
      />
    </>
  );
}

export default MyApp;
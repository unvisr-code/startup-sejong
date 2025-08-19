import React, { useState, useEffect } from 'react';
import { FaDownload, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window === 'undefined') return;
    
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    const isInWebAppChrome = window.matchMedia('(display-mode: standalone)').matches;
    
    setIsInstalled(isStandalone || isInWebAppiOS || isInWebAppChrome);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt after a short delay (better UX)
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('installPromptDismissed', 'true');
    }
  };

  // Don't show if not on client, already installed, dismissed, or no prompt available
  if (!isClient || isInstalled || !deferredPrompt || !showPrompt) {
    return null;
  }

  // Check if dismissed in this session
  if (typeof window !== 'undefined' && sessionStorage.getItem('installPromptDismissed')) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50"
      >
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <img src="/icons/icon-72x72.png" alt="앱 아이콘" className="w-6 h-6 rounded" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm">
                앱으로 설치하기
              </h3>
              <p className="text-gray-600 text-xs mt-1">
                홈 화면에 추가하여 더 편리하게 이용하세요
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes size={14} />
            </button>
          </div>
          
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstallClick}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-2 px-3 rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              <FaDownload size={12} />
              설치
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
            >
              나중에
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallPrompt;
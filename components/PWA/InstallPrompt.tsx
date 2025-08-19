import React, { useState, useEffect } from 'react';
import { FaDownload, FaTimes, FaApple, FaAndroid, FaChrome, FaShare } from 'react-icons/fa';
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
  const [showManualGuide, setShowManualGuide] = useState(false);
  const [browserInfo, setBrowserInfo] = useState({ isIOS: false, isSafari: false, isAndroid: false, isChrome: false });

  useEffect(() => {
    setIsClient(true);
    if (typeof window === 'undefined') return;

    // Detect browser and platform
    const userAgent = navigator.userAgent.toLowerCase();
    const browserData = {
      isIOS: /iphone|ipad|ipod/.test(userAgent),
      isSafari: /safari/.test(userAgent) && !/chrome/.test(userAgent),
      isAndroid: /android/.test(userAgent),
      isChrome: /chrome/.test(userAgent) && !/edg/.test(userAgent)
    };
    setBrowserInfo(browserData);
    
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

    // For browsers that don't support beforeinstallprompt 
    // Show manual guide after some time
    if (browserData.isIOS && browserData.isSafari) {
      setTimeout(() => {
        const isStandalone = (window.navigator as any).standalone === true;
        if (!isStandalone) {
          setShowManualGuide(true);
        }
      }, 10000); // Show after 10 seconds for iOS users
    } else if (browserData.isAndroid && !browserData.isChrome) {
      // For Android non-Chrome browsers, show manual guide
      setTimeout(() => {
        setShowManualGuide(true);
      }, 15000); // Show after 15 seconds for Android non-Chrome users
    } else if (!browserData.isChrome && !browserData.isSafari) {
      // For other browsers that might not support auto-install
      setTimeout(() => {
        if (!deferredPrompt) {
          setShowManualGuide(true);
        }
      }, 20000); // Show after 20 seconds if no auto-prompt
    }

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
    setShowManualGuide(false);
    // Don't show again for this session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('installPromptDismissed', 'true');
    }
  };

  // Check if dismissed in this session
  if (typeof window !== 'undefined' && sessionStorage.getItem('installPromptDismissed')) {
    return null;
  }

  // Don't show if not on client or already installed
  if (!isClient || isInstalled) {
    return null;
  }

  // Show automatic install prompt if available
  const showAutoPrompt = deferredPrompt && showPrompt;
  
  // Show manual guide for iOS Safari or if no auto prompt after some time
  const showManualInstall = showManualGuide || (browserInfo.isIOS && browserInfo.isSafari);

  // Don't show anything if no prompt conditions are met
  if (!showAutoPrompt && !showManualInstall) {
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
                {showAutoPrompt ? '앱으로 설치하기' : 
                 browserInfo.isIOS ? '아이폰에 앱 추가하기' : 
                 browserInfo.isAndroid ? '안드로이드에 앱 추가하기' : '앱으로 설치하기'}
              </h3>
              <p className="text-gray-600 text-xs mt-1">
                {showAutoPrompt ? '홈 화면에 추가하여 더 편리하게 이용하세요' :
                 browserInfo.isIOS ? '사파리 메뉴에서 "홈 화면에 추가"를 선택하세요' :
                 '브라우저 메뉴에서 "홈 화면에 추가"를 찾아보세요'}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes size={14} />
            </button>
          </div>
          
          {showAutoPrompt ? (
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
          ) : (
            <div className="mt-3">
              {browserInfo.isIOS ? (
                <div className="text-xs text-gray-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <FaShare className="text-blue-500" />
                    <span>1. 사파리 하단의 공유 버튼 탭</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaApple className="text-gray-700" />
                    <span>2. "홈 화면에 추가" 선택</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaDownload className="text-green-500" />
                    <span>3. "추가" 버튼 탭</span>
                  </div>
                </div>
              ) : browserInfo.isAndroid ? (
                <div className="text-xs text-gray-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <FaChrome className="text-blue-500" />
                    <span>1. Chrome 메뉴 (⋮) 탭</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaAndroid className="text-green-500" />
                    <span>2. "홈 화면에 추가" 선택</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-600">
                  브라우저 메뉴에서 "홈 화면에 추가" 또는 "앱 설치"를 찾아보세요
                </div>
              )}
              <button
                onClick={handleDismiss}
                className="w-full mt-3 py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
              >
                닫기
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallPrompt;
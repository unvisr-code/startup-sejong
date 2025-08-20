// Push Notifications utility functions
import { supabase } from './supabase';

// VAPID keys (you'll need to generate these)
// Run: npx web-push generate-vapid-keys
export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
export const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
export const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:admin@sejong.ac.kr';

// Validate VAPID keys
export const isVapidConfigured = (): boolean => {
  return !!(VAPID_PUBLIC_KEY && VAPID_PUBLIC_KEY.length > 20);
};

export const getVapidError = (): string | null => {
  if (!VAPID_PUBLIC_KEY) {
    return 'VAPID 공개키가 설정되지 않았습니다. 관리자에게 문의하세요.';
  }
  if (VAPID_PUBLIC_KEY.length < 20) {
    return 'VAPID 공개키가 유효하지 않습니다.';
  }
  return null;
};

// Detect browser and platform
export const getBrowserInfo = () => {
  if (typeof window === 'undefined') return { isIOS: false, isSafari: false, isAndroid: false, isChrome: false, isIOSChrome: false };
  
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent) || (navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform));
  const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent) && !/crios/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isChrome = /chrome/.test(userAgent) && !/edg/.test(userAgent);
  const isIOSChrome = isIOS && /crios/.test(userAgent); // Chrome on iOS
  
  return { isIOS, isSafari, isAndroid, isChrome, isIOSChrome };
};

// Check if push notifications are supported
export const isPushSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const { isIOS, isSafari } = getBrowserInfo();
  
  // iOS Safari has limited PWA support
  if (isIOS && isSafari) {
    // Check if running as PWA (standalone mode)
    const isStandalone = (window.navigator as any).standalone === true;
    return isStandalone && 'serviceWorker' in navigator && 'PushManager' in window;
  }
  
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

// Get platform-specific error messages
export const getPlatformError = (): string | null => {
  const { isIOS, isSafari, isAndroid, isIOSChrome } = getBrowserInfo();
  
  // iOS Chrome cannot support push notifications due to iOS restrictions
  if (isIOSChrome) {
    return '아이폰 Chrome에서는 알림이 지원되지 않습니다. Safari에서 홈 화면에 추가 후 사용해주세요.';
  }
  
  if (isIOS && isSafari) {
    const isStandalone = (window.navigator as any).standalone === true;
    if (!isStandalone) {
      return '아이폰에서는 홈 화면에 추가한 후 알림을 사용할 수 있습니다. Safari 메뉴 > 홈 화면에 추가를 선택해주세요.';
    }
  }
  
  // iOS other browsers
  if (isIOS && !isSafari) {
    return '아이폰에서는 Safari 브라우저에서 홈 화면에 추가한 후 알림을 사용할 수 있습니다.';
  }
  
  if (!isPushSupported()) {
    if (isAndroid) {
      return '이 브라우저는 푸시 알림을 지원하지 않습니다. Chrome 브라우저를 사용해주세요.';
    }
    return '이 브라우저는 푸시 알림을 지원하지 않습니다.';
  }
  
  return null;
};

// Convert VAPID key to Uint8Array
export const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  if (!base64String || base64String.length === 0) {
    throw new Error('VAPID 키가 유효하지 않습니다.');
  }

  try {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  } catch (error) {
    console.error('VAPID 키 변환 실패:', error);
    throw new Error('VAPID 키 형식이 올바르지 않습니다.');
  }
};

// Register service worker
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    
    console.log('Service Worker registered successfully:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
};

// Subscribe to push notifications
export const subscribeToPush = async (): Promise<PushSubscription | null> => {
  try {
    // Check VAPID configuration first
    const vapidError = getVapidError();
    if (vapidError) {
      throw new Error(vapidError);
    }

    if (!isPushSupported()) {
      throw new Error('이 브라우저는 푸시 알림을 지원하지 않습니다.');
    }

    const registration = await registerServiceWorker();
    if (!registration) {
      throw new Error('서비스 워커 등록에 실패했습니다.');
    }

    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      throw new Error('알림 권한이 거부되었습니다.');
    }

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Create new subscription with error handling
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer
        });
      } catch (subscribeError) {
        console.error('Push manager subscribe failed:', subscribeError);
        throw new Error('푸시 구독 생성에 실패했습니다. 네트워크를 확인하거나 나중에 다시 시도해주세요.');
      }
    }

    // Save subscription to database
    const saved = await saveSubscription(subscription);
    if (!saved) {
      console.warn('Subscription created but failed to save to database');
    }
    
    return subscription;
  } catch (error) {
    console.error('Push subscription failed:', error);
    throw error; // Re-throw to handle in component
  }
};

// Save subscription to database
export const saveSubscription = async (subscription: PushSubscription): Promise<boolean> => {
  try {
    const subscriptionObject = subscription.toJSON();
    
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        endpoint: subscriptionObject.endpoint!,
        p256dh_key: subscriptionObject.keys!.p256dh!,
        auth_key: subscriptionObject.keys!.auth!,
        user_agent: navigator.userAgent,
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'endpoint'
      });

    if (error) {
      console.error('Error saving subscription:', error);
      return false;
    }

    console.log('Subscription saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving subscription:', error);
    return false;
  }
};

// Unsubscribe from push notifications
export const unsubscribeFromPush = async (): Promise<boolean> => {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return false;
    }

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      return false;
    }

    // Unsubscribe from browser
    const unsubscribed = await subscription.unsubscribe();
    
    if (unsubscribed) {
      // Mark as inactive in database
      const subscriptionObject = subscription.toJSON();
      await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .eq('endpoint', subscriptionObject.endpoint!);
    }

    return unsubscribed;
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return false;
  }
};

// Check subscription status
export const getSubscriptionStatus = async (): Promise<{
  isSubscribed: boolean;
  subscription: PushSubscription | null;
}> => {
  try {
    if (!isPushSupported()) {
      return { isSubscribed: false, subscription: null };
    }

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return { isSubscribed: false, subscription: null };
    }

    const subscription = await registration.pushManager.getSubscription();
    return {
      isSubscribed: !!subscription,
      subscription
    };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return { isSubscribed: false, subscription: null };
  }
};

// Show local notification (for testing)
export const showLocalNotification = (title: string, body: string, url?: string) => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return;
  }

  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'local-notification',
      requireInteraction: false
    });

    notification.onclick = () => {
      window.focus();
      if (url) {
        window.location.href = url;
      }
      notification.close();
    };

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
  }
};
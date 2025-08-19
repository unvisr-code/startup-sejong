// Push Notifications utility functions
import { supabase } from './supabase';

// VAPID keys (you'll need to generate these)
// Run: npx web-push generate-vapid-keys
export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
export const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
export const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:admin@sejong.ac.kr';

// Check if push notifications are supported
export const isPushSupported = (): boolean => {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
};

// Convert VAPID key to Uint8Array
export const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
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
    if (!isPushSupported()) {
      throw new Error('Push notifications are not supported');
    }

    const registration = await registerServiceWorker();
    if (!registration) {
      throw new Error('Service Worker registration failed');
    }

    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Create new subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer
      });
    }

    // Save subscription to database
    await saveSubscription(subscription);
    
    return subscription;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return null;
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
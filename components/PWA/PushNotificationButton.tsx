import React, { useState, useEffect } from 'react';
import { FaBell, FaBellSlash, FaExclamationTriangle } from 'react-icons/fa';
import { 
  subscribeToPush, 
  unsubscribeFromPush, 
  getSubscriptionStatus, 
  requestNotificationPermission,
  showLocalNotification,
  isVapidConfigured,
  getVapidError,
  getBrowserInfo,
  getPlatformError
} from '../../lib/pushNotifications';

const PushNotificationButton: React.FC = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(true);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      // Check platform compatibility first
      const platformError = getPlatformError();
      if (platformError) {
        setError(platformError);
        return;
      }

      // Check VAPID configuration
      setIsConfigured(isVapidConfigured());
      if (!isVapidConfigured()) {
        setError(getVapidError());
      } else {
        checkSubscriptionStatus();
        // Only access Notification.permission if API exists
        if ('Notification' in window) {
          setPermission(Notification.permission);
        }
      }
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    const status = await getSubscriptionStatus();
    setIsSubscribed(status.isSubscribed);
  };

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const subscription = await subscribeToPush();
      if (subscription) {
        setIsSubscribed(true);
        setPermission('granted');
        showLocalNotification(
          '알림 구독 완료!', 
          '이제 새로운 공지사항과 중요 일정을 실시간으로 받아보실 수 있습니다.'
        );
      } else {
        setError('알림 구독에 실패했습니다. 브라우저 설정을 확인해주세요.');
      }
    } catch (error: any) {
      console.error('Subscribe error:', error);
      const errorMessage = error.message || '알림 구독 중 오류가 발생했습니다.';
      setError(errorMessage);
      
      // Show user-friendly alert for critical errors
      if (errorMessage.includes('VAPID')) {
        alert('시스템 설정 오류입니다. 관리자에게 문의해주세요.');
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!confirm('알림 구독을 해제하시겠습니까?')) return;

    setLoading(true);
    try {
      const success = await unsubscribeFromPush();
      if (success) {
        setIsSubscribed(false);
        showLocalNotification(
          '알림 구독 해제됨', 
          '더 이상 푸시 알림을 받지 않습니다.'
        );
      } else {
        alert('알림 구독 해제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      alert('알림 구독 해제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionRequest = async () => {
    const permission = await requestNotificationPermission();
    setPermission(permission);
    
    if (permission === 'granted') {
      handleSubscribe();
    } else {
      alert('알림을 받으려면 브라우저에서 알림 권한을 허용해주세요.');
    }
  };

  // Don't show button if not on client
  if (!isClient || typeof window === 'undefined') {
    return null;
  }

  // Check iOS first (before Notification API check)
  const browserInfo = getBrowserInfo();
  const isIOS = browserInfo.isIOS;
  
  // Show iOS-specific message
  if (isIOS) {
    const isStandalone = (window.navigator as any).standalone === true;
    
    // If running as PWA on iOS, try to show normal button
    if (isStandalone && 'serviceWorker' in navigator && 'PushManager' in window) {
      // Continue to normal flow
    } else {
      // Show guidance for iOS users
      const message = browserInfo.isSafari 
        ? '아이폰에서 알림을 받으려면:\n1. Safari 공유 버튼 탭\n2. "홈 화면에 추가" 선택\n3. 추가된 앱에서 알림 설정'
        : '아이폰에서는 Safari 브라우저를 사용해주세요.\n\nSafari에서:\n1. 공유 버튼 탭\n2. "홈 화면에 추가" 선택';
      
      return (
        <button
          onClick={() => alert(message)}
          className="flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200 transition-colors"
          title="알림 안내"
        >
          <FaBell className="flex-shrink-0" />
          <span>알림 안내</span>
        </button>
      );
    }
  }

  // Show compatibility message for unsupported browsers (non-iOS)
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    return (
      <button
        onClick={() => alert('이 브라우저는 알림을 지원하지 않습니다.\n\nChrome 또는 Firefox 브라우저를 사용해주세요.')}
        className="flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200 transition-colors"
        title="알림 미지원"
      >
        <FaBell className="flex-shrink-0" />
        <span>알림 안내</span>
      </button>
    );
  }

  // Show platform compatibility error (for other cases)
  if (error?.includes('브라우저')) {
    return (
      <button
        onClick={() => alert(error)}
        className="flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200 transition-colors"
        title={error}
      >
        <FaBell className="flex-shrink-0" />
        <span>알림 안내</span>
      </button>
    );
  }

  // Show configuration error state
  if (!isConfigured || error?.includes('VAPID')) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg cursor-not-allowed text-sm" title="설정 오류">
        <FaExclamationTriangle className="flex-shrink-0" />
        <span>설정 오류</span>
      </div>
    );
  }

  // Show permission request button if permission not granted
  if (permission === 'default') {
    return (
      <button
        onClick={handlePermissionRequest}
        disabled={loading}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
        title="알림 허용"
      >
        <FaBell className="flex-shrink-0" />
        <span>알림 받기</span>
      </button>
    );
  }

  // Show denied state
  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed text-sm" title="알림이 차단됨">
        <FaBellSlash className="flex-shrink-0" />
        <span>알림 차단됨</span>
      </div>
    );
  }

  // Show subscribe/unsubscribe button
  return (
    <button
      onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
      disabled={loading}
      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base ${
        isSubscribed 
          ? 'bg-green-600 text-white hover:bg-green-700' 
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
      title={isSubscribed ? '알림 구독 해제' : '알림 구독'}
    >
      <FaBell className="flex-shrink-0" />
      <span>
        {loading ? '처리 중...' : isSubscribed ? '알림 ON' : '알림 받기'}
      </span>
    </button>
  );
};

export default PushNotificationButton;
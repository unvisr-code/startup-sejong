import React, { useState, useEffect } from 'react';
import { FaBell, FaBellSlash } from 'react-icons/fa';
import { 
  subscribeToPush, 
  unsubscribeFromPush, 
  getSubscriptionStatus, 
  requestNotificationPermission,
  showLocalNotification
} from '../../lib/pushNotifications';

const PushNotificationButton: React.FC = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      checkSubscriptionStatus();
      setPermission(Notification.permission);
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    const status = await getSubscriptionStatus();
    setIsSubscribed(status.isSubscribed);
  };

  const handleSubscribe = async () => {
    setLoading(true);
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
        alert('알림 구독에 실패했습니다. 브라우저 설정을 확인해주세요.');
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      alert('알림 구독 중 오류가 발생했습니다.');
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

  // Don't show button if not on client or notifications are not supported
  if (!isClient || typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
    return null;
  }

  // Show permission request button if permission not granted
  if (permission === 'default') {
    return (
      <button
        onClick={handlePermissionRequest}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        title="알림 허용"
      >
        <FaBell />
        <span className="hidden sm:inline">알림 받기</span>
      </button>
    );
  }

  // Show denied state
  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed" title="알림이 차단됨">
        <FaBellSlash />
        <span className="hidden sm:inline">알림 차단됨</span>
      </div>
    );
  }

  // Show subscribe/unsubscribe button
  return (
    <button
      onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
        isSubscribed 
          ? 'bg-green-600 text-white hover:bg-green-700' 
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
      title={isSubscribed ? '알림 구독 해제' : '알림 구독'}
    >
      {isSubscribed ? <FaBell /> : <FaBellSlash />}
      <span className="hidden sm:inline">
        {loading ? '처리 중...' : isSubscribed ? '알림 ON' : '알림 OFF'}
      </span>
    </button>
  );
};

export default PushNotificationButton;
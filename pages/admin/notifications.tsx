import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/Admin/AdminLayout';
import { FaBell, FaPaperPlane, FaUsers, FaCheckCircle, FaExclamationTriangle, FaEye, FaCog, FaDatabase, FaKey, FaTrash, FaSync, FaCalendarAlt, FaBullhorn, FaChartLine, FaMouse } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import SubscribersModal from '../../components/Admin/SubscribersModal';
import { formatNotificationBody } from '../../lib/utils';
import dynamic from 'next/dynamic';

// Chart 컴포넌트를 dynamic import로 불러오기 (SSR 문제 해결)
const SubscriberChart = dynamic(() => import('../../components/Admin/SubscriberChart'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
});

interface NotificationForm {
  title: string;
  body: string;
  url: string;
  requireInteraction: boolean;
}

interface NotificationHistory {
  id: string;
  title: string;
  body: string;
  url: string;
  sent_count: number;
  success_count: number;
  error_count: number;
  open_count?: number;
  admin_email: string;
  created_at: string;
  sent_at: string;
}

interface SystemStatus {
  isConfigured: boolean;
  vapidPublicKey: boolean;
  vapidPrivateKey: boolean;
  vapidEmail: boolean;
  supabaseUrl: boolean;
  supabaseKey: boolean;
  errors: string[];
  environment: string;
}

const AdminNotificationsPage = () => {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [subscriptionCount, setSubscriptionCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationHistory[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);
  const [showSubscribersModal, setShowSubscribersModal] = useState(false);
  const [recentAnnouncements, setRecentAnnouncements] = useState<any[]>([]);
  const [recentCalendarEvents, setRecentCalendarEvents] = useState<any[]>([]);
  const [selectedContent, setSelectedContent] = useState<'custom' | 'announcement' | 'calendar'>('custom');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [subscriberTrendData, setSubscriberTrendData] = useState<any[]>([]);
  const [openRates, setOpenRates] = useState<Record<string, number>>({});
  const [form, setForm] = useState<NotificationForm>({
    title: '',
    body: '',
    url: '/',
    requireInteraction: false
  });

  useEffect(() => {
    // Load cached data first for instant display
    loadCachedData();
    
    // Then fetch fresh data
    fetchSubscriptionCount();
    fetchNotificationHistory();
    fetchSystemStatus();
    fetchRecentContent();
    fetchSubscriberTrend();
  }, []);

  const loadCachedData = () => {
    try {
      // Load cached notifications
      const cachedNotifications = localStorage.getItem('admin_notifications_cache');
      if (cachedNotifications) {
        const parsed = JSON.parse(cachedNotifications);
        if (parsed.data && parsed.timestamp) {
          const age = Date.now() - parsed.timestamp;
          // Use cache if less than 5 minutes old
          if (age < 5 * 60 * 1000) {
            setNotifications(parsed.data);
            console.log('📦 Loaded cached notifications:', parsed.data.length);
          }
        }
      }

      // Load cached open rates
      const cachedOpenRates = localStorage.getItem('admin_open_rates_cache');
      if (cachedOpenRates) {
        const parsed = JSON.parse(cachedOpenRates);
        if (parsed.data && parsed.timestamp) {
          const age = Date.now() - parsed.timestamp;
          if (age < 5 * 60 * 1000) {
            setOpenRates(parsed.data);
            console.log('📦 Loaded cached open rates');
          }
        }
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/push/config-check');
      if (response.ok) {
        const status = await response.json();
        setSystemStatus(status);
      }
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  const handleSetupTables = async () => {
    if (!confirm('데이터베이스 테이블을 자동으로 생성하시겠습니까?\n\n이 작업은 Supabase에 push_subscriptions, notifications, notification_delivery_log 테이블을 생성합니다.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/push/setup-tables', {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ 테이블 설정 완료!\n\n생성된 테이블: ${result.tablesCreated.join(', ')}\n\n${result.message}`);
        
        // Refresh system status and subscription count
        await fetchSystemStatus();
        await fetchSubscriptionCount();
      } else {
        let errorMessage = `❌ 테이블 설정 실패\n\n${result.message}`;
        
        if (result.errors && result.errors.length > 0) {
          errorMessage += `\n\n오류 상세:\n${result.errors.join('\n')}`;
        }
        
        errorMessage += '\n\n수동 설정 필요:\n1. Supabase 대시보드에서 SQL Editor 열기\n2. database/push_notifications.sql 파일 내용 복사\n3. SQL Editor에서 실행';
        
        alert(errorMessage);
      }
    } catch (error: any) {
      console.error('Setup tables error:', error);
      alert(`❌ 테이블 설정 중 오류 발생\n\n${error.message}\n\n수동으로 database/push_notifications.sql을 Supabase SQL Editor에서 실행해주세요.`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSubscriptions = async (action: string) => {
    const confirmMessages: { [key: string]: string } = {
      'clear-inactive': '비활성 구독을 모두 삭제하시겠습니까?',
      'clear-old': '30일 이상된 구독을 모두 삭제하시겠습니까?',
      'clear-all': '⚠️ 모든 구독을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다!',
      'mark-inactive': '모든 구독을 비활성화하시겠습니까?'
    };
    
    if (!confirm(confirmMessages[action])) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/push/clear-subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`✅ ${result.message}\n남은 활성 구독: ${result.remainingActiveSubscriptions}개`);
        await fetchSubscriptionCount();
      } else {
        alert(`❌ 실패: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Clear subscriptions error:', error);
      alert(`❌ 오류 발생: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVapidGuide = () => {
    const guide = `
🔑 VAPID 키 생성 및 설정 가이드

1️⃣ VAPID 키 생성:
   방법 1: web-push 라이브러리 사용
   npm install -g web-push
   web-push generate-vapid-keys

   방법 2: 온라인 생성기 사용
   https://vapidkeys.com/

2️⃣ 생성된 키 예시:
   Public Key: BBiVnQ7S9y7uXXXXXXXXXXXX...
   Private Key: 9Q-VVVVvkXXXXXXXXXXXXXXXX...

3️⃣ Vercel 환경변수 설정:
   - NEXT_PUBLIC_VAPID_PUBLIC_KEY: [Public Key]
   - VAPID_PRIVATE_KEY: [Private Key]  
   - VAPID_EMAIL: [관리자 이메일 (예: admin@sejong.ac.kr)]

4️⃣ 설정 후:
   - Vercel에서 재배포
   - 이 페이지에서 "상태 새로고침" 클릭하여 확인

⚠️ 주의사항:
   - Private Key는 절대 노출하지 마세요
   - Public Key만 클라이언트에서 사용됩니다
   - 이메일은 유효한 이메일 주소여야 합니다
`;

    alert(guide);
  };

  const fetchSubscriptionCount = async () => {
    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('id', { count: 'exact' })
        .eq('is_active', true);

      if (error) throw error;
      setSubscriptionCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching subscription count:', error);
    }
  };

  const fetchNotificationHistory = async (forceRefresh = false) => {
    // Show loading only if not using cache or force refresh
    if (forceRefresh || !notifications.length) {
      setLoading(true);
    }
    
    try {
      console.log('📋 Fetching notification history...');
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      console.log(`📋 Found ${data?.length || 0} notifications`);
      setNotifications(data || []);
      
      // Save to cache
      if (data && data.length > 0) {
        localStorage.setItem('admin_notifications_cache', JSON.stringify({
          data: data,
          timestamp: Date.now()
        }));
        console.log('💾 Saved notifications to cache');
      }
      
      // Always fetch open rates after notifications are loaded
      console.log('🔄 Fetching open rates after notifications loaded...');
      await fetchOpenRates(forceRefresh);
      
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentContent = async () => {
    try {
      // 최근 공지사항 가져오기
      const { data: announcements, error: announcementsError } = await supabase
        .from('announcements')
        .select('id, title, content, category, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (announcementsError) throw announcementsError;
      setRecentAnnouncements(announcements || []);

      // 최근 학사일정 가져오기
      const { data: events, error: eventsError } = await supabase
        .from('academic_calendar')
        .select('id, title, description, start_date, end_date, event_type')
        .gte('start_date', new Date().toISOString().split('T')[0])
        .order('start_date', { ascending: true })
        .limit(10);

      if (eventsError) throw eventsError;
      setRecentCalendarEvents(events || []);
    } catch (error) {
      console.error('Error fetching recent content:', error);
    }
  };

  const handleContentSelection = (type: 'announcement' | 'calendar', id: string) => {
    setSelectedContent(type);
    setSelectedItemId(id);

    if (type === 'announcement') {
      const announcement = recentAnnouncements.find(a => a.id === id);
      if (announcement) {
        setForm({
          title: `[공지] ${announcement.title}`,
          body: formatNotificationBody(announcement.content, 100),
          url: `/announcements/${announcement.id}`,
          requireInteraction: announcement.category === 'important'
        });
      }
    } else if (type === 'calendar') {
      const event = recentCalendarEvents.find(e => e.id === id);
      if (event) {
        const startDate = format(new Date(event.start_date), 'MM월 dd일', { locale: ko });
        const eventDescription = event.description || '새로운 일정이 등록되었습니다.';
        setForm({
          title: `[일정] ${event.title}`,
          body: `${startDate} - ${formatNotificationBody(eventDescription, 80)}`,
          url: `/calendar#event-${event.id}`,
          requireInteraction: event.event_type === 'exam' || event.event_type === 'application'
        });
      }
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.body.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    if (subscriptionCount === 0) {
      alert('구독자가 없습니다. 먼저 사용자들이 알림을 구독해야 합니다.');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          adminEmail: 'admin@sejong.ac.kr' // TODO: Get from auth context
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`알림이 전송되었습니다!\n성공: ${result.sent}건, 실패: ${result.errors}건`);
        
        // Reset form
        setForm({
          title: '',
          body: '',
          url: '/',
          requireInteraction: false
        });

        // Refresh data
        fetchNotificationHistory();
        fetchSubscriptionCount();
      } else {
        // Handle different error types
        let errorMessage = '알림 전송에 실패했습니다.';
        
        if (result.type === 'VAPID_CONFIG_ERROR') {
          errorMessage = `서버 설정 오류: ${result.details}\n\nVercel 환경변수를 확인해주세요:\n- NEXT_PUBLIC_VAPID_PUBLIC_KEY\n- VAPID_PRIVATE_KEY\n- VAPID_EMAIL`;
        } else if (result.type === 'DATABASE_TABLE_ERROR') {
          errorMessage = `데이터베이스 오류: ${result.details}\n\n${result.sqlFile || 'Supabase에서 필요한 테이블을 생성해주세요.'}`;
        } else if (result.type === 'DATABASE_ERROR') {
          errorMessage = `데이터베이스 연결 오류: ${result.details}`;
        } else if (result.details) {
          errorMessage = `${result.error}: ${result.details}`;
        } else {
          errorMessage = result.error || '알림 전송에 실패했습니다.';
        }
        
        alert(errorMessage);
      }
    } catch (error: any) {
      console.error('Send notification error:', error);
      
      let errorMessage = '알림 전송 중 오류가 발생했습니다.';
      if (error.message?.includes('Failed to fetch')) {
        errorMessage = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
      } else if (error.message) {
        errorMessage = `오류: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const getSuccessRate = (notification: NotificationHistory) => {
    if (notification.sent_count === 0) return 0;
    return Math.round((notification.success_count / notification.sent_count) * 100);
  };

  const getOpenRate = (notificationId: string) => {
    const rate = openRates[notificationId] || 0;
    // 디버깅을 위한 로그 (처음 몇 개만)
    if (Object.keys(openRates).length > 0 && Math.random() < 0.1) {
      console.log(`🎯 getOpenRate(${notificationId.slice(0,8)}...): ${rate}%`);
    }
    return rate;
  };

  const formatKST = (dateString: string) => {
    const date = new Date(dateString);
    // Intl.DateTimeFormat을 사용하여 한국 시간대로 변환
    const kstFormatter = new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const parts = kstFormatter.formatToParts(date);
    const year = parts.find(part => part.type === 'year')?.value;
    const month = parts.find(part => part.type === 'month')?.value;
    const day = parts.find(part => part.type === 'day')?.value;
    const hour = parts.find(part => part.type === 'hour')?.value;
    const minute = parts.find(part => part.type === 'minute')?.value;
    
    return `${year}.${month}.${day} ${hour}:${minute} KST`;
  };

  const fetchOpenRates = async (forceRefresh = false) => {
    try {
      console.log(forceRefresh ? '🔄 Force refreshing open rates...' : '🔄 Fetching open rates...');
      const response = await fetch('/api/push/calculate-open-rates', {
        cache: forceRefresh ? 'no-cache' : 'default',
        headers: forceRefresh ? {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 API Response:', data);
        
        if (data.success) {
          setOpenRates(data.openRates);
          console.log('✅ Open rates updated in React state:', data.openRates);
          
          // Save to cache
          localStorage.setItem('admin_open_rates_cache', JSON.stringify({
            data: data.openRates,
            timestamp: Date.now()
          }));
          console.log('💾 Saved open rates to cache');
          
          // 성공 메시지 표시
          const nonZeroRates = Object.values(data.openRates as Record<string, number>).filter((rate) => rate > 0).length;
          console.log(`📈 ${nonZeroRates} notifications have open rates > 0%`);
        } else {
          console.error('❌ API returned success: false', data);
        }
      } else {
        console.error('❌ API response not ok:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error fetching open rates:', error);
    }
  };

  const fetchSubscriberTrend = async () => {
    try {
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        // const dateStr = format(date, 'yyyy-MM-dd'); // 현재 사용하지 않음
        
        const { count } = await supabase
          .from('push_subscriptions')
          .select('*', { count: 'exact', head: true })
          .lte('created_at', endOfDay(date).toISOString());
          
        last7Days.push({
          date: format(date, 'MM/dd', { locale: ko }),
          subscribers: count || 0
        });
      }
      
      setSubscriberTrendData(last7Days);
    } catch (error) {
      console.error('Error fetching subscriber trend:', error);
    }
  };


  const toggleNotificationSelection = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(notifId => notifId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };

  const handleDeleteNotifications = async () => {
    if (selectedNotifications.length === 0) {
      alert('삭제할 알림을 선택해주세요.');
      return;
    }

    const confirmMessage = `선택한 ${selectedNotifications.length}개의 발송 기록을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`;
    if (!confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/push/delete-notifications', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedNotifications }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ ${result.deletedCount}개의 발송 기록이 삭제되었습니다.`);
        setSelectedNotifications([]);
        await fetchNotificationHistory();
      } else {
        alert(`❌ 삭제 실패: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Delete notifications error:', error);
      alert(`❌ 오류 발생: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const quickNotifications = [
    {
      title: '새 공지사항',
      body: '새로운 중요 공지사항이 등록되었습니다.',
      url: '/announcements'
    },
    {
      title: '일정 알림',
      body: '곧 다가오는 중요 일정이 있습니다.',
      url: '/calendar'
    },
    {
      title: '긴급 공지',
      body: '긴급한 공지사항을 확인해주세요.',
      url: '/announcements',
      requireInteraction: true
    }
  ];

  return (
    <>
      <Head>
        <title>푸시 알림 관리 - 관리자</title>
      </Head>

      <AdminLayout title="푸시 알림 관리">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div 
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setShowSubscribersModal(true)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">활성 구독자</p>
                <p className="text-2xl font-bold text-gray-900">{subscriptionCount}</p>
                <p className="text-xs text-gray-500 mt-1">클릭하여 상세보기</p>
              </div>
              <FaUsers className="text-3xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 발송</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.reduce((sum, n) => sum + n.sent_count, 0)}
                </p>
              </div>
              <FaPaperPlane className="text-3xl text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">성공률</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.length > 0 
                    ? Math.round(
                        (notifications.reduce((sum, n) => sum + n.success_count, 0) / 
                         notifications.reduce((sum, n) => sum + n.sent_count, 0)) * 100
                      )
                    : 0}%
                </p>
              </div>
              <FaCheckCircle className="text-3xl text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Subscription Management Panel */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaUsers className="text-blue-500" />
                구독 관리
              </h2>
              <button
                onClick={() => setShowSubscriptionManager(!showSubscriptionManager)}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <FaCog />
                {showSubscriptionManager ? '숨기기' : '관리 도구'}
              </button>
            </div>
            
            {showSubscriptionManager && (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 mb-3">
                    ⚠️ 주의: VAPID 키를 변경한 경우 기존 구독이 작동하지 않을 수 있습니다.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleClearSubscriptions('clear-inactive')}
                      disabled={loading}
                      className="px-3 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded transition-colors disabled:opacity-50"
                    >
                      <FaTrash className="inline mr-1" />
                      비활성 구독 삭제
                    </button>
                    <button
                      onClick={() => handleClearSubscriptions('clear-old')}
                      disabled={loading}
                      className="px-3 py-1 text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 rounded transition-colors disabled:opacity-50"
                    >
                      <FaTrash className="inline mr-1" />
                      30일 이상된 구독 삭제
                    </button>
                    <button
                      onClick={() => handleClearSubscriptions('mark-inactive')}
                      disabled={loading}
                      className="px-3 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded transition-colors disabled:opacity-50"
                    >
                      <FaSync className="inline mr-1" />
                      모든 구독 비활성화
                    </button>
                    <button
                      onClick={() => handleClearSubscriptions('clear-all')}
                      disabled={loading}
                      className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors disabled:opacity-50"
                    >
                      <FaTrash className="inline mr-1" />
                      모든 구독 삭제 (위험!)
                    </button>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-800 mb-2">구독 재등록 안내</h4>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>위에서 기존 구독을 정리합니다</li>
                    <li>메인 페이지에서 "알림 받기" 버튼 클릭</li>
                    <li>브라우저 알림 권한 허용</li>
                    <li>새로운 VAPID 키로 구독 완료</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* System Status & Debug Panel */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaCog className="text-gray-500" />
                시스템 상태
              </h2>
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <FaEye />
                {showDebug ? '숨기기' : '상세보기'}
              </button>
            </div>

            {systemStatus && (
              <div className="space-y-4">
                {/* Configuration Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                      <FaKey className="text-blue-500" />
                      VAPID 설정
                    </h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        {systemStatus.vapidPublicKey ? (
                          <FaCheckCircle className="text-green-500" />
                        ) : (
                          <FaExclamationTriangle className="text-red-500" />
                        )}
                        <span className={systemStatus.vapidPublicKey ? 'text-green-700' : 'text-red-700'}>
                          Public Key: {systemStatus.vapidPublicKey ? '설정됨' : '누락'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {systemStatus.vapidPrivateKey ? (
                          <FaCheckCircle className="text-green-500" />
                        ) : (
                          <FaExclamationTriangle className="text-red-500" />
                        )}
                        <span className={systemStatus.vapidPrivateKey ? 'text-green-700' : 'text-red-700'}>
                          Private Key: {systemStatus.vapidPrivateKey ? '설정됨' : '누락'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {systemStatus.vapidEmail ? (
                          <FaCheckCircle className="text-green-500" />
                        ) : (
                          <FaExclamationTriangle className="text-red-500" />
                        )}
                        <span className={systemStatus.vapidEmail ? 'text-green-700' : 'text-red-700'}>
                          Email: {systemStatus.vapidEmail ? '설정됨' : '누락'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                      <FaDatabase className="text-purple-500" />
                      데이터베이스 설정
                    </h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        {systemStatus.supabaseUrl ? (
                          <FaCheckCircle className="text-green-500" />
                        ) : (
                          <FaExclamationTriangle className="text-red-500" />
                        )}
                        <span className={systemStatus.supabaseUrl ? 'text-green-700' : 'text-red-700'}>
                          Supabase URL: {systemStatus.supabaseUrl ? '설정됨' : '누락'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {systemStatus.supabaseKey ? (
                          <FaCheckCircle className="text-green-500" />
                        ) : (
                          <FaExclamationTriangle className="text-red-500" />
                        )}
                        <span className={systemStatus.supabaseKey ? 'text-green-700' : 'text-red-700'}>
                          Supabase Key: {systemStatus.supabaseKey ? '설정됨' : '누락'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          환경: {systemStatus.environment}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overall Status */}
                <div className="p-3 rounded-lg border-2 border-dashed">
                  {systemStatus.isConfigured ? (
                    <div className="flex items-center gap-2 text-green-700">
                      <FaCheckCircle className="text-green-500" />
                      <span className="font-semibold">시스템 설정이 완료되었습니다</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-700">
                      <FaExclamationTriangle className="text-red-500" />
                      <span className="font-semibold">시스템 설정이 완료되지 않았습니다</span>
                    </div>
                  )}
                </div>

                {/* Error Messages */}
                {systemStatus.errors && systemStatus.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <h4 className="font-semibold text-red-800 mb-2">설정 오류:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {systemStatus.errors.map((error, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">•</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Debug Details */}
                {showDebug && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">상세 디버그 정보</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">환경 변수 상태</h5>
                        <div className="text-xs space-y-1 font-mono">
                          <div className="flex justify-between">
                            <span>NEXT_PUBLIC_VAPID_PUBLIC_KEY:</span>
                            <span className={systemStatus.vapidPublicKey ? 'text-green-600' : 'text-red-600'}>
                              {systemStatus.vapidPublicKey ? 'SET' : 'MISSING'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>VAPID_PRIVATE_KEY:</span>
                            <span className={systemStatus.vapidPrivateKey ? 'text-green-600' : 'text-red-600'}>
                              {systemStatus.vapidPrivateKey ? 'SET' : 'MISSING'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>VAPID_EMAIL:</span>
                            <span className={systemStatus.vapidEmail ? 'text-green-600' : 'text-red-600'}>
                              {systemStatus.vapidEmail ? 'SET' : 'MISSING'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>NEXT_PUBLIC_SUPABASE_URL:</span>
                            <span className={systemStatus.supabaseUrl ? 'text-green-600' : 'text-red-600'}>
                              {systemStatus.supabaseUrl ? 'SET' : 'MISSING'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                            <span className={systemStatus.supabaseKey ? 'text-green-600' : 'text-red-600'}>
                              {systemStatus.supabaseKey ? 'SET' : 'MISSING'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">권장 해결 방법</h5>
                        <div className="text-xs text-gray-600 space-y-2">
                          {!systemStatus.isConfigured && (
                            <>
                              <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                                <p className="font-medium text-yellow-800">Vercel 환경변수 설정:</p>
                                <p className="text-yellow-700">
                                  1. Vercel 대시보드 → 프로젝트 → Settings → Environment Variables<br/>
                                  2. 필요한 VAPID 키들을 추가<br/>
                                  3. 배포 후 재시도
                                </p>
                              </div>
                              <div className="bg-blue-50 border border-blue-200 rounded p-2">
                                <p className="font-medium text-blue-800">데이터베이스 테이블:</p>
                                <p className="text-blue-700">
                                  Supabase SQL Editor에서 database/push_notifications.sql 실행
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h5 className="font-medium text-gray-700 mb-2">빠른 작업</h5>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={fetchSystemStatus}
                          className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                        >
                          상태 새로고침
                        </button>
                        <button
                          onClick={handleSetupTables}
                          disabled={loading}
                          className="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? '생성 중...' : '테이블 자동 생성'}
                        </button>
                        <button
                          onClick={() => window.open('https://dashboard.vercel.com', '_blank')}
                          className="px-3 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded transition-colors"
                        >
                          Vercel 대시보드
                        </button>
                        <button
                          onClick={handleGenerateVapidGuide}
                          className="px-3 py-1 text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 rounded transition-colors"
                        >
                          VAPID 키 생성 가이드
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!systemStatus && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                <p className="text-gray-500 text-sm mt-2">시스템 상태 확인 중...</p>
              </div>
            )}
          </div>
        </div>

        {/* Subscriber Trend Chart */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaChartLine className="text-green-500" />
              구독자 추이 (최근 7일)
            </h2>
            <SubscriberChart data={subscriberTrendData} />
            <p className="text-sm text-gray-500 mt-2">
              * 매일 자정 기준 누적 구독자 수
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Send Notification Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaBell className="text-blue-500" />
              알림 발송
            </h2>

            <form onSubmit={handleSendNotification} className="space-y-4">
              {/* Content Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  알림 유형
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedContent('custom');
                      setSelectedItemId('');
                    }}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      selectedContent === 'custom' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    직접 작성
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedContent('announcement')}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors flex items-center gap-1 ${
                      selectedContent === 'announcement' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FaBullhorn className="text-xs" />
                    공지사항 선택
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedContent('calendar')}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors flex items-center gap-1 ${
                      selectedContent === 'calendar' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FaCalendarAlt className="text-xs" />
                    일정 선택
                  </button>
                </div>

                {/* Announcement Selection */}
                {selectedContent === 'announcement' && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-3">
                    <label className="block text-xs font-medium text-blue-700 mb-2">
                      최근 공지사항
                    </label>
                    <select
                      value={selectedItemId}
                      onChange={(e) => handleContentSelection('announcement', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">선택하세요</option>
                      {recentAnnouncements.map((announcement) => (
                        <option key={announcement.id} value={announcement.id}>
                          [{announcement.category}] {announcement.title.substring(0, 30)}...
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Calendar Event Selection */}
                {selectedContent === 'calendar' && (
                  <div className="bg-green-50 rounded-lg p-3 mb-3">
                    <label className="block text-xs font-medium text-green-700 mb-2">
                      예정된 일정
                    </label>
                    <select
                      value={selectedItemId}
                      onChange={(e) => handleContentSelection('calendar', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">선택하세요</option>
                      {recentCalendarEvents.map((event) => (
                        <option key={event.id} value={event.id}>
                          [{format(new Date(event.start_date), 'MM/dd', { locale: ko })}] {event.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="알림 제목을 입력하세요"
                  maxLength={50}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{form.title.length}/50</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  내용 *
                </label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="알림 내용을 입력하세요"
                  rows={3}
                  maxLength={120}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{form.body.length}/120</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  링크 URL
                </label>
                <select
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="/">홈페이지</option>
                  <option value="/announcements">공지사항</option>
                  <option value="/calendar">학사일정</option>
                  <option value="/curriculum">교육과정</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireInteraction"
                  checked={form.requireInteraction}
                  onChange={(e) => setForm({ ...form, requireInteraction: e.target.checked })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="requireInteraction" className="ml-2 text-sm text-gray-700">
                  중요 알림 (사용자가 직접 닫을 때까지 유지)
                </label>
              </div>

              {/* Quick Templates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  빠른 템플릿
                </label>
                <div className="flex flex-wrap gap-2">
                  {quickNotifications.map((template, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setForm({ ...form, ...template })}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {template.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">미리보기</h3>
                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-3">
                    <img src="/icons/icon-72x72.png" alt="앱 아이콘" className="w-8 h-8 rounded" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {form.title || '알림 제목'}
                      </h4>
                      <p className="text-gray-600 text-xs mt-1">
                        {form.body || '알림 내용이 여기에 표시됩니다.'}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        세종대 융합창업연계전공 • 지금
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={sending || subscriptionCount === 0}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPaperPlane />
                {sending ? '발송 중...' : `${subscriptionCount}명에게 알림 발송`}
              </button>
            </form>
          </div>

          {/* Notification History */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaEye className="text-gray-500" />
                발송 기록
                {selectedNotifications.length > 0 && (
                  <span className="text-sm font-normal text-gray-500">
                    ({selectedNotifications.length}개 선택됨)
                  </span>
                )}
              </h2>
              {notifications.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // Clear cache and force refresh
                      localStorage.removeItem('admin_open_rates_cache');
                      localStorage.removeItem('admin_notifications_cache');
                      fetchNotificationHistory(true);
                    }}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                    title="캐시를 삭제하고 최신 데이터를 불러옵니다"
                  >
                    <FaSync size={12} className={loading ? 'animate-spin' : ''} />
                    오픈율 갱신
                  </button>
                  <button
                    onClick={handleDeleteNotifications}
                    disabled={selectedNotifications.length === 0 || loading}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      selectedNotifications.length > 0
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    } disabled:opacity-50`}
                  >
                    <FaTrash size={12} />
                    삭제
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : notifications.length > 0 ? (
              <>
                {/* Select All Checkbox */}
                <div className="border-b pb-2 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-600">전체 선택</span>
                  </label>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`border rounded-lg p-3 transition-colors ${
                        selectedNotifications.includes(notification.id) 
                          ? 'bg-blue-50 border-blue-300' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={() => toggleNotificationSelection(notification.id)}
                          className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {notification.title}
                              </h4>
                              <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                                {notification.body}
                              </p>
                              <p className="text-gray-400 text-xs mt-2">
                                {formatKST(notification.created_at)}
                              </p>
                            </div>
                            <div className="ml-4 text-right">
                              <div className="flex items-center gap-1 text-xs">
                                <FaCheckCircle className="text-green-500" />
                                <span className="text-gray-600">{notification.success_count}</span>
                              </div>
                              {notification.error_count > 0 && (
                                <div className="flex items-center gap-1 text-xs mt-1">
                                  <FaExclamationTriangle className="text-red-500" />
                                  <span className="text-gray-600">{notification.error_count}</span>
                                </div>
                              )}
                              <div className="text-xs text-gray-500 mt-1">
                                성공률 {getSuccessRate(notification)}%
                              </div>
                              <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                                <FaMouse size={10} />
                                <span>오픈율 {getOpenRate(notification.id)}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                아직 발송된 알림이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📱 PWA 알림 사용 안내</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• 사용자가 웹사이트를 방문하여 헤더의 "알림 받기" 버튼을 클릭해야 구독됩니다.</p>
            <p>• 브라우저에서 알림 권한을 허용해야 푸시 알림을 받을 수 있습니다.</p>
            <p>• PWA로 설치된 앱에서는 더 안정적인 알림 수신이 가능합니다.</p>
            <p>• HTTPS 환경에서만 푸시 알림이 작동합니다.</p>
          </div>
        </div>

        {/* Subscribers Modal */}
        <SubscribersModal
          isOpen={showSubscribersModal}
          onClose={() => setShowSubscribersModal(false)}
          subscriptionCount={subscriptionCount}
          onSubscriptionDeleted={fetchSubscriptionCount}
        />
      </AdminLayout>
    </>
  );
};


export default AdminNotificationsPage;
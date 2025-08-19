import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/Admin/AdminLayout';
import { FaBell, FaPaperPlane, FaUsers, FaCheckCircle, FaExclamationTriangle, FaEye } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

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
  admin_email: string;
  created_at: string;
  sent_at: string;
}

const AdminNotificationsPage = () => {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [subscriptionCount, setSubscriptionCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationHistory[]>([]);
  const [form, setForm] = useState<NotificationForm>({
    title: '',
    body: '',
    url: '/',
    requireInteraction: false
  });

  useEffect(() => {
    fetchSubscriptionCount();
    fetchNotificationHistory();
  }, []);

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

  const fetchNotificationHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
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
        throw new Error(result.error || '알림 전송에 실패했습니다.');
      }
    } catch (error) {
      console.error('Send notification error:', error);
      alert('알림 전송 중 오류가 발생했습니다.');
    } finally {
      setSending(false);
    }
  };

  const getSuccessRate = (notification: NotificationHistory) => {
    if (notification.sent_count === 0) return 0;
    return Math.round((notification.success_count / notification.sent_count) * 100);
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">활성 구독자</p>
                <p className="text-2xl font-bold text-gray-900">{subscriptionCount}</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Send Notification Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaBell className="text-blue-500" />
              알림 발송
            </h2>

            <form onSubmit={handleSendNotification} className="space-y-4">
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
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaEye className="text-gray-500" />
              발송 기록
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {notification.title}
                        </h4>
                        <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                          {notification.body}
                        </p>
                        <p className="text-gray-400 text-xs mt-2">
                          {format(new Date(notification.created_at), 'MM/dd HH:mm', { locale: ko })}
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
      </AdminLayout>
    </>
  );
};


export default AdminNotificationsPage;
import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaClock, FaDesktop, FaTrash, FaSearch, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Subscriber {
  id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  user_agent: string | null;
  ip_address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SubscribersModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionCount: number;
  onSubscriptionDeleted?: () => void;
}

const SubscribersModal: React.FC<SubscribersModalProps> = ({ 
  isOpen, 
  onClose, 
  subscriptionCount,
  onSubscriptionDeleted 
}) => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('active');

  useEffect(() => {
    if (isOpen) {
      fetchSubscribers();
    }
  }, [isOpen, filterActive]);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      let query = supabaseAdmin
        .from('push_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterActive === 'active') {
        query = query.eq('is_active', true);
      } else if (filterActive === 'inactive') {
        query = query.eq('is_active', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      alert('구독자 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!confirm('이 구독을 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabaseAdmin
        .from('push_subscriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSubscribers(prev => prev.filter(sub => sub.id !== id));
      if (onSubscriptionDeleted) {
        onSubscriptionDeleted();
      }
      alert('구독이 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting subscription:', error);
      alert('구독 삭제에 실패했습니다.');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabaseAdmin
        .from('push_subscriptions')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setSubscribers(prev => 
        prev.map(sub => 
          sub.id === id ? { ...sub, is_active: !currentStatus } : sub
        )
      );
    } catch (error) {
      console.error('Error toggling subscription status:', error);
      alert('상태 변경에 실패했습니다.');
    }
  };

  const getBrowserInfo = (userAgent: string | null) => {
    if (!userAgent) return '알 수 없음';
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return '기타';
  };

  const getDeviceInfo = (userAgent: string | null) => {
    if (!userAgent) return '알 수 없음';
    
    if (userAgent.includes('Mobile')) return '모바일';
    if (userAgent.includes('Tablet')) return '태블릿';
    return '데스크톱';
  };

  const filteredSubscribers = subscribers.filter(sub => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        sub.id.toLowerCase().includes(searchLower) ||
        (sub.user_agent && sub.user_agent.toLowerCase().includes(searchLower)) ||
        (sub.ip_address && sub.ip_address.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-primary text-white flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">구독자 목록</h2>
            <p className="text-white/80 text-sm mt-1">
              전체 {subscriptionCount}명 | 표시 중 {filteredSubscribers.length}명
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="검색 (ID, 브라우저, IP)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterActive('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterActive === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-white border hover:bg-gray-50'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setFilterActive('active')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterActive === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-white border hover:bg-gray-50'
                }`}
              >
                활성
              </button>
              <button
                onClick={() => setFilterActive('inactive')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterActive === 'inactive'
                    ? 'bg-gray-600 text-white'
                    : 'bg-white border hover:bg-gray-50'
                }`}
              >
                비활성
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-gray-600">구독자 목록을 불러오는 중...</p>
            </div>
          ) : filteredSubscribers.length > 0 ? (
            <div className="grid gap-4">
              {filteredSubscribers.map((subscriber) => (
                <div
                  key={subscriber.id}
                  className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-full ${
                          subscriber.is_active ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <FaUser className={`${
                            subscriber.is_active ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {subscriber.id.substring(0, 8)}...
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <FaClock />
                            {format(new Date(subscriber.created_at), 'yyyy.MM.dd HH:mm', { locale: ko })}
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          subscriber.is_active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {subscriber.is_active ? '활성' : '비활성'}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FaDesktop className="text-gray-400" />
                          <span>
                            {getBrowserInfo(subscriber.user_agent)} / {getDeviceInfo(subscriber.user_agent)}
                          </span>
                        </div>
                        {subscriber.ip_address && (
                          <div>
                            <span className="text-gray-500">IP:</span> {subscriber.ip_address}
                          </div>
                        )}
                      </div>

                      {subscriber.user_agent && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            User Agent 상세보기
                          </summary>
                          <p className="text-xs text-gray-500 mt-1 break-all">
                            {subscriber.user_agent}
                          </p>
                        </details>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleToggleActive(subscriber.id, subscriber.is_active)}
                        className={`p-2 rounded-lg transition-colors ${
                          subscriber.is_active
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                            : 'bg-green-100 hover:bg-green-200 text-green-600'
                        }`}
                        title={subscriber.is_active ? '비활성화' : '활성화'}
                      >
                        {subscriber.is_active ? <FaTimesCircle /> : <FaCheckCircle />}
                      </button>
                      <button
                        onClick={() => handleDeleteSubscription(subscriber.id)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaUser className="text-gray-300 text-5xl mx-auto mb-4" />
              <p className="text-gray-500">구독자가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscribersModal;
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/Admin/AdminLayout';
import { FaBullhorn, FaCalendarAlt, FaChartLine, FaPlus, FaEye, FaBell } from 'react-icons/fa';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    announcements: 0,
    events: 0,
    pinnedAnnouncements: 0,
    upcomingEvents: 0
  });
  const [recentAnnouncements, setRecentAnnouncements] = useState<any[]>([]);
  const [popularAnnouncements, setPopularAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch announcements count
      const { count: announcementsCount } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true });

      // Fetch pinned announcements count
      const { count: pinnedCount } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true })
        .eq('is_pinned', true);

      // Fetch events count
      const { count: eventsCount } = await supabase
        .from('academic_calendar')
        .select('*', { count: 'exact', head: true });

      // Fetch upcoming events count
      const { count: upcomingCount } = await supabase
        .from('academic_calendar')
        .select('*', { count: 'exact', head: true })
        .gte('start_date', new Date().toISOString());

      // Fetch recent announcements
      const { data: announcements } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch popular announcements (by view count)
      const { data: popular } = await supabase
        .from('announcements')
        .select('*')
        .order('view_count', { ascending: false })
        .limit(5);

      setStats({
        announcements: announcementsCount || 0,
        events: eventsCount || 0,
        pinnedAnnouncements: pinnedCount || 0,
        upcomingEvents: upcomingCount || 0
      });

      setRecentAnnouncements(announcements || []);
      setPopularAnnouncements(popular || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set mock data for development
      setStats({
        announcements: 3,
        events: 4,
        pinnedAnnouncements: 1,
        upcomingEvents: 2
      });
      setRecentAnnouncements([
        {
          id: '1',
          title: '2025학년도 1학기 융합창업연계전공 신청 안내',
          category: 'important',
          created_at: '2025-01-18'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: '전체 공지사항',
      value: stats.announcements,
      icon: FaBullhorn,
      color: 'bg-blue-500',
      link: '/admin/announcements'
    },
    {
      title: '고정된 공지',
      value: stats.pinnedAnnouncements,
      icon: FaBullhorn,
      color: 'bg-yellow-500',
      link: '/admin/announcements'
    },
    {
      title: '전체 일정',
      value: stats.events,
      icon: FaCalendarAlt,
      color: 'bg-green-500',
      link: '/admin/calendar'
    },
    {
      title: '예정된 일정',
      value: stats.upcomingEvents,
      icon: FaCalendarAlt,
      color: 'bg-purple-500',
      link: '/admin/calendar'
    }
  ];

  return (
    <>
      <Head>
        <title>관리자 대시보드 - 세종대 융합창업연계전공</title>
      </Head>

      <AdminLayout title="대시보드">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Link 
                    key={index} 
                    href={stat.link}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow block"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${stat.color} text-white p-3 rounded-lg`}>
                        <Icon size={24} />
                      </div>
                      <FaChartLine className="text-gray-400" />
                    </div>
                    <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                  </Link>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">빠른 작업</h2>
                <div className="space-y-3">
                  <Link 
                    href="/admin/announcements/new"
                    className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <FaPlus className="text-blue-600" />
                    <span className="font-medium">새 공지사항 작성</span>
                  </Link>
                  <Link 
                    href="/admin/calendar/new"
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <FaPlus className="text-green-600" />
                    <span className="font-medium">새 일정 추가</span>
                  </Link>
                </div>
              </div>

              {/* Recent Announcements */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">최근 공지사항</h2>
                  <Link 
                    href="/admin/announcements"
                    className="text-primary hover:text-primary/80 text-sm"
                  >
                    전체보기
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentAnnouncements.length > 0 ? (
                    recentAnnouncements.map(announcement => (
                      <Link 
                        key={announcement.id} 
                        href={`/announcements/${announcement.id}`}
                        className="block border-b pb-2 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
                      >
                        <h3 className="font-medium text-sm line-clamp-1 text-gray-800 hover:text-primary">
                          {announcement.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(announcement.created_at), 'yyyy.MM.dd', { locale: ko })}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">아직 공지사항이 없습니다.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Popular Announcements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FaEye className="text-purple-500" />
                    인기 공지사항
                  </h2>
                  <Link 
                    href="/admin/announcements"
                    className="text-primary hover:text-primary/80 text-sm"
                  >
                    전체보기
                  </Link>
                </div>
                <div className="space-y-3">
                  {popularAnnouncements.length > 0 ? (
                    popularAnnouncements.map((announcement, index) => (
                      <Link 
                        key={announcement.id} 
                        href={`/announcements/${announcement.id}`}
                        className="flex items-center justify-between border-b pb-2 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-400">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <h3 className="font-medium text-sm line-clamp-1 text-gray-800 hover:text-primary">
                              {announcement.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {format(new Date(announcement.created_at), 'yyyy.MM.dd', { locale: ko })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <FaEye size={12} />
                          <span>{announcement.view_count || 0}</span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">아직 공지사항이 없습니다.</p>
                  )}
                </div>
              </div>

              {/* Push Notification Summary */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FaBell className="text-blue-500" />
                    푸시 알림 현황
                  </h2>
                  <Link 
                    href="/admin/notifications"
                    className="text-primary hover:text-primary/80 text-sm"
                  >
                    상세보기
                  </Link>
                </div>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p>푸시 알림 현황을 확인하세요.</p>
                    <p className="mt-2">구독자 수, 발송 기록, 성공률 등을 확인할 수 있습니다.</p>
                  </div>
                  <Link 
                    href="/admin/notifications"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <FaBell />
                    푸시 알림 관리로 이동
                  </Link>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-bold mb-2">시스템 정보</h3>
              <p className="text-sm text-gray-700">
                Supabase와 연동된 관리자 시스템입니다. 
                공지사항과 학사일정을 실시간으로 관리할 수 있습니다.
              </p>
            </div>
          </>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminDashboard;
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../../components/Admin/AdminLayout';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaSearch, FaStar } from 'react-icons/fa';
import { supabase, AcademicEvent } from '../../../lib/supabase';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const AdminCalendarPage = () => {
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('academic_calendar')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      // Mock data for development
      setEvents([
        {
          id: '1',
          title: '2025학년도 1학기 개강',
          start_date: '2025-03-02',
          end_date: '2025-03-02',
          event_type: 'semester',
          description: '2025학년도 1학기가 시작됩니다.',
          created_at: '2025-01-18'
        },
        {
          id: '2',
          title: '중간고사',
          start_date: '2025-04-20',
          end_date: '2025-04-26',
          event_type: 'exam',
          description: '중간고사 기간입니다.',
          created_at: '2025-01-18'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('academic_calendar')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setEvents(events.filter(e => e.id !== id));
      alert('일정이 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const getEventTypeBadge = (type: string) => {
    const colors = {
      semester: 'bg-blue-100 text-blue-800',
      exam: 'bg-red-100 text-red-800',
      holiday: 'bg-green-100 text-green-800',
      application: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    const labels = {
      semester: '학기',
      exam: '시험',
      holiday: '휴일',
      application: '신청',
      other: '기타'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[type as keyof typeof colors]}`}>
        {labels[type as keyof typeof labels]}
      </span>
    );
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || event.event_type === selectedType;
    
    let matchesMonth = true;
    if (selectedMonth !== 'all') {
      const eventMonth = new Date(event.start_date).getMonth() + 1;
      matchesMonth = eventMonth === parseInt(selectedMonth);
    }
    
    return matchesSearch && matchesType && matchesMonth;
  });

  return (
    <>
      <Head>
        <title>학사일정 관리 - 관리자</title>
      </Head>

      <AdminLayout title="학사일정 관리">
        {/* Header Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">전체 유형</option>
                <option value="semester">학기</option>
                <option value="exam">시험</option>
                <option value="holiday">휴일</option>
                <option value="application">신청</option>
                <option value="other">기타</option>
              </select>

              {/* Month Filter */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">전체 월</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}월</option>
                ))}
              </select>
            </div>
            
            <Link 
              href="/admin/calendar/new"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <FaPlus />
              새 일정 추가
            </Link>
          </div>
        </div>

        {/* Calendar Table - Desktop View */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredEvents.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 border-b sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                        일정명
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                        유형
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        시작일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        종료일
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {event.title}
                              </div>
                              {event.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {event.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getEventTypeBadge(event.event_type)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {format(new Date(event.start_date), 'yyyy.MM.dd', { locale: ko })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {format(new Date(event.end_date), 'yyyy.MM.dd', { locale: ko })}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <Link 
                              href={`/admin/calendar/${event.id}`}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                              <FaEdit />
                            </Link>
                            <button
                              onClick={() => handleDelete(event.id)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="p-4 border-b hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        {event.description && (
                          <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                        )}
                      </div>
                      <div className="ml-2">
                        {getEventTypeBadge(event.event_type)}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <div>시작: {format(new Date(event.start_date), 'yyyy.MM.dd', { locale: ko })}</div>
                      <div>종료: {format(new Date(event.end_date), 'yyyy.MM.dd', { locale: ko })}</div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link 
                        href={`/admin/calendar/${event.id}`}
                        className="flex-1 text-center py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        수정
                      </Link>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="flex-1 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-gray-500">
              검색 결과가 없습니다.
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">전체 일정</p>
                <p className="text-2xl font-bold text-gray-800">{events.length}</p>
              </div>
              <FaCalendarAlt className="text-3xl text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">이번 달 일정</p>
                <p className="text-2xl font-bold text-gray-800">
                  {events.filter(e => {
                    const eventMonth = new Date(e.start_date).getMonth();
                    const currentMonth = new Date().getMonth();
                    return eventMonth === currentMonth;
                  }).length}
                </p>
              </div>
              <FaCalendarAlt className="text-3xl text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">예정된 시험</p>
                <p className="text-2xl font-bold text-gray-800">
                  {events.filter(e => e.event_type === 'exam' && new Date(e.start_date) > new Date()).length}
                </p>
              </div>
              <FaCalendarAlt className="text-3xl text-red-400" />
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminCalendarPage;
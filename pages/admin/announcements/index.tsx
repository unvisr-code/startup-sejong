import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../../components/Admin/AdminLayout';
import { FaPlus, FaEdit, FaTrash, FaThumbtack, FaSearch } from 'react-icons/fa';
import { supabase, Announcement } from '../../../lib/supabase';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const AdminAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      // Mock data for development
      setAnnouncements([
        {
          id: '1',
          title: '2025학년도 1학기 융합창업연계전공 신청 안내',
          content: '신청 기간 안내...',
          category: 'important',
          is_pinned: true,
          created_at: '2025-01-18',
          updated_at: '2025-01-18'
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
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setAnnouncements(announcements.filter(a => a.id !== id));
      alert('공지사항이 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleTogglePin = async (announcement: Announcement) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_pinned: !announcement.is_pinned })
        .eq('id', announcement.id);

      if (error) throw error;
      
      setAnnouncements(announcements.map(a => 
        a.id === announcement.id 
          ? { ...a, is_pinned: !a.is_pinned }
          : a
      ));
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert('고정 상태 변경 중 오류가 발생했습니다.');
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || announcement.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadge = (category: string) => {
    const colors = {
      important: 'bg-red-100 text-red-800',
      academic: 'bg-blue-100 text-blue-800',
      event: 'bg-green-100 text-green-800',
      general: 'bg-gray-100 text-gray-800'
    };
    const labels = {
      important: '중요',
      academic: '학사',
      event: '행사',
      general: '일반'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[category as keyof typeof colors]}`}>
        {labels[category as keyof typeof labels]}
      </span>
    );
  };

  return (
    <>
      <Head>
        <title>공지사항 관리 - 관리자</title>
      </Head>

      <AdminLayout title="공지사항 관리">
        {/* Header Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-96 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">전체</option>
                <option value="important">중요</option>
                <option value="academic">학사</option>
                <option value="event">행사</option>
                <option value="general">일반</option>
              </select>
              
              <Link href="/admin/announcements/new">
                <a className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                  <FaPlus />
                  새 공지사항
                </a>
              </Link>
            </div>
          </div>
        </div>

        {/* Announcements Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredAnnouncements.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      제목
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      카테고리
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작성일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      고정
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAnnouncements.map((announcement) => (
                    <tr key={announcement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {announcement.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getCategoryBadge(announcement.category)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {format(new Date(announcement.created_at), 'yyyy.MM.dd', { locale: ko })}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleTogglePin(announcement)}
                          className={`p-2 rounded-lg transition-colors ${
                            announcement.is_pinned
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          <FaThumbtack />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/announcements/${announcement.id}`}>
                            <a className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                              <FaEdit />
                            </a>
                          </Link>
                          <button
                            onClick={() => handleDelete(announcement.id)}
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
          ) : (
            <div className="p-12 text-center text-gray-500">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminAnnouncementsPage;
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../../components/Admin/AdminLayout';
import { FaPlus, FaEdit, FaTrash, FaThumbtack, FaSearch, FaEye, FaDownload, FaSpinner } from 'react-icons/fa';
import { supabase, Announcement } from '../../../lib/supabase';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { showSuccess, showError, showSupabaseError } from '../../../lib/toast';

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
        .select(`
          *,
          announcement_attachments(
            download_count
          )
        `)
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
              
              <Link 
                href="/admin/announcements/new"
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <FaPlus />
                새 공지사항
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
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 border-b sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[250px]">
                        제목
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                        카테고리
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        작성일
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                        조회수
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                        다운로드
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                        고정
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAnnouncements.map((announcement) => (
                      <tr key={announcement.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {announcement.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getCategoryBadge(announcement.category)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {format(new Date(announcement.created_at), 'yyyy.MM.dd', { locale: ko })}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                            <FaEye className="text-gray-400" size={12} />
                            {announcement.view_count || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                            <FaDownload className="text-gray-400" size={12} />
                            {(announcement as any).announcement_attachments?.reduce((sum: number, att: any) => sum + (att.download_count || 0), 0) || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
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
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <Link 
                              href={`/admin/announcements/${announcement.id}`}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                              <FaEdit />
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

              {/* Mobile Card View */}
              <div className="lg:hidden">
                {filteredAnnouncements.map((announcement) => (
                  <div key={announcement.id} className="p-4 border-b hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {getCategoryBadge(announcement.category)}
                        <button
                          onClick={() => handleTogglePin(announcement)}
                          className={`p-1 rounded transition-colors ${
                            announcement.is_pinned
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          <FaThumbtack size={12} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      작성일: {format(new Date(announcement.created_at), 'yyyy.MM.dd', { locale: ko })}
                    </div>
                    
                    <div className="flex gap-2">
                      <Link 
                        href={`/admin/announcements/${announcement.id}`}
                        className="flex-1 text-center py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        수정
                      </Link>
                      <button
                        onClick={() => handleDelete(announcement.id)}
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
      </AdminLayout>
    </>
  );
};

export default AdminAnnouncementsPage;
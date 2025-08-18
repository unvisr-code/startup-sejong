import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../../components/Admin/AdminLayout';
import { useForm } from 'react-hook-form';
import { FaSave, FaTimes, FaEye } from 'react-icons/fa';
import { supabase, Announcement } from '../../../lib/supabase';

interface AnnouncementForm {
  title: string;
  content: string;
  category: 'general' | 'important' | 'academic' | 'event';
  is_pinned: boolean;
}

const EditAnnouncementPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<AnnouncementForm>();

  useEffect(() => {
    if (id) {
      fetchAnnouncement(id as string);
    }
  }, [id]);

  const fetchAnnouncement = async (announcementId: string) => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('id', announcementId)
        .single();

      if (error) throw error;
      
      if (data) {
        reset({
          title: data.title,
          content: data.content,
          category: data.category,
          is_pinned: data.is_pinned
        });
      }
    } catch (error) {
      console.error('Error fetching announcement:', error);
      // Mock data for development
      reset({
        title: '2025학년도 1학기 융합창업연계전공 신청 안내',
        content: '<h2>신청 대상</h2><p>세종대학교 재학생 중 창업에 관심이 있는 모든 학생</p>',
        category: 'important',
        is_pinned: true
      });
    } finally {
      setFetching(false);
    }
  };

  const onSubmit = async (data: AnnouncementForm) => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('announcements')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      alert('공지사항이 수정되었습니다.');
      router.push('/admin/announcements');
    } catch (error) {
      console.error('Error updating announcement:', error);
      alert('공지사항 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const content = watch('content');
  const title = watch('title');
  const category = watch('category');

  if (fetching) {
    return (
      <AdminLayout title="공지사항 수정">
        <div className="flex justify-center items-center h-64">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>공지사항 수정 - 관리자</title>
      </Head>

      <AdminLayout title="공지사항 수정">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Edit Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">편집</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제목 *
                  </label>
                  <input
                    type="text"
                    {...register('title', { required: '제목을 입력해주세요' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="공지사항 제목을 입력하세요"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                {/* Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      카테고리 *
                    </label>
                    <select
                      {...register('category')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="general">일반</option>
                      <option value="important">중요</option>
                      <option value="academic">학사</option>
                      <option value="event">행사</option>
                    </select>
                  </div>

                  {/* Pin Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      상단 고정
                    </label>
                    <div className="flex items-center h-[42px]">
                      <input
                        type="checkbox"
                        {...register('is_pinned')}
                        className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-600">
                        목록 상단에 고정
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    내용 *
                  </label>
                  <textarea
                    {...register('content', { required: '내용을 입력해주세요' })}
                    rows={20}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                    placeholder="공지사항 내용을 입력하세요. HTML 태그를 사용할 수 있습니다."
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    HTML 태그 사용 가능 (예: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;br&gt;)
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 lg:hidden"
                  >
                    <FaEye />
                    {showPreview ? '편집' : '미리보기'}
                  </button>
                  
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => router.push('/admin/announcements')}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <FaTimes />
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaSave />
                      {loading ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Preview */}
            <div className={`bg-white rounded-lg shadow-md p-6 ${showPreview ? 'block' : 'hidden lg:block'}`}>
              <h2 className="text-lg font-semibold mb-4">미리보기</h2>
              <div className="border border-gray-200 rounded-lg p-6">
                {/* Category Badge */}
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    category === 'important' ? 'bg-red-100 text-red-800' :
                    category === 'academic' ? 'bg-blue-100 text-blue-800' :
                    category === 'event' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {category === 'important' ? '중요' :
                     category === 'academic' ? '학사' :
                     category === 'event' ? '행사' : '일반'}
                  </span>
                  {watch('is_pinned') && (
                    <span className="ml-2 inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                      고정됨
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold mb-4 text-gray-800">
                  {title || '제목을 입력하세요'}
                </h1>

                {/* Content */}
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: content || '<p class="text-gray-400">내용을 입력하세요...</p>' 
                  }}
                />
              </div>

              {/* HTML Helper */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">HTML 태그 도우미</h3>
                <div className="space-y-1 text-xs text-gray-600 font-mono">
                  <div>&lt;h2&gt;제목&lt;/h2&gt; - 큰 제목</div>
                  <div>&lt;h3&gt;소제목&lt;/h3&gt; - 작은 제목</div>
                  <div>&lt;p&gt;문단&lt;/p&gt; - 일반 문단</div>
                  <div>&lt;strong&gt;강조&lt;/strong&gt; - <strong>굵은 글씨</strong></div>
                  <div>&lt;ul&gt;&lt;li&gt;항목&lt;/li&gt;&lt;/ul&gt; - 목록</div>
                  <div>&lt;br&gt; - 줄바꿈</div>
                  <div>&lt;a href="url"&gt;링크&lt;/a&gt; - 링크</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default EditAnnouncementPage;
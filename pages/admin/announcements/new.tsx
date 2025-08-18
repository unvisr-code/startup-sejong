import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../../components/Admin/AdminLayout';
import FileUpload from '../../../components/Admin/FileUpload';
import { useForm } from 'react-hook-form';
import { FaSave, FaTimes } from 'react-icons/fa';
import { supabase } from '../../../lib/supabase';
import { uploadMultipleFiles } from '../../../lib/fileUpload';

interface AnnouncementForm {
  title: string;
  content: string;
  category: 'general' | 'important' | 'academic' | 'event';
  is_pinned: boolean;
}

const NewAnnouncementPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { register, handleSubmit, formState: { errors }, watch } = useForm<AnnouncementForm>({
    defaultValues: {
      category: 'general',
      is_pinned: false
    }
  });

  const onSubmit = async (data: AnnouncementForm) => {
    setLoading(true);
    setUploadProgress(0);
    
    try {
      // 공지사항 먼저 생성
      const { data: announcement, error: announcementError } = await supabase
        .from('announcements')
        .insert([{
          title: data.title,
          content: data.content,
          category: data.category,
          is_pinned: data.is_pinned,
          author_email: 'admin@sejong.ac.kr'
        }])
        .select()
        .single();

      if (announcementError) throw announcementError;

      // 파일이 있으면 업로드
      if (selectedFiles.length > 0) {
        const uploadResult = await uploadMultipleFiles(
          selectedFiles,
          announcement.id,
          setUploadProgress
        );

        if (!uploadResult.success) {
          console.error('File upload errors:', uploadResult.errors);
          alert(`공지사항은 생성되었지만 파일 업로드 중 오류가 발생했습니다:\n${uploadResult.errors.join('\n')}`);
        }
      }

      alert('공지사항이 성공적으로 작성되었습니다.');
      router.push('/admin/announcements');
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('공지사항 작성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const content = watch('content');

  return (
    <>
      <Head>
        <title>새 공지사항 작성 - 관리자</title>
      </Head>

      <AdminLayout title="새 공지사항 작성">
        <div className="bg-white rounded-lg shadow-md p-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('is_pinned')}
                    className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">
                    이 공지사항을 목록 상단에 고정합니다
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
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="공지사항 내용을 입력하세요. HTML 태그를 사용할 수 있습니다."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                HTML 태그 사용 가능 (예: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;)
              </p>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                파일 첨부
              </label>
              <FileUpload
                onFilesChange={setSelectedFiles}
                maxFiles={5}
                disabled={loading}
              />
              <p className="mt-1 text-sm text-gray-500">
                최대 5개 파일, 각 파일 최대 10MB
              </p>
            </div>

            {/* Upload Progress */}
            {loading && uploadProgress > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  업로드 진행률
                </label>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="mt-1 text-sm text-gray-600">{Math.round(uploadProgress)}% 완료</p>
              </div>
            )}

            {/* Preview */}
            {content && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  미리보기
                </label>
                <div 
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
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
          </form>
        </div>
      </AdminLayout>
    </>
  );
};

export default NewAnnouncementPage;
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../../components/Admin/AdminLayout';
import FileUpload from '../../../components/Admin/FileUpload';
import RichTextEditor from '../../../components/Admin/RichTextEditor';
import { useForm } from 'react-hook-form';
import { FaSave, FaTimes, FaEye, FaSpinner } from 'react-icons/fa';
import { supabase } from '../../../lib/supabase';
import { uploadMultipleFiles } from '../../../lib/fileUpload';
import { formatNotificationBody } from '../../../lib/utils';
import { showSuccess, showError, showWarning, showSupabaseError } from '../../../lib/toast';
import { useUnsavedChanges } from '../../../hooks/useUnsavedChanges';
import { sanitizeAdminPreview } from '../../../lib/sanitize';

interface AnnouncementForm {
  title: string;
  content: string;
  category: 'general' | 'important' | 'academic' | 'event';
  is_pinned: boolean;
  send_push: boolean;
}

const NewAnnouncementPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editorContent, setEditorContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<AnnouncementForm>({
    defaultValues: {
      category: 'general',
      is_pinned: false,
      send_push: false
    }
  });

  // 미저장 변경사항 감지
  const { isDirty, setIsDirty, saveNow, clearSaved } = useUnsavedChanges<AnnouncementForm>({
    formType: 'announcement',
    formId: 'new',
    enableAutoSave: true,
    enableWarning: true,
    interval: 30000, // 30초마다 자동저장
  });

  // 폼 데이터 변경 감지
  const formData = watch();
  useEffect(() => {
    if (formData.title || editorContent) {
      setIsDirty(true);
      saveNow({ ...formData, content: editorContent } as AnnouncementForm);
    }
  }, [formData.title, editorContent]);

  const onSubmit = async (data: AnnouncementForm) => {
    // 에디터 내용 검증
    if (!editorContent || editorContent === '<p><br></p>') {
      showWarning('내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // 공지사항 먼저 생성 (에디터 내용 사용)
      const { data: announcement, error: announcementError } = await supabase
        .from('announcements')
        .insert([{
          title: data.title,
          content: editorContent, // 에디터 내용 사용
          category: data.category,
          is_pinned: data.is_pinned,
          author_email: 'admin@sejong.ac.kr'
        }])
        .select()
        .single();

      if (announcementError) {
        showSupabaseError(announcementError, '공지사항 작성 중 오류가 발생했습니다.');
        throw announcementError;
      }

      // 파일이 있으면 업로드
      if (selectedFiles.length > 0) {
        const uploadResult = await uploadMultipleFiles(
          selectedFiles,
          announcement.id,
          setUploadProgress
        );

        if (!uploadResult.success) {
          console.error('File upload errors:', uploadResult.errors);
          showError(`공지사항은 생성되었지만 파일 업로드 중 오류가 발생했습니다: ${uploadResult.errors.join(', ')}`);
        } else if (uploadResult.usedFallback) {
          showWarning('Supabase Storage가 설정되지 않아 파일은 미리보기로만 저장되었습니다.');
          showSuccess('공지사항이 성공적으로 작성되었습니다.');
          clearSaved(); // 자동저장 데이터 삭제
          setIsDirty(false);
          router.push('/admin/announcements');
          return;
        }
      }

      // 푸시 알림 발송
      if (data.send_push) {
        try {
          const pushResponse = await fetch('/api/push/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: `[공지] ${data.title}`,
              body: formatNotificationBody(editorContent, 100), // 에디터 내용 사용
              url: `/announcements/${announcement.id}`,
              requireInteraction: data.category === 'important',
              adminEmail: 'admin@sejong.ac.kr'
            }),
          });

          const pushResult = await pushResponse.json();
          if (pushResponse.ok) {
            showSuccess(`공지사항이 성공적으로 작성되었습니다! 푸시 알림이 ${pushResult.sent}명에게 발송되었습니다.`);
          } else {
            showWarning(`공지사항은 작성되었으나 푸시 알림 발송에 실패했습니다: ${pushResult.error || '오류 발생'}`);
          }
        } catch (error) {
          console.error('Push notification error:', error);
          showWarning('공지사항은 작성되었으나 푸시 알림 발송에 실패했습니다.');
        }
      } else {
        showSuccess('공지사항이 성공적으로 작성되었습니다.');
      }

      // 자동저장 데이터 삭제 및 상태 초기화
      clearSaved();
      setIsDirty(false);
      router.push('/admin/announcements');
    } catch (error: any) {
      console.error('Error creating announcement:', error);
      showSupabaseError(error, '공지사항 작성 중 오류가 발생했습니다.');
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

              {/* Push Notification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  푸시 알림
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('send_push')}
                    className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">
                    이 공지사항을 푸시 알림으로 발송합니다
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  내용 *
                </label>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <FaEye />
                  {showPreview ? '편집기' : '미리보기'}
                </button>
              </div>
              
              {showPreview ? (
                // 미리보기 모드
                <div className="min-h-[400px] p-4 border border-gray-300 rounded-lg bg-gray-50">
                  <div className="prose max-w-none ql-content" dangerouslySetInnerHTML={{ __html: sanitizeAdminPreview(editorContent || '<p class="text-gray-400">내용을 입력해주세요</p>') }} />
                </div>
              ) : (
                // 에디터 모드
                <RichTextEditor
                  value={editorContent}
                  onChange={setEditorContent}
                  placeholder="공지사항 내용을 입력하세요..."
                  height="400px"
                />
              )}
              
              {!editorContent && (
                <p className="mt-1 text-sm text-red-600">내용을 입력해주세요</p>
              )}
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
              <p className="mt-2 text-xs text-blue-600">
                💡 Tip: 이미지는 에디터에서 직접 드래그 앤 드롭하거나 이미지 버튼을 사용할 수도 있습니다
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
                  dangerouslySetInnerHTML={{ __html: sanitizeAdminPreview(content) }}
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
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <FaSave />
                    저장
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </>
  );
};

export default NewAnnouncementPage;
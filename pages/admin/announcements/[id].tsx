import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../../components/Admin/AdminLayout';
import FileUpload from '../../../components/Admin/FileUpload';
import RichTextEditor from '../../../components/Admin/RichTextEditor';
import { useForm } from 'react-hook-form';
import { FaSave, FaTimes, FaEye, FaTrash, FaDownload, FaPaperclip } from 'react-icons/fa';
import { supabase, Announcement, AnnouncementAttachment } from '../../../lib/supabase';
import { uploadMultipleFiles, getAnnouncementAttachments, deleteFile, getFileDownloadUrl, formatFileSize, getFileIcon } from '../../../lib/fileUpload';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface AnnouncementForm {
  title: string;
  content: string;
  category: 'general' | 'important' | 'academic' | 'event';
  is_pinned: boolean;
  send_push: boolean;
}

const EditAnnouncementPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<AnnouncementAttachment[]>([]);
  const [editorContent, setEditorContent] = useState('');
  
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
          is_pinned: data.is_pinned,
          send_push: false // 수정 시에는 기본적으로 false
        });
        
        // 에디터 내용 설정
        setEditorContent(data.content);
        
        // 첨부파일 조회
        const attachmentData = await getAnnouncementAttachments(data.id);
        setExistingAttachments(attachmentData);
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
    // 에디터 내용 검증
    if (!editorContent || editorContent === '<p><br></p>') {
      alert('내용을 입력해주세요.');
      return;
    }
    
    setLoading(true);
    setUploadProgress(0);
    
    try {
      const { error } = await supabase
        .from('announcements')
        .update({
          title: data.title,
          content: editorContent, // 에디터 내용 사용
          category: data.category,
          is_pinned: data.is_pinned,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // 새 파일이 있으면 업로드
      if (selectedFiles.length > 0) {
        const uploadResult = await uploadMultipleFiles(
          selectedFiles,
          id as string,
          setUploadProgress
        );

        if (!uploadResult.success) {
          console.error('File upload errors:', uploadResult.errors);
          alert(`공지사항은 수정되었지만 파일 업로드 중 오류가 발생했습니다:\n${uploadResult.errors.join('\n')}`);
        } else {
          // 첨부파일 목록 새로 고침
          const attachmentData = await getAnnouncementAttachments(id as string);
          setExistingAttachments(attachmentData);
          
          if (uploadResult.usedFallback) {
            alert('공지사항이 수정되었습니다.\n\n⚠️ 참고: Supabase Storage가 설정되지 않아 파일은 미리보기로만 저장되었습니다.\n실제 파일 다운로드 기능을 사용하려면 Storage 설정이 필요합니다.');
            router.push('/admin/announcements');
            return;
          }
        }
      }
      
      alert('공지사항이 수정되었습니다.');
      router.push('/admin/announcements');
    } catch (error) {
      console.error('Error updating announcement:', error);
      alert('공지사항 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm('이 파일을 삭제하시겠습니까?')) return;

    try {
      const result = await deleteFile(attachmentId);
      if (result.success) {
        setExistingAttachments(existingAttachments.filter(a => a.id !== attachmentId));
        alert('파일이 삭제되었습니다.');
      } else {
        alert(result.error || '파일 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('파일 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDownloadAttachment = async (attachment: AnnouncementAttachment) => {
    try {
      const downloadUrl = await getFileDownloadUrl(attachment.file_path);
      if (downloadUrl) {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = attachment.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('파일 다운로드 링크를 생성할 수 없습니다.');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('파일 다운로드 중 오류가 발생했습니다.');
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
                <div className="mb-10">
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
                    <div className="min-h-[400px] p-4 border border-gray-300 rounded-lg bg-gray-50 mb-12">
                      <div className="prose max-w-none ql-content" dangerouslySetInnerHTML={{ __html: editorContent || '<p class="text-gray-400">내용을 입력해주세요</p>' }} />
                    </div>
                  ) : (
                    // 에디터 모드
                    <div className="mb-12">
                      <RichTextEditor
                        value={editorContent}
                        onChange={setEditorContent}
                        placeholder="공지사항 내용을 입력하세요..."
                        height="400px"
                      />
                    </div>
                  )}
                  
                  {!editorContent && (
                    <p className="mt-1 text-sm text-red-600">내용을 입력해주세요</p>
                  )}
                </div>

                {/* Existing Attachments */}
                {existingAttachments.length > 0 && (
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      기존 첨부파일 ({existingAttachments.length}개)
                    </label>
                    <div className="space-y-3">
                      {existingAttachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-xl">
                              {getFileIcon(attachment.mime_type)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate text-sm">
                                {attachment.file_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(attachment.file_size)} • {format(new Date(attachment.uploaded_at), 'yyyy.MM.dd', { locale: ko })}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleDownloadAttachment(attachment)}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200 transition-colors"
                            >
                              <FaDownload size={10} />
                              다운로드
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAttachment(attachment.id)}
                              className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200 transition-colors"
                            >
                              <FaTrash size={10} />
                              삭제
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* File Upload */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    새 파일 첨부
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
                  <div className="mb-6">
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
                  className="prose prose-sm max-w-none ql-content"
                  dangerouslySetInnerHTML={{ 
                    __html: editorContent || '<p class="text-gray-400">내용을 입력하세요...</p>' 
                  }}
                />
              </div>

            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default EditAnnouncementPage;
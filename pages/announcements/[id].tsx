import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCalendar, FaTag, FaDownload, FaPaperclip, FaEye, FaCloudDownloadAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { supabase, Announcement, AnnouncementAttachment } from '../../lib/supabase';
import { getAnnouncementAttachments, downloadFile, formatFileSize, getFileIcon, isImageFile, getImagePreviewUrl, ImageLoadState } from '../../lib/fileUpload';
import ImageModal from '../../components/Common/ImageModal';
import Image from 'next/image';

const AnnouncementDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [attachments, setAttachments] = useState<AnnouncementAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoadStates, setImageLoadStates] = useState<{ [key: string]: ImageLoadState }>({});

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
      
      // 조회수 증가
      const newViewCount = (data.view_count || 0) + 1;
      await supabase
        .from('announcements')
        .update({ view_count: newViewCount })
        .eq('id', announcementId);
      
      // 증가된 조회수로 상태 업데이트
      setAnnouncement({ ...data, view_count: newViewCount });

      // 첨부파일 조회
      const attachmentData = await getAnnouncementAttachments(announcementId);
      setAttachments(attachmentData);
      
      // 이미지 파일들의 미리보기 URL 로드
      const imageAttachments = attachmentData.filter(att => isImageFile(att.mime_type));
      const loadStates: { [key: string]: ImageLoadState } = {};
      
      for (const attachment of imageAttachments) {
        loadStates[attachment.id] = { loading: true, error: false, url: null };
      }
      setImageLoadStates(loadStates);
      
      // 이미지 URL들을 병렬로 로드
      imageAttachments.forEach(async (attachment) => {
        try {
          const url = await getImagePreviewUrl(attachment.file_path);
          setImageLoadStates(prev => ({
            ...prev,
            [attachment.id]: { loading: false, error: !url, url }
          }));
        } catch (error) {
          setImageLoadStates(prev => ({
            ...prev,
            [attachment.id]: { loading: false, error: true, url: null }
          }));
        }
      });
    } catch (error) {
      console.error('Error fetching announcement:', error);
      // Mock data for development
      setAnnouncement({
        id: announcementId,
        title: '2025학년도 1학기 융합창업연계전공 신청 안내',
        content: `
          <h2>신청 대상</h2>
          <p>세종대학교 재학생 중 창업에 관심이 있는 모든 학생</p>
          
          <h2>신청 기간</h2>
          <p>2025년 2월 1일(토) ~ 2월 14일(금)</p>
          
          <h2>신청 방법</h2>
          <ol>
            <li>학사정보시스템 접속</li>
            <li>전공신청 메뉴 선택</li>
            <li>융합창업연계전공 선택</li>
            <li>신청서 작성 및 제출</li>
          </ol>
          
          <h2>문의</h2>
          <p>전화: 02-3408-3360</p>
          <p>이메일: cscsejong@sejong.ac.kr</p>
        `,
        category: 'important',
        is_pinned: true,
        created_at: '2025-01-18',
        updated_at: '2025-01-18'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileDownload = async (attachment: AnnouncementAttachment, event?: React.MouseEvent<HTMLButtonElement>) => {
    try {
      // Fallback 파일 확인
      if (attachment.file_path.startsWith('fallback/') || attachment.file_name.includes('(미리보기)')) {
        alert('이 파일은 미리보기로만 저장되어 다운로드할 수 없습니다.\n\n관리자에게 실제 파일을 요청하거나 Supabase Storage 설정을 확인해주세요.');
        return;
      }
      
      // 다운로드 버튼 비활성화 (다운로드 중)
      const downloadButton = event?.currentTarget as HTMLButtonElement;
      if (downloadButton) {
        downloadButton.disabled = true;
        const originalContent = downloadButton.innerHTML;
        downloadButton.textContent = '다운로드 중...';
        
        // 다운로드 수 증가
        await supabase
          .from('announcement_attachments')
          .update({ download_count: (attachment.download_count || 0) + 1 })
          .eq('id', attachment.id);
        
        // 강제 다운로드 실행
        const success = await downloadFile(attachment.file_path, attachment.file_name);
        
        // 버튼 원상 복구
        downloadButton.disabled = false;
        downloadButton.innerHTML = originalContent;
        
        if (!success) {
          alert('파일 다운로드에 실패했습니다.\n\nStorage 설정을 확인하거나 관리자에게 문의해주세요.');
        }
      } else {
        // 다운로드 수 증가
        await supabase
          .from('announcement_attachments')
          .update({ download_count: (attachment.download_count || 0) + 1 })
          .eq('id', attachment.id);
        
        // 버튼이 없으면 그냥 다운로드 시도
        const success = await downloadFile(attachment.file_path, attachment.file_name);
        if (!success) {
          alert('파일 다운로드에 실패했습니다.\n\nStorage 설정을 확인하거나 관리자에게 문의해주세요.');
        }
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('파일 다운로드 중 오류가 발생했습니다.');
    }
  };

  const handleImageClick = (attachment: AnnouncementAttachment) => {
    const imageAttachments = attachments.filter(att => isImageFile(att.mime_type));
    const index = imageAttachments.findIndex(img => img.id === attachment.id);
    if (index !== -1) {
      setCurrentImageIndex(index);
      setImageModalOpen(true);
    }
  };

  const handleImageModalClose = () => {
    setImageModalOpen(false);
  };

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleModalDownload = (attachment: AnnouncementAttachment) => {
    handleFileDownload(attachment);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'important':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'academic':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'event':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'important':
        return '중요';
      case 'academic':
        return '학사';
      case 'event':
        return '행사';
      default:
        return '일반';
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen">
          <div className="bg-gradient-primary h-24"></div>
          <div className="flex items-center justify-center py-32">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!announcement) {
    return (
      <>
        <Header />
        <div className="min-h-screen">
          <div className="bg-gradient-primary h-24"></div>
          <div className="flex items-center justify-center py-32">
            <p className="text-gray-600">공지사항을 찾을 수 없습니다.</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{announcement.title} - 세종대 융합창업연계전공</title>
        <meta name="description" content={announcement.content.substring(0, 160)} />
      </Head>

      <Header />
      
      <main className="min-h-screen">
        {/* Simple gradient background for header visibility */}
        <div className="bg-gradient-primary h-24"></div>
        
        <section className="py-12">
          <div className="container-custom max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Back Button */}
              <Link href="/announcements" className="inline-flex items-center text-primary hover:text-primary/80 mb-6">
                <FaArrowLeft className="mr-2" />
                목록으로 돌아가기
              </Link>

              {/* Announcement Header */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getCategoryColor(announcement.category)}`}>
                    <FaTag className="inline mr-1" size={12} />
                    {getCategoryLabel(announcement.category)}
                  </span>
                  {announcement.is_pinned && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold border border-yellow-200">
                      고정됨
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  {announcement.title}
                </h1>

                <div className="flex items-center justify-between text-gray-500 text-sm mb-6 pb-6 border-b">
                  <div className="flex items-center">
                    <FaCalendar className="mr-2" />
                    작성일: {format(new Date(announcement.created_at), 'yyyy년 MM월 dd일', { locale: ko })}
                    {announcement.updated_at !== announcement.created_at && (
                      <span className="ml-4">
                        (수정일: {format(new Date(announcement.updated_at), 'yyyy년 MM월 dd일', { locale: ko })})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <FaEye className="text-gray-400" />
                    <span className="text-gray-600">조회수 {announcement.view_count || 0}</span>
                  </div>
                </div>

                {/* Announcement Content */}
                <div 
                  className="prose prose-lg max-w-none mb-8 ql-content"
                  dangerouslySetInnerHTML={{ __html: announcement.content }}
                />

                {/* Attachments */}
                {attachments.length > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FaPaperclip />
                      첨부파일 ({attachments.length}개)
                    </h3>
                    <div className="space-y-3">
                      {attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg border transition-colors ${
                            isImageFile(attachment.mime_type) 
                              ? 'hover:bg-blue-50 cursor-pointer' 
                              : 'hover:bg-gray-100'
                          }`}
                          onClick={() => {
                            if (isImageFile(attachment.mime_type)) {
                              handleImageClick(attachment);
                            }
                          }}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {isImageFile(attachment.mime_type) ? (
                              <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border bg-gray-200">
                                {imageLoadStates[attachment.id]?.loading && (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                  </div>
                                )}
                                {imageLoadStates[attachment.id]?.error && (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <span className="text-xl">{getFileIcon(attachment.mime_type)}</span>
                                  </div>
                                )}
                                {imageLoadStates[attachment.id]?.url && !imageLoadStates[attachment.id]?.loading && !imageLoadStates[attachment.id]?.error && (
                                  <img
                                    src={imageLoadStates[attachment.id].url!}
                                    alt={attachment.file_name}
                                    className="w-full h-full object-cover"
                                    onError={() => {
                                      setImageLoadStates(prev => ({
                                        ...prev,
                                        [attachment.id]: { ...prev[attachment.id], error: true }
                                      }));
                                    }}
                                  />
                                )}
                              </div>
                            ) : (
                              <span className="text-2xl">
                                {getFileIcon(attachment.mime_type)}
                              </span>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {attachment.file_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(attachment.file_size)} • {format(new Date(attachment.uploaded_at), 'yyyy.MM.dd', { locale: ko })}
                                {attachment.download_count !== undefined && (
                                  <span className="ml-2">
                                    <FaCloudDownloadAlt className="inline mr-1" size={12} />
                                    {attachment.download_count}회
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFileDownload(attachment, e);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            <FaDownload size={14} />
                            다운로드
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-between">
                <Link href="/announcements" className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors">
                  목록으로
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* 이미지 모달 */}
      <ImageModal
        isOpen={imageModalOpen}
        onClose={handleImageModalClose}
        images={attachments.filter(att => isImageFile(att.mime_type))}
        currentIndex={currentImageIndex}
        onImageChange={handleImageChange}
        onDownload={handleModalDownload}
      />

      <Footer />
    </>
  );
};

export default AnnouncementDetailPage;
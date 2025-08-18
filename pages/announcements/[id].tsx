import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCalendar, FaTag } from 'react-icons/fa';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { supabase, Announcement } from '../../lib/supabase';

const AnnouncementDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

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
      setAnnouncement(data);
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
              <Link href="/announcements">
                <a className="inline-flex items-center text-primary hover:text-primary/80 mb-6">
                  <FaArrowLeft className="mr-2" />
                  목록으로 돌아가기
                </a>
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

                <div className="flex items-center text-gray-500 text-sm mb-6 pb-6 border-b">
                  <FaCalendar className="mr-2" />
                  작성일: {format(new Date(announcement.created_at), 'yyyy년 MM월 dd일', { locale: ko })}
                  {announcement.updated_at !== announcement.created_at && (
                    <span className="ml-4">
                      (수정일: {format(new Date(announcement.updated_at), 'yyyy년 MM월 dd일', { locale: ko })})
                    </span>
                  )}
                </div>

                {/* Announcement Content */}
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: announcement.content }}
                />
              </div>

              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-between">
                <Link href="/announcements">
                  <a className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors">
                    목록으로
                  </a>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default AnnouncementDetailPage;
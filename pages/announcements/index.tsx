import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import AnnouncementCard from '../../components/Announcements/AnnouncementCard';
import { motion } from 'framer-motion';
import { FaSearch, FaBullhorn } from 'react-icons/fa';
import { supabase, Announcement } from '../../lib/supabase';

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('is_pinned', { ascending: false })
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
          content: '2025학년도 1학기 융합창업연계전공 신청을 받습니다...',
          category: 'important',
          is_pinned: true,
          created_at: '2025-01-18',
          updated_at: '2025-01-18'
        },
        {
          id: '2',
          title: '창업 아이디어 경진대회 개최',
          content: '세종대학교 융합창업연계전공에서 창업 아이디어 경진대회를 개최합니다...',
          category: 'event',
          is_pinned: false,
          created_at: '2025-01-17',
          updated_at: '2025-01-17'
        },
        {
          id: '3',
          title: '2025-1학기 수강신청 안내',
          content: '2025학년도 1학기 수강신청 일정을 안내드립니다...',
          category: 'academic',
          is_pinned: false,
          created_at: '2025-01-16',
          updated_at: '2025-01-16'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || announcement.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'important', label: '중요' },
    { value: 'academic', label: '학사' },
    { value: 'event', label: '행사' },
    { value: 'general', label: '일반' }
  ];

  return (
    <>
      <Head>
        <title>공지사항 - 세종대 융합창업연계전공</title>
        <meta name="description" content="세종대학교 융합창업연계전공 공지사항" />
      </Head>

      <Header />
      
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-primary pt-36 pb-16">
          <div className="container-custom text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <FaBullhorn className="text-5xl mb-4 mx-auto" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">공지사항</h1>
              <p className="text-xl">융합창업연계전공의 최신 소식을 확인하세요</p>
            </motion.div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="py-8 bg-gray-50">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="검색어를 입력하세요..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex gap-2">
                {categories.map(category => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedCategory === category.value
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Announcements List */}
        <section className="py-12">
          <div className="container-custom">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-gray-600">공지사항을 불러오는 중...</p>
              </div>
            ) : filteredAnnouncements.length > 0 ? (
              <div className="grid gap-6">
                {filteredAnnouncements.map((announcement, index) => (
                  <motion.div
                    key={announcement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <AnnouncementCard announcement={announcement} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">검색 결과가 없습니다.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default AnnouncementsPage;
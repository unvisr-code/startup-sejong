import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { motion } from 'framer-motion';
import { FaHome, FaBullhorn, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';
import { SITE_CONFIG } from '../lib/seo';

const Custom404 = () => {
  return (
    <>
      <Head>
        <title>페이지를 찾을 수 없습니다 (404) - 세종대 융합창업연계전공</title>
        <meta name="description" content="요청하신 페이지를 찾을 수 없습니다. 세종대학교 융합창업연계전공 메인 페이지로 이동하세요." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={SITE_CONFIG.url} />
      </Head>

      <Header />

      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom pt-36 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-2xl mx-auto"
          >
            {/* 404 Icon */}
            <div className="mb-8">
              <FaExclamationTriangle className="text-yellow-500 text-6xl mx-auto mb-4" />
              <h1 className="text-6xl md:text-8xl font-bold text-gray-800 mb-4">404</h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
                페이지를 찾을 수 없습니다
              </h2>
              <p className="text-gray-600 text-lg">
                요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
              </p>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
              <Link
                href="/"
                className="group bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <FaHome className="text-primary text-3xl mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-gray-800 mb-2">홈페이지</h3>
                <p className="text-sm text-gray-600">메인 페이지로 이동</p>
              </Link>

              <Link
                href="/announcements"
                className="group bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <FaBullhorn className="text-primary text-3xl mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-gray-800 mb-2">공지사항</h3>
                <p className="text-sm text-gray-600">최신 소식 확인</p>
              </Link>

              <Link
                href="/calendar"
                className="group bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <FaCalendarAlt className="text-primary text-3xl mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-gray-800 mb-2">학사일정</h3>
                <p className="text-sm text-gray-600">일정 확인하기</p>
              </Link>
            </div>

            {/* Additional Help */}
            <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-gray-700 mb-2">
                <strong>도움이 필요하신가요?</strong>
              </p>
              <p className="text-gray-600 text-sm">
                문제가 지속되면 관리자에게 문의해주세요.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Custom404;

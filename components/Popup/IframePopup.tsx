'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const IFRAME_URL = 'https://demo-day-sejong.vercel.app/embed/hero';
const SHOW_DELAY = 500; // 0.5초

const IframePopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // 지연 후 팝업 표시
    const timer = setTimeout(() => setIsVisible(true), SHOW_DELAY);
    return () => clearTimeout(timer);
  }, []);

  // 배경 스크롤 방지 (강화)
  useEffect(() => {
    if (isVisible) {
      // 현재 스크롤 위치 저장
      const scrollY = window.scrollY;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // 스크롤 위치 복원
      const scrollY = document.body.style.top;
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    return () => {
      const scrollY = document.body.style.top;
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    };
  }, [isVisible]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
  }, []);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, handleClose]);

  if (!isClient) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden"
            style={{ height: '90vh', maxHeight: '900px' }}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-2 text-gray-400 hover:text-white hover:bg-gradient-primary rounded-lg transition-all duration-300 z-10"
              aria-label="팝업 닫기"
            >
              <FaTimes size={20} />
            </button>

            {/* iframe 컨테이너 */}
            <div className="w-full h-full overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              )}
              <iframe
                src={IFRAME_URL}
                title="데모데이 안내"
                className="w-full h-full border-0"
                style={{ overflow: 'hidden' }}
                scrolling="no"
                onLoad={() => setIsLoading(false)}
                allow="autoplay; fullscreen"
              />
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default IframePopup;

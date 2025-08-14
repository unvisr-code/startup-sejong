'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaArrowRight, FaRocket } from 'react-icons/fa';
import ApplicationModal from '../Modal/ApplicationModal';

const HeroSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const scrollToAbout = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('about');
    if (element) {
      const headerOffset = 80; // 헤더 높이만큼 오프셋 추가
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
    <section className="relative min-h-[calc(100vh-120px)] pt-12 pb-4 sm:min-h-[calc(100vh-72px)] sm:pt-20 sm:pb-10 md:min-h-screen md:pt-0 md:pb-0 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-primary opacity-90"></div>
      
      <div className="absolute inset-0 hidden sm:block">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container-custom text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full inline-flex items-center space-x-2">
              <FaRocket className="text-yellow-300" />
              <span className="text-sm font-semibold">세종대학교 유일 창업 학위과정</span>
            </div>
          </div>

          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight break-keep">
            세종대 융합창업연계전공
          </h1>
          
          <p className="text-base xs:text-lg sm:text-xl md:text-xl lg:text-2xl mb-4 sm:mb-6 md:mb-8 text-white/90 font-medium break-keep">
            융합창업, 아이디어가 현실이 되는 과정
          </p>

          <p className="text-xs xs:text-sm sm:text-lg md:text-lg lg:text-xl mb-6 sm:mb-8 md:mb-10 max-w-lg sm:max-w-2xl mx-auto text-white/80 leading-relaxed break-keep px-4 sm:px-0">
            창업 기초부터 실전까지<br className="sm:hidden" /> 체계적인 교육과정으로<br className="sm:hidden" /> 준비된 청년창업인으로 성장하세요
          </p>

          <div className="flex flex-row gap-3 justify-center">
            <motion.button
              onClick={handleApplyClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-primary font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-full hover:shadow-2xl transition-all duration-300 inline-flex items-center justify-center space-x-2 cursor-pointer text-sm sm:text-base"
            >
              <span>지원하기</span>
              <FaArrowRight />
            </motion.button>
            
            <motion.button
              onClick={scrollToAbout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-transparent border-2 border-white text-white font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-full hover:bg-white hover:text-primary transition-all duration-300 text-sm sm:text-base"
            >
              더 알아보기
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-6 sm:mt-10 md:mt-12 grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 max-w-4xl mx-auto"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 md:p-6">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 break-keep">세종대 유일</div>
            <div className="text-xs sm:text-sm break-keep">100% 실전 투자 연결</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 md:p-6">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 break-keep">체계적 교육</div>
            <div className="text-xs sm:text-sm break-keep">창업 학위과정</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 md:p-6 col-span-2 md:col-span-1">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 break-keep">실전 멘토링</div>
            <div className="text-xs sm:text-sm break-keep">현직 창업가·투자자</div>
          </div>
        </motion.div>
      </div>
    </section>
    <ApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default HeroSection;
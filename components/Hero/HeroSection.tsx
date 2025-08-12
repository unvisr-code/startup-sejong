'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowRight, FaRocket } from 'react-icons/fa';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-primary opacity-90"></div>
      
      <div className="absolute inset-0">
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

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            세종대 융합창업연계전공
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl mb-8 text-white/90 font-medium">
            융합창업, 아이디어가 현실이 되는 과정
          </p>

          <p className="text-base md:text-lg lg:text-xl mb-10 md:mb-12 max-w-3xl mx-auto text-white/80 leading-relaxed">
            창업 기초부터 실전까지,<br className="md:hidden" /> 체계적인 교육과정으로<br className="hidden md:block" />
            준비된 청년창업인으로 성장하세요
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="#apply"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-primary font-bold py-4 px-8 rounded-full hover:shadow-2xl transition-all duration-300 inline-flex items-center justify-center space-x-2"
            >
              <span>지원하기</span>
              <FaArrowRight />
            </motion.a>
            
            <motion.a
              href="#about"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-transparent border-2 border-white text-white font-bold py-4 px-8 rounded-full hover:bg-white hover:text-primary transition-all duration-300"
            >
              더 알아보기
            </motion.a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6">
            <div className="text-2xl md:text-3xl font-bold mb-1">세종대 유일</div>
            <div className="text-xs md:text-sm">창업 학위과정</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6">
            <div className="text-2xl md:text-3xl font-bold mb-1">100% 실전</div>
            <div className="text-xs md:text-sm">현직 창업가 멘토링</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6 col-span-2 md:col-span-1">
            <div className="text-2xl md:text-3xl font-bold mb-1">투자연결</div>
            <div className="text-xs md:text-sm">VC·엑셀러레이터 IR</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
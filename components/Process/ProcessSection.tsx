'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaClipboardList, FaUserCheck, FaBookOpen, FaRocket, FaArrowRight } from 'react-icons/fa';

const ProcessSection = () => {
  const steps = [
    {
      icon: <FaClipboardList />,
      title: '신청',
      description: '매학기 5월, 11월 연계전공 신청',
      detail: '학사포털에서 온라인 신청',
    },
    {
      icon: <FaUserCheck />,
      title: '선발',
      description: '서류 심사 및 면접 진행',
      detail: '창업 의지와 열정 평가',
    },
    {
      icon: <FaBookOpen />,
      title: '수강',
      description: '체계적인 창업 교육과정 이수',
      detail: '39학점(전공) 또는 21학점(부전공)',
    },
    {
      icon: <FaRocket />,
      title: '성장',
      description: 'IR 피칭 및 창업 실전',
      detail: '투자자 네트워킹 및 멘토링',
    },
  ];


  return (
    <section id="process" className="section-padding bg-gray-50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.1 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            지원 절차 및 <span className="gradient-text">과정</span>
          </h2>
          <p className="text-xl text-gray-600">
            체계적인 단계별 지원 절차를 확인하세요
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.1 }}
              className="relative"
            >
              <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <div className="text-3xl md:text-4xl text-primary mb-3">{step.icon}</div>
                <h3 className="text-base md:text-xl font-bold mb-2">{step.title}</h3>
                <p className="font-semibold text-sm md:text-base text-gray-700 mb-1">{step.description}</p>
                <p className="text-xs md:text-sm text-gray-500">{step.detail}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 transform -translate-y-1/2 text-primary z-10" style={{right: 'calc(-0.75rem - 12px)'}}>
                  <FaArrowRight size={24} />
                </div>
              )}
            </motion.div>
          ))}
        </div>


        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true, amount: 0.1 }}
          className="mt-6 sm:mt-8 md:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6"
        >
          <div className="bg-gradient-primary text-white rounded-2xl p-4 sm:p-6 md:p-8">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">지원 자격</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-start">
                <span className="text-lg sm:text-xl md:text-2xl mr-2 sm:mr-3">✓</span>
                <span className="text-sm sm:text-base break-keep">세종대학교 1~4학년 재학생</span>
              </li>
              <li className="flex items-start">
                <span className="text-lg sm:text-xl md:text-2xl mr-2 sm:mr-3">✓</span>
                <span className="text-sm sm:text-base break-keep">창업 및 신사업 기획에 관심 있는 학생</span>
              </li>
              <li className="flex items-start">
                <span className="text-lg sm:text-xl md:text-2xl mr-2 sm:mr-3">✓</span>
                <span className="text-sm sm:text-base break-keep">열정과 도전정신을 가진 예비 창업가</span>
              </li>
            </ul>
          </div>

          <div id="apply" className="bg-secondary text-white rounded-2xl p-4 sm:p-6 md:p-8">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">지원 방법</h3>
            <ol className="space-y-2 sm:space-y-3">
              <li className="flex items-start">
                <span className="font-bold mr-2 sm:mr-3 text-sm sm:text-base">1.</span>
                <span className="text-sm sm:text-base break-keep">학사포털 접속 후 연계전공 신청</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2 sm:mr-3 text-sm sm:text-base">2.</span>
                <span className="text-sm sm:text-base break-keep">신청서 작성 및 서류 제출</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2 sm:mr-3 text-sm sm:text-base">3.</span>
                <span className="text-sm sm:text-base break-keep">면접 일정 확인 및 참석</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2 sm:mr-3 text-sm sm:text-base">4.</span>
                <span className="text-sm sm:text-base break-keep">최종 합격 발표 확인</span>
              </li>
            </ol>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessSection;
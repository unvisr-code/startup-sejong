'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaLightbulb, FaUsers, FaGraduationCap, FaRocket, FaChartLine, FaHandshake, FaCheckCircle } from 'react-icons/fa';

const AboutSection = () => {
  const features = [
    {
      icon: <FaLightbulb />,
      title: '아이디어 발굴',
      description: '창의적인 아이디어를 현실화하는 체계적인 프로세스',
    },
    {
      icon: <FaUsers />,
      title: '실전 멘토링',
      description: '투자자, 액셀러레이터, VC 전문가 직접 멘토링',
    },
    {
      icon: <FaGraduationCap />,
      title: '학위 취득',
      description: '융합창업학사 학위로 전문성 인증',
    },
    {
      icon: <FaRocket />,
      title: '창업 지원',
      description: 'IR 기회 제공 및 투자 연결 지원',
    },
    {
      icon: <FaChartLine />,
      title: '성장 단계별 교육',
      description: '기초부터 성장까지 단계별 맞춤 교육',
    },
    {
      icon: <FaHandshake />,
      title: '네트워킹',
      description: '창업 전문가들과의 네트워킹 기회',
    },
  ];

  return (
    <section id="about" className="py-6 sm:py-8 md:py-12 lg:py-16 bg-gray-50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.1 }}
          className="text-center mb-6 sm:mb-8 md:mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">융합창업연계전공</span> 소개
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto break-keep">
            세종대 유일 창업학과로 실전 창업역량을 갖춘 준비된 청년창업인을 양성합니다.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, amount: 0.1 }}
          className="mb-8 sm:mb-10 md:mb-12 text-center"
        >
          <div className="bg-gradient-primary rounded-2xl p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white text-center">교육 목표</h3>
            <div className="text-center">
              <blockquote className="text-white text-lg sm:text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto px-4 sm:px-6">
                <span className="font-bold">"아이디어 발굴→성장"</span>까지<br className="sm:hidden" /> 창업의 모든 단계를 체계적으로 배우고,<br className="hidden sm:block" />
                <br className="sm:hidden" />
                실제 창업가·투자자·액셀러레이터와<br className="sm:hidden" /> 함께하는 실전 교육으로<br className="hidden sm:block" />
                <br className="sm:hidden" />
                <span className="font-bold text-yellow-300">"준비된 창업가를 양성합니다."</span>
              </blockquote>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-3xl md:text-4xl text-primary mb-3">{feature.icon}</div>
              <h3 className="text-base md:text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* 융합창업연계전공 혜택 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true, amount: 0.1 }}
          className="mt-8 sm:mt-10 md:mt-12 bg-blue-50 rounded-2xl p-6 sm:p-8"
        >
          <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">융합창업연계전공 혜택</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex items-start">
              <FaCheckCircle className="text-green-500 text-xl mt-1 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-bold mb-1">주전공 필수이수학점 완화</h4>
                <p className="text-gray-600 text-sm sm:text-base">72학점 → 39학점으로 완화되어 1+1 학위 취득 가능</p>
              </div>
            </div>
            <div className="flex items-start">
              <FaCheckCircle className="text-green-500 text-xl mt-1 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-bold mb-1">창업 동아리 활동 가능</h4>
                <p className="text-gray-600 text-sm sm:text-base">창업 동아리 활동 장려 및 지원 제공</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
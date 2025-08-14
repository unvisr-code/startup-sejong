'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaLightbulb, FaUsers, FaGraduationCap, FaRocket, FaChartLine, FaHandshake } from 'react-icons/fa';

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
      description: '엔젤투자자, 엑셀러레이터, VC 전문가 직접 멘토링',
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
      description: '창업 생태계 전문가들과의 네트워킹 기회',
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
            세종대학교 유일의 창업교육으로 학생창업자들에게 실전창업을 경험하고 창업역량을 함양하여 "준비된 청년창업인"을 양성합니다.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, amount: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-12 mb-6 sm:mb-8 md:mb-12"
        >
          <div className="text-center space-y-6">
            <p className="text-gray-700 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-4 break-keep">
              창업 기초부터 실전까지, 아이디어 발굴에서 성장까지 창업의 모든 단계를 체계적으로 교육합니다.
            </p>
            <p className="text-gray-700 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto break-keep">
              실제 창업가, 투자자, 엑셀러레이터와 함께하는 실전 중심의 교육으로 준비된 창업가를 양성합니다.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.1 }}
              className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-3xl md:text-4xl text-primary mb-3">{feature.icon}</div>
              <h3 className="text-base md:text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true, amount: 0.1 }}
          className="mt-8 sm:mt-10 md:mt-12 text-center"
        >
          <div className="bg-gradient-primary rounded-2xl p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white text-center">교육 목표</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4 md:gap-6">
              <div className="flex flex-row sm:flex-col items-center sm:items-center gap-4 sm:gap-0">
                <div className="bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center flex-shrink-0 sm:mb-3 md:mb-4">
                  <FaLightbulb className="text-xl sm:text-2xl md:text-3xl text-white" />
                </div>
                <div className="flex-1 sm:flex-none text-left sm:text-center">
                  <h4 className="text-sm sm:text-base md:text-lg font-bold text-white mb-1 sm:mb-2 break-keep">창업가 발굴</h4>
                  <p className="text-xs sm:text-sm text-white/90 sm:text-center break-keep leading-relaxed">
                    참신한 아이디어와 열정을 가진 예비 창업가를 발굴합니다
                  </p>
                </div>
              </div>
              <div className="flex flex-row sm:flex-col items-center sm:items-center gap-4 sm:gap-0">
                <div className="bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center flex-shrink-0 sm:mb-3 md:mb-4">
                  <FaGraduationCap className="text-xl sm:text-2xl md:text-3xl text-white" />
                </div>
                <div className="flex-1 sm:flex-none text-left sm:text-center">
                  <h4 className="text-sm sm:text-base md:text-lg font-bold text-white mb-1 sm:mb-2 break-keep">실전 교육</h4>
                  <p className="text-xs sm:text-sm text-white/90 sm:text-center break-keep leading-relaxed">
                    현직 투자자와 창업가가 직접 멘토링을 제공합니다
                  </p>
                </div>
              </div>
              <div className="flex flex-row sm:flex-col items-center sm:items-center gap-4 sm:gap-0">
                <div className="bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center flex-shrink-0 sm:mb-3 md:mb-4">
                  <FaRocket className="text-xl sm:text-2xl md:text-3xl text-white" />
                </div>
                <div className="flex-1 sm:flex-none text-left sm:text-center">
                  <h4 className="text-sm sm:text-base md:text-lg font-bold text-white mb-1 sm:mb-2 break-keep">인재 양성</h4>
                  <p className="text-xs sm:text-sm text-white/90 sm:text-center break-keep leading-relaxed">
                    기업이 원하는 기업가형 인재로 성장시킵니다
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
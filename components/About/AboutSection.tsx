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
    <section id="about" className="section-padding bg-gray-50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">융합창업연계전공</span> 소개
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            세종대학교 유일의 창업교육으로 학생창업자들에게 실전창업을 경험하고 
            창업역량을 함양하여 "준비된 청년창업인"을 양성합니다.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12"
        >
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              창업 및 신사업 기획에 관심이 있는 학생들에게 단계별 체험형 학습을 통해 
              기업가정신과 창업에 대한 자신감이 함양될 수 있도록 합니다.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              창업 기초 소양뿐만 아니라 창업의 첫 단계인 아이디어 발굴에서부터 창업의 실행과 
              성장까지 창업의 모든 단계를 대학 교육 안에서 실행할 수 있는 교육과정을 제공합니다.
            </p>
            <p className="text-gray-700 leading-relaxed">
              기업가정신, 문제해결역량, 글로벌 창업 역량을 갖춘 인재를 양성하여 산업간 융합을 
              통해 창업에 도전할 수 있도록 지원합니다. 본 과정의 전공자들에게 실제 창업을 
              준비하거나 모의 창업을 경험할 수 있도록 엔젤투자자·엑설러레이터·벤처캐피탈리스트 
              등을 대상으로 한 IR(Investor Relations) 기회가 부여됩니다.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
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
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-primary rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">교육 목표</h3>
            <p className="text-lg leading-relaxed">
              참신한 아이디어 및 사업에 열정이 넘치는 창업가를 발굴하여 창업에 도전할 수 있도록 한다. 
              성공적인 창업을 이끌 수 있도록 우수한 창업학 분야의 교수진, 엔젤투자자·엑설러레이터·
              벤처캐피탈리스트 등 외부 창업전문가들과 함께 실전창업교육을 제공하여 창업 역량을 강화하고, 
              기업에서 원하는 기업가형 인재 양성을 목표로 한다.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
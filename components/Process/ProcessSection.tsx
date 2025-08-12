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

  const timeline = [
    {
      phase: '1단계',
      title: '기초 역량 함양',
      courses: ['디자인씽킹', '린스타트업', '창업기초'],
      color: 'bg-blue-500',
    },
    {
      phase: '2단계',
      title: '실전 준비',
      courses: ['비즈니스모델', '창업마케팅', '창업재무'],
      color: 'bg-purple-500',
    },
    {
      phase: '3단계',
      title: '창업 실행',
      courses: ['창업캡스톤', '실전창업동아리', '사업계획서'],
      color: 'bg-green-500',
    },
    {
      phase: '4단계',
      title: '성장 및 투자',
      courses: ['IR 피칭', '엑셀러레이팅', '투자 유치'],
      color: 'bg-orange-500',
    },
  ];

  return (
    <section id="process" className="section-padding bg-gray-50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            지원 절차 및 <span className="gradient-text">성장 과정</span>
          </h2>
          <p className="text-xl text-gray-600">
            아이디어, 실전, 창업, 체계적인 단계별 프로세스
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <div className="text-3xl md:text-4xl text-primary mb-3">{step.icon}</div>
                <h3 className="text-base md:text-xl font-bold mb-2">{step.title}</h3>
                <p className="font-semibold text-sm md:text-base text-gray-700 mb-1">{step.description}</p>
                <p className="text-xs md:text-sm text-gray-500">{step.detail}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-primary">
                  <FaArrowRight size={20} />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 shadow-xl"
        >
          <h3 className="text-2xl font-bold mb-8 text-center">창업 성장 로드맵</h3>
          
          <div className="relative">
            <div className="absolute left-10 md:left-12 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-orange-500"></div>
            <div className="space-y-8">
              {timeline.map((phase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative flex items-start"
                >
                  <div className="relative z-10">
                    <div className={`w-20 h-20 md:w-24 md:h-24 ${phase.color} rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg shadow-lg transform transition-transform hover:scale-110`}>
                      {phase.phase}
                    </div>
                    <div className={`absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 ${phase.color} rounded-full animate-pulse`}></div>
                  </div>
                  <div className="ml-8 flex-grow bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <h4 className="text-xl font-bold mb-3 text-gray-800">{phase.title}</h4>
                    <div className="flex flex-wrap gap-2">
                      {phase.courses.map((course, courseIndex) => (
                        <span
                          key={courseIndex}
                          className="bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-100"
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-gradient-primary text-white rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4">지원 자격</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-2xl mr-3">✓</span>
                <span>세종대학교 1~4학년 재학생</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">✓</span>
                <span>창업 및 신사업 기획에 관심 있는 학생</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">✓</span>
                <span>열정과 도전정신을 가진 예비 창업가</span>
              </li>
            </ul>
          </div>

          <div id="apply" className="bg-secondary text-white rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4">지원 방법</h3>
            <ol className="space-y-3">
              <li className="flex items-start">
                <span className="font-bold mr-3">1.</span>
                <span>학사포털 접속 후 연계전공 신청</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-3">2.</span>
                <span>신청서 작성 및 서류 제출</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-3">3.</span>
                <span>면접 일정 확인 및 참석</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-3">4.</span>
                <span>최종 합격 발표 확인</span>
              </li>
            </ol>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessSection;
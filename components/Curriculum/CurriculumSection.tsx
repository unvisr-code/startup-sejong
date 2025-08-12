'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaBook, FaStar, FaCheckCircle, FaChevronRight } from 'react-icons/fa';

const CurriculumSection = () => {
  const [activeTab, setActiveTab] = useState('major');

  const requiredCourses = [
    { name: '디자인씽킹', credits: 3 },
    { name: '린스타트업', credits: 3 },
    { name: '창업재무', credits: 3 },
    { name: '비즈니스모델', credits: 3 },
    { name: '창업캡스톤', credits: 3 },
  ];

  const electiveCourses = [
    { name: '실전창업동아리 1~3', credits: '각 3' },
    { name: '창업마케팅', credits: 3 },
    { name: '창업회계', credits: 3 },
    { name: '소셜벤처', credits: 3 },
    { name: '사업계획서', credits: 3 },
    { name: '온라인커머스실전창업', credits: 3 },
  ];

  const otherDepartmentCourses = [
    { department: '경영학과', courses: '소비자행동론, 비즈니스커뮤니케이션, 비즈니스인텔리전스' },
    { department: '경제학과', courses: '빅데이터론, 경제원론, 국제무역론' },
    { department: '소프트웨어학과', courses: '데이터분석' },
    { department: '행정학과', courses: '재무행정론, 조직론, 지방행정론' },
  ];

  return (
    <section id="curriculum" className="section-padding">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            교육과정 및 <span className="gradient-text">학위 취득</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            체계적인 커리큘럼으로<br className="sm:hidden" />
            창업 전문가로 성장하세요
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-gradient-primary rounded-2xl p-6 md:p-8 text-white mb-8 md:mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-center">
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">학위명</h3>
              <p className="text-lg md:text-xl">융합창업학사</p>
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">이수 대상</h3>
              <p className="text-base md:text-lg">1~4학년 재학생</p>
              <p className="text-xs md:text-sm opacity-90">창업에 관심있는 전체 학생</p>
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">신청 시기</h3>
              <p className="text-base md:text-lg">매학기 5월, 11월</p>
              <p className="text-xs md:text-sm opacity-90">상시 문의 가능</p>
            </div>
          </div>
        </motion.div>

        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setActiveTab('major')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'major'
                  ? 'bg-white text-primary shadow-md'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              전공 (39학점)
            </button>
            <button
              onClick={() => setActiveTab('minor')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'minor'
                  ? 'bg-white text-primary shadow-md'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              부전공 (21학점)
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        >
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <FaStar className="text-primary text-2xl mr-3" />
              <h3 className="text-2xl font-bold">전공필수</h3>
              <span className="ml-auto bg-primary text-white px-3 py-1 rounded-full text-sm">
                {activeTab === 'major' ? '15학점' : '9학점'}
              </span>
            </div>
            <ul className="space-y-3">
              {requiredCourses.map((course, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-3" />
                    <span className="font-medium">{course.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{course.credits}학점</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <FaBook className="text-secondary text-2xl mr-3" />
              <h3 className="text-2xl font-bold">전공선택</h3>
              <span className="ml-auto bg-secondary text-white px-3 py-1 rounded-full text-sm">
                {activeTab === 'major' ? '24학점' : '12학점'}
              </span>
            </div>
            <ul className="space-y-3">
              {electiveCourses.map((course, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <FaChevronRight className="text-blue-500 mr-3" />
                    <span className="font-medium">{course.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{course.credits}학점</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>


        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 bg-blue-50 rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold mb-4 text-center">융합창업전공 혜택</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <FaCheckCircle className="text-green-500 text-xl mt-1 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-bold mb-1">주전공 필수이수학점 완화</h4>
                <p className="text-gray-600">72학점 → 39학점으로 완화되어 1+1 학위 취득 가능</p>
              </div>
            </div>
            <div className="flex items-start">
              <FaCheckCircle className="text-green-500 text-xl mt-1 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-bold mb-1">창업 동아리 활동 가능</h4>
                <p className="text-gray-600">창업 동아리 활동 장려 및 지원 제공</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CurriculumSection;
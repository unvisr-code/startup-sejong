'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaInstagram, FaYoutube, FaEnvelope, FaPhone, FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa';

const ContactSection = () => {
  return (
    <section id="contact" className="py-8 sm:py-12 md:py-16">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.1 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            문의하기 & <span className="gradient-text">SNS</span>
          </h2>
          <p className="text-sm sm:text-xl text-gray-600 max-w-3xl mx-auto px-2 sm:px-0">
            융합창업연계전공에 대해 궁금한 점 있으신가요?
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-6 sm:p-8"
          >
            <h3 className="text-2xl font-bold mb-6">연락처 정보</h3>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <FaMapMarkerAlt className="text-primary text-xl mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm mb-0.5">주소</h4>
                  <p className="text-gray-600 text-sm">
                    서울특별시 광진구 능동로 209<br />
                    세종대학교 린스타트업랩
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <FaPhone className="text-primary text-xl mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm mb-0.5">전화</h4>
                  <p className="text-gray-600 text-sm">02-3408-3360</p>
                </div>
              </div>

              <div className="flex items-start">
                <FaEnvelope className="text-primary text-xl mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm mb-0.5">이메일</h4>
                  <p className="text-gray-600 text-sm">cscsejong@sejong.ac.kr</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold mb-2 text-sm">문의 가능시간</h4>
              <p className="text-gray-600 text-sm">
                평일 09:00 - 18:00<br />
                점심시간 12:00 - 13:00<br />
                <span className="text-xs">(주말 및 공휴일 휴무)</span>
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.1 }}
            className="bg-gradient-primary rounded-2xl p-6 sm:p-8 text-white"
          >
            <h3 className="text-2xl font-bold mb-6">SNS</h3>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
              <a
                href="https://www.instagram.com/sejong_startup"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center bg-white/20 backdrop-blur-sm rounded-lg p-4 hover:bg-white/30 transition-all duration-300 group text-center"
              >
                <FaInstagram size={28} className="mb-2" />
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">Instagram</h4>
                  <p className="text-xs sm:text-sm opacity-90">@sejong_startup</p>
                </div>
              </a>

              <a
                href="https://youtu.be/DQ23hx55Y7A"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center bg-white/20 backdrop-blur-sm rounded-lg p-4 hover:bg-white/30 transition-all duration-300 group text-center"
              >
                <FaYoutube size={28} className="mb-2" />
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">YouTube</h4>
                  <p className="text-xs sm:text-sm opacity-90">홍보 영상 보기</p>
                </div>
              </a>
            </div>

            <div className="mt-6 p-4 sm:p-6 bg-white/10 backdrop-blur-sm rounded-lg">
              <h4 className="font-semibold mb-2 text-sm sm:text-base">💬 카카오톡 상담</h4>
              <p className="text-xs sm:text-sm mb-3">
                실시간 상담을 원하시면 하단의 카카오톡 버튼을 클릭해주세요!
              </p>
              <button
                onClick={() => {
                  const kakaoButton = document.querySelector('[aria-label="카카오톡 채팅 상담"]') as HTMLButtonElement;
                  if (kakaoButton) kakaoButton.click();
                }}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg transition-all duration-300 w-full"
              >
                카카오톡 채팅 시작하기
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, amount: 0.1 }}
          className="mt-6 sm:mt-10 bg-gray-50 rounded-2xl p-4 sm:p-6 md:p-8 text-center"
        >
          <h3 className="text-xl md:text-2xl font-bold mb-4">자주 묻는 질문</h3>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 gap-4 md:gap-6 text-left max-w-4xl mx-auto">
            <div>
              <h4 className="font-semibold text-sm md:text-base mb-2">Q. 타 학과생도 지원 가능한가요?</h4>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">A. 네, 세종대학교 전체 학과 재학생이 지원 가능합니다.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm md:text-base mb-2">Q. 신청 시기는 언제인가요?</h4>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">A. 매학기 5월과 11월에 신청 가능하며,<br className="md:hidden" /> 상시 문의는 언제든 가능합니다.<br />
              <span className="text-primary font-medium">카카오톡 채널을 추가하시면 신청 시기 알림을 받을 수 있습니다.</span></p>
            </div>
            <div>
              <h4 className="font-semibold text-sm md:text-base mb-2">Q. 졸업 요건은 어떻게 되나요?</h4>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">A. 전공 39학점 또는 부전공 21학점을 이수하면 됩니다.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm md:text-base mb-2">Q. 창업 경험이 없어도 되나요?</h4>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">A. 네, 창업 기초부터 체계적으로 교육하므로<br className="md:hidden" /> 경험이 없어도 괜찮습니다.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
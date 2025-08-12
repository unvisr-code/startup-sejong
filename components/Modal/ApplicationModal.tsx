'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaExclamationCircle, FaComment } from 'react-icons/fa';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({ isOpen, onClose }) => {
  const openKakaoChat = () => {
    window.open('http://pf.kakao.com/_RqLxan', '_blank');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes size={24} />
            </button>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <FaExclamationCircle className="text-yellow-500 text-3xl" />
              </div>

              <h2 className="text-2xl font-bold mb-3">현재 신청 기간이 아닙니다</h2>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                융합창업연계전공 신청은 매학기 <strong>5월</strong>과 <strong>11월</strong>에 진행됩니다.
                <br />
                <br />
                카카오톡 채널을 추가하시면<br />
                <strong className="text-primary">신청 기간 알림</strong>을 받으실 수 있습니다!
              </p>

              <div className="space-y-3">
                <button
                  onClick={openKakaoChat}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <FaComment />
                  <span>카카오톡 채널 추가하기</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                >
                  나중에 하기
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                * 상시 문의는 언제든 가능합니다
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ApplicationModal;
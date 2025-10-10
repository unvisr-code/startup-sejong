'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaExclamationCircle, FaComment, FaCheckCircle, FaSpinner } from 'react-icons/fa';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone_number: string;
  department: string;
  grade: string;
  age: string;
  gpa: string;
  has_startup_item: boolean;
  self_introduction: string;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({ isOpen, onClose }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone_number: '',
    department: '',
    grade: '',
    age: '',
    gpa: '미입력',
    has_startup_item: false,
    self_introduction: ''
  });

  const openKakaoChat = () => {
    window.open('http://pf.kakao.com/_RqLxan', '_blank');
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/preliminary-application/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          grade: parseInt(formData.grade),
          age: parseInt(formData.age)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '신청 중 오류가 발생했습니다.');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || '신청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setFormData({
      name: '',
      email: '',
      phone_number: '',
      department: '',
      grade: '',
      age: '',
      gpa: '미입력',
      has_startup_item: false,
      self_introduction: ''
    });
    setError(null);
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
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <FaTimes size={24} />
            </button>

            {isSubmitted ? (
              // Success state - show KakaoChat prompt
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <FaCheckCircle className="text-green-500 text-3xl" />
                </div>

                <h2 className="text-2xl font-bold mb-3">예비 신청이 완료되었습니다!</h2>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  융합창업연계전공 예비 신청이 성공적으로 접수되었습니다.
                  <br />
                  <br />
                  정식 신청 기간은 매학기 <strong>5월</strong>과 <strong>11월</strong>입니다.
                  <br />
                  카카오톡 채널을 추가하시면 <strong className="text-primary">신청 기간 알림</strong>을 받으실 수 있습니다!
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
                    onClick={handleClose}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                  >
                    닫기
                  </button>
                </div>
              </div>
            ) : (
              // Form state
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">융합창업연계전공 예비 신청</h2>
                  <p className="text-gray-600 text-sm">
                    현재는 정식 신청 기간이 아니지만, 예비 신청을 통해 관련 정보를 받아보실 수 있습니다.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="홍길동"
                      maxLength={50}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이메일 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="example@sejong.ac.kr"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      전화번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      placeholder="010-1234-5678"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Department and Grade */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        학과 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        placeholder="예: 컴퓨터공학과"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        학년 <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="grade"
                        value={formData.grade}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">선택</option>
                        <option value="1">1학년</option>
                        <option value="2">2학년</option>
                        <option value="3">3학년</option>
                        <option value="4">4학년</option>
                      </select>
                    </div>
                  </div>

                  {/* Age and GPA */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        나이 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        placeholder="예: 22"
                        min="18"
                        max="100"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        학점 (선택)
                      </label>
                      <select
                        name="gpa"
                        value={formData.gpa}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="미입력">선택안함</option>
                        <option value="4.5">4.5</option>
                        <option value="4.3">4.3 이상</option>
                        <option value="4.0">4.0 이상</option>
                        <option value="3.7">3.7 이상</option>
                        <option value="3.5">3.5 이상</option>
                        <option value="3.3">3.3 이상</option>
                        <option value="3.0">3.0 이상</option>
                        <option value="2.7">2.7 이상</option>
                        <option value="2.5">2.5 이상</option>
                        <option value="2.0">2.0 이상</option>
                      </select>
                    </div>
                  </div>

                  {/* Startup Item */}
                  <div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="has_startup_item"
                        checked={formData.has_startup_item}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        창업 아이템을 보유하고 있습니다
                      </span>
                    </label>
                  </div>

                  {/* Self Introduction */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      간단한 자기소개 (선택, 300자 이내)
                    </label>
                    <textarea
                      name="self_introduction"
                      value={formData.self_introduction}
                      onChange={handleInputChange}
                      placeholder="창업에 관심을 갖게 된 계기나 목표 등을 자유롭게 작성해주세요"
                      maxLength={300}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {formData.self_introduction.length}/300자
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          <span>처리 중...</span>
                        </>
                      ) : (
                        <span>예비 신청하기</span>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    * 정식 신청 기간: 매학기 5월, 11월
                  </p>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ApplicationModal;

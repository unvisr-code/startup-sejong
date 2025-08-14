'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBook, FaStar, FaCheckCircle, FaCheck, FaLink, FaTimes, FaPlay, FaStop, FaQuestionCircle, FaCopy, FaInfoCircle } from 'react-icons/fa';
import { HiOutlineInformationCircle } from 'react-icons/hi';
import curriculumData from '../../curriculum.json';

interface Course {
  name: string;
  grade: number;
  semester: number;
  credits: number;
  desc: string;
}

interface SelectedCourses {
  core: Course[];
  elective: Course[];
}

const CurriculumSection = () => {
  const [activeTab, setActiveTab] = useState('major');
  const [gradeFilter, setGradeFilter] = useState<number | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourses>({
    core: [],
    elective: []
  });
  const [showResult, setShowResult] = useState(false);
  const [showFreeTooltip, setShowFreeTooltip] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const resultRef = useRef<HTMLDivElement>(null);

  // 과목 정렬 (학년/학기 오름차순)
  const sortCourses = (courses: Course[]) => {
    return courses.sort((a, b) => a.grade - b.grade || a.semester - b.semester);
  };

  // 학년별 필터링
  const filterByGrade = (courses: Course[]) => {
    if (gradeFilter === null) return courses;
    return courses.filter(course => course.grade === gradeFilter);
  };

  const requiredCourses = filterByGrade(sortCourses(curriculumData.courses.core.list));
  const electiveCourses = filterByGrade(sortCourses(curriculumData.courses.elective.list));

  const gradeOptions = [null, 2, 3, 4];
  // 현재 탭에 맞는 학점 정보 가져오기
  const credits = curriculumData.meta.credits[activeTab as 'major' | 'minor'];

  // 과목 선택/해제
  const toggleCourse = (course: Course, category: keyof SelectedCourses) => {
    if (!isPlanning) return;
    
    setSelectedCourses(prev => {
      const currentCourses = prev[category];
      const isSelected = currentCourses.some(c => c.name === course.name);
      
      if (isSelected) {
        return {
          ...prev,
          [category]: currentCourses.filter(c => c.name !== course.name)
        };
      } else {
        return {
          ...prev,
          [category]: [...currentCourses, course]
        };
      }
    });
  };

  // 선택된 과목 확인
  const isCourseSelected = (courseName: string, category: keyof SelectedCourses) => {
    return selectedCourses[category].some(c => c.name === courseName);
  };

  // 학점 계산
  const calculateCredits = (category: keyof SelectedCourses) => {
    return selectedCourses[category].reduce((sum, course) => sum + course.credits, 0);
  };

  // 완료 처리
  const handleComplete = () => {
    setIsPlanning(false);
    setShowResult(true);
    setCurrentDate(new Date().toLocaleDateString('ko-KR'));
    // 카카오톡 버튼 숨기기 이벤트 발생
    window.dispatchEvent(new CustomEvent('curriculumResultModal', { detail: { isOpen: true } }));
  };

  // 취소 처리
  const handleCancel = () => {
    setIsPlanning(false);
    setSelectedCourses({ core: [], elective: [] });
  };

  // 결과 데이터 인코딩
  const encodeData = () => {
    const data = {
      type: activeTab,
      core: selectedCourses.core.map(c => c.name),
      elective: selectedCourses.elective.map(c => c.name)
    };
    const jsonString = JSON.stringify(data);
    // 한글 처리를 위한 안전한 인코딩
    const base64 = btoa(encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
    return encodeURIComponent(base64);
  };

  // 링크 복사
  const copyShareLink = () => {
    const encoded = encodeData();
    const shareUrl = `${window.location.origin}/curriculum/${encoded}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareLink(shareUrl);
      setShowCopyModal(true);
      setCopySuccess(true);
      setTimeout(() => {
        setShowCopyModal(false);
        setCopySuccess(false);
      }, 3000);
    }).catch(err => {
      console.error('링크 복사 실패:', err);
      alert('링크 복사에 실패했습니다.');
    });
  };

  // 안내 메시지 생성
  // 학년/학기별로 과목 그룹화
  const groupCoursesBySemester = () => {
    const allCourses = [
      ...selectedCourses.core.map(c => ({ ...c, type: 'core' })),
      ...selectedCourses.elective.map(c => ({ ...c, type: 'elective' }))
    ];
    
    const grouped: { [key: string]: any[] } = {};
    
    for (let grade = 2; grade <= 4; grade++) {
      for (let semester = 1; semester <= 2; semester++) {
        const key = `${grade}-${semester}`;
        grouped[key] = allCourses.filter(c => c.grade === grade && c.semester === semester);
      }
    }
    
    return grouped;
  };

  const getStatusMessage = () => {
    const coreCredits = calculateCredits('core');
    const electiveCredits = calculateCredits('elective');
    
    const messages = [];
    
    if (coreCredits < credits.core) {
      messages.push(`전공필수 ${credits.core - coreCredits}학점이 더 필요합니다`);
    } else if (coreCredits > credits.core) {
      messages.push(`전공필수를 ${coreCredits - credits.core}학점 초과 이수하셨습니다 (권장 범위 내)`);
    }
    
    if (electiveCredits < credits.elective) {
      messages.push(`전공선택 ${credits.elective - electiveCredits}학점이 더 필요합니다`);
    } else if (electiveCredits > credits.elective) {
      messages.push(`전공선택을 ${electiveCredits - credits.elective}학점 초과 이수하셨습니다 (권장 범위 내)`);
    }
    
    if (coreCredits >= credits.core && electiveCredits >= credits.elective) {
      return '전공필수/선택 이수 완료!';
    }
    
    return messages.join(' | ');
  };


  return (
    <section id="curriculum" className="section-padding">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.1 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            교육과정 및 <span className="gradient-text">학위 취득</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            체계적인 커리큘럼으로<br className="sm:hidden" />
            창업 전문가로 성장하세요
          </p>
        </motion.div>


        <div className="flex flex-col items-center mb-8 space-y-4">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setActiveTab('major')}
              className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                activeTab === 'major'
                  ? 'bg-white text-primary shadow-md'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              연계전공 ({curriculumData.meta.credits.major.total}학점)
            </button>
            <button
              onClick={() => setActiveTab('minor')}
              className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                activeTab === 'minor'
                  ? 'bg-white text-primary shadow-md'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              연계부전공 ({curriculumData.meta.credits.minor.total}학점)
            </button>
          </div>
          
          <div className="text-xs sm:text-sm text-gray-500 text-center max-w-2xl px-2 sm:px-0">
            <p className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-x-1">
              <span className="whitespace-nowrap">전공필수 {credits.core}학점</span>
              <span className="hidden sm:inline">+</span>
              <span className="whitespace-nowrap">전공선택 {credits.elective}학점</span>
              <span className="hidden sm:inline">+</span>
              <span className="relative inline-flex items-center gap-1 whitespace-nowrap">
                자유선택 {credits.free}학점
                <span 
                  className="relative"
                  onMouseEnter={() => setShowFreeTooltip(true)}
                  onMouseLeave={() => setShowFreeTooltip(false)}
                  onClick={() => setShowFreeTooltip(!showFreeTooltip)}
                >
                  <HiOutlineInformationCircle className="text-gray-400 hover:text-gray-600 transition-all hover:scale-110 cursor-help" style={{ fontSize: '14px' }} />
                  <AnimatePresence>
                    {showFreeTooltip && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 bg-gray-900 text-white text-xs rounded-md p-3 shadow-xl z-50"
                      >
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                        {curriculumData.courses.free.policy}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </span>
              </span>
              <span className="whitespace-nowrap">= 총 {credits.total}학점</span>
            </p>
          </div>
          
          <div className="bg-gray-50 p-1 rounded-lg inline-flex">
            {gradeOptions.map((grade) => (
              <button
                key={grade || 'all'}
                onClick={() => setGradeFilter(grade)}
                className={`px-4 py-2 rounded-md font-medium transition-all text-sm ${
                  gradeFilter === grade
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                {grade ? `${grade}학년` : '전체'}
              </button>
            ))}
          </div>
          
          <div className="flex gap-3">
            {!isPlanning ? (
              <button
                onClick={() => setIsPlanning(true)}
                className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <FaPlay size={14} />
                이수체계도 만들기
              </button>
            ) : (
              <>
                <button
                  onClick={handleComplete}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <FaCheck size={14} />
                  완료
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <FaTimes size={14} />
                  취소
                </button>
              </>
            )}
          </div>
          
          {isPlanning && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-medium mb-1">현재 선택 현황:</p>
              <p>전공필수: {calculateCredits('core')}/{credits.core}학점 | 전공선택: {calculateCredits('elective')}/{credits.elective}학점 | 자유선택: 별도 {credits.free}학점 이수 필요</p>
              <p className="mt-1 text-xs">{getStatusMessage()}</p>
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        >
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <FaStar className="text-primary text-xl sm:text-2xl mr-2 sm:mr-3" />
              <h3 className="text-xl sm:text-2xl font-bold">전공필수</h3>
              <span className="ml-auto bg-primary text-white px-3 py-1 rounded-full text-sm">
                {credits.core}학점
              </span>
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
              {requiredCourses.map((course, index) => {
                const isSelected = isCourseSelected(course.name, 'core');
                return (
                  <div 
                    key={index} 
                    onClick={() => toggleCourse(course, 'core')}
                    className={`border rounded-lg p-3 sm:p-4 shadow-sm transition-all ${
                      isPlanning ? 'cursor-pointer hover:shadow-md' : ''
                    } ${
                      isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-sm sm:text-base text-gray-800 flex-1 pr-2">
                          {isPlanning && isSelected && <FaCheck className="inline-block text-blue-600 mr-1" />}
                          {course.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          {course.grade}-{course.semester}
                        </span>
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          {course.credits}학점
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{course.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <FaBook className="text-secondary text-xl sm:text-2xl mr-2 sm:mr-3" />
              <h3 className="text-xl sm:text-2xl font-bold">전공선택</h3>
              <span className="ml-auto bg-secondary text-white px-3 py-1 rounded-full text-sm">
                {credits.elective}학점
              </span>
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
              {electiveCourses.map((course, index) => {
                const isSelected = isCourseSelected(course.name, 'elective');
                return (
                  <div 
                    key={index} 
                    onClick={() => toggleCourse(course, 'elective')}
                    className={`border rounded-lg p-3 sm:p-4 shadow-sm transition-all ${
                      isPlanning ? 'cursor-pointer hover:shadow-md' : ''
                    } ${
                      isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-sm sm:text-base text-gray-800 flex-1 pr-2">
                          {isPlanning && isSelected && <FaCheck className="inline-block text-blue-600 mr-1" />}
                          {course.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          {course.grade}-{course.semester}
                        </span>
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          {course.credits}학점
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{course.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </motion.div>


        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true, amount: 0.1 }}
          className="mt-12 bg-blue-50 rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold mb-4 text-center">융합창업연계전공 혜택</h3>
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

        {/* 결과 팝업 */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => {
                setShowResult(false);
                // 카카오톡 버튼 다시 보이기 이벤트 발생
                window.dispatchEvent(new CustomEvent('curriculumResultModal', { detail: { isOpen: false } }));
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col"
              >
                <div className="p-6 flex-1 overflow-y-auto">
                  <div ref={resultRef} id="result-content" className="space-y-3">
                    <div className="text-center border-b border-gray-200 pb-3">
                      <h2 className="text-2xl font-bold text-gray-800 mb-1">세종대학교 융합창업학과</h2>
                      <h3 className="text-lg text-gray-600">{activeTab === 'major' ? '연계전공' : '연계부전공'} 이수체계도</h3>
                      <div className="mt-2 flex flex-wrap justify-center gap-2 sm:gap-4">
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">선택 학점:</span> {calculateCredits('core') + calculateCredits('elective')}학점 (자유선택 {credits.free}학점 별도)
                        </div>
                        {currentDate && (
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">생성일:</span> {currentDate}
                          </div>
                        )}
                      </div>
                    </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* 전공필수 */}
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-base font-bold text-blue-800">전공필수</h4>
                        <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                          {calculateCredits('core')}/{credits.core}학점
                        </span>
                      </div>
                      <div className="space-y-1">
                        {selectedCourses.core.map((course, index) => (
                          <div key={index} className="bg-white rounded-md p-2">
                            <div className="font-medium text-gray-800 text-sm">{course.name}</div>
                            <div className="text-gray-500 text-xs">
                              {course.grade}학년 {course.semester}학기 • {course.credits}학점
                            </div>
                            <div className="text-gray-600 text-xs mt-1 truncate">{course.desc}</div>
                          </div>
                        ))}
                        {selectedCourses.core.length === 0 && (
                          <div className="text-gray-500 text-xs text-center py-2">선택된 과목이 없습니다</div>
                        )}
                      </div>
                    </div>

                    {/* 전공선택 */}
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-base font-bold text-purple-800">전공선택</h4>
                        <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs">
                          {calculateCredits('elective')}/{credits.elective}학점
                        </span>
                      </div>
                      <div className="space-y-1">
                        {selectedCourses.elective.map((course, index) => (
                          <div key={index} className="bg-white rounded-md p-2">
                            <div className="font-medium text-gray-800 text-sm">{course.name}</div>
                            <div className="text-gray-500 text-xs">
                              {course.grade}학년 {course.semester}학기 • {course.credits}학점
                            </div>
                            <div className="text-gray-600 text-xs mt-1 truncate">{course.desc}</div>
                          </div>
                        ))}
                        {selectedCourses.elective.length === 0 && (
                          <div className="text-gray-500 text-xs text-center py-2">선택된 과목이 없습니다</div>
                        )}
                      </div>
                    </div>

                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-base font-bold text-gray-800 mb-2">이수 현황 요약</h4>
                    <div className="grid grid-cols-4 gap-1 sm:gap-2 text-center">
                      <div className="bg-white rounded-md p-2 sm:p-3">
                        <div className="text-lg sm:text-xl font-bold text-blue-600">{calculateCredits('core')}</div>
                        <div className="text-[10px] sm:text-xs text-gray-600">전공필수</div>
                      </div>
                      <div className="bg-white rounded-md p-2 sm:p-3">
                        <div className="text-lg sm:text-xl font-bold text-purple-600">{calculateCredits('elective')}</div>
                        <div className="text-[10px] sm:text-xs text-gray-600">전공선택</div>
                      </div>
                      <div className="bg-white rounded-md p-2 sm:p-3">
                        <div className="text-lg sm:text-xl font-bold text-green-600">{credits.free}</div>
                        <div className="text-[10px] sm:text-xs text-gray-600">자유선택</div>
                      </div>
                      <div className="bg-white rounded-md p-2 sm:p-3">
                        <div className="text-lg sm:text-xl font-bold text-gray-800">
                          {calculateCredits('core') + calculateCredits('elective') + credits.free}
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-600">총 학점</div>
                      </div>
                    </div>
                    <div className="mt-3 text-center space-y-2">
                      <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        getStatusMessage().includes('완료')
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getStatusMessage().split(' | ').map((msg, idx) => (
                          <div key={idx} className={idx > 0 ? 'mt-1' : ''}>
                            {msg}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 학년별 이수 계획 */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 mt-3">
                    <h4 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <FaBook className="text-gray-600" />
                      학년별 이수 계획
                    </h4>
                    <div className="space-y-3">
                      {(() => {
                        const grouped = groupCoursesBySemester();
                        return [2, 3, 4].map(grade => {
                          const firstSem = grouped[`${grade}-1`] || [];
                          const secondSem = grouped[`${grade}-2`] || [];
                          
                          if (firstSem.length === 0 && secondSem.length === 0) return null;
                          
                          return (
                            <div key={grade} className="border-l-4 border-gray-300 pl-4">
                              <h5 className="font-bold text-gray-700 mb-2">{grade}학년</h5>
                              <div className="space-y-2 ml-2">
                                {firstSem.length > 0 && (
                                  <div className="flex flex-wrap items-start gap-2">
                                    <span className="text-xs font-medium text-gray-600 mt-1">1학기:</span>
                                    <div className="flex flex-wrap gap-1">
                                      {firstSem.map((course, idx) => (
                                        <span 
                                          key={idx} 
                                          className={`px-2 py-1 rounded text-xs font-medium ${
                                            course.type === 'core' 
                                              ? 'bg-blue-100 text-blue-700' 
                                              : 'bg-purple-100 text-purple-700'
                                          }`}
                                        >
                                          {course.name} ({course.credits}학점)
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {secondSem.length > 0 && (
                                  <div className="flex flex-wrap items-start gap-2">
                                    <span className="text-xs font-medium text-gray-600 mt-1">2학기:</span>
                                    <div className="flex flex-wrap gap-1">
                                      {secondSem.map((course, idx) => (
                                        <span 
                                          key={idx} 
                                          className={`px-2 py-1 rounded text-xs font-medium ${
                                            course.type === 'core' 
                                              ? 'bg-blue-100 text-blue-700' 
                                              : 'bg-purple-100 text-purple-700'
                                          }`}
                                        >
                                          {course.name} ({course.credits}학점)
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }).filter(Boolean);
                      })()}
                      {selectedCourses.core.length === 0 && selectedCourses.elective.length === 0 && (
                        <div className="text-center text-gray-500 text-sm py-4">
                          선택된 과목이 없습니다
                        </div>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="w-3 h-3 bg-blue-100 rounded"></span>
                          <span className="text-gray-600">전공필수</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-3 h-3 bg-purple-100 rounded"></span>
                          <span className="text-gray-600">전공선택</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4 p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex-shrink-0">
                  <button
                    onClick={copyShareLink}
                    className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 relative"
                  >
                    {copySuccess ? (
                      <>
                        <FaCheck size={14} />
                        복사 완료!
                      </>
                    ) : (
                      <>
                        <FaCopy size={14} />
                        링크 복사하기
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowResult(false);
                      // 카카오톡 버튼 다시 보이기 이벤트 발생
                      window.dispatchEvent(new CustomEvent('curriculumResultModal', { detail: { isOpen: false } }));
                    }}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 링크 복사 성공 모달 */}
        <AnimatePresence>
          {showCopyModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
              onClick={() => setShowCopyModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              >
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <FaCheck className="text-green-600 text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">링크가 복사되었습니다!</h3>
                  <p className="text-gray-600 mb-4">
                    이 링크를 통해 이수체계도를 저장했습니다.
                  </p>
                  <div className="bg-gray-100 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-700 break-all font-mono">
                      {shareLink}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCopyModal(false)}
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    확인
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default CurriculumSection;
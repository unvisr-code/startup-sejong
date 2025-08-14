import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { FaHome, FaCheckCircle, FaBook } from 'react-icons/fa';
import Link from 'next/link';
import curriculumData from '../../curriculum.json';

interface Course {
  name: string;
  grade: number;
  semester: number;
  credits: number;
  desc: string;
}

interface DecodedData {
  type: 'major' | 'minor';
  core: string[];
  elective: string[];
}

const CurriculumSharePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [currentDate, setCurrentDate] = useState<string>('');

  // URL 파라미터 디코딩
  const decodeData = (encodedStr: string): DecodedData | null => {
    try {
      const decoded = decodeURIComponent(encodedStr);
      // 한글 처리를 위한 안전한 디코딩
      const binaryString = atob(decoded);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const jsonString = decodeURIComponent(bytes.reduce((acc, byte) => {
        return acc + '%' + ('0' + byte.toString(16)).slice(-2);
      }, ''));
      const data = JSON.parse(jsonString);
      return data;
    } catch (error) {
      console.error('Invalid share link:', error);
      return null;
    }
  };

  // 클라이언트 사이드에서만 날짜 설정
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('ko-KR'));
  }, []);

  // 라우터가 준비되지 않았을 때 로딩 표시
  if (!router.isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">이수체계도를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 데이터 파싱
  const data = id ? decodeData(id as string) : null;
  
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">잘못된 링크입니다</h1>
          <Link href="/" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
            <FaHome />
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const credits = curriculumData.meta.credits[data.type];
  
  // 선택된 과목 찾기
  const findCourses = (courseNames: string[], courseList: Course[]): Course[] => {
    return courseNames.map(name => courseList.find(c => c.name === name)).filter(Boolean) as Course[];
  };

  const selectedCore = findCourses(data.core, curriculumData.courses.core.list);
  const selectedElective = findCourses(data.elective, curriculumData.courses.elective.list);

  const totalCore = selectedCore.reduce((sum, c) => sum + c.credits, 0);
  const totalElective = selectedElective.reduce((sum, c) => sum + c.credits, 0);

  // 학년/학기별로 과목 그룹화
  const groupCoursesBySemester = () => {
    const allCourses = [
      ...selectedCore.map(c => ({ ...c, type: 'core' })),
      ...selectedElective.map(c => ({ ...c, type: 'elective' }))
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
    const messages = [];
    
    if (totalCore < credits.core) {
      messages.push(`전공필수 ${credits.core - totalCore}학점이 더 필요합니다`);
    } else if (totalCore > credits.core) {
      messages.push(`전공필수를 ${totalCore - credits.core}학점 초과 이수하셨습니다 (권장 범위 내)`);
    }
    
    if (totalElective < credits.elective) {
      messages.push(`전공선택 ${credits.elective - totalElective}학점이 더 필요합니다`);
    } else if (totalElective > credits.elective) {
      messages.push(`전공선택을 ${totalElective - credits.elective}학점 초과 이수하셨습니다 (권장 범위 내)`);
    }
    
    if (totalCore >= credits.core && totalElective >= credits.elective) {
      return '전공필수/선택 이수 완료!';
    }
    
    return messages.join(' | ');
  };

  return (
    <>
      <Head>
        <title>세종대 융합창업 {data.type === 'major' ? '연계전공' : '연계부전공'} 이수체계도</title>
        <meta name="description" content={`세종대학교 융합창업학과 ${data.type === 'major' ? '연계전공' : '연계부전공'} 이수체계도`} />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-5xl mx-auto">
            {/* 헤더 */}
            <div className="text-center border-b border-gray-200 pb-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">세종대학교 융합창업학과</h1>
              <h2 className="text-xl text-gray-600 mb-4">
                {data.type === 'major' ? '연계전공' : '연계부전공'} 이수체계도
              </h2>
              <div className="flex justify-center gap-6 text-sm text-gray-500">
                <div>
                  <span className="font-medium">선택 학점:</span> {totalCore + totalElective}학점
                </div>
                {currentDate && (
                  <div>
                    <span className="font-medium">생성일:</span> {currentDate}
                  </div>
                )}
              </div>
            </div>

            {/* 과목 목록 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* 전공필수 */}
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-blue-800">전공필수</h3>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                    {totalCore}/{credits.core}학점
                  </span>
                </div>
                <div className="space-y-3">
                  {selectedCore.length > 0 ? (
                    selectedCore.map((course, index) => (
                      <div key={index} className="bg-white rounded-lg p-4">
                        <div className="font-medium text-gray-800 mb-1">{course.name}</div>
                        <div className="text-gray-500 text-sm mb-2">
                          {course.grade}학년 {course.semester}학기 • {course.credits}학점
                        </div>
                        <div className="text-gray-600 text-sm">{course.desc}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-4">선택된 과목이 없습니다</div>
                  )}
                </div>
              </div>

              {/* 전공선택 */}
              <div className="bg-purple-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-purple-800">전공선택</h3>
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                    {totalElective}/{credits.elective}학점
                  </span>
                </div>
                <div className="space-y-3">
                  {selectedElective.length > 0 ? (
                    selectedElective.map((course, index) => (
                      <div key={index} className="bg-white rounded-lg p-4">
                        <div className="font-medium text-gray-800 mb-1">{course.name}</div>
                        <div className="text-gray-500 text-sm mb-2">
                          {course.grade}학년 {course.semester}학기 • {course.credits}학점
                        </div>
                        <div className="text-gray-600 text-sm">{course.desc}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-4">선택된 과목이 없습니다</div>
                  )}
                </div>
              </div>
            </div>

            {/* 이수 현황 요약 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">이수 현황 요약</h3>
              <div className="grid grid-cols-4 gap-4 text-center mb-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{totalCore}</div>
                  <div className="text-sm text-gray-600">전공필수</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">{totalElective}</div>
                  <div className="text-sm text-gray-600">전공선택</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{credits.free}</div>
                  <div className="text-sm text-gray-600">자유선택</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-800">
                    {totalCore + totalElective + credits.free}
                  </div>
                  <div className="text-sm text-gray-600">총 학점</div>
                </div>
              </div>
              
              <div className="text-center space-y-3">
                <div className={`inline-block px-4 py-2 rounded-lg text-sm font-medium ${
                  getStatusMessage().includes('완료')
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {getStatusMessage()}
                </div>
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-gray-700 font-medium text-sm mb-1">
                    ※ 자유선택 {credits.free}학점 별도 이수 필요
                  </p>
                  <p className="text-gray-600 text-xs">
                    {curriculumData.courses.free.policy}
                  </p>
                </div>
              </div>
            </div>

            {/* 학년별 이수 계획 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaBook className="text-gray-600" />
                학년별 이수 계획
              </h3>
              <div className="space-y-4">
                {(() => {
                  const grouped = groupCoursesBySemester();
                  return [2, 3, 4].map(grade => {
                    const firstSem = grouped[`${grade}-1`] || [];
                    const secondSem = grouped[`${grade}-2`] || [];
                    
                    if (firstSem.length === 0 && secondSem.length === 0) return null;
                    
                    return (
                      <div key={grade} className="border-l-4 border-gray-300 pl-4">
                        <h4 className="font-bold text-gray-700 mb-2">{grade}학년</h4>
                        <div className="space-y-2 ml-4">
                          {firstSem.length > 0 && (
                            <div className="flex flex-wrap items-start gap-2">
                              <span className="text-sm font-medium text-gray-600 mt-1">1학기:</span>
                              <div className="flex flex-wrap gap-2">
                                {firstSem.map((course, idx) => (
                                  <span 
                                    key={idx} 
                                    className={`px-3 py-1 rounded text-sm font-medium ${
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
                              <span className="text-sm font-medium text-gray-600 mt-1">2학기:</span>
                              <div className="flex flex-wrap gap-2">
                                {secondSem.map((course, idx) => (
                                  <span 
                                    key={idx} 
                                    className={`px-3 py-1 rounded text-sm font-medium ${
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
                {selectedCore.length === 0 && selectedElective.length === 0 && (
                  <div className="text-center text-gray-500 py-6">
                    선택된 과목이 없습니다
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-blue-100 rounded"></span>
                    <span className="text-gray-600">전공필수</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-purple-100 rounded"></span>
                    <span className="text-gray-600">전공선택</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="mt-8 flex justify-center">
              <Link href="/" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                <FaHome />
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CurriculumSharePage;
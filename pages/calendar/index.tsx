import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import JsonLd from '../../components/SEO/JsonLd';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaDownload, FaCalendarPlus, FaStar, FaBullhorn, FaExternalLinkAlt } from 'react-icons/fa';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import { supabase, AcademicEvent } from '../../lib/supabase';
import { downloadMonthlyICS, downloadSingleEventICS } from '../../lib/icsGenerator';
import { useRouter } from 'next/router';
import { generateEventSchema, SITE_CONFIG } from '../../lib/seo';

const CalendarPage = () => {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle URL hash for direct event linking
  useEffect(() => {
    if (events.length > 0 && router.asPath.includes('#event-')) {
      const eventId = router.asPath.split('#event-')[1];
      const targetEvent = events.find(e => e.id === eventId);
      
      if (targetEvent) {
        setSelectedEvent(targetEvent);
        // Scroll to calendar section after a short delay
        setTimeout(() => {
          const calendarSection = document.getElementById('calendar-section');
          if (calendarSection) {
            calendarSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 500);
      }
    }
  }, [events, router.asPath]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('academic_calendar')
        .select(`
          *,
          announcement:announcements!academic_calendar_announcement_id_fkey (
            id,
            title,
            category
          )
        `)
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        // 재시도 로직
        setTimeout(async () => {
          try {
            const { data: retryData, error: retryError } = await supabase
              .from('academic_calendar')
              .select('*')
              .order('start_date', { ascending: true });
            
            if (!retryError && retryData) {
              setEvents(retryData);
              return;
            }
          } catch (retryErr) {
            console.error('Retry failed:', retryErr);
          }
        }, 2000);
        
        // 재시도 중에도 mock 데이터 표시
        throw error;
      }
      
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      // 개발용 더미 데이터 - DB 연결 실패 시 사용
      const mockData: AcademicEvent[] = [
        {
          id: '1',
          title: '2025학년도 1학기 개강',
          start_date: '2025-03-02',
          end_date: '2025-03-02',
          event_type: 'semester',
          description: '2025학년도 1학기가 시작됩니다.',
          location: '세종대학교',
          created_at: '2025-01-18',
          updated_at: '2025-01-18',
          is_important: true
        },
        {
          id: '2',
          title: '수강신청 기간',
          start_date: '2025-02-24',
          end_date: '2025-02-28',
          event_type: 'application',
          description: '2025학년도 1학기 수강신청 기간입니다.',
          location: '온라인 (학사정보시스템)',
          created_at: '2025-01-18',
          updated_at: '2025-01-18',
          is_important: true
        },
        {
          id: '3',
          title: '중간고사',
          start_date: '2025-04-20',
          end_date: '2025-04-26',
          event_type: 'exam',
          description: '중간고사 기간입니다.',
          location: '각 강의실',
          created_at: '2025-01-18',
          updated_at: '2025-01-18',
          is_important: true
        },
        {
          id: '4',
          title: '어린이날',
          start_date: '2025-05-05',
          end_date: '2025-05-05',
          event_type: 'holiday',
          description: '어린이날 공휴일입니다.',
          created_at: '2025-01-18',
          updated_at: '2025-01-18',
          is_important: false
        },
        {
          id: '5',
          title: '기말고사',
          start_date: '2025-06-15',
          end_date: '2025-06-21',
          event_type: 'exam',
          description: '기말고사 기간입니다.',
          location: '각 강의실',
          created_at: '2025-01-18',
          updated_at: '2025-01-18',
          is_important: true
        },
        {
          id: '6',
          title: '하계방학',
          start_date: '2025-06-22',
          end_date: '2025-08-31',
          event_type: 'holiday',
          description: '하계방학 기간입니다.',
          created_at: '2025-01-18',
          updated_at: '2025-01-18',
          is_important: false
        }
      ];
      setEvents(mockData);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'semester':
        return 'bg-blue-500';
      case 'exam':
        return 'bg-red-500';
      case 'holiday':
        return 'bg-green-500';
      case 'application':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'semester':
        return '학기';
      case 'exam':
        return '시험';
      case 'holiday':
        return '휴일';
      case 'application':
        return '신청';
      default:
        return '기타';
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad days to start from Sunday
  const startDay = monthStart.getDay();
  const paddedDays = Array(startDay).fill(null).concat(days);

  const getEventsForDay = (day: Date | null) => {
    if (!day) return [];
    return events.filter(event => {
      const eventStart = new Date(event.start_date);
      const eventEnd = new Date(event.end_date);
      return day >= eventStart && day <= eventEnd;
    });
  };

  // 연속된 일정을 그룹화하는 함수
  const getMonthEventsWithSpan = () => {
    return events.map(event => {
      const eventStart = new Date(event.start_date);
      const eventEnd = new Date(event.end_date);
      
      // 현재 달의 시작과 끝 날짜 계산
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      
      // 이벤트가 현재 달에 포함되는지 확인
      if (eventEnd < monthStart || eventStart > monthEnd) {
        return null;
      }
      
      // 표시할 시작일과 종료일 계산 (현재 달 범위 내로 제한)
      const displayStart = eventStart < monthStart ? monthStart : eventStart;
      const displayEnd = eventEnd > monthEnd ? monthEnd : eventEnd;
      
      // 캘린더 그리드에서의 위치 계산
      const startDay = displayStart.getDay();
      const startDate = displayStart.getDate();
      const endDate = displayEnd.getDate();
      const duration = endDate - startDate + 1;
      
      // 첫 주의 패딩을 고려한 시작 인덱스
      const firstDayPadding = monthStart.getDay();
      const gridStartIndex = firstDayPadding + startDate - 1;
      
      return {
        ...event,
        gridStartIndex,
        duration,
        displayStart,
        displayEnd
      };
    }).filter(Boolean);
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  return (
    <>
      <Head>
        <title>학사일정 - 세종대 융합창업연계전공</title>
        <meta name="description" content="세종대학교 융합창업연계전공 학사일정을 확인하세요. 수강신청, 시험 기간, 학기 일정 등을 한눈에 볼 수 있습니다." />
        <meta name="keywords" content="세종대학교 학사일정, 융합창업 일정, 수강신청, 시험기간, 학사캘린더" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="학사일정 - 세종대 융합창업연계전공" />
        <meta property="og:description" content="세종대학교 융합창업연계전공 학사일정을 확인하세요." />
        <meta property="og:url" content={`${SITE_CONFIG.url}/calendar`} />
        <meta property="og:image" content={`${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`} />

        {/* Canonical */}
        <link rel="canonical" href={`${SITE_CONFIG.url}/calendar`} />
      </Head>

      {/* Event Schema for current month events */}
      {!loading && events.length > 0 && (
        <JsonLd
          data={events
            .filter(event => {
              const eventStart = new Date(event.start_date);
              const eventEnd = new Date(event.end_date);
              const monthStart = startOfMonth(currentDate);
              const monthEnd = endOfMonth(currentDate);
              return (eventStart <= monthEnd && eventEnd >= monthStart);
            })
            .map(event => generateEventSchema({
              title: event.title,
              description: event.description || event.title,
              startDate: event.start_date,
              endDate: event.end_date,
              location: event.location,
              url: `/calendar#event-${event.id}`
            }))
          }
        />
      )}

      <Header />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-primary pt-36 pb-16">
          <div className="container-custom text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <FaCalendarAlt className="text-5xl mb-4 mx-auto" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">학사일정</h1>
              <p className="text-xl">융합창업연계전공의 주요 일정을 확인하세요</p>
            </motion.div>
          </div>
        </section>

        {/* Calendar Section */}
        <section className="py-12">
          <div className="container-custom">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-gray-600">학사일정을 불러오는 중...</p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8" id="calendar-section">
                {/* Calendar View */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-6">
                      <button
                        onClick={handlePrevMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FaChevronLeft />
                      </button>
                      <h2 className="text-2xl font-bold">
                        {format(currentDate, 'yyyy년 MM월', { locale: ko })}
                      </h2>
                      <button
                        onClick={handleNextMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FaChevronRight />
                      </button>
                    </div>

                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                        <div key={day} className="text-center font-semibold text-gray-600 py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 relative">
                      {paddedDays.map((day, index) => {
                        const isToday = day && isSameDay(day, new Date());
                        
                        return (
                          <div
                            key={index}
                            className={`min-h-[100px] p-2 border rounded-lg ${
                              !day ? 'bg-gray-50' : 
                              isToday ? 'bg-blue-50 border-blue-300' : 
                              'bg-white hover:bg-gray-50'
                            }`}
                          >
                            {day && (
                              <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                                {format(day, 'd')}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* 연속된 일정 표시 - 개선된 렌더링 */}
                      <div className="absolute inset-0 pointer-events-none">
                        {(() => {
                          // 각 주별로 이벤트 그룹화
                          const eventsByWeek: { [key: number]: any[] } = {};
                          
                          events
                            .filter(event => {
                              const eventStart = new Date(event.start_date);
                              const eventEnd = new Date(event.end_date);
                              return !(eventEnd < monthStart || eventStart > monthEnd);
                            })
                            .forEach(event => {
                              const eventStart = new Date(event.start_date);
                              const eventEnd = new Date(event.end_date);
                              
                              // 현재 달에서 표시할 범위 계산
                              const displayStart = eventStart < monthStart ? monthStart : eventStart;
                              const displayEnd = eventEnd > monthEnd ? monthEnd : eventEnd;
                              
                              // 주별로 나누어 처리
                              let currentDate = new Date(displayStart);
                              
                              while (currentDate <= displayEnd) {
                                const weekEnd = new Date(currentDate);
                                weekEnd.setDate(weekEnd.getDate() + (6 - weekEnd.getDay()));
                                
                                const barEnd = weekEnd > displayEnd ? displayEnd : weekEnd;
                                const startDateNum = currentDate.getDate();
                                const weekRow = Math.floor((startDateNum + monthStart.getDay() - 1) / 7);
                                
                                if (!eventsByWeek[weekRow]) {
                                  eventsByWeek[weekRow] = [];
                                }
                                
                                eventsByWeek[weekRow].push({
                                  event,
                                  startDate: new Date(currentDate),
                                  endDate: new Date(barEnd),
                                  isFirstSegment: currentDate.getTime() === displayStart.getTime(),
                                  isMonthStart: currentDate.getTime() === monthStart.getTime()
                                });
                                
                                // 다음 주로 이동
                                currentDate = new Date(barEnd);
                                currentDate.setDate(currentDate.getDate() + 1);
                              }
                            });
                          
                          // 렌더링
                          return Object.entries(eventsByWeek).map(([weekRow, weekEvents]) => {
                            // 각 주의 이벤트들을 row로 정렬
                            const rows: any[][] = [];
                            
                            weekEvents.forEach(eventData => {
                              let placed = false;
                              const startCol = eventData.startDate.getDay();
                              const endCol = eventData.endDate.getDay();
                              
                              // 기존 row들 중에서 배치 가능한 곳 찾기
                              for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
                                const row = rows[rowIndex];
                                let canPlace = true;
                                
                                for (const existingEvent of row) {
                                  const existingStart = existingEvent.startDate.getDay();
                                  const existingEnd = existingEvent.endDate.getDay();
                                  
                                  if (!(endCol < existingStart || startCol > existingEnd)) {
                                    canPlace = false;
                                    break;
                                  }
                                }
                                
                                if (canPlace) {
                                  row.push(eventData);
                                  placed = true;
                                  break;
                                }
                              }
                              
                              if (!placed) {
                                rows.push([eventData]);
                              }
                            });
                            
                            // 각 이벤트 렌더링
                            return rows.map((row, rowIndex) => 
                              row.map(eventData => {
                                const startCol = eventData.startDate.getDay();
                                const endCol = eventData.endDate.getDay();
                                const barLength = endCol - startCol + 1;
                                
                                return (
                                  <div
                                    key={`${eventData.event.id}-week-${weekRow}-row-${rowIndex}`}
                                    className={`absolute h-5 ${getEventTypeColor(eventData.event.event_type)} text-white text-xs px-1 rounded flex items-center pointer-events-auto cursor-pointer hover:opacity-90 transition-opacity overflow-hidden`}
                                    style={{
                                      left: `calc((100% / 7) * ${startCol} + 2px)`,
                                      width: `calc((100% / 7) * ${barLength} - 4px)`,
                                      top: `calc((100px + 4px) * ${weekRow} + 30px + ${rowIndex * 22}px)`,
                                      zIndex: 10
                                    }}
                                    onClick={() => setSelectedEvent(eventData.event)}
                                    title={eventData.event.title}
                                  >
                                    <span className="truncate flex items-center gap-1 w-full">
                                      {(eventData.isFirstSegment || eventData.isMonthStart) && (
                                        <>
                                          {eventData.event.is_important && <FaStar className="text-yellow-300 flex-shrink-0" size={10} />}
                                          <span className={eventData.event.is_important ? 'font-bold' : ''}>
                                            {eventData.isMonthStart && !eventData.isFirstSegment ? '← ' : ''}
                                            {eventData.event.title}
                                          </span>
                                        </>
                                      )}
                                    </span>
                                  </div>
                                );
                              })
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event List */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">이번 달 일정</h3>
                      <button
                        onClick={() => {
                          downloadMonthlyICS(events, currentDate);
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                      >
                        <FaDownload size={14} />
                        전체 일정 다운로드
                      </button>
                    </div>
                    
                    {/* Event Type Legend */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {['semester', 'exam', 'holiday', 'application'].map(type => (
                        <div key={type} className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getEventTypeColor(type)}`}></div>
                          <span className="text-sm text-gray-600">{getEventTypeLabel(type)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Events for Current Month */}
                    <div className="space-y-3">
                      {events
                        .filter(event => {
                          const eventStart = new Date(event.start_date);
                          const eventEnd = new Date(event.end_date);
                          const monthStart = startOfMonth(currentDate);
                          const monthEnd = endOfMonth(currentDate);
                          
                          // 이벤트가 현재 달과 겹치는지 확인 (시작일 또는 종료일이 현재 달에 포함)
                          return (eventStart <= monthEnd && eventEnd >= monthStart);
                        })
                        .map(event => (
                          <div
                            key={event.id}
                            className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => setSelectedEvent(event)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-1.5 ${getEventTypeColor(event.event_type)}`}></div>
                              <div className="flex-1">
                                <h4 className={`text-sm ${event.is_important ? 'font-bold' : 'font-semibold'} flex items-center gap-1`}>
                                  {event.is_important && <FaStar className="text-yellow-500" size={12} />}
                                  {event.title}
                                  {event.announcement && <FaBullhorn className="text-blue-500 ml-1" size={10} />}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  {format(new Date(event.start_date), 'MM/dd', { locale: ko })}
                                  {event.start_date !== event.end_date && 
                                    ` - ${format(new Date(event.end_date), 'MM/dd', { locale: ko })}`
                                  }
                                </p>
                                {event.location && (
                                  <p className="text-xs text-gray-500 mt-1">📍 {event.location}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Selected Event Modal */}
        {selectedEvent && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-4 h-4 rounded-full ${getEventTypeColor(selectedEvent.event_type)}`}></div>
                <span className="text-sm font-medium text-gray-600">
                  {getEventTypeLabel(selectedEvent.event_type)}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                {selectedEvent.is_important && <FaStar className="text-yellow-500" />}
                {selectedEvent.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {format(new Date(selectedEvent.start_date), 'yyyy년 MM월 dd일', { locale: ko })}
                {selectedEvent.start_date !== selectedEvent.end_date && 
                  ` ~ ${format(new Date(selectedEvent.end_date), 'yyyy년 MM월 dd일', { locale: ko })}`
                }
              </p>
              {selectedEvent.location && (
                <p className="text-gray-600 mb-2 flex items-center gap-2">
                  📍 <span>{selectedEvent.location}</span>
                </p>
              )}
              {selectedEvent.description && (
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{selectedEvent.description}</p>
              )}
              
              {/* 공지사항 연결 표시 */}
              {selectedEvent.announcement && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FaBullhorn className="text-blue-500 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-900 mb-1">
                        관련 공지사항
                      </p>
                      <p className="text-sm text-blue-700 mb-2">
                        {selectedEvent.announcement.title}
                      </p>
                      <a
                        href={`/announcements/${selectedEvent.announcement.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          // 모달 닫기
                          setSelectedEvent(null);
                        }}
                      >
                        공지사항 보기
                        <FaExternalLinkAlt size={10} />
                      </a>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => downloadSingleEventICS(selectedEvent)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FaCalendarPlus />
                  캘린더에 추가
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
};

export default CalendarPage;
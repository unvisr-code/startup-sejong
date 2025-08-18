import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import { supabase, AcademicEvent } from '../../lib/supabase';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('academic_calendar')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      // Mock data for development
      setEvents([
        {
          id: '1',
          title: '2025학년도 1학기 개강',
          start_date: '2025-03-02',
          end_date: '2025-03-02',
          event_type: 'semester',
          description: '2025학년도 1학기가 시작됩니다.',
          created_at: '2025-01-18'
        },
        {
          id: '2',
          title: '수강신청 기간',
          start_date: '2025-02-24',
          end_date: '2025-02-28',
          event_type: 'application',
          description: '2025학년도 1학기 수강신청 기간입니다.',
          created_at: '2025-01-18'
        },
        {
          id: '3',
          title: '중간고사',
          start_date: '2025-04-20',
          end_date: '2025-04-26',
          event_type: 'exam',
          description: '중간고사 기간입니다.',
          created_at: '2025-01-18'
        },
        {
          id: '4',
          title: '어린이날',
          start_date: '2025-05-05',
          end_date: '2025-05-05',
          event_type: 'holiday',
          description: '어린이날 공휴일입니다.',
          created_at: '2025-01-18'
        }
      ]);
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
        <meta name="description" content="세종대학교 융합창업연계전공 학사일정" />
      </Head>

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
              <div className="grid lg:grid-cols-3 gap-8">
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
                    <div className="grid grid-cols-7 gap-1">
                      {paddedDays.map((day, index) => {
                        const dayEvents = day ? getEventsForDay(day) : [];
                        const isToday = day && isSameDay(day, new Date());
                        
                        return (
                          <div
                            key={index}
                            className={`min-h-[100px] p-2 border rounded-lg ${
                              !day ? 'bg-gray-50' : 
                              isToday ? 'bg-blue-50 border-blue-300' : 
                              'bg-white hover:bg-gray-50'
                            } ${day ? 'cursor-pointer' : ''}`}
                            onClick={() => {
                              if (dayEvents.length > 0) {
                                setSelectedEvent(dayEvents[0]);
                              }
                            }}
                          >
                            {day && (
                              <>
                                <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                                  {format(day, 'd')}
                                </div>
                                <div className="mt-1 space-y-1">
                                  {dayEvents.slice(0, 2).map(event => (
                                    <div
                                      key={event.id}
                                      className={`text-xs p-1 rounded text-white truncate ${getEventTypeColor(event.event_type)}`}
                                    >
                                      {event.title}
                                    </div>
                                  ))}
                                  {dayEvents.length > 2 && (
                                    <div className="text-xs text-gray-500">
                                      +{dayEvents.length - 2}개
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Event List */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-4">이번 달 일정</h3>
                    
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
                          const eventDate = new Date(event.start_date);
                          return isSameMonth(eventDate, currentDate);
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
                                <h4 className="font-semibold text-sm">{event.title}</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  {format(new Date(event.start_date), 'MM/dd', { locale: ko })}
                                  {event.start_date !== event.end_date && 
                                    ` - ${format(new Date(event.end_date), 'MM/dd', { locale: ko })}`
                                  }
                                </p>
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
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-4 h-4 rounded-full ${getEventTypeColor(selectedEvent.event_type)}`}></div>
                <span className="text-sm font-medium text-gray-600">
                  {getEventTypeLabel(selectedEvent.event_type)}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">{selectedEvent.title}</h3>
              <p className="text-gray-600 mb-4">
                {format(new Date(selectedEvent.start_date), 'yyyy년 MM월 dd일', { locale: ko })}
                {selectedEvent.start_date !== selectedEvent.end_date && 
                  ` ~ ${format(new Date(selectedEvent.end_date), 'yyyy년 MM월 dd일', { locale: ko })}`
                }
              </p>
              {selectedEvent.description && (
                <p className="text-gray-700">{selectedEvent.description}</p>
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                className="mt-6 w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                닫기
              </button>
            </motion.div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
};

export default CalendarPage;
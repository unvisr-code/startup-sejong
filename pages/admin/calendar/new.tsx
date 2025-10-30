import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../../components/Admin/AdminLayout';
import { useForm } from 'react-hook-form';
import { FaSave, FaTimes, FaCalendarAlt, FaStar, FaBullhorn ,FaSpinner} from 'react-icons/fa';
import { supabase, Announcement } from '../../../lib/supabase';
import { showSuccess, showError, showWarning, showSupabaseError } from '../../../lib/toast';
import { useUnsavedChanges } from '../../../hooks/useUnsavedChanges';

interface CalendarForm {
  title: string;
  start_date: string;
  end_date: string;
  event_type: 'semester' | 'exam' | 'holiday' | 'application' | 'other';
  description: string;
  location: string;
  is_important: boolean;
  announcement_id: string;
  send_push: boolean;
}

const NewCalendarEventPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<CalendarForm>({
    defaultValues: {
      event_type: 'other',
      is_important: false,
      announcement_id: '',
      send_push: false
    }
  });

  const startDate = watch('start_date');
  const selectedAnnouncementId = watch('announcement_id');

  // Auto-set end date if not set
  React.useEffect(() => {
    if (startDate && !watch('end_date')) {
      setValue('end_date', startDate);
    }
  }, [startDate, setValue, watch]);

  // Fetch announcements for linking
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('id, title, category')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setAnnouncements(data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const selectedAnnouncement = announcements.find(a => a.id === selectedAnnouncementId);

  const onSubmit = async (data: CalendarForm) => {
    setLoading(true);
    
    try {
      const { data: calendarEvent, error } = await supabase
        .from('academic_calendar')
        .insert([{
          title: data.title,
          start_date: data.start_date,
          end_date: data.end_date,
          event_type: data.event_type,
          description: data.description,
          location: data.location,
          is_important: data.is_important,
          announcement_id: data.announcement_id || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      
      // 푸시 알림 발송
      if (data.send_push) {
        try {
          const eventTypeLabel = {
            'semester': '학기',
            'exam': '시험',
            'holiday': '휴일',
            'application': '신청',
            'other': '일정'
          }[data.event_type] || '일정';

          const notificationBody = data.description || 
            `${data.start_date === data.end_date ? data.start_date : `${data.start_date} ~ ${data.end_date}`}${data.location ? `, ${data.location}` : ''}`;

          const pushResponse = await fetch('/api/push/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: `[${eventTypeLabel}] ${data.title}`,
              body: notificationBody,
              url: `/calendar#event-${calendarEvent.id}`,
              requireInteraction: data.is_important,
              adminEmail: 'admin@sejong.ac.kr'
            }),
          });

          const pushResult = await pushResponse.json();
          if (pushResponse.ok) {
            showSuccess(`일정이 추가되었습니다.\n\n푸시 알림이 ${pushResult.sent}명에게 발송되었습니다.`);
          } else {
            showWarning(`일정은 추가되었으나 푸시 알림 발송에 실패했습니다.\n${pushResult.error || '오류가 발생했습니다.'}`);
          }
        } catch (error) {
          console.error('Push notification error:', error);
          showWarning('일정은 추가되었으나 푸시 알림 발송에 실패했습니다.');
        }
      } else {
        showSuccess('일정이 추가되었습니다.');
      }
      
      router.push('/admin/calendar');
    } catch (error) {
      console.error('Error creating calendar event:', error);
      showError('일정 추가 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'semester': return 'text-blue-600 bg-blue-50';
      case 'exam': return 'text-red-600 bg-red-50';
      case 'holiday': return 'text-green-600 bg-green-50';
      case 'application': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <>
      <Head>
        <title>새 일정 추가 - 관리자</title>
      </Head>

      <AdminLayout title="새 일정 추가">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  일정명 *
                </label>
                <input
                  type="text"
                  {...register('title', { required: '일정명을 입력해주세요' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="예: 2025학년도 1학기 개강"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시작일 *
                  </label>
                  <input
                    type="date"
                    {...register('start_date', { required: '시작일을 선택해주세요' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.start_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    종료일 *
                  </label>
                  <input
                    type="date"
                    {...register('end_date', { 
                      required: '종료일을 선택해주세요',
                      validate: (value) => {
                        if (startDate && value < startDate) {
                          return '종료일은 시작일 이후여야 합니다';
                        }
                        return true;
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.end_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>
                  )}
                </div>
              </div>

              {/* Event Type and Important */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    일정 유형 *
                  </label>
                  <select
                    {...register('event_type')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="semester">학기</option>
                    <option value="exam">시험</option>
                    <option value="holiday">휴일</option>
                    <option value="application">신청</option>
                    <option value="other">기타</option>
                  </select>
                  <div className="mt-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getEventTypeColor(watch('event_type'))}`}>
                      미리보기
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    중요 일정
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('is_important')}
                      className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-600">
                      이 일정을 중요 일정으로 표시합니다
                    </span>
                  </div>
                </div>
              </div>

              {/* Announcement Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  관련 공지사항 연결 (선택사항)
                </label>
                <select
                  {...register('announcement_id')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">공지사항을 선택하세요</option>
                  {announcements.map(announcement => (
                    <option key={announcement.id} value={announcement.id}>
                      [{announcement.category === 'important' ? '중요' : 
                        announcement.category === 'academic' ? '학사' :
                        announcement.category === 'event' ? '행사' : '일반'}] {announcement.title}
                    </option>
                  ))}
                </select>
                {selectedAnnouncement && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <FaBullhorn className="text-blue-500" />
                      <span className="font-medium">연결된 공지사항:</span>
                      <span>{selectedAnnouncement.title}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Push Notification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  푸시 알림
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('send_push')}
                    className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">
                    이 일정을 푸시 알림으로 발송합니다
                  </span>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  장소
                </label>
                <input
                  type="text"
                  {...register('location')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="예: 대양홀, 온라인"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  {...register('description')}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary whitespace-pre-wrap"
                  placeholder="일정에 대한 상세 설명을 입력하세요 (Enter키로 줄바꿈 가능)"
                />
              </div>

              {/* Preview Card */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">미리보기</h3>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <FaCalendarAlt className={`text-2xl mt-1 ${
                      watch('event_type') === 'exam' ? 'text-red-500' :
                      watch('event_type') === 'semester' ? 'text-blue-500' :
                      watch('event_type') === 'holiday' ? 'text-green-500' :
                      watch('event_type') === 'application' ? 'text-purple-500' :
                      'text-gray-500'
                    }`} />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-1">
                        {watch('is_important') && <FaStar className="text-yellow-500" size={12} />}
                        {watch('title') || '일정명'}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {watch('start_date') && watch('end_date') ? (
                          watch('start_date') === watch('end_date') ? 
                            watch('start_date') : 
                            `${watch('start_date')} ~ ${watch('end_date')}`
                        ) : '날짜를 선택하세요'}
                      </p>
                      {watch('location') && (
                        <p className="text-sm text-gray-500 mt-1">📍 {watch('location')}</p>
                      )}
                      {watch('description') && (
                        <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{watch('description')}</p>
                      )}
                      {selectedAnnouncement && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex items-center gap-1 text-xs text-blue-600">
                            <FaBullhorn size={10} />
                            <span>공지사항 연결됨</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/admin/calendar')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <FaTimes />
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaSave />
                  {loading ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default NewCalendarEventPage;
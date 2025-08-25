import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../../components/Admin/AdminLayout';
import { useForm } from 'react-hook-form';
import { FaSave, FaTimes, FaCalendarAlt, FaStar, FaBullhorn } from 'react-icons/fa';
import { supabase, Announcement } from '../../../lib/supabase';
import { format } from 'date-fns';

interface CalendarForm {
  title: string;
  description?: string;
  location?: string;
  start_date: string;
  end_date: string;
  event_type: 'semester' | 'exam' | 'holiday' | 'application' | 'other';
  is_important: boolean;
  announcement_id: string;
  send_push: boolean;
}

const EditCalendarPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<CalendarForm>();

  useEffect(() => {
    if (id) {
      fetchEvent(id as string);
    }
    fetchAnnouncements();
  }, [id]);

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

  const fetchEvent = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('academic_calendar')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      
      if (data) {
        reset({
          title: data.title,
          description: data.description || '',
          location: data.location || '',
          start_date: format(new Date(data.start_date), 'yyyy-MM-dd'),
          end_date: format(new Date(data.end_date), 'yyyy-MM-dd'),
          event_type: data.event_type,
          is_important: data.is_important,
          announcement_id: data.announcement_id || '',
          send_push: false // 수정 시에는 기본적으로 false
        });
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      alert('일정을 불러오는 중 오류가 발생했습니다.');
      router.push('/admin/calendar');
    } finally {
      setFetching(false);
    }
  };

  const onSubmit = async (data: CalendarForm) => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('academic_calendar')
        .update({
          title: data.title,
          description: data.description,
          location: data.location,
          start_date: data.start_date,
          end_date: data.end_date,
          event_type: data.event_type,
          is_important: data.is_important,
          announcement_id: data.announcement_id || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

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
              url: `/calendar#event-${id}`,
              requireInteraction: data.is_important,
              adminEmail: 'admin@sejong.ac.kr'
            }),
          });

          const pushResult = await pushResponse.json();
          if (pushResponse.ok) {
            alert(`학사일정이 수정되었습니다.\n\n푸시 알림이 ${pushResult.sent}명에게 발송되었습니다.`);
          } else {
            alert(`학사일정은 수정되었으나 푸시 알림 발송에 실패했습니다.\n${pushResult.error || '오류가 발생했습니다.'}`);
          }
        } catch (error) {
          console.error('Push notification error:', error);
          alert('학사일정은 수정되었으나 푸시 알림 발송에 실패했습니다.');
        }
      } else {
        alert('학사일정이 성공적으로 수정되었습니다.');
      }

      router.push('/admin/calendar');
    } catch (error) {
      console.error('Error updating event:', error);
      alert('학사일정 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const startDate = watch('start_date');
  const endDate = watch('end_date');
  const selectedAnnouncementId = watch('announcement_id');
  const selectedAnnouncement = announcements.find(a => a.id === selectedAnnouncementId);

  if (fetching) {
    return (
      <>
        <Head>
          <title>학사일정 수정 - 관리자</title>
        </Head>
        <AdminLayout title="학사일정 수정">
          <div className="flex items-center justify-center py-32">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </AdminLayout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>학사일정 수정 - 관리자</title>
      </Head>

      <AdminLayout title="학사일정 수정">
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                일정 제목 *
              </label>
              <input
                type="text"
                {...register('title', { required: '제목을 입력해주세요' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="일정 제목을 입력하세요"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
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
                placeholder="일정에 대한 추가 설명을 입력하세요 (Enter키로 줄바꿈 가능)"
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시작일 *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    {...register('start_date', { 
                      required: '시작일을 선택해주세요',
                      validate: value => {
                        if (endDate && value > endDate) {
                          return '시작일은 종료일 이전이어야 합니다';
                        }
                        return true;
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {errors.start_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  종료일 *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    {...register('end_date', { 
                      required: '종료일을 선택해주세요',
                      validate: value => {
                        if (startDate && value < startDate) {
                          return '종료일은 시작일 이후여야 합니다';
                        }
                        return true;
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  중요 일정
                </label>
                <div className="flex items-center mt-3">
                  <input
                    type="checkbox"
                    {...register('is_important')}
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label className="ml-3 flex items-center gap-2">
                    <FaStar className="text-yellow-500" />
                    <span className="text-gray-700">중요 일정으로 표시</span>
                  </label>
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
                  이 일정 수정사항을 푸시 알림으로 발송합니다
                </span>
              </div>
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
      </AdminLayout>
    </>
  );
};

export default EditCalendarPage;
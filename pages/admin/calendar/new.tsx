import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../../components/Admin/AdminLayout';
import { useForm } from 'react-hook-form';
import { FaSave, FaTimes, FaCalendarAlt } from 'react-icons/fa';
import { supabase } from '../../../lib/supabase';

interface CalendarForm {
  title: string;
  start_date: string;
  end_date: string;
  event_type: 'semester' | 'exam' | 'holiday' | 'application' | 'other';
  description: string;
  location: string;
  is_important: boolean;
}

const NewCalendarEventPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<CalendarForm>({
    defaultValues: {
      event_type: 'other',
      is_important: false
    }
  });

  const startDate = watch('start_date');

  // Auto-set end date if not set
  React.useEffect(() => {
    if (startDate && !watch('end_date')) {
      setValue('end_date', startDate);
    }
  }, [startDate, setValue, watch]);

  const onSubmit = async (data: CalendarForm) => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('academic_calendar')
        .insert([{
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;
      
      alert('일정이 추가되었습니다.');
      router.push('/admin/calendar');
    } catch (error) {
      console.error('Error creating calendar event:', error);
      alert('일정 추가 중 오류가 발생했습니다.');
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
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="일정에 대한 상세 설명을 입력하세요"
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
                      <h4 className="font-semibold text-gray-800">
                        {watch('title') || '일정명'}
                        {watch('is_important') && (
                          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">중요</span>
                        )}
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
                        <p className="text-sm text-gray-700 mt-2">{watch('description')}</p>
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
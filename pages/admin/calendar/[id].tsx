import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../../components/Admin/AdminLayout';
import { useForm } from 'react-hook-form';
import { FaSave, FaTimes, FaCalendarAlt, FaStar } from 'react-icons/fa';
import { supabase, AcademicEvent } from '../../../lib/supabase';
import { format } from 'date-fns';

interface CalendarForm {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  event_type: 'semester' | 'exam' | 'holiday' | 'application' | 'other';
  is_important: boolean;
}

const EditCalendarPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<CalendarForm>();

  useEffect(() => {
    if (id) {
      fetchEvent(id as string);
    }
  }, [id]);

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
          start_date: format(new Date(data.start_date), 'yyyy-MM-dd'),
          end_date: format(new Date(data.end_date), 'yyyy-MM-dd'),
          event_type: data.event_type,
          is_important: data.is_important
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
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      alert('학사일정이 성공적으로 수정되었습니다.');
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

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                설명
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="일정에 대한 추가 설명을 입력하세요 (선택사항)"
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
/**
 * Toast Notification Utilities
 *
 * react-hot-toast를 사용한 토스트 알림 유틸리티 함수들
 * alert()를 대체하여 더 나은 사용자 경험 제공
 */

import toast from 'react-hot-toast';

/**
 * 성공 토스트 알림
 * @param message 성공 메시지
 * @param duration 표시 시간 (ms, 기본값: 3000)
 */
export const showSuccess = (message: string, duration: number = 3000) => {
  return toast.success(message, {
    duration,
    position: 'top-right',
    style: {
      background: '#10B981',
      color: '#FFFFFF',
      fontWeight: 500,
    },
    icon: '✅',
  });
};

/**
 * 에러 토스트 알림
 * @param message 에러 메시지
 * @param duration 표시 시간 (ms, 기본값: 5000)
 */
export const showError = (message: string, duration: number = 5000) => {
  return toast.error(message, {
    duration,
    position: 'top-right',
    style: {
      background: '#EF4444',
      color: '#FFFFFF',
      fontWeight: 500,
    },
    icon: '❌',
  });
};

/**
 * 경고 토스트 알림
 * @param message 경고 메시지
 * @param duration 표시 시간 (ms, 기본값: 4000)
 */
export const showWarning = (message: string, duration: number = 4000) => {
  return toast(message, {
    duration,
    position: 'top-right',
    style: {
      background: '#F59E0B',
      color: '#FFFFFF',
      fontWeight: 500,
    },
    icon: '⚠️',
  });
};

/**
 * 정보 토스트 알림
 * @param message 정보 메시지
 * @param duration 표시 시간 (ms, 기본값: 3000)
 */
export const showInfo = (message: string, duration: number = 3000) => {
  return toast(message, {
    duration,
    position: 'top-right',
    style: {
      background: '#3B82F6',
      color: '#FFFFFF',
      fontWeight: 500,
    },
    icon: 'ℹ️',
  });
};

/**
 * 로딩 토스트 알림
 * @param message 로딩 메시지
 */
export const showLoading = (message: string = '처리 중...') => {
  return toast.loading(message, {
    position: 'top-right',
  });
};

/**
 * 로딩 토스트 제거
 * @param toastId showLoading()에서 반환된 ID
 */
export const dismissLoading = (toastId: string) => {
  toast.dismiss(toastId);
};

/**
 * 프로미스 처리 중 토스트 표시
 * @param promise 비동기 함수
 * @param messages 상태별 메시지 객체
 */
export const showPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    },
    {
      position: 'top-right',
      success: {
        duration: 3000,
        icon: '✅',
      },
      error: {
        duration: 5000,
        icon: '❌',
      },
    }
  );
};

/**
 * Supabase 에러를 사용자 친화적 메시지로 변환
 * @param error Supabase 에러 객체
 * @returns 사용자 친화적 에러 메시지
 */
export const parseSupabaseError = (error: any): string => {
  // 네트워크 에러
  if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
    return '네트워크 연결을 확인해주세요.';
  }

  // 권한 에러
  if (error.code === 'PGRST301' || error.message?.includes('permission denied')) {
    return '권한이 없습니다. 관리자에게 문의하세요.';
  }

  // 중복 데이터 에러
  if (error.code === '23505' || error.message?.includes('duplicate key')) {
    return '이미 존재하는 데이터입니다.';
  }

  // 외래키 제약 위반
  if (error.code === '23503' || error.message?.includes('foreign key')) {
    return '연관된 데이터가 존재하여 작업할 수 없습니다.';
  }

  // 타임아웃
  if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
    return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
  }

  // 인증 에러
  if (error.status === 401 || error.message?.includes('unauthorized')) {
    return '로그인이 필요합니다.';
  }

  // 기타 에러는 원본 메시지 반환 (개발 시 유용)
  return error.message || '알 수 없는 오류가 발생했습니다.';
};

/**
 * Supabase 에러를 토스트로 표시
 * @param error Supabase 에러 객체
 * @param customMessage 커스텀 에러 메시지 (선택사항)
 */
export const showSupabaseError = (error: any, customMessage?: string) => {
  const message = customMessage || parseSupabaseError(error);
  showError(message);

  // 개발 환경에서는 콘솔에 원본 에러도 출력
  if (process.env.NODE_ENV === 'development') {
    console.error('[Supabase Error]', error);
  }
};

/**
 * 파일 업로드 에러 메시지 생성
 * @param error 에러 객체
 * @param fileName 파일명
 */
export const showFileUploadError = (error: any, fileName: string) => {
  let message = `파일 업로드 실패: ${fileName}`;

  if (error.message?.includes('size')) {
    message = `파일이 너무 큽니다: ${fileName}`;
  } else if (error.message?.includes('type')) {
    message = `지원하지 않는 파일 형식입니다: ${fileName}`;
  }

  showError(message);
};

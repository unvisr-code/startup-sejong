/**
 * useUnsavedChanges Hook
 *
 * 폼 데이터의 변경사항을 감지하고 페이지 이탈 시 경고를 표시하는 훅
 * 자동저장 기능도 함께 제공
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  clearLocalStorage,
  getAutoSaveKey,
  createAutoSaveInterval,
  clearAutoSaveInterval,
  getBeforeUnloadMessage,
  type AutoSaveOptions,
} from '../lib/autoSave';

export interface UseUnsavedChangesOptions<T> extends AutoSaveOptions {
  /** 초기 데이터 */
  initialData?: T;
  /** 변경 여부를 수동으로 설정 */
  isDirty?: boolean;
  /** 페이지 이탈 경고 활성화 여부 (기본값: true) */
  enableWarning?: boolean;
  /** 자동저장 활성화 여부 (기본값: true) */
  enableAutoSave?: boolean;
}

export interface UseUnsavedChangesReturn<T> {
  /** 변경 여부 */
  isDirty: boolean;
  /** 변경 여부 설정 */
  setIsDirty: (dirty: boolean) => void;
  /** 수동 저장 함수 */
  saveNow: (data: T) => void;
  /** 저장된 데이터 불러오기 */
  loadSaved: () => { data: T; timestamp: string } | null;
  /** 자동저장 데이터 삭제 */
  clearSaved: () => void;
  /** 저장 키 */
  autoSaveKey: string;
}

/**
 * 미저장 변경사항 감지 및 자동저장 훅
 *
 * @example
 * ```tsx
 * const { isDirty, setIsDirty, saveNow, loadSaved, clearSaved } = useUnsavedChanges({
 *   formType: 'announcement',
 *   formId: announcementId,
 *   enableWarning: true,
 *   enableAutoSave: true,
 *   interval: 30000, // 30초
 * });
 *
 * // 폼 변경 시
 * const handleChange = (e) => {
 *   setFormData(e.target.value);
 *   setIsDirty(true);
 * };
 *
 * // 저장 성공 시
 * const handleSubmit = async () => {
 *   await saveData();
 *   setIsDirty(false);
 *   clearSaved();
 * };
 *
 * // 컴포넌트 마운트 시 복원
 * useEffect(() => {
 *   const saved = loadSaved();
 *   if (saved && confirm('저장된 데이터를 불러올까요?')) {
 *     setFormData(saved.data);
 *   }
 * }, []);
 * ```
 */
export function useUnsavedChanges<T = any>({
  formType,
  formId = 'new',
  interval = 30000,
  showNotification = true,
  initialData,
  isDirty: externalIsDirty,
  enableWarning = true,
  enableAutoSave = true,
}: UseUnsavedChangesOptions<T>): UseUnsavedChangesReturn<T> {
  const router = useRouter();
  const [internalIsDirty, setInternalIsDirty] = useState(false);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dataRef = useRef<T | null>(initialData || null);

  // 변경 여부는 외부에서 제공된 값이 우선, 없으면 내부 상태 사용
  const isDirty = externalIsDirty !== undefined ? externalIsDirty : internalIsDirty;

  // 자동저장 키 생성
  const autoSaveKey = getAutoSaveKey(formType, formId);

  /**
   * 수동 저장 함수
   */
  const saveNow = useCallback(
    (data: T) => {
      dataRef.current = data;
      if (enableAutoSave) {
        saveToLocalStorage(autoSaveKey, data, showNotification);
      }
    },
    [autoSaveKey, enableAutoSave, showNotification]
  );

  /**
   * 저장된 데이터 불러오기
   */
  const loadSaved = useCallback((): { data: T; timestamp: string } | null => {
    return loadFromLocalStorage<T>(autoSaveKey);
  }, [autoSaveKey]);

  /**
   * 자동저장 데이터 삭제
   */
  const clearSaved = useCallback(() => {
    clearLocalStorage(autoSaveKey);
  }, [autoSaveKey]);

  /**
   * 자동저장 실행
   */
  const performAutoSave = useCallback(() => {
    if (dataRef.current && isDirty) {
      saveToLocalStorage(autoSaveKey, dataRef.current, showNotification);
    }
  }, [autoSaveKey, isDirty, showNotification]);

  /**
   * 자동저장 타이머 설정
   */
  useEffect(() => {
    if (enableAutoSave && isDirty) {
      autoSaveIntervalRef.current = createAutoSaveInterval(performAutoSave, interval);
    }

    return () => {
      if (autoSaveIntervalRef.current) {
        clearAutoSaveInterval(autoSaveIntervalRef.current);
      }
    };
  }, [enableAutoSave, isDirty, interval, performAutoSave]);

  /**
   * 브라우저 beforeunload 이벤트 (새로고침, 창 닫기)
   */
  useEffect(() => {
    if (!enableWarning || !isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = getBeforeUnloadMessage();
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enableWarning, isDirty]);

  /**
   * Next.js Router 이벤트 (페이지 이동)
   */
  useEffect(() => {
    if (!enableWarning || !isDirty) return;

    const handleRouteChange = (url: string) => {
      // 현재 경로와 다른 경로로 이동하는 경우에만 경고
      if (url !== router.asPath) {
        const confirmed = window.confirm(
          '작성 중인 내용이 저장되지 않았습니다.\n페이지를 나가시겠습니까?'
        );

        if (!confirmed) {
          router.events.emit('routeChangeError');
          throw new Error('Route change aborted by user');
        }
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [enableWarning, isDirty, router]);

  return {
    isDirty,
    setIsDirty: setInternalIsDirty,
    saveNow,
    loadSaved,
    clearSaved,
    autoSaveKey,
  };
}

/**
 * 간단한 변경 감지 훅 (자동저장 없이 경고만)
 *
 * @example
 * ```tsx
 * const { isDirty, setIsDirty } = useUnsavedChangesWarning();
 *
 * const handleChange = () => {
 *   setIsDirty(true);
 * };
 *
 * const handleSubmit = () => {
 *   // 저장 성공
 *   setIsDirty(false);
 * };
 * ```
 */
export function useUnsavedChangesWarning() {
  return useUnsavedChanges({
    formType: 'generic',
    enableAutoSave: false,
    enableWarning: true,
  });
}

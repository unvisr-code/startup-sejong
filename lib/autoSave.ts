/**
 * Auto Save Utilities
 *
 * 작성 중인 폼 데이터를 로컬스토리지에 자동 저장하는 유틸리티
 * 브라우저 새로고침, 뒤로가기 등으로 인한 데이터 손실 방지
 */

import { showInfo } from './toast';

/**
 * 자동저장 키 생성
 * @param formType 폼 타입 (announcement, calendar)
 * @param formId 폼 ID (새 작성인 경우 'new')
 */
export const getAutoSaveKey = (formType: string, formId: string = 'new'): string => {
  return `autosave_${formType}_${formId}`;
};

/**
 * 폼 데이터를 로컬스토리지에 자동 저장
 * @param key 저장 키
 * @param data 저장할 데이터
 * @param showNotification 알림 표시 여부 (기본값: false)
 */
export const saveToLocalStorage = <T>(
  key: string,
  data: T,
  showNotification: boolean = false
): void => {
  try {
    const saveData = {
      data,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(saveData));

    if (showNotification) {
      showInfo('임시 저장되었습니다', 2000);
    }
  } catch (error) {
    console.error('[AutoSave] 저장 실패:', error);
  }
};

/**
 * 로컬스토리지에서 폼 데이터 불러오기
 * @param key 저장 키
 * @returns 저장된 데이터 또는 null
 */
export const loadFromLocalStorage = <T>(key: string): {
  data: T;
  timestamp: string;
} | null => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return null;

    const parsed = JSON.parse(saved);
    return parsed;
  } catch (error) {
    console.error('[AutoSave] 불러오기 실패:', error);
    return null;
  }
};

/**
 * 로컬스토리지에서 폼 데이터 삭제
 * @param key 저장 키
 */
export const clearLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('[AutoSave] 삭제 실패:', error);
  }
};

/**
 * 자동저장 간격을 가진 타이머 생성
 * @param callback 저장 함수
 * @param interval 저장 간격 (ms, 기본값: 30000 = 30초)
 * @returns 타이머 ID
 */
export const createAutoSaveInterval = (
  callback: () => void,
  interval: number = 30000
): NodeJS.Timeout => {
  return setInterval(() => {
    callback();
  }, interval);
};

/**
 * 자동저장 타이머 정리
 * @param intervalId 타이머 ID
 */
export const clearAutoSaveInterval = (intervalId: NodeJS.Timeout): void => {
  clearInterval(intervalId);
};

/**
 * 저장된 데이터가 얼마나 오래되었는지 확인
 * @param timestamp ISO 형식의 타임스탬프
 * @returns 경과 시간 (분)
 */
export const getElapsedMinutes = (timestamp: string): number => {
  const savedTime = new Date(timestamp).getTime();
  const now = new Date().getTime();
  return Math.floor((now - savedTime) / 1000 / 60);
};

/**
 * 저장된 데이터가 유효한지 확인 (24시간 이내)
 * @param timestamp ISO 형식의 타임스탬프
 * @returns 유효 여부
 */
export const isAutoSaveValid = (timestamp: string): boolean => {
  const elapsed = getElapsedMinutes(timestamp);
  return elapsed < 24 * 60; // 24시간
};

/**
 * 폼 데이터 비교 (변경 여부 확인)
 * @param current 현재 데이터
 * @param saved 저장된 데이터
 * @returns 변경 여부
 */
export const hasChanges = <T extends object>(current: T, saved: T | null): boolean => {
  if (!saved) return false;

  try {
    return JSON.stringify(current) !== JSON.stringify(saved);
  } catch (error) {
    console.error('[AutoSave] 비교 실패:', error);
    return false;
  }
};

/**
 * 모든 자동저장 데이터 정리 (일정 기간 이상 지난 데이터)
 * @param maxAgeHours 최대 보관 시간 (시간, 기본값: 24)
 */
export const cleanupOldAutoSaves = (maxAgeHours: number = 24): void => {
  try {
    const keys = Object.keys(localStorage);
    const autoSaveKeys = keys.filter(key => key.startsWith('autosave_'));

    autoSaveKeys.forEach(key => {
      const data = loadFromLocalStorage(key);
      if (data && !isAutoSaveValid(data.timestamp)) {
        localStorage.removeItem(key);
        console.log('[AutoSave] 오래된 데이터 삭제:', key);
      }
    });
  } catch (error) {
    console.error('[AutoSave] 정리 실패:', error);
  }
};

/**
 * 페이지 이탈 전 자동저장 데이터 정리 권장 메시지
 * @returns 브라우저 beforeunload 이벤트 메시지
 */
export const getBeforeUnloadMessage = (): string => {
  return '작성 중인 내용이 있습니다. 페이지를 나가시겠습니까?';
};

/**
 * React Hook에서 사용할 자동저장 유틸리티 타입
 */
export interface AutoSaveOptions {
  /** 폼 타입 (announcement, calendar 등) */
  formType: string;
  /** 폼 ID (새 작성인 경우 'new') */
  formId?: string;
  /** 자동저장 간격 (ms, 기본값: 30000) */
  interval?: number;
  /** 알림 표시 여부 (기본값: true) */
  showNotification?: boolean;
}

/**
 * 자동저장 반환 타입
 */
export interface AutoSaveReturn<T> {
  /** 저장 함수 */
  save: (data: T) => void;
  /** 불러오기 함수 */
  load: () => { data: T; timestamp: string } | null;
  /** 삭제 함수 */
  clear: () => void;
  /** 저장 키 */
  key: string;
}

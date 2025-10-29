/**
 * 환경별 로깅 유틸리티
 * 개발 환경에서만 console.log 출력
 * 프로덕션 환경에서는 error만 출력
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * 디버그 로그 - 개발 환경에서만 출력
   */
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * 정보 로그 - 개발 환경에서만 출력
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  /**
   * 경고 로그 - 항상 출력
   */
  warn: (...args: any[]) => {
    console.warn(...args);
  },

  /**
   * 에러 로그 - 항상 출력
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * 테이블 로그 - 개발 환경에서만 출력
   */
  table: (data: any) => {
    if (isDevelopment && console.table) {
      console.table(data);
    }
  },

  /**
   * 그룹 시작 - 개발 환경에서만 출력
   */
  group: (label: string) => {
    if (isDevelopment && console.group) {
      console.group(label);
    }
  },

  /**
   * 그룹 종료 - 개발 환경에서만 출력
   */
  groupEnd: () => {
    if (isDevelopment && console.groupEnd) {
      console.groupEnd();
    }
  },

  /**
   * 시간 측정 시작 - 개발 환경에서만 측정
   */
  time: (label: string) => {
    if (isDevelopment && console.time) {
      console.time(label);
    }
  },

  /**
   * 시간 측정 종료 - 개발 환경에서만 측정
   */
  timeEnd: (label: string) => {
    if (isDevelopment && console.timeEnd) {
      console.timeEnd(label);
    }
  }
};

export default logger;

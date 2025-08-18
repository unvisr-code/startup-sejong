import { createEvent, DateArray, EventAttributes } from 'ics';
import { AcademicEvent } from './supabase';

// 날짜를 ICS 형식으로 변환하는 함수
const dateToICSArray = (dateString: string): DateArray => {
  const date = new Date(dateString);
  return [
    date.getFullYear(),
    date.getMonth() + 1, // ICS는 1-based month
    date.getDate(),
    9, // 기본 시간: 오전 9시
    0  // 분
  ];
};

// 단일 이벤트에 대한 ICS 파일 생성
export const generateSingleEventICS = (event: AcademicEvent): string | null => {
  try {
    const eventData: EventAttributes = {
      start: dateToICSArray(event.start_date),
      end: dateToICSArray(event.end_date),
      title: event.title,
      description: event.description || '',
      location: event.location || '세종대학교',
      categories: [getEventCategoryName(event.event_type)],
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
      organizer: { name: '세종대 융합창업연계전공', email: 'convergence@sejong.ac.kr' },
      uid: `sejong-${event.id}@sejong.ac.kr`
    };

    const { error, value } = createEvent(eventData);
    
    if (error) {
      console.error('ICS 생성 오류:', error);
      return null;
    }
    
    return value || null;
  } catch (error) {
    console.error('ICS 생성 중 오류 발생:', error);
    return null;
  }
};

// 다중 이벤트에 대한 ICS 파일 생성
export const generateMultipleEventsICS = (events: AcademicEvent[]): string | null => {
  try {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//세종대 융합창업연계전공//학사일정//KO',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:세종대 융합창업연계전공 학사일정',
      'X-WR-CALDESC:세종대학교 융합창업연계전공의 주요 학사일정입니다',
      'X-WR-TIMEZONE:Asia/Seoul'
    ];

    events.forEach(event => {
      const eventICS = generateSingleEventICS(event);
      if (eventICS) {
        // VCALENDAR 헤더/푸터 제거하고 이벤트 부분만 추출
        const eventLines = eventICS.split('\n').filter(line => 
          !line.startsWith('BEGIN:VCALENDAR') && 
          !line.startsWith('VERSION:') && 
          !line.startsWith('PRODID:') && 
          !line.startsWith('CALSCALE:') && 
          !line.startsWith('END:VCALENDAR') &&
          line.trim() !== ''
        );
        icsContent = icsContent.concat(eventLines);
      }
    });

    icsContent.push('END:VCALENDAR');
    
    return icsContent.join('\n');
  } catch (error) {
    console.error('다중 이벤트 ICS 생성 중 오류 발생:', error);
    return null;
  }
};

// 이벤트 타입을 한국어 카테고리로 변환
const getEventCategoryName = (eventType: string): string => {
  const categories = {
    semester: '학기',
    exam: '시험',
    holiday: '휴일',
    application: '신청',
    other: '기타'
  };
  return categories[eventType as keyof typeof categories] || '기타';
};

// ICS 파일 다운로드 함수
export const downloadICSFile = (icsContent: string, filename: string) => {
  try {
    // BOM을 추가하여 한글 인코딩 문제 해결
    const bom = '\uFEFF';
    const blob = new Blob([bom + icsContent], { 
      type: 'text/calendar;charset=utf-8' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.ics`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('ICS 파일 다운로드 중 오류 발생:', error);
    alert('파일 다운로드 중 오류가 발생했습니다.');
  }
};

// 월간 일정 ICS 다운로드
export const downloadMonthlyICS = (events: AcademicEvent[], monthDate: Date) => {
  const monthName = monthDate.toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long' 
  });
  
  const icsContent = generateMultipleEventsICS(events);
  if (icsContent) {
    downloadICSFile(icsContent, `세종대_융합창업_${monthName}_학사일정`);
  } else {
    alert('ICS 파일 생성에 실패했습니다.');
  }
};

// 단일 이벤트 ICS 다운로드
export const downloadSingleEventICS = (event: AcademicEvent) => {
  const icsContent = generateSingleEventICS(event);
  if (icsContent) {
    downloadICSFile(icsContent, `${event.title}_일정`);
  } else {
    alert('ICS 파일 생성에 실패했습니다.');
  }
};
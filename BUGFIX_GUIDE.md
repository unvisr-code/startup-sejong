# 🔧 버그 수정 가이드

이 가이드는 발견된 3가지 문제에 대한 수정 사항과 남은 작업을 안내합니다.

## 📋 수정 완료 항목

### ✅ 1. 파일 업로드 기능 (공지사항 첨부파일)

**문제**: 공지사항에 파일 업로드 실패 (400 에러)
**원인**: 스토리지 버킷은 존재하지만 RLS 정책이 없음

**수정 내용**:
- ✅ 스토리지 버킷 확인 완료 (`announcement-attachments` 존재)
- ✅ RLS 정책 SQL 파일 생성: `database/fix_announcement_storage_policies.sql`

**👉 남은 작업 (필수)**:
1. Supabase Dashboard SQL Editor 열기
   - URL: https://supabase.com/dashboard/project/ihgojwljhbdrfmqhlspb/sql/new
2. `database/fix_announcement_storage_policies.sql` 파일 내용을 복사해서 실행
3. "RUN" 버튼 클릭

---

### ✅ 2. 이미지 크기 조절 기능 (본문 에디터)

**문제**: 본문에 삽입된 이미지 크기 조절 불가
**원인**: Quill 에디터에 이미지 리사이즈 모듈 없음

**수정 내용**:
- ✅ `quill-image-resize-module-react` 패키지 설치 완료
- ✅ `components/Admin/RichTextEditor.tsx` 수정 완료
  - ImageResize 모듈 추가
  - 리사이즈 핸들 CSS 추가
  - 드래그 앤 리사이즈 기능 활성화

**👉 남은 작업**:
- 개발 서버 재시작 후 테스트
  ```bash
  npm run dev
  ```
- 공지사항 작성 화면에서 이미지 삽입 후 드래그로 크기 조절 테스트

---

### ✅ 3. 푸시 알림 전송 실패

**문제**: 공지사항 및 일정 푸시 알림 전송 실패 (100% 실패율)
**원인**: VAPID 키 환경 변수 누락 또는 만료

**수정 내용**:
- ✅ 새로운 VAPID 키 생성 완료
- ✅ `.env.local` 파일 생성 및 설정 완료
  - Supabase URL 및 Anon Key 자동 입력
  - VAPID Public/Private Key 입력
  - VAPID Email 설정
- ✅ `lib/supabaseAdmin.ts` 확인 완료 (정상 작동)

**👉 남은 작업 (필수)**:
1. Supabase Service Role Key 입력
   - Supabase Dashboard 이동: https://supabase.com/dashboard/project/ihgojwljhbdrfmqhlspb/settings/api
   - "service_role" 섹션에서 키 복사 (⚠️ secret key)
   - `.env.local` 파일 열기
   - `SUPABASE_SERVICE_ROLE_KEY=` 뒤에 복사한 키 붙여넣기

2. 개발 서버 재시작
   ```bash
   npm run dev
   ```

3. 푸시 알림 테스트
   - 공지사항 작성 후 알림 전송 테스트
   - 일정 등록 후 알림 전송 테스트

---

## 🚨 추가 발견: 보안 취약점

**문제**: 8개 주요 테이블에서 RLS(Row Level Security)가 비활성화됨
- User, Post, Category, PostImage, Comment
- ChatRoom, ChatRoomMember, ChatMessage

**위험도**: 높음 (데이터 노출 가능성)

**👉 권장 조치**:
- RLS 정책을 활성화하고 적절한 접근 제어 규칙 설정
- 자세한 내용은 Supabase Dashboard의 Security Advisor 참조

---

## 📝 최종 체크리스트

### 필수 작업
- [ ] Supabase SQL Editor에서 `database/fix_announcement_storage_policies.sql` 실행
- [ ] `.env.local`에 `SUPABASE_SERVICE_ROLE_KEY` 입력
- [ ] 개발 서버 재시작 (`npm run dev`)
- [ ] 파일 업로드 테스트 (공지사항 첨부파일)
- [ ] 이미지 크기 조절 테스트 (본문 에디터)
- [ ] 푸시 알림 전송 테스트 (공지사항 + 일정)

### 권장 작업 (보안)
- [ ] RLS 정책 활성화 및 설정
- [ ] 미사용 인덱스 제거 (24개)
- [ ] Supabase Auth 보안 설정 강화

---

## 🔍 테스트 방법

### 1. 파일 업로드 테스트
1. 관리자로 로그인
2. 공지사항 작성 페이지 이동
3. 파일 첨부 버튼 클릭
4. 파일 선택 및 업로드
5. **예상 결과**: 파일이 정상적으로 업로드되고 목록에 표시됨

### 2. 이미지 크기 조절 테스트
1. 공지사항 작성 페이지에서 본문 에디터 사용
2. 이미지 삽입 (툴바의 이미지 아이콘 클릭)
3. 삽입된 이미지 클릭
4. **예상 결과**: 이미지 모서리에 리사이즈 핸들(파란 점) 표시
5. 핸들을 드래그해서 크기 조절
6. **예상 결과**: 이미지 크기가 실시간으로 변경되고 크기 정보 표시

### 3. 푸시 알림 테스트
1. 브라우저에서 알림 권한 허용
2. 관리자로 로그인
3. 공지사항 작성 및 저장
4. **예상 결과**: "알림이 전송되었습니다! 성공: X건" 메시지 표시
5. 브라우저 알림 확인
6. 일정도 동일하게 테스트

---

## ❓ 문제 발생 시

### 파일 업로드 실패
- Supabase Dashboard에서 Storage 메뉴 확인
- `announcement-attachments` 버킷이 존재하는지 확인
- RLS 정책이 적용되었는지 확인 (SQL Editor에서 확인)
- 브라우저 콘솔에서 에러 메시지 확인

### 이미지 리사이즈 작동 안함
- 브라우저 콘솔에서 에러 확인
- 개발 서버를 완전히 종료하고 재시작
- `node_modules` 삭제 후 재설치: `rm -rf node_modules && npm install`

### 푸시 알림 전송 실패
- `.env.local` 파일의 모든 변수가 올바르게 입력되었는지 확인
- `SUPABASE_SERVICE_ROLE_KEY`가 설정되었는지 확인
- 브라우저에서 알림 권한이 허용되었는지 확인
- 서버 로그에서 자세한 에러 메시지 확인

---

## 📞 지원

문제가 계속되면 다음 정보와 함께 문의하세요:
- 브라우저 콘솔의 에러 메시지
- 서버 터미널의 에러 로그
- Supabase Dashboard의 로그 (해당되는 경우)
- 어떤 단계에서 문제가 발생했는지

---

**생성일**: 2025-10-30
**프로젝트**: startup-sejong
**Supabase 프로젝트 ID**: ihgojwljhbdrfmqhlspb

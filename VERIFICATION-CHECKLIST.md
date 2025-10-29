# ✅ Supabase 프로젝트 복원 후 검증 체크리스트

프로젝트를 복원한 후 반드시 확인해야 할 항목들입니다.

---

## 📋 사전 준비

- [ ] Supabase 프로젝트 상태: **ACTIVE_HEALTHY** ✅
- [ ] `.env.local` 파일 생성 완료
- [ ] 모든 환경 변수 설정 완료

---

## 🔍 Phase 1: 데이터베이스 연결 확인

### 1.1 기본 연결 테스트

**Supabase SQL Editor**에서 실행:

```sql
-- 현재 데이터베이스 버전 확인
SELECT version();

-- 현재 타임존 확인
SELECT current_setting('TIMEZONE');

-- 현재 사용자 확인
SELECT current_user;
```

**예상 결과**:
- PostgreSQL 17.4.1 이상
- Timezone: UTC
- User: postgres

---

## 📊 Phase 2: 테이블 구조 검증

### 2.1 모든 테이블 목록 확인

```sql
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### 2.2 필수 테이블 존재 확인

체크리스트:

- [ ] `announcements` - 공지사항
- [ ] `calendar_events` - 캘린더 이벤트
- [ ] `push_subscriptions` - 푸시 알림 구독 정보
- [ ] `notifications` - 알림 기록
- [ ] `notification_delivery_log` - 알림 전송 로그
- [ ] `preliminary_applications` - 예비지원서

### 2.3 테이블 구조 상세 확인

각 테이블의 컬럼 확인:

```sql
-- announcements 테이블
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'announcements'
ORDER BY ordinal_position;

-- push_subscriptions 테이블
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'push_subscriptions'
ORDER BY ordinal_position;

-- notifications 테이블
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;
```

---

## 🔐 Phase 3: 보안 정책 확인

### 3.1 RLS (Row Level Security) 활성화 확인

```sql
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**예상 결과**: `rowsecurity` 컬럼이 `true`여야 함 (주요 테이블)

### 3.2 RLS 정책 목록 확인

```sql
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**확인 사항**:
- [ ] 각 테이블에 최소 1개 이상의 정책 존재
- [ ] `SELECT`, `INSERT`, `UPDATE`, `DELETE` 정책 적절히 설정

### 3.3 Supabase MCP를 통한 보안 점검

**프로젝트 복원 후 실행**:

```bash
# Security Advisors 확인
# (코드에서 Supabase MCP 사용)
```

또는 **Dashboard 확인**:
```
Dashboard → Database → Advisors → Security
```

**확인할 보안 이슈**:
- [ ] Missing RLS policies
- [ ] Public tables without authentication
- [ ] Exposed sensitive columns
- [ ] Weak security configurations

---

## ⚡ Phase 4: 성능 최적화 확인

### 4.1 인덱스 존재 확인

```sql
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**확인 사항**:
- [ ] Primary Key 인덱스 존재
- [ ] Foreign Key 인덱스 존재
- [ ] 자주 조회되는 컬럼에 인덱스 존재

### 4.2 테이블 통계 확인

```sql
SELECT
    schemaname,
    tablename,
    n_live_tup as row_count,
    n_dead_tup as dead_rows,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;
```

### 4.3 Supabase MCP를 통한 성능 점검

**프로젝트 복원 후 실행**:

```bash
# Performance Advisors 확인
# (코드에서 Supabase MCP 사용)
```

또는 **Dashboard 확인**:
```
Dashboard → Database → Advisors → Performance
```

**확인할 성능 이슈**:
- [ ] Missing indexes on foreign keys
- [ ] Large tables without partitioning
- [ ] Slow queries
- [ ] Inefficient query patterns

---

## 📦 Phase 5: 확장 기능 확인

### 5.1 설치된 확장 목록

```sql
SELECT
    extname as extension_name,
    extversion as version
FROM pg_extension
ORDER BY extname;
```

**필수 확장**:
- [ ] `uuid-ossp` - UUID 생성
- [ ] `pgcrypto` - 암호화
- [ ] `pg_stat_statements` - 쿼리 통계 (선택)

### 5.2 누락된 확장 설치

필요시 SQL Editor에서 실행:

```sql
-- UUID 확장
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 암호화 확장
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

---

## 🔄 Phase 6: 마이그레이션 확인

### 6.1 마이그레이션 히스토리 확인

```sql
-- Supabase 마이그레이션 테이블 확인
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version DESC;
```

### 6.2 Supabase MCP를 통한 마이그레이션 확인

**프로젝트 복원 후 실행**:

```bash
# List Migrations
# (코드에서 Supabase MCP 사용)
```

**확인 사항**:
- [ ] 모든 마이그레이션 성공적으로 적용됨
- [ ] 실패한 마이그레이션 없음
- [ ] 마이그레이션 순서 정상

---

## 🧪 Phase 7: API 연결 테스트

### 7.1 로컬 환경 테스트

```bash
# 개발 서버 시작
npm run dev

# 브라우저에서 확인
# http://localhost:3000
```

**확인 사항**:
- [ ] 페이지 정상 로드
- [ ] 콘솔에 Supabase 연결 에러 없음
- [ ] 데이터베이스 쿼리 성공

### 7.2 API 라우트 테스트

```bash
# Push 알림 설정 확인
curl http://localhost:3000/api/push/config-check

# 데이터베이스 연결 확인
# (Admin 로그인 후 Dashboard 접근)
```

### 7.3 Admin 기능 테스트

- [ ] Admin 로그인 성공
- [ ] 공지사항 조회 성공
- [ ] 캘린더 조회 성공
- [ ] 푸시 알림 대시보드 접근 가능

---

## 📝 Phase 8: 로그 확인

### 8.1 Postgres 로그 확인

**Dashboard 확인**:
```
Dashboard → Logs → Postgres Logs
```

**확인 사항**:
- [ ] 에러 로그 없음
- [ ] 연결 성공 로그 확인
- [ ] 쿼리 실행 로그 정상

### 8.2 API 로그 확인

**Dashboard 확인**:
```
Dashboard → Logs → API Logs
```

**확인 사항**:
- [ ] 인증 요청 성공
- [ ] 데이터 조회 성공
- [ ] 에러 응답 없음

---

## 🎯 Phase 9: 최종 검증

### 9.1 전체 기능 테스트

**사용자 기능**:
- [ ] 메인 페이지 로드
- [ ] 공지사항 페이지 조회
- [ ] 캘린더 페이지 조회
- [ ] 예비지원서 제출 (테스트)

**Admin 기능**:
- [ ] 로그인/로그아웃
- [ ] 공지사항 CRUD
- [ ] 캘린더 이벤트 CRUD
- [ ] 푸시 알림 전송 (테스트)
- [ ] 예비지원서 조회

### 9.2 빌드 테스트

```bash
# 프로덕션 빌드
npm run build

# 빌드 성공 확인
# ✓ Compiled successfully
```

### 9.3 배포 준비 확인

- [ ] 모든 환경 변수 Vercel에 설정
- [ ] GitHub 저장소 최신 상태
- [ ] README 문서 업데이트
- [ ] `.env.local` 파일이 `.gitignore`에 포함됨

---

## 🚨 문제 발생 시

### 연결 실패
```
Error: Failed to connect to database
```

**해결**:
1. 프로젝트 상태 확인 (ACTIVE인지)
2. 환경 변수 재확인
3. Dashboard에서 직접 SQL 실행 테스트

### RLS 정책 오류
```
Error: new row violates row-level security policy
```

**해결**:
1. Dashboard → Table Editor → 테이블 선택
2. RLS Policies 탭에서 정책 추가/수정
3. 또는 임시로 RLS 비활성화 (개발용)

### 마이그레이션 실패
```
Error: Migration failed
```

**해결**:
1. Dashboard → Database → Migrations
2. 실패한 마이그레이션 확인
3. 수동으로 SQL 실행
4. 마이그레이션 테이블 업데이트

---

## ✅ 검증 완료 체크리스트

최종 확인:

- [ ] **Phase 1**: 데이터베이스 연결 성공
- [ ] **Phase 2**: 모든 필수 테이블 존재
- [ ] **Phase 3**: RLS 정책 적절히 설정
- [ ] **Phase 4**: 성능 최적화 완료
- [ ] **Phase 5**: 필수 확장 설치됨
- [ ] **Phase 6**: 마이그레이션 정상 완료
- [ ] **Phase 7**: API 연결 테스트 성공
- [ ] **Phase 8**: 로그에 치명적 에러 없음
- [ ] **Phase 9**: 전체 기능 테스트 통과

---

**검증 완료 일자**: _______________
**검증자**: _______________
**프로젝트 버전**: 1.0.0

모든 항목이 체크되면 프로젝트를 프로덕션에 배포할 준비가 완료된 것입니다! 🎉

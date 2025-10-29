# 🚀 Startup Sejong - 프로젝트 설정 가이드

완전한 로컬 개발 환경 설정을 위한 단계별 가이드입니다.

---

## 📋 목차

1. [사전 요구사항](#사전-요구사항)
2. [Supabase 프로젝트 복원](#supabase-프로젝트-복원)
3. [환경 변수 설정](#환경-변수-설정)
4. [데이터베이스 검증](#데이터베이스-검증)
5. [로컬 개발 서버 실행](#로컬-개발-서버-실행)
6. [Vercel 배포](#vercel-배포)
7. [문제 해결](#문제-해결)

---

## 🔧 사전 요구사항

### 필수 소프트웨어

- **Node.js**: 18.x 이상 ([다운로드](https://nodejs.org/))
- **npm**: Node.js와 함께 설치됨
- **Git**: 버전 관리 ([다운로드](https://git-scm.com/))

### 필수 계정

- **Supabase 계정**: [https://supabase.com](https://supabase.com)
- **Vercel 계정** (배포 시): [https://vercel.com](https://vercel.com)

---

## 🔄 Supabase 프로젝트 복원

### ⚠️ 현재 상태

**프로젝트**: `startup-sejong` (ID: `ihgojwljhbdrfmqhlspb`)
**상태**: **INACTIVE** ❌
**리전**: `ap-northeast-2` (서울)
**데이터베이스 버전**: PostgreSQL 17.4.1

### 📝 복원 단계

#### Step 1: Supabase Dashboard 접속

```
https://app.supabase.com
```

#### Step 2: 무료 플랜 한도 확인

**문제**: 무료 플랜은 최대 2개 활성 프로젝트까지 지원합니다.
**현재**: 다른 프로젝트들이 이미 활성화되어 있어 복원 불가

**해결 방법 A - 다른 프로젝트 일시정지**:
1. Dashboard에서 사용하지 않는 프로젝트 선택
2. **Settings** → **General** → 맨 아래로 스크롤
3. **Pause project** 버튼 클릭
4. 확인 후 일시정지

**해결 방법 B - 유료 플랜 업그레이드**:
1. Dashboard → **Billing** 메뉴
2. **Pro Plan** 선택 ($25/월)
3. 무제한 프로젝트 사용 가능

#### Step 3: startup-sejong 프로젝트 복원

1. Dashboard에서 `startup-sejong` 프로젝트 선택
2. **Settings** → **General**
3. **Restore project** 버튼 클릭
4. 복원 확인 (약 2-5분 소요)

#### Step 4: 복원 상태 확인

프로젝트 상태가 **ACTIVE_HEALTHY** ✅로 변경될 때까지 기다립니다.

```
Dashboard → Project → Overview
Status: ACTIVE_HEALTHY ✅
```

---

## 🔐 환경 변수 설정

### Step 1: 템플릿 파일 복사

```bash
cp .env.local.template .env.local
```

### Step 2: Supabase API Keys 확인

프로젝트가 **ACTIVE** 상태일 때:

```
https://app.supabase.com/project/ihgojwljhbdrfmqhlspb/settings/api
```

#### 이미 입력된 값들:

✅ **Project URL**:
```
NEXT_PUBLIC_SUPABASE_URL=https://ihgojwljhbdrfmqhlspb.supabase.co
```

✅ **Anon Key**:
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 수동으로 입력해야 하는 값:

⚠️ **Service Role Key** (매우 중요!):
1. API Settings 페이지에서 `service_role` 섹션 찾기
2. **Reveal** 버튼 클릭
3. 전체 키 복사
4. `.env.local` 파일의 `SUPABASE_SERVICE_ROLE_KEY`에 붙여넣기

**주의**: Service Role Key는 RLS(Row Level Security)를 우회할 수 있으므로 **절대 클라이언트에 노출하지 마세요!**

### Step 3: VAPID Keys 생성 (Push 알림용)

#### Option A: Web Tool 사용 (추천)

```
https://web-push-codelab.glitch.me/
```

1. **Generate Keys** 버튼 클릭
2. Public Key와 Private Key 복사
3. `.env.local` 파일에 입력:

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<복사한 Public Key>
VAPID_PRIVATE_KEY=<복사한 Private Key>
VAPID_EMAIL=mailto:admin@sejong.ac.kr
```

#### Option B: CLI 사용

```bash
npx web-push generate-vapid-keys
```

### Step 4: 환경 변수 확인

`.env.local` 파일이 다음과 같은 형식이어야 합니다:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ihgojwljhbdrfmqhlspb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... # ⚠️ 반드시 입력!

# VAPID
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BK8V...
VAPID_PRIVATE_KEY=nT6z...
VAPID_EMAIL=mailto:admin@sejong.ac.kr
```

---

## ✅ 데이터베이스 검증

프로젝트가 **ACTIVE** 상태가 되면 다음을 확인하세요:

### 필수 테이블 존재 확인

```sql
-- Supabase SQL Editor에서 실행
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**필수 테이블**:
- `announcements` - 공지사항
- `calendar_events` - 캘린더 이벤트
- `push_subscriptions` - 푸시 알림 구독
- `notifications` - 알림 기록
- `notification_delivery_log` - 알림 전송 로그
- `preliminary_applications` - 예비지원서

### RLS (Row Level Security) 정책 확인

```
Dashboard → Authentication → Policies
```

각 테이블에 적절한 RLS 정책이 설정되어 있는지 확인하세요.

---

## 🏃 로컬 개발 서버 실행

### Step 1: 의존성 설치

```bash
npm install
```

### Step 2: 개발 서버 실행

```bash
npm run dev
```

### Step 3: 브라우저 확인

```
http://localhost:3000
```

### Step 4: Admin 페이지 접근

```
http://localhost:3000/admin/login
```

**기본 관리자 계정** (Supabase Auth에서 생성):
- 이메일: Supabase Dashboard → Authentication → Users에서 생성
- 비밀번호: 생성 시 설정한 비밀번호

---

## 🚀 Vercel 배포

### Step 1: Vercel 프로젝트 생성

```bash
# Vercel CLI 설치 (선택)
npm install -g vercel

# 배포
vercel
```

또는 **Vercel Dashboard**에서:
1. **New Project** 클릭
2. GitHub 저장소 연결
3. 자동 배포 설정

### Step 2: 환경 변수 설정

```
Vercel Dashboard → Project Settings → Environment Variables
```

**모든 환경 변수 추가**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` ⚠️
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY` ⚠️
- `VAPID_EMAIL`

**적용 환경**:
- ✅ Production
- ✅ Preview
- ✅ Development (선택)

### Step 3: 재배포

환경 변수 추가 후:
```
Deployments → Latest Deployment → Redeploy
```

---

## 🔍 문제 해결

### Issue 1: 빌드 실패 - "Missing Supabase environment variables"

**원인**: 환경 변수가 설정되지 않음

**해결**:
1. `.env.local` 파일 존재 확인
2. 모든 필수 환경 변수 입력 확인
3. 개발 서버 재시작: `npm run dev`

### Issue 2: 데이터베이스 연결 타임아웃

**원인**: Supabase 프로젝트가 INACTIVE 상태

**해결**:
1. Dashboard에서 프로젝트 상태 확인
2. INACTIVE면 복원 진행
3. ACTIVE 상태가 될 때까지 대기 (2-5분)

### Issue 3: Admin 페이지 접근 불가

**원인**: 관리자 계정이 생성되지 않음

**해결**:
```
Dashboard → Authentication → Users → Add user
```

1. 이메일과 비밀번호 입력
2. **Confirm email** 체크
3. 사용자 생성
4. `/admin/login`에서 로그인

### Issue 4: Push 알림 전송 실패

**원인**: VAPID Keys 미설정 또는 Service Role Key 누락

**해결**:
1. VAPID Keys 생성 및 환경 변수 설정 확인
2. `SUPABASE_SERVICE_ROLE_KEY` 설정 확인
3. 개발 서버 재시작

### Issue 5: RLS Policy 오류

**원인**: Row Level Security 정책으로 데이터 접근 거부

**해결**:
1. Dashboard → Table Editor → 테이블 선택
2. **RLS Policies** 탭 확인
3. 필요한 정책 추가 또는 수정

---

## 📚 추가 리소스

### 공식 문서

- **Next.js**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **Vercel**: https://vercel.com/docs

### 커뮤니티

- **Supabase Discord**: https://discord.supabase.com
- **Next.js GitHub**: https://github.com/vercel/next.js

### 프로젝트 정보

- **프로젝트 ID**: `ihgojwljhbdrfmqhlspb`
- **리전**: `ap-northeast-2` (서울)
- **Dashboard**: https://app.supabase.com/project/ihgojwljhbdrfmqhlspb

---

## 📞 Support

문제가 계속되면 다음을 확인하세요:

1. **빌드 로그**: 터미널 출력 확인
2. **브라우저 콘솔**: F12 → Console 탭
3. **Supabase Logs**: Dashboard → Logs
4. **Network 탭**: API 요청 실패 확인

---

**마지막 업데이트**: 2025-01-29
**버전**: 1.0.0

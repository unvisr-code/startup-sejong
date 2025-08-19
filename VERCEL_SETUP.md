# Vercel 배포 및 환경변수 설정 가이드

## 🚀 Vercel 배포 시 필수 환경변수 설정

### 1. VAPID 키 생성

먼저 VAPID 키를 생성해야 합니다:

```bash
npx web-push generate-vapid-keys
```

출력 예시:
```
=======================================

Public Key:
BD7SqfrCa70quD1pjwene9JU7nI_slfYPUigjIuN_1lnxxBmmJTvmtlcWfBmZYRWfZKyUY9RZINgfCf-tBq13oU

Private Key:
JIkeZYUVa-wPt1mOnGtip1UbUrB73SLW--IYvuyEtG4

=======================================
```

### 2. Vercel 환경변수 설정

#### 방법 1: Vercel 대시보드에서 설정

1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** 탭 클릭
4. **Environment Variables** 메뉴 선택
5. 다음 변수들을 추가:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | `생성된_공개키` | Production, Preview, Development |
| `VAPID_PRIVATE_KEY` | `생성된_비밀키` | Production, Preview, Development |
| `VAPID_EMAIL` | `admin@sejong.ac.kr` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key` | Production, Preview, Development |
| `ADMIN_EMAIL` | `admin@sejong.ac.kr` | Production, Preview, Development |

#### 방법 2: Vercel CLI로 설정

```bash
# 프로덕션 환경변수 설정
vercel env add NEXT_PUBLIC_VAPID_PUBLIC_KEY production
vercel env add VAPID_PRIVATE_KEY production
vercel env add VAPID_EMAIL production

# 프리뷰 환경변수 설정  
vercel env add NEXT_PUBLIC_VAPID_PUBLIC_KEY preview
vercel env add VAPID_PRIVATE_KEY preview
vercel env add VAPID_EMAIL preview

# 개발 환경변수 설정
vercel env add NEXT_PUBLIC_VAPID_PUBLIC_KEY development
vercel env add VAPID_PRIVATE_KEY development
vercel env add VAPID_EMAIL development
```

### 3. 환경변수 확인

배포 후 다음 URL에서 설정 상태를 확인할 수 있습니다:
```
https://your-domain.vercel.app/api/push/config-check
```

정상 설정 시 응답:
```json
{
  "isConfigured": true,
  "vapidPublicKey": true,
  "vapidPrivateKey": true,
  "vapidEmail": true,
  "supabaseUrl": true,
  "supabaseKey": true,
  "errors": [],
  "environment": "production"
}
```

### 4. 문제 해결

#### 🚨 "설정 오류" 버튼이 표시되는 경우

1. **VAPID 키 미설정**: 
   - Vercel 대시보드에서 `NEXT_PUBLIC_VAPID_PUBLIC_KEY` 확인
   - 키가 20자 이상인지 확인

2. **환경변수 이름 오타**:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (PUBLIC 누락 주의)
   - `VAPID_PRIVATE_KEY`
   - `VAPID_EMAIL`

#### ⚠️ "호환성 제한" 버튼이 표시되는 경우

**iOS Safari 사용자**:
- Safari 메뉴 → 공유 → 홈 화면에 추가
- 홈 화면의 앱 아이콘으로 접속해야 알림 사용 가능

**Android 사용자**:
- Chrome 브라우저 사용 권장
- Samsung Internet 등 일부 브라우저는 제한적 지원

#### 📱 모바일 "Application error" 해결

1. **VAPID 키 확인**: `/api/push/config-check` 접속하여 설정 확인
2. **브라우저 캐시 삭제**: 설정 → 개인정보 → 인터넷 사용 기록 삭제
3. **앱 재설치**: 홈 화면에서 앱 삭제 후 다시 설치

### 5. 테스트 방법

1. **알림 권한 요청**: 헤더의 "알림 받기" 버튼 클릭
2. **구독 확인**: 개발자 도구 → Application → Service Workers 확인
3. **테스트 발송**: `/admin/notifications`에서 테스트 알림 발송
4. **수신 확인**: 브라우저 알림 또는 모바일 알림 확인

### 6. 보안 참고사항

- **VAPID 비밀키**: 절대 클라이언트에 노출되지 않도록 주의
- **환경 분리**: 프로덕션/개발 환경별로 다른 VAPID 키 사용 권장
- **키 교체**: 보안상 이유로 VAPID 키 교체 시 모든 구독자가 재구독 필요

### 7. Supabase 테이블 생성

`database/push_notifications.sql` 파일의 내용을 Supabase SQL 에디터에서 실행:

1. Supabase 대시보드 → SQL Editor
2. `push_notifications.sql` 내용 복사 후 실행
3. 테이블 생성 확인: `push_subscriptions`, `notifications`

---

## 🆘 추가 도움이 필요한 경우

1. **설정 확인**: `/api/push/config-check` API 호출
2. **브라우저 콘솔**: 개발자 도구에서 에러 메시지 확인
3. **Vercel 로그**: Vercel 대시보드 → Functions 탭에서 에러 로그 확인
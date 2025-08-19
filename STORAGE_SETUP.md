# Supabase Storage 설정 가이드

## 문제 진단

현재 Storage 버킷은 생성되었지만 파일 업로드가 fallback 모드로 동작하고 있습니다.

## 해결 방법

### 1. Supabase Dashboard에서 Storage 설정 확인

1. https://app.supabase.com 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **Storage** 클릭

### 2. 버킷 설정 확인

`announcement-attachments` 버킷이 있는지 확인하고:

1. 버킷 이름 옆의 **⋮** (점 3개) 메뉴 클릭
2. **Edit bucket** 선택
3. **Public bucket** 체크박스가 선택되어 있는지 확인
4. 선택되어 있지 않다면 체크하고 **Update** 클릭

### 3. Storage 정책 설정 (중요!)

SQL Editor로 이동하여 `database/storage_policies.sql` 파일의 내용을 실행하거나, 
다음 명령을 순차적으로 실행:

```sql
-- 1. 버킷을 Public으로 설정 (필수!)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'announcement-attachments';

-- 2. Storage RLS 정책 생성 (새로운 문법)
-- 공개 읽기 허용
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'announcement-attachments');

-- 인증된 사용자는 업로드 가능
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'announcement-attachments' 
    AND auth.role() = 'authenticated'
);

-- 3. 정책 확인
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```

### 4. CORS 설정 확인 (필요한 경우)

Supabase Dashboard > Settings > API 에서:

1. **CORS** 섹션 확인
2. 허용된 도메인에 `http://localhost:3000` 포함 확인

### 5. 환경변수 확인

`.env.local` 파일:
```
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

### 6. 개발 서버 재시작

```bash
# 서버 중지 (Ctrl+C)
# 다시 시작
npm run dev
```

## 테스트 방법

1. 브라우저 개발자 도구(F12) > Console 열기
2. 새 공지사항 작성 페이지에서 파일 첨부 후 저장
3. Console에서 다음 메시지 확인:
   - `Storage bucket found and accessible` → 정상
   - `Storage not available, using fallback mode` → Storage 문제

## 문제가 지속될 경우

### 오류: "relation 'storage.policies' does not exist"

Supabase가 새로운 Storage 정책 시스템을 사용합니다. `storage.objects` 테이블에 직접 정책을 생성해야 합니다.

### 해결 방법:

1. **버킷 재생성**:
   ```sql
   -- 기존 버킷 삭제 (필요한 경우)
   DELETE FROM storage.buckets WHERE id = 'announcement-attachments';
   
   -- 새 버킷 생성
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('announcement-attachments', 'announcement-attachments', true);
   ```

2. **Supabase Dashboard > Logs > API 에서 오류 확인**

3. **개발 환경용 임시 해결책**:
   ```sql
   -- 모든 작업 허용 (개발 환경만!)
   CREATE POLICY "Allow all for dev" ON storage.objects
   FOR ALL USING (bucket_id = 'announcement-attachments');
   ```

4. **Service Role Key 사용 (프로덕션 환경)**:
   - Dashboard > Settings > API
   - Service Role Key 복사
   - 서버 사이드에서만 사용 (클라이언트 노출 금지)
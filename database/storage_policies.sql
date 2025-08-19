-- =====================================================
-- Supabase Storage 정책 설정
-- =====================================================
-- 이 스크립트를 Supabase SQL 편집기에서 실행하세요.

-- 1. 버킷을 Public으로 설정
UPDATE storage.buckets 
SET public = true 
WHERE id = 'announcement-attachments';

-- 2. 버킷이 제대로 생성되었는지 확인
SELECT id, name, public FROM storage.buckets WHERE id = 'announcement-attachments';

-- 3. Storage RLS 정책 생성 (새로운 문법)
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- 공개 읽기 허용 (누구나 파일 다운로드 가능)
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'announcement-attachments');

-- 인증된 사용자는 업로드 가능
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'announcement-attachments' 
    AND auth.role() = 'authenticated'
);

-- 인증된 사용자는 수정 가능
CREATE POLICY "Authenticated users can update" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'announcement-attachments' 
    AND auth.role() = 'authenticated'
);

-- 인증된 사용자는 삭제 가능
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (
    bucket_id = 'announcement-attachments' 
    AND auth.role() = 'authenticated'
);

-- 4. 개발 환경용 - 모든 작업 허용 (선택사항, 주의!)
-- 프로덕션에서는 사용하지 마세요
-- DROP POLICY IF EXISTS "Allow all for development" ON storage.objects;
-- CREATE POLICY "Allow all for development" ON storage.objects
-- FOR ALL USING (bucket_id = 'announcement-attachments');

-- 5. 정책이 제대로 생성되었는지 확인
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- 6. 버킷 상태 확인
SELECT 
    b.id,
    b.name,
    b.public,
    b.created_at,
    COUNT(o.id) as file_count
FROM storage.buckets b
LEFT JOIN storage.objects o ON b.id = o.bucket_id
WHERE b.id = 'announcement-attachments'
GROUP BY b.id, b.name, b.public, b.created_at;
-- =====================================================
-- RLS 정책 수정 스크립트
-- =====================================================
-- 이 스크립트를 Supabase SQL 편집기에서 실행하세요.

-- 1. announcement_attachments 테이블에 RLS 활성화
ALTER TABLE announcement_attachments ENABLE ROW LEVEL SECURITY;

-- 2. 기존 정책이 있다면 삭제 (오류 무시)
DROP POLICY IF EXISTS "Public can view announcement attachments" ON announcement_attachments;
DROP POLICY IF EXISTS "Authenticated users can insert announcement attachments" ON announcement_attachments;
DROP POLICY IF EXISTS "Authenticated users can update announcement attachments" ON announcement_attachments;
DROP POLICY IF EXISTS "Authenticated users can delete announcement attachments" ON announcement_attachments;

-- 3. 새로운 정책 생성 (개발환경용 - 모든 접근 허용)
CREATE POLICY "Public can view announcement attachments" ON announcement_attachments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert announcement attachments" ON announcement_attachments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update announcement attachments" ON announcement_attachments
    FOR UPDATE USING (true);

CREATE POLICY "Authenticated users can delete announcement attachments" ON announcement_attachments
    FOR DELETE USING (true);

-- 4. 다른 테이블들도 개발환경용으로 수정 (선택사항)
-- announcements 테이블 정책 수정
DROP POLICY IF EXISTS "Authenticated users can insert announcements" ON announcements;
DROP POLICY IF EXISTS "Authenticated users can update announcements" ON announcements;
DROP POLICY IF EXISTS "Authenticated users can delete announcements" ON announcements;

CREATE POLICY "Authenticated users can insert announcements" ON announcements
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update announcements" ON announcements
    FOR UPDATE USING (true);

CREATE POLICY "Authenticated users can delete announcements" ON announcements
    FOR DELETE USING (true);

-- academic_calendar 테이블 정책 수정
DROP POLICY IF EXISTS "Authenticated users can insert calendar" ON academic_calendar;
DROP POLICY IF EXISTS "Authenticated users can update calendar" ON academic_calendar;
DROP POLICY IF EXISTS "Authenticated users can delete calendar" ON academic_calendar;

CREATE POLICY "Authenticated users can insert calendar" ON academic_calendar
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update calendar" ON academic_calendar
    FOR UPDATE USING (true);

CREATE POLICY "Authenticated users can delete calendar" ON academic_calendar
    FOR DELETE USING (true);
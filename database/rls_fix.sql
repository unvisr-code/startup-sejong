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

-- =====================================================
-- push_subscriptions 테이블 RLS 정책
-- =====================================================
-- Push 알림을 위한 RLS 정책 설정

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can view active subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Anyone can create subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON push_subscriptions;

-- 새로운 정책 생성
-- 1. 누구나 활성 구독을 조회할 수 있음 (개발환경용)
CREATE POLICY "Anyone can view active subscriptions" ON push_subscriptions
    FOR SELECT USING (is_active = true);

-- 2. 누구나 구독을 생성할 수 있음 (사용자가 알림 구독 시)
CREATE POLICY "Anyone can create subscriptions" ON push_subscriptions
    FOR INSERT WITH CHECK (true);

-- 3. 누구나 자신의 구독을 업데이트할 수 있음 (endpoint 기준)
CREATE POLICY "Anyone can update own subscription" ON push_subscriptions
    FOR UPDATE USING (true);

-- 4. 누구나 자신의 구독을 삭제할 수 있음
CREATE POLICY "Anyone can delete own subscription" ON push_subscriptions
    FOR DELETE USING (true);

-- notifications 테이블 정책 (선택사항)
DROP POLICY IF EXISTS "Anyone can view notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can manage notifications" ON notifications;

CREATE POLICY "Anyone can view notifications" ON notifications
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage notifications" ON notifications
    FOR ALL USING (true);

-- notification_delivery_log 테이블 정책 (선택사항)
DROP POLICY IF EXISTS "Service role can manage delivery logs" ON notification_delivery_log;

CREATE POLICY "Service role can manage delivery logs" ON notification_delivery_log
    FOR ALL USING (true);
-- Supabase Database Schema for 세종대 융합창업연계전공
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ANNOUNCEMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('general', 'important', 'academic', 'event')) DEFAULT 'general',
  is_pinned BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  author_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('Asia/Seoul', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('Asia/Seoul', NOW())
);

-- Create index for faster queries
CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX idx_announcements_is_pinned ON announcements(is_pinned);
CREATE INDEX idx_announcements_category ON announcements(category);

-- =====================================================
-- ACADEMIC CALENDAR TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS academic_calendar (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  event_type TEXT CHECK (event_type IN ('semester', 'exam', 'holiday', 'application', 'other')) DEFAULT 'other',
  description TEXT,
  location TEXT,
  is_important BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('Asia/Seoul', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('Asia/Seoul', NOW())
);

-- Create index for faster queries
CREATE INDEX idx_calendar_start_date ON academic_calendar(start_date);
CREATE INDEX idx_calendar_end_date ON academic_calendar(end_date);
CREATE INDEX idx_calendar_event_type ON academic_calendar(event_type);

-- =====================================================
-- ADMIN ACTIVITY LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('Asia/Seoul', NOW())
);

-- Create index for faster queries
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX idx_admin_logs_admin_email ON admin_logs(admin_email);

-- =====================================================
-- FILE UPLOADS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  resource_type TEXT,
  resource_id UUID,
  uploaded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('Asia/Seoul', NOW())
);

-- =====================================================
-- STATISTICS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS statistics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  announcement_views INTEGER DEFAULT 0,
  calendar_views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('Asia/Seoul', NOW())
);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('Asia/Seoul', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger for announcements
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE
    ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for academic_calendar
CREATE TRIGGER update_calendar_updated_at BEFORE UPDATE
    ON academic_calendar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;

-- Public read access for announcements
CREATE POLICY "Public can view announcements" ON announcements
    FOR SELECT USING (true);

-- Public read access for academic_calendar
CREATE POLICY "Public can view calendar" ON academic_calendar
    FOR SELECT USING (true);

-- Authenticated users can manage announcements
CREATE POLICY "Authenticated users can insert announcements" ON announcements
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update announcements" ON announcements
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete announcements" ON announcements
    FOR DELETE USING (auth.role() = 'authenticated');

-- Authenticated users can manage academic_calendar
CREATE POLICY "Authenticated users can insert calendar" ON academic_calendar
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update calendar" ON academic_calendar
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete calendar" ON academic_calendar
    FOR DELETE USING (auth.role() = 'authenticated');

-- Only authenticated users can view and insert logs
CREATE POLICY "Authenticated users can view logs" ON admin_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert logs" ON admin_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- File uploads policies
CREATE POLICY "Public can view files" ON file_uploads
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload files" ON file_uploads
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Statistics policies
CREATE POLICY "Public can view statistics" ON statistics
    FOR SELECT USING (true);

CREATE POLICY "System can update statistics" ON statistics
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- SAMPLE DATA (Optional - Remove in production)
-- =====================================================

-- Sample announcements
INSERT INTO announcements (title, content, category, is_pinned) VALUES
('2025학년도 1학기 융합창업연계전공 신청 안내', 
'<h2>신청 대상</h2><p>세종대학교 재학생 중 창업에 관심이 있는 모든 학생</p><h2>신청 기간</h2><p>2025년 2월 1일(토) ~ 2월 14일(금)</p><h2>신청 방법</h2><ol><li>학사정보시스템 접속</li><li>전공신청 메뉴 선택</li><li>융합창업연계전공 선택</li><li>신청서 작성 및 제출</li></ol>', 
'important', true),

('창업 아이디어 경진대회 개최', 
'<p>세종대학교 융합창업연계전공에서 창업 아이디어 경진대회를 개최합니다.</p><p><strong>일시:</strong> 2025년 3월 15일(토) 14:00</p><p><strong>장소:</strong> 대양홀</p><p><strong>참가자격:</strong> 세종대학교 재학생</p><p><strong>시상:</strong> 대상 100만원, 최우수상 50만원, 우수상 30만원</p>', 
'event', false),

('2025-1학기 수강신청 안내', 
'<p>2025학년도 1학기 수강신청 일정을 안내드립니다.</p><ul><li>수강신청 기간: 2025년 2월 24일(월) ~ 2월 28일(금)</li><li>수강정정 기간: 2025년 3월 4일(화) ~ 3월 7일(금)</li></ul>', 
'academic', false);

-- Sample calendar events
INSERT INTO academic_calendar (title, start_date, end_date, event_type, description, is_important) VALUES
('2025학년도 1학기 개강', '2025-03-02', '2025-03-02', 'semester', '2025학년도 1학기가 시작됩니다.', true),
('수강신청 기간', '2025-02-24', '2025-02-28', 'application', '2025학년도 1학기 수강신청 기간입니다.', true),
('중간고사', '2025-04-20', '2025-04-26', 'exam', '중간고사 기간입니다.', true),
('어린이날', '2025-05-05', '2025-05-05', 'holiday', '어린이날 공휴일입니다.', false),
('기말고사', '2025-06-15', '2025-06-21', 'exam', '기말고사 기간입니다.', true),
('하계방학', '2025-06-22', '2025-08-31', 'holiday', '하계방학 기간입니다.', false);

-- =====================================================
-- INSTRUCTIONS
-- =====================================================
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire SQL script
-- 4. Click "Run" to execute
-- 5. Check the Table Editor to verify tables were created
-- 6. Set up Authentication users in the Authentication section
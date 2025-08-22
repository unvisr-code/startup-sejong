-- Preliminary Applications Table for 세종대 융합창업연계전공
-- Run this SQL in your Supabase SQL Editor after running schema.sql

-- =====================================================
-- PRELIMINARY APPLICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS preliminary_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Personal Information
  phone_number TEXT NOT NULL,
  department TEXT NOT NULL,
  grade INTEGER CHECK (grade >= 1 AND grade <= 4) NOT NULL,
  age INTEGER CHECK (age >= 18 AND age <= 100) NOT NULL,
  gpa TEXT CHECK (gpa IN ('4.5', '4.3', '4.0', '3.7', '3.5', '3.3', '3.0', '2.7', '2.5', '2.0', '미입력')),
  
  -- Startup Related
  has_startup_item BOOLEAN NOT NULL DEFAULT false,
  self_introduction TEXT CHECK (LENGTH(self_introduction) <= 300),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('Asia/Seoul', NOW()),
  ip_address TEXT,
  user_agent TEXT
);

-- Create indexes for faster queries
CREATE INDEX idx_preliminary_applications_created_at ON preliminary_applications(created_at DESC);
CREATE INDEX idx_preliminary_applications_phone ON preliminary_applications(phone_number);
CREATE INDEX idx_preliminary_applications_department ON preliminary_applications(department);

-- Add comment for table documentation
COMMENT ON TABLE preliminary_applications IS '융합창업연계전공 예비 신청자 정보';
COMMENT ON COLUMN preliminary_applications.phone_number IS '전화번호 (하이픈 포함)';
COMMENT ON COLUMN preliminary_applications.department IS '학과명';
COMMENT ON COLUMN preliminary_applications.grade IS '학년 (1-4)';
COMMENT ON COLUMN preliminary_applications.age IS '나이';
COMMENT ON COLUMN preliminary_applications.gpa IS '학점 (4.5 만점 기준)';
COMMENT ON COLUMN preliminary_applications.has_startup_item IS '창업 아이템 보유 여부';
COMMENT ON COLUMN preliminary_applications.self_introduction IS '자기소개 (300자 이내)';
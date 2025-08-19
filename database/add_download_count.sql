-- =====================================================
-- 다운로드 수 추가 스크립트
-- =====================================================
-- 이 스크립트를 Supabase SQL 편집기에서 실행하세요.

-- 1. announcement_attachments 테이블에 download_count 컬럼 추가
ALTER TABLE announcement_attachments 
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;

-- 2. 인덱스 추가 (빠른 조회를 위해)
CREATE INDEX IF NOT EXISTS idx_attachments_download_count 
ON announcement_attachments(download_count DESC);

-- 3. 기존 레코드의 download_count를 0으로 설정 (이미 기본값이 0이지만 명시적으로)
UPDATE announcement_attachments 
SET download_count = 0 
WHERE download_count IS NULL;

-- 4. 확인
SELECT 
  a.title as announcement_title,
  aa.file_name,
  aa.download_count
FROM announcement_attachments aa
JOIN announcements a ON aa.announcement_id = a.id
ORDER BY aa.download_count DESC;
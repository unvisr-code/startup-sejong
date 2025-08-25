-- Add announcement_id field to academic_calendar table
ALTER TABLE academic_calendar
ADD COLUMN announcement_id UUID REFERENCES announcements(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_academic_calendar_announcement_id ON academic_calendar(announcement_id);

-- Add comment to explain the field
COMMENT ON COLUMN academic_calendar.announcement_id IS 'Optional reference to related announcement';
-- Add push notification fields to announcements and academic_calendar tables

-- Add push_sent field to announcements table
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS push_sent BOOLEAN DEFAULT false;

-- Add push_sent field to academic_calendar table
ALTER TABLE academic_calendar 
ADD COLUMN IF NOT EXISTS push_sent BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_announcements_push_sent ON announcements(push_sent);
CREATE INDEX IF NOT EXISTS idx_academic_calendar_push_sent ON academic_calendar(push_sent);

-- Add comments for documentation
COMMENT ON COLUMN announcements.push_sent IS 'Whether a push notification has been sent for this announcement';
COMMENT ON COLUMN academic_calendar.push_sent IS 'Whether a push notification has been sent for this calendar event';
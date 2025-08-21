-- Add open_count column to notifications table for push notification analytics
-- This column will store the number of times users clicked/opened the notification

BEGIN;

-- Add open_count column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'open_count'
    ) THEN
        ALTER TABLE notifications ADD COLUMN open_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add opened_at column to notification_delivery_log if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notification_delivery_log' 
        AND column_name = 'opened_at'
    ) THEN
        ALTER TABLE notification_delivery_log ADD COLUMN opened_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Initialize open_count for existing notifications
UPDATE notifications 
SET open_count = (
    SELECT COUNT(*) 
    FROM notification_delivery_log ndl 
    WHERE ndl.notification_id = notifications.id 
    AND ndl.opened_at IS NOT NULL
)
WHERE open_count IS NULL OR open_count = 0;

COMMIT;

-- Verify the changes
SELECT 
    'notifications' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND column_name IN ('open_count')
UNION ALL
SELECT 
    'notification_delivery_log' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notification_delivery_log' 
AND column_name IN ('opened_at')
ORDER BY table_name, column_name;
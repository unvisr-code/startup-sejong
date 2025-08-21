-- Update notification_delivery_log status constraint to allow 'opened' status
-- This enables proper tracking of notification clicks

BEGIN;

-- First, let's check the current constraint
DO $$ 
DECLARE
    constraint_exists boolean;
BEGIN
    -- Check if the constraint exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'notification_delivery_log_status_check'
    ) INTO constraint_exists;
    
    IF constraint_exists THEN
        -- Drop the existing constraint
        ALTER TABLE notification_delivery_log DROP CONSTRAINT notification_delivery_log_status_check;
        RAISE NOTICE 'Dropped existing status constraint';
    END IF;
    
    -- Add new constraint that allows 'sent', 'failed', and 'opened'
    ALTER TABLE notification_delivery_log 
    ADD CONSTRAINT notification_delivery_log_status_check 
    CHECK (status IN ('sent', 'failed', 'opened'));
    
    RAISE NOTICE 'Added new status constraint with opened status';
END $$;

-- Add opened_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notification_delivery_log' 
        AND column_name = 'opened_at'
    ) THEN
        ALTER TABLE notification_delivery_log ADD COLUMN opened_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added opened_at column';
    ELSE
        RAISE NOTICE 'opened_at column already exists';
    END IF;
END $$;

-- Add open_count column to notifications table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'open_count'
    ) THEN
        ALTER TABLE notifications ADD COLUMN open_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added open_count column';
    ELSE
        RAISE NOTICE 'open_count column already exists';
    END IF;
END $$;

COMMIT;

-- Test the new constraint by checking allowed values
SELECT 'Status constraint test:' as test_info;
SELECT 
    CASE 
        WHEN cc.check_clause LIKE '%opened%' THEN 'SUCCESS: opened status is allowed'
        ELSE 'ERROR: opened status not found in constraint'
    END as constraint_check
FROM information_schema.check_constraints cc
WHERE cc.constraint_name = 'notification_delivery_log_status_check';

-- Verify the new columns
SELECT 
    'notifications' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND column_name = 'open_count'
UNION ALL
SELECT 
    'notification_delivery_log' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notification_delivery_log' 
AND column_name = 'opened_at'
ORDER BY table_name, column_name;
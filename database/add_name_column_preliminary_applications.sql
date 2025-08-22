-- Migration: Add `name` column to preliminary_applications (idempotent)
-- Usage: Run this in Supabase SQL Editor to add only the name column.

BEGIN;

-- 1) Add column if it does not exist
ALTER TABLE IF EXISTS preliminary_applications
  ADD COLUMN IF NOT EXISTS name TEXT;

-- 2) Add comment (safe to re-run)
COMMENT ON COLUMN preliminary_applications.name IS '이름';

-- 3) Backfill: set empty string for existing NULLs to ease NOT NULL constraint later
UPDATE preliminary_applications
SET name = ''
WHERE name IS NULL;

-- 4) Try to enforce NOT NULL if there are no NULLs remaining
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'preliminary_applications' AND column_name = 'name'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM preliminary_applications WHERE name IS NULL) THEN
      BEGIN
        ALTER TABLE preliminary_applications ALTER COLUMN name SET NOT NULL;
      EXCEPTION WHEN others THEN
        -- Ignore if cannot set NOT NULL now (e.g., concurrent writes)
        NULL;
      END;
    END IF;
  END IF;
END $$;

COMMIT;


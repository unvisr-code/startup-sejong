-- ============================================================================
-- Fix Storage Policies for announcement-attachments bucket
-- ============================================================================
-- This migration adds RLS policies to allow file uploads to the
-- announcement-attachments storage bucket.
--
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Copy and paste this entire file
-- 3. Click "Run" to execute
-- ============================================================================

-- Enable RLS on storage.objects (usually already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated uploads to announcement-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads from announcement-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to announcement-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from announcement-attachments" ON storage.objects;

-- Allow authenticated users to upload files to announcement-attachments bucket
CREATE POLICY "Allow authenticated uploads to announcement-attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'announcement-attachments');

-- Allow public read access to files in announcement-attachments bucket
-- Since the bucket is marked as public, anyone should be able to read
CREATE POLICY "Allow public downloads from announcement-attachments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'announcement-attachments');

-- Allow authenticated users to update their files in announcement-attachments bucket
CREATE POLICY "Allow authenticated updates to announcement-attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'announcement-attachments')
WITH CHECK (bucket_id = 'announcement-attachments');

-- Allow authenticated users to delete files from announcement-attachments bucket
CREATE POLICY "Allow authenticated deletes from announcement-attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'announcement-attachments');

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Run this query after applying the migration to verify policies were created:
--
-- SELECT polname, polcmd, polroles::text
-- FROM pg_policy
-- WHERE polrelid = 'storage.objects'::regclass
-- AND polname ILIKE '%announcement%';
-- ============================================================================

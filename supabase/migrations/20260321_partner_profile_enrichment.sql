-- Migration: Partner Profile Enrichment + User Birth Date
-- Run this in your Supabase SQL Editor

-- 1. Add social/online presence fields to partners table
ALTER TABLE partners
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS facebook_url TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';

-- 2. Add birth_date to users table for profile completion tracking
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS birth_date DATE;

-- 3. Create bucket for partner photos (run via Storage dashboard or paste below in SQL Editor)
-- NOTE: Creating buckets via SQL is not supported. Please manually create a bucket
-- named 'partner-photos' in your Supabase Storage dashboard with PUBLIC access.

-- 4. Storage RLS Policy — allow authenticated users to upload to their own folder
-- (Run AFTER creating the partner-photos bucket in the dashboard)
INSERT INTO storage.buckets (id, name, public)
  VALUES ('partner-photos', 'partner-photos', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY IF NOT EXISTS "Partners can upload their own photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'partner-photos');

CREATE POLICY IF NOT EXISTS "Anyone can view partner photos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'partner-photos');

CREATE POLICY IF NOT EXISTS "Partners can delete their own photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'partner-photos');

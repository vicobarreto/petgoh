-- Allow anonymous users to insert into partners for registration
CREATE POLICY "Allow anon to insert pending partners"
ON public.partners
FOR INSERT
TO anon
WITH CHECK (status = 'pending');

-- Ensure partner-logos bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-logos', 'partner-logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow anonymous users to upload logos
CREATE POLICY "Allow anon to upload partner logos"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'partner-logos');

-- Allow public to select from partner-logos
CREATE POLICY "Public Access for partner logos"
ON storage.objects 
FOR SELECT
USING (bucket_id = 'partner-logos');

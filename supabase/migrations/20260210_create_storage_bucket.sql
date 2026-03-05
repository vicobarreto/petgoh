-- Create a new storage bucket for pet photos
insert into storage.buckets (id, name, public)
values ('pet-photos', 'pet-photos', true);

-- Policy to allow public access to view photos
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'pet-photos' );

-- Policy to allow authenticated users to upload photos
create policy "Authenticated users can upload photos"
  on storage.objects for insert
  with check ( bucket_id = 'pet-photos' and auth.role() = 'authenticated' );

-- Policy to allow users to update their own photos
create policy "Users can update own photos"
  on storage.objects for update
  using ( bucket_id = 'pet-photos' and auth.uid() = owner )
  with check ( bucket_id = 'pet-photos' and auth.uid() = owner );

-- Policy to allow users to delete their own photos
create policy "Users can delete own photos"
  on storage.objects for delete
  using ( bucket_id = 'pet-photos' and auth.uid() = owner );

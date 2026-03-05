-- Create a table for users' pets
create table if not exists public.pets (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users not null,
  name text not null,
  breed text,
  age text,
  weight text,
  gender text check (gender in ('Macho', 'Fêmea')),
  photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.pets enable row level security;

-- Policies for pets table
create policy "Users can view their own pets."
  on public.pets for select
  using ( auth.uid() = owner_id );

create policy "Users can insert their own pets."
  on public.pets for insert
  with check ( auth.uid() = owner_id );

create policy "Users can update their own pets."
  on public.pets for update
  using ( auth.uid() = owner_id );

create policy "Users can delete their own pets."
  on public.pets for delete
  using ( auth.uid() = owner_id );

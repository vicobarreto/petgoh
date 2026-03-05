-- Create a table for lost pets
create table if not exists public.lost_pets (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users not null,
  name text not null,
  breed text,
  last_seen_date date,
  last_seen_location text not null,
  description text,
  reward text,
  contact_info text not null,
  photo_url text,
  status text check (status in ('lost', 'found')) default 'lost',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.lost_pets enable row level security;

-- Policies
create policy "Anyone can view lost pets."
  on public.lost_pets for select
  using ( true );

create policy "Users can insert their own lost pets."
  on public.lost_pets for insert
  with check ( auth.uid() = owner_id );

create policy "Users can update their own lost pets."
  on public.lost_pets for update
  using ( auth.uid() = owner_id )
  with check ( auth.uid() = owner_id );

create policy "Users can delete their own lost pets."
  on public.lost_pets for delete
  using ( auth.uid() = owner_id );

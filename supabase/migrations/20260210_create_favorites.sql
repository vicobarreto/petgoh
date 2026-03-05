-- Create post_favorites table
create table if not exists public.post_favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  post_id uuid references public.wall_posts not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id)
);

-- Enable RLS
alter table public.post_favorites enable row level security;

-- Policies
create policy "Users can insert their own favorites"
  on public.post_favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own favorites"
  on public.post_favorites for delete
  using (auth.uid() = user_id);

create policy "Users can view their own favorites"
  on public.post_favorites for select
  using (auth.uid() = user_id);

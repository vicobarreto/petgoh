-- Create a table for public profiles linked to auth.users
create table if not exists public.user_roles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('tutor', 'partner', 'admin')) default 'tutor',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_roles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone."
  on public.user_roles for select
  using ( true );

create policy "Users can update own role."
  on public.user_roles for update
  using ( auth.uid() = id );

-- Trigger to create a user_role entry when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_roles (id, role)
  values (new.id, 'tutor');
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Insert existing users if any (optional, safe to run if empty)
insert into public.user_roles (id, role)
select id, 'tutor' from auth.users
on conflict (id) do nothing;

create table if not exists public.adoption_pets (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  breed text,
  age text,
  gender text check (gender in ('Macho', 'Fêmea')),
  size text,
  weight text,
  location text not null,
  story text,
  main_image text,
  gallery text[], -- Array of image URLs
  status text check (status in ('available', 'adopted', 'pending')) default 'available',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  owner_id uuid references auth.users
);

-- Enable RLS
alter table public.adoption_pets enable row level security;

-- Policies
create policy "Adoption pets are viewable by everyone."
  on public.adoption_pets for select
  using ( true );

create policy "Users can insert their own pets for adoption."
  on public.adoption_pets for insert
  with check (auth.uid() = owner_id);
  
create policy "Users can update their own pets."
  on public.adoption_pets for update
  using (auth.uid() = owner_id);

-- Seed data for testing
insert into public.adoption_pets (name, breed, age, gender, weight, location, story, main_image, gallery)
values 
('Bento', 'Golden Retriever', '2 anos', 'Macho', '28kg', 'São Paulo, SP', 'Fui resgatado há cerca de 6 meses. Sou muito carinhoso e adoro passear.', 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1552053831-71594a27632d']),
('Luna', 'SRD (Vira-lata)', '8 meses', 'Fêmea', '3kg', 'Osasco, SP', 'Sou uma filhote cheia de energia procurando um lar!', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1543466835-00a7907e9de1']),
('Thor', 'Bulldog Francês', '3 anos', 'Macho', '12kg', 'Campinas, SP', 'Adoro dormir no sofá e roncar.', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e']);

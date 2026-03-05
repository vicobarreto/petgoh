-- Enable RLS for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_schedules ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- Pets Policies
-- Users can view their own pets
CREATE POLICY "Users can view own pets" 
ON pets FOR SELECT 
TO authenticated 
USING (auth.uid() = owner_id);

-- Users can insert their own pets
CREATE POLICY "Users can insert own pets" 
ON pets FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = owner_id);

-- Users can update their own pets
CREATE POLICY "Users can update own pets" 
ON pets FOR UPDATE 
TO authenticated 
USING (auth.uid() = owner_id);

-- Users can delete their own pets
CREATE POLICY "Users can delete own pets" 
ON pets FOR DELETE 
TO authenticated 
USING (auth.uid() = owner_id);

-- Lost Pets Policies (Public Read, Authenticated Write)
-- Everyone can view lost pets
CREATE POLICY "Everyone can view lost pets" 
ON lost_pets FOR SELECT 
TO anon, authenticated 
USING (true);

-- Authenticated users can report lost pets
CREATE POLICY "Users can report lost pets" 
ON lost_pets FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Users can update/delete their own reports
CREATE POLICY "Users can manage own lost pet reports" 
ON lost_pets FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);

-- Pet Schedules Policies
-- Users can view their own schedules
CREATE POLICY "Users can view own schedules" 
ON pet_schedules FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Users can create schedules
CREATE POLICY "Users can create schedules" 
ON pet_schedules FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

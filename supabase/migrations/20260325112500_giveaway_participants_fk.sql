-- Add participants array column to giveaways
ALTER TABLE giveaways
ADD COLUMN IF NOT EXISTS participants UUID[] DEFAULT '{}';

-- Drop the old foreign key constraint pointing to the deprecated tutors table
-- The constraint name is usually generated as "giveaways_winner_id_fkey"
ALTER TABLE giveaways
DROP CONSTRAINT IF EXISTS giveaways_winner_id_fkey;

-- Add a new foreign key constraint pointing to the public.users table
ALTER TABLE giveaways
ADD CONSTRAINT giveaways_winner_id_fkey
FOREIGN KEY (winner_id)
REFERENCES public.users(id)
ON DELETE SET NULL;

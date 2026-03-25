-- Update partners category to text array
ALTER TABLE public.partners
  ALTER COLUMN category TYPE TEXT[]
  USING CASE
    WHEN category IS NULL THEN ARRAY[]::TEXT[]
    WHEN category = '' THEN ARRAY[]::TEXT[]
    ELSE string_to_array(replace(replace(category, '{', ''), '}', ''), ', ')
  END;

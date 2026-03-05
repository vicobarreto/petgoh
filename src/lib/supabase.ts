import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rvmcnyhqhmkauyasupjx.supabase.co';
// Modern publishable key
const supabaseKey = 'sb_publishable_e_GSHEp6cYIhmo8HqHkfeg_z4YjBIA0';

export const supabase = createClient(supabaseUrl, supabaseKey);

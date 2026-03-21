import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rvmcnyhqhmkauyasupjx.supabase.co';
const supabaseKey = 'sb_publishable_e_GSHEp6cYIhmo8HqHkfeg_z4YjBIA0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    // try to get the foreign key definitions
    const { data, error } = await supabase.rpc('get_service_role_stats'); // We might not have permission
    // A simpler way: just try to insert a dummy user to giveaways and see the precise error
    // Alternatively, I will just assume it points to auth.users.
}
test();

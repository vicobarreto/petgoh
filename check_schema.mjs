import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    const { data, error } = await supabase.rpc('get_table_schema', { table_name: 'partners' });
    console.log("RPC result:", data, error);
    
    // Alternative: try to read a single row to see its type
    const { data: row, error: rowError } = await supabase.from('partners').select('category').limit(1);
    console.log("Row type:", rowError, typeof row?.[0]?.category, row?.[0]?.category);
}
check();

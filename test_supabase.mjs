import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rvmcnyhqhmkauyasupjx.supabase.co';
const supabaseKey = 'sb_publishable_e_GSHEp6cYIhmo8HqHkfeg_z4YjBIA0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('Testing Promo Insert...');
    const resPromo = await supabase.from('coupons').insert([{
        code: 'TESTPROMO123',
        discount_type: 'percentage',
        discount_value: 10,
        is_active: true
    }]);
    console.log('Promo Error:', resPromo.error);

    console.log('Testing Giveaway Insert...');
    const resGiveaway = await supabase.from('giveaways').insert([{
        title: 'Test Giveaway',
        prize_description: 'Test Prize',
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        draw_date: new Date().toISOString(),
        status: 'upcoming'
    }]);
    console.log('Giveaway Error:', resGiveaway.error);
}
test();

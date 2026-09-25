
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
    // Get country ID specifically for KE
    const { data: country } = await supabase
        .from('countries')
        .select('id')
        .eq('code', 'KE')
        .single();

    if (!country) {
        console.error('Country KE not found');
        return;
    }

    console.log('Country ID:', country.id);

    // Test deep filter with head: true
    const { count, error } = await supabase
        .from('facilities')
        .select('wards!inner(sub_counties!inner(counties!inner(country_id)))', { count: 'exact', head: true })
        .eq('wards.sub_counties.counties.country_id', country.id);

    if (error) {
        console.error('Query Error:', error);
    } else {
        console.log('Count:', count);
    }
}

testQuery();

/**
 * Check database state and facility counts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('🔍 Checking Facility Counts\n');
    console.log('===========================\n');

    // Check facilities table
    const { count: facilityCount } = await supabase
        .from('facilities')
        .select('*', { count: 'exact', head: true });

    console.log(`📊 Total facilities in database: ${facilityCount}`);

    // Check regional_aggregates
    const { data: regionalAggs, error } = await supabase
        .from('regional_aggregates')
        .select('county_name, total_facilities, facilities_assessed');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`\n📈 Regional Aggregates (${regionalAggs?.length} counties):`);
        console.log('='.repeat(60));

        let totalFromAggs = 0;
        regionalAggs?.forEach(agg => {
            console.log(`${agg.county_name}: ${agg.total_facilities} facilities (${agg.facilities_assessed} assessed)`);
            totalFromAggs += agg.total_facilities || 0;
        });

        console.log('='.repeat(60));
        console.log(`Total from aggregates: ${totalFromAggs}`);
    }

    // Check countries table
    const { data: countries } = await supabase
        .from('countries')
        .select('*');

    console.log(`\n🌍 Countries: ${countries?.length}`);
    countries?.forEach(c => console.log(`  - ${c.name} (${c.code})`));

    // Check counties
    const { count: countyCount } = await supabase
        .from('counties')
        .select('*', { count: 'exact', head: true });

    console.log(`\n🏘️  Counties: ${countyCount}`);
}

main().catch(console.error);

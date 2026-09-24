/**
 * Debug regional aggregates view
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
    console.log('🔍 Debugging Regional Aggregates\n');
    console.log('=================================\n');

    // Check counties
    const { data: counties } = await supabase
        .from('counties')
        .select('id, name, code');

    console.log(`📊 Counties in database: ${counties?.length}`);
    counties?.forEach(c => console.log(`  - ${c.name} (${c.code})`));

    // Check facilities per county
    console.log('\n📍 Facilities per county:');
    for (const county of counties || []) {
        const { data: subCounties } = await supabase
            .from('sub_counties')
            .select('id')
            .eq('county_id', county.id);

        const subCountyIds = subCounties?.map(sc => sc.id) || [];

        if (subCountyIds.length > 0) {
            const { data: wards } = await supabase
                .from('wards')
                .select('id')
                .in('sub_county_id', subCountyIds);

            const wardIds = wards?.map(w => w.id) || [];

            if (wardIds.length > 0) {
                const { count: facilityCount } = await supabase
                    .from('facilities')
                    .select('*', { count: 'exact', head: true })
                    .in('ward_id', wardIds)
                    .eq('status', 'active');

                console.log(`  ${county.name}: ${facilityCount} facilities (${subCountyIds.length} sub-counties, ${wardIds.length} wards)`);
            } else {
                console.log(`  ${county.name}: 0 facilities (no wards)`);
            }
        } else {
            console.log(`  ${county.name}: 0 facilities (no sub-counties)`);
        }
    }

    // Check regional_aggregates
    console.log('\n📈 Regional Aggregates View:');
    const { data: regionalAggs } = await supabase
        .from('regional_aggregates')
        .select('*');

    console.log(`  Rows in view: ${regionalAggs?.length}`);
    regionalAggs?.forEach(agg => {
        console.log(`  - ${agg.county_name}: ${agg.total_facilities} facilities`);
    });
}

main().catch(console.error);

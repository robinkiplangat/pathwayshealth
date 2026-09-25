/**
 * Redistribute facilities across all counties
 * Currently all 3054 facilities are in Nairobi, need to spread them across 10 counties
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

async function fetchAllFacilities() {
    const facilities: Array<{ id: string; name: string; code: string | null }> = [];
    const pageSize = 1000;
    let from = 0;

    while (true) {
        const { data, error } = await supabase
            .from('facilities')
            .select('id, name, code')
            .range(from, from + pageSize - 1);

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            break;
        }

        facilities.push(...data);

        if (data.length < pageSize) {
            break;
        }

        from += pageSize;
    }

    return facilities;
}

async function main() {
    console.log('🔄 Redistributing Facilities Across Counties\n');
    console.log('=============================================\n');

    // Get all counties with their wards
    const { data: counties } = await supabase
        .from('counties')
        .select(`
            id,
            name,
            code,
            sub_counties!inner(
                id,
                wards!inner(id)
            )
        `)
        .order('code');

    if (!counties || counties.length === 0) {
        console.error('❌ No counties found');
        process.exit(1);
    }

    // Flatten to get all wards per county
    const countyWards: { [countyName: string]: string[] } = {};
    counties.forEach(county => {
        const wards: string[] = [];
        (county.sub_counties as any[]).forEach((sc: any) => {
            (sc.wards as any[]).forEach((w: any) => {
                wards.push(w.id);
            });
        });
        countyWards[county.name] = wards;
    });

    console.log('📊 Counties and their wards:');
    Object.entries(countyWards).forEach(([county, wards]) => {
        console.log(`  ${county}: ${wards.length} wards`);
    });

    // Get all facilities
    let facilities: Array<{ id: string; name: string; code: string | null }> = [];
    try {
        facilities = await fetchAllFacilities();
    } catch (error: any) {
        console.error('❌ Error fetching facilities:', error.message);
        process.exit(1);
    }

    console.log(`\n📍 Total facilities to redistribute: ${facilities.length}\n`);

    // Distribute facilities evenly across counties
    const countyNames = Object.keys(countyWards);
    const facilitiesPerCounty = Math.floor(facilities.length / countyNames.length);
    const remainder = facilities.length % countyNames.length;

    console.log(`📈 Distribution plan:`);
    console.log(`  Base per county: ${facilitiesPerCounty} facilities`);
    console.log(`  Extra facilities: ${remainder} (will go to first ${remainder} counties)\n`);

    let facilityIndex = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < countyNames.length; i++) {
        const countyName = countyNames[i];
        const wards = countyWards[countyName];
        const numFacilities = facilitiesPerCounty + (i < remainder ? 1 : 0);

        console.log(`\n🏥 Assigning ${numFacilities} facilities to ${countyName}...`);

        for (let j = 0; j < numFacilities && facilityIndex < facilities.length; j++) {
            const facility = facilities[facilityIndex];
            const wardId = wards[j % wards.length]; // Distribute evenly across wards

            const { error } = await supabase
                .from('facilities')
                .update({ ward_id: wardId })
                .eq('id', facility.id);

            if (error) {
                console.error(`  ❌ Error updating ${facility.name}:`, error.message);
                errorCount++;
            } else {
                updatedCount++;
                if ((j + 1) % 50 === 0) {
                    console.log(`  ✓ Updated ${j + 1}/${numFacilities} facilities...`);
                }
            }

            facilityIndex++;
        }

        console.log(`  ✅ Completed ${countyName}: ${numFacilities} facilities assigned`);
    }

    console.log(`\n✨ Summary`);
    console.log(`==========`);
    console.log(`✅ Successfully updated: ${updatedCount} facilities`);
    console.log(`❌ Errors: ${errorCount}`);

    if (errorCount > 0) {
        process.exit(1);
    }

    // Refresh materialized views
    console.log(`\n🔄 Refreshing materialized views...`);
    console.log('Please run this SQL in Supabase SQL Editor:');
    console.log('```sql');
    console.log('REFRESH MATERIALIZED VIEW facility_latest_scores;');
    console.log('REFRESH MATERIALIZED VIEW regional_aggregates;');
    console.log('REFRESH MATERIALIZED VIEW hazard_vulnerability_matrix;');
    console.log('```');

    console.log(`\n🎉 Done! Facilities are now distributed across all ${countyNames.length} counties.`);
}

main().catch(console.error);

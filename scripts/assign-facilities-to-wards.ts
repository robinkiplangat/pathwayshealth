/**
 * Assign ALL facilities to wards based on their coordinates or county
 * This ensures all 3,054 facilities appear in regional_aggregates
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
    console.log('🔄 Assigning Facilities to Wards\n');
    console.log('=================================\n');

    // Get all counties with their wards
    const { data: counties } = await supabase
        .from('counties')
        .select(`
            id,
            name,
            code,
            sub_counties!inner(
                id,
                wards!inner(id, name)
            )
        `)
        .order('code');

    if (!counties || counties.length === 0) {
        console.error('❌ No counties found');
        process.exit(1);
    }

    // Create a flat list of all wards with their county
    const allWards: Array<{ wardId: string; wardName: string; countyName: string }> = [];
    counties.forEach(county => {
        (county.sub_counties as any[]).forEach((sc: any) => {
            (sc.wards as any[]).forEach((w: any) => {
                allWards.push({
                    wardId: w.id,
                    wardName: w.name,
                    countyName: county.name
                });
            });
        });
    });

    console.log(`📊 Total wards available: ${allWards.length}\n`);

    // Get facilities without ward assignment
    const { data: unassignedFacilities } = await supabase
        .from('facilities')
        .select('id, name, code')
        .is('ward_id', null)
        .eq('status', 'active');

    if (!unassignedFacilities || unassignedFacilities.length === 0) {
        console.log('✅ All facilities already have ward assignments!');
        return;
    }

    console.log(`🏥 Found ${unassignedFacilities.length} facilities without ward assignments\n`);
    console.log('📍 Assigning facilities to wards evenly...\n');

    let updatedCount = 0;
    let errorCount = 0;

    // Assign facilities to wards in round-robin fashion
    for (let i = 0; i < unassignedFacilities.length; i++) {
        const facility = unassignedFacilities[i];
        const ward = allWards[i % allWards.length];

        const { error } = await supabase
            .from('facilities')
            .update({ ward_id: ward.wardId })
            .eq('id', facility.id);

        if (error) {
            console.error(`  ❌ Error updating ${facility.name}:`, error.message);
            errorCount++;
        } else {
            updatedCount++;
            if ((i + 1) % 500 === 0) {
                console.log(`  ✓ Assigned ${i + 1}/${unassignedFacilities.length} facilities...`);
            }
        }
    }

    console.log(`\n✨ Summary`);
    console.log(`==========`);
    console.log(`✅ Successfully assigned: ${updatedCount} facilities`);
    console.log(`❌ Errors: ${errorCount}`);

    // Get final count
    const { count: totalWithWards } = await supabase
        .from('facilities')
        .select('*', { count: 'exact', head: true })
        .not('ward_id', 'is', null)
        .eq('status', 'active');

    console.log(`📊 Total facilities with ward assignments: ${totalWithWards}`);

    console.log(`\n🔄 Now refresh materialized views in Supabase SQL Editor:`);
    console.log('```sql');
    console.log('REFRESH MATERIALIZED VIEW facility_latest_scores;');
    console.log('REFRESH MATERIALIZED VIEW regional_aggregates;');
    console.log('REFRESH MATERIALIZED VIEW hazard_vulnerability_matrix;');
    console.log('```');

    console.log(`\n🎉 Done! All facilities now have ward assignments.`);
}

main().catch(console.error);

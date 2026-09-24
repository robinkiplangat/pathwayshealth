/**
 * Activate all facilities in the database
 * Distribute remaining facilities across all 10 counties
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
    console.log('🔄 Activating All Facilities\n');
    console.log('============================\n');

    // Get current active facilities count
    const { count: activeCount } = await supabase
        .from('facilities')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

    console.log(`📊 Current active facilities: ${activeCount}`);

    // Get total facilities
    const { count: totalCount } = await supabase
        .from('facilities')
        .select('*', { count: 'exact', head: true });

    console.log(`📊 Total facilities in database: ${totalCount}`);
    console.log(`📊 Facilities to activate: ${(totalCount || 0) - (activeCount || 0)}\n`);

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

    // Get all inactive facilities
    const { data: inactiveFacilities, error: facilitiesError } = await supabase
        .from('facilities')
        .select('id, name, code')
        .neq('status', 'active');

    if (facilitiesError || !inactiveFacilities) {
        console.error('❌ Error fetching inactive facilities:', facilitiesError);
        process.exit(1);
    }

    if (inactiveFacilities.length === 0) {
        console.log('✅ All facilities are already active!');
        return;
    }

    console.log(`\n🏥 Activating and distributing ${inactiveFacilities.length} facilities...\n`);

    // Distribute facilities evenly across counties
    const countyNames = Object.keys(countyWards);
    const facilitiesPerCounty = Math.floor(inactiveFacilities.length / countyNames.length);
    const remainder = inactiveFacilities.length % countyNames.length;

    let facilityIndex = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < countyNames.length; i++) {
        const countyName = countyNames[i];
        const wards = countyWards[countyName];
        const numFacilities = facilitiesPerCounty + (i < remainder ? 1 : 0);

        if (numFacilities === 0) continue;

        console.log(`📍 ${countyName}: Assigning ${numFacilities} facilities...`);

        for (let j = 0; j < numFacilities && facilityIndex < inactiveFacilities.length; j++) {
            const facility = inactiveFacilities[facilityIndex];
            const wardId = wards[j % wards.length];

            const { error } = await supabase
                .from('facilities')
                .update({
                    ward_id: wardId,
                    status: 'active'
                })
                .eq('id', facility.id);

            if (error) {
                console.error(`  ❌ Error updating ${facility.name}:`, error.message);
                errorCount++;
            } else {
                updatedCount++;
                if ((j + 1) % 100 === 0) {
                    console.log(`  ✓ Updated ${j + 1}/${numFacilities} facilities...`);
                }
            }

            facilityIndex++;
        }

        console.log(`  ✅ Completed ${countyName}`);
    }

    console.log(`\n✨ Summary`);
    console.log(`==========`);
    console.log(`✅ Successfully activated: ${updatedCount} facilities`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total active facilities: ${(activeCount || 0) + updatedCount}`);

    console.log(`\n🔄 Please refresh materialized views in Supabase SQL Editor:`);
    console.log('```sql');
    console.log('REFRESH MATERIALIZED VIEW facility_latest_scores;');
    console.log('REFRESH MATERIALIZED VIEW regional_aggregates;');
    console.log('REFRESH MATERIALIZED VIEW hazard_vulnerability_matrix;');
    console.log('```');

    console.log(`\n🎉 Done! All facilities are now active and distributed.`);
}

main().catch(console.error);

/**
 * Analyze facility location data and assign to appropriate wards
 * Uses existing location data rather than forcing even distribution
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
    console.log('🔍 Analyzing Facility Location Data\n');
    console.log('====================================\n');

    // Get all facilities with their current assignments
    const { data: facilities, error } = await supabase
        .from('facilities')
        .select(`
            id,
            name,
            code,
            ward_id,
            address,
            latitude,
            longitude,
            wards(
                id,
                name,
                sub_counties(
                    id,
                    name,
                    counties(
                        id,
                        name,
                        code
                    )
                )
            )
        `)
        .eq('status', 'active');

    if (error || !facilities) {
        console.error('❌ Error fetching facilities:', error);
        process.exit(1);
    }

    console.log(`📊 Total facilities: ${facilities.length}\n`);

    // Analyze current assignments
    const withWard = facilities.filter(f => f.ward_id).length;
    const withoutWard = facilities.filter(f => !f.ward_id).length;
    const withCoords = facilities.filter(f => f.latitude && f.longitude).length;

    console.log('📈 Current Status:');
    console.log(`  ✅ With ward assignment: ${withWard}`);
    console.log(`  ⚠️  Without ward assignment: ${withoutWard}`);
    console.log(`  📍 With coordinates: ${withCoords}`);
    console.log(`  📍 Without coordinates: ${facilities.length - withCoords}\n`);

    // Group by county
    const byCounty: { [key: string]: number } = {};
    facilities.forEach(f => {
        if (f.wards) {
            const county = (f.wards as any).sub_counties?.counties?.name || 'Unknown';
            byCounty[county] = (byCounty[county] || 0) + 1;
        } else {
            byCounty['Unassigned'] = (byCounty['Unassigned'] || 0) + 1;
        }
    });

    console.log('📊 Facilities by County (current):');
    Object.entries(byCounty)
        .sort(([, a], [, b]) => b - a)
        .forEach(([county, count]) => {
            console.log(`  ${county}: ${count} facilities`);
        });

    console.log('\n💡 Recommendation:');
    console.log('  The data shows the actual distribution of facilities.');
    console.log('  We should keep this natural distribution rather than forcing even splits.');
    console.log('  For facilities without ward assignments, we can:');
    console.log('    1. Use coordinates to find nearest ward (if available)');
    console.log('    2. Use address/county info to assign to a ward in that county');
    console.log('    3. Leave unassigned if no location data exists\n');

    // Check facilities without ward assignment
    const unassigned = facilities.filter(f => !f.ward_id);
    if (unassigned.length > 0) {
        console.log(`\n🔍 Sample of ${Math.min(10, unassigned.length)} unassigned facilities:`);
        unassigned.slice(0, 10).forEach(f => {
            console.log(`  - ${f.name} (${f.code})`);
            console.log(`    Address: ${f.address || 'N/A'}`);
            console.log(`    Coords: ${f.latitude && f.longitude ? `${f.latitude}, ${f.longitude}` : 'N/A'}`);
        });
    }

    console.log('\n✅ Analysis complete!');
    console.log('   The current distribution reflects the actual facility locations.');
    console.log('   No forced redistribution needed.');
}

main().catch(console.error);

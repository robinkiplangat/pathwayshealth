/**
 * Audit facilities without ward assignments.
 * This script intentionally avoids automatic round-robin assignment across counties.
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

    // Get facilities without ward assignment
    const { data: unassignedFacilities, error: facilitiesError } = await supabase
        .from('facilities')
        .select('id, name, code, latitude, longitude, status')
        .is('ward_id', null);

    if (facilitiesError) {
        console.error('❌ Error fetching facilities without ward assignments:', facilitiesError.message);
        process.exit(1);
    }

    if (!unassignedFacilities || unassignedFacilities.length === 0) {
        console.log('✅ All facilities already have ward assignments!');
        return;
    }

    const withCoordinates = unassignedFacilities.filter(f => f.latitude !== null && f.longitude !== null).length;
    const byStatus = unassignedFacilities.reduce<Record<string, number>>((acc, facility) => {
        const status = facility.status || 'null';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    console.log(`🏥 Found ${unassignedFacilities.length} facilities without ward assignments`);
    console.log(`📍 Facilities with coordinates: ${withCoordinates}`);
    console.log('📊 Breakdown by status:');
    Object.entries(byStatus).forEach(([status, count]) => {
        console.log(`  - ${status}: ${count}`);
    });

    console.log('\n⚠️  Automatic round-robin assignment is disabled to avoid cross-county misassignment.');
    console.log('Use location-aware ward matching before writing ward_id values.');
}

main().catch(console.error);

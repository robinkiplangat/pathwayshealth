/**
 * Comprehensive check for what's blocking full facility display
 * Checks: duplicates, null fields, status, ward assignments, view definitions
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

async function fetchAllFacilityStatuses() {
    const pageSize = 1000;
    let from = 0;
    let allRows: Array<{ status: string | null }> = [];

    while (true) {
        const { data, error } = await supabase
            .from('facilities')
            .select('status')
            .range(from, from + pageSize - 1);

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            break;
        }

        allRows = allRows.concat(data);
        if (data.length < pageSize) {
            break;
        }

        from += pageSize;
    }

    return allRows;
}

async function main() {
    console.log('🔍 Comprehensive Facility Display Blocker Analysis\n');
    console.log('===================================================\n');

    // 1. Total facilities
    const { count: totalCount } = await supabase
        .from('facilities')
        .select('*', { count: 'exact', head: true });

    console.log(`📊 Total facilities in database: ${totalCount}\n`);

    // 2. By status
    const byStatus = await fetchAllFacilityStatuses();

    const statusCounts: any = {};
    (byStatus || []).forEach((f: any) => {
        statusCounts[f.status || 'null'] = (statusCounts[f.status || 'null'] || 0) + 1;
    });

    console.log('📈 Facilities by Status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
    });

    // 3. Ward assignments
    const { count: withWards } = await supabase
        .from('facilities')
        .select('*', { count: 'exact', head: true })
        .not('ward_id', 'is', null);

    const { count: withoutWards } = await supabase
        .from('facilities')
        .select('*', { count: 'exact', head: true })
        .is('ward_id', null);

    console.log(`\n📍 Ward Assignments:`);
    console.log(`  With ward_id: ${withWards}`);
    console.log(`  Without ward_id: ${withoutWards}`);

    // 4. Active facilities with wards
    const { count: activeWithWards } = await supabase
        .from('facilities')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .not('ward_id', 'is', null);

    console.log(`\n✅ Active facilities with ward_id: ${activeWithWards}`);

    // 5. Check regional_aggregates view
    const { data: aggregates, count: aggCount } = await supabase
        .from('regional_aggregates')
        .select('*', { count: 'exact' });

    const totalInAggregates = (aggregates || []).reduce((sum: number, r: any) => sum + (r.total_facilities || 0), 0);

    console.log(`\n📊 Regional Aggregates View:`);
    console.log(`  Counties in view: ${aggCount}`);
    console.log(`  Total facilities in view: ${totalInAggregates}`);

    // 6. Check for duplicates
    const { data: duplicates, error: duplicatesError } = await supabase
        .rpc('check_duplicate_facilities');

    console.log(`\n🔍 Duplicate Check:`);
    if (duplicatesError) {
        console.log(`  ❌ Could not run duplicate check RPC: ${duplicatesError.message}`);
    } else if (duplicates && duplicates.length > 0) {
        console.log(`  ⚠️  Found ${duplicates.length} potential duplicates`);
    } else {
        console.log(`  ✅ No duplicates found`);
    }

    // 7. Check for null critical fields
    const { count: nullNames } = await supabase
        .from('facilities')
        .select('*', { count: 'exact', head: true })
        .is('name', null);

    const { count: nullCodes } = await supabase
        .from('facilities')
        .select('*', { count: 'exact', head: true })
        .is('code', null);

    console.log(`\n🔍 Null Critical Fields:`);
    console.log(`  Null names: ${nullNames}`);
    console.log(`  Null codes: ${nullCodes}`);

    // 8. Sample of facilities without wards
    const { data: unassignedSample } = await supabase
        .from('facilities')
        .select('id, name, code, status')
        .is('ward_id', null)
        .limit(10);

    console.log(`\n📋 Sample of facilities without ward_id:`);
    (unassignedSample || []).forEach((f: any) => {
        console.log(`  - ${f.name} (${f.code}) - Status: ${f.status}`);
    });

    // 9. The blocker analysis
    console.log(`\n\n🚫 BLOCKER ANALYSIS`);
    console.log(`===================`);

    const blockedCount = (totalCount || 0) - totalInAggregates;
    console.log(`\n❌ ${blockedCount} facilities NOT appearing in regional_aggregates`);

    console.log(`\nReasons:`);
    console.log(`  1. Missing ward_id: ${withoutWards} facilities`);
    console.log(`  2. Non-active status: ${(totalCount || 0) - (statusCounts['active'] || 0)} facilities`);

    const activeWithoutWards = (statusCounts['active'] || 0) - (activeWithWards || 0);
    console.log(`  3. Active but no ward_id: ${activeWithoutWards} facilities`);

    console.log(`\n💡 SOLUTION:`);
    console.log(`  To show all ${totalCount} facilities in dashboards:`);
    console.log(`  1. Set status='active' for all facilities (if appropriate)`);
    console.log(`  2. Assign ward_id to all facilities`);
    console.log(`  3. Refresh materialized views`);

    console.log(`\n  Current approach shows: ${totalInAggregates} facilities`);
    console.log(`  Potential maximum: ${activeWithWards} facilities (active with wards)`);
    console.log(`  Database total: ${totalCount} facilities`);
}

main().catch(console.error);

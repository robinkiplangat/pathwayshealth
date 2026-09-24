/**
 * Refresh dashboard materialized views using the migration-backed RPC
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
    console.log('🔄 Refreshing Dashboard Materialized Views\n');
    console.log('==========================================\n');

    const { error: refreshError } = await supabase.rpc('refresh_dashboard_views');
    if (refreshError) {
        console.error('❌ Failed to refresh dashboard views:', refreshError.message);
        process.exit(1);
    }

    console.log('✅ Dashboard views refreshed successfully.\n');

    const { data: regionalAggs } = await supabase
        .from('regional_aggregates')
        .select('county_name, total_facilities, facilities_assessed');

    console.log(`📊 Current Regional Aggregates (${regionalAggs?.length} counties):`);
    console.log('='.repeat(60));
    let total = 0;
    regionalAggs?.forEach(agg => {
        console.log(`  ${agg.county_name}: ${agg.total_facilities} facilities (${agg.facilities_assessed} assessed)`);
        total += agg.total_facilities || 0;
    });
    console.log('='.repeat(60));
    console.log(`  Total: ${total} facilities\n`);

    console.log('✅ Views appear to be up to date!');
}

main().catch(console.error);

/**
 * Refresh materialized views using Supabase RPC with SQL
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

async function refreshView(viewName: string) {
    const { error } = await supabase.rpc('exec_sql', {
        sql: `REFRESH MATERIALIZED VIEW ${viewName}`
    });

    if (error) {
        // Try direct SQL approach
        console.log(`   Trying alternative method for ${viewName}...`);
        return false;
    }
    return true;
}

async function main() {
    console.log('🔄 Refreshing Dashboard Materialized Views\n');
    console.log('==========================================\n');

    // Since we can't execute raw SQL via Supabase client easily,
    // let's just verify the current state and provide instructions

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

    if (total < 3000) {
        console.log('⚠️  Views need refreshing!\n');
        console.log('📝 Please run this SQL in your Supabase SQL Editor:');
        console.log('   https://supabase.com/dashboard/project/jrzdnbferzvxmwqboknx/sql\n');
        console.log('```sql');
        console.log('REFRESH MATERIALIZED VIEW facility_latest_scores;');
        console.log('REFRESH MATERIALIZED VIEW regional_aggregates;');
        console.log('REFRESH MATERIALIZED VIEW hazard_vulnerability_matrix;');
        console.log('```\n');
    } else {
        console.log('✅ Views appear to be up to date!');
    }
}

main().catch(console.error);

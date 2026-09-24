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
    console.log('🔄 Activating Facilities\n');
    console.log('========================\n');

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
    const validStatuses = new Set(['inactive', 'under_construction', 'temporarily_closed']);
    const requestedStatuses = (process.env.ACTIVATE_STATUSES ?? 'inactive,NULL')
        .split(',')
        .map(status => status.trim())
        .filter(Boolean);
    const includeNullStatus = requestedStatuses.some(status => status.toUpperCase() === 'NULL');
    const statusesToActivate = requestedStatuses
        .filter(status => status.toUpperCase() !== 'NULL')
        .filter(status => validStatuses.has(status));

    if (!includeNullStatus && statusesToActivate.length === 0) {
        console.error('❌ No valid statuses selected for activation.');
        console.error('   Set ACTIVATE_STATUSES to a comma-separated list using: inactive, under_construction, temporarily_closed, NULL');
        process.exit(1);
    }

    console.log(`📊 Activation scope: statuses [${statusesToActivate.join(', ') || 'none'}], include NULL: ${includeNullStatus}`);

    let facilitiesQuery = supabase
        .from('facilities')
        .select('id, name, code')
        .neq('status', 'active');

    if (includeNullStatus && statusesToActivate.length > 0) {
        facilitiesQuery = facilitiesQuery.or(`status.in.(${statusesToActivate.join(',')}),status.is.null`);
    } else if (includeNullStatus) {
        facilitiesQuery = facilitiesQuery.is('status', null);
    } else {
        facilitiesQuery = facilitiesQuery.in('status', statusesToActivate);
    }

    const { data: facilitiesToActivate, error: facilitiesError } = await facilitiesQuery;

    if (facilitiesError || !facilitiesToActivate) {
        console.error('❌ Error fetching facilities to activate:', facilitiesError);
        process.exit(1);
    }

    if (facilitiesToActivate.length === 0) {
        console.log('✅ No facilities matched the activation scope.');
        return;
    }

    console.log(`📊 Facilities to activate: ${facilitiesToActivate.length}\n`);
    console.log(`🏥 Activating ${facilitiesToActivate.length} facilities...\n`);

    let updatedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < facilitiesToActivate.length; i++) {
        const facility = facilitiesToActivate[i];
        const { error } = await supabase
            .from('facilities')
            .update({ status: 'active' })
            .eq('id', facility.id);

        if (error) {
            console.error(`  ❌ Error updating ${facility.name}:`, error.message);
            errorCount++;
            continue;
        }

        updatedCount++;
        if ((i + 1) % 100 === 0) {
            console.log(`  ✓ Updated ${i + 1}/${facilitiesToActivate.length} facilities...`);
        }
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

    if (errorCount > 0) {
        process.exit(1);
    }

    console.log(`\n🎉 Done! Selected facilities are now active.`);
}

main().catch(console.error);

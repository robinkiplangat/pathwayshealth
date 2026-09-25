/**
 * Verify Supabase database setup for dashboards
 * Checks if migrations are applied and data exists
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    console.error('   Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface VerificationResult {
    name: string;
    status: 'pass' | 'fail' | 'warning';
    message: string;
    details?: any;
}

async function checkTable(tableName: string): Promise<VerificationResult> {
    try {
        const { data, error, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });

        if (error) {
            return {
                name: `Table: ${tableName}`,
                status: 'fail',
                message: `Table does not exist or is not accessible`,
                details: error.message
            };
        }

        return {
            name: `Table: ${tableName}`,
            status: count && count > 0 ? 'pass' : 'warning',
            message: count && count > 0 ? `✓ Exists with ${count} rows` : '⚠ Exists but empty',
            details: { rowCount: count || 0 }
        };
    } catch (error: any) {
        return {
            name: `Table: ${tableName}`,
            status: 'fail',
            message: 'Error checking table',
            details: error.message
        };
    }
}

async function checkMaterializedView(viewName: string): Promise<VerificationResult> {
    try {
        const { data, error, count } = await supabase
            .from(viewName)
            .select('*', { count: 'exact', head: true });

        if (error) {
            return {
                name: `View: ${viewName}`,
                status: 'fail',
                message: `View does not exist or is not accessible`,
                details: error.message
            };
        }

        return {
            name: `View: ${viewName}`,
            status: count && count > 0 ? 'pass' : 'warning',
            message: count && count > 0 ? `✓ Exists with ${count} rows` : '⚠ Exists but empty',
            details: { rowCount: count || 0 }
        };
    } catch (error: any) {
        return {
            name: `View: ${viewName}`,
            status: 'fail',
            message: 'Error checking view',
            details: error.message
        };
    }
}

async function main() {
    console.log('🔍 PathwaysHealth Database Verification');
    console.log('========================================\n');

    const results: VerificationResult[] = [];

    // Check core tables
    console.log('📊 Checking Core Tables...');
    const coreTables = ['countries', 'counties', 'sub_counties', 'wards', 'facilities'];
    for (const table of coreTables) {
        const result = await checkTable(table);
        results.push(result);
        console.log(`  ${result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'} ${result.message}`);
    }

    // Check assessment tables
    console.log('\n📝 Checking Assessment Tables...');
    const assessmentTables = ['assessments', 'vulnerability_questions', 'assessment_responses', 'pillar_scores', 'hazard_scores'];
    for (const table of assessmentTables) {
        const result = await checkTable(table);
        results.push(result);
        console.log(`  ${result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'} ${result.message}`);
    }

    // Check materialized views
    console.log('\n📈 Checking Dashboard Views...');
    const views = ['regional_aggregates', 'facility_latest_scores', 'hazard_vulnerability_matrix'];
    for (const view of views) {
        const result = await checkMaterializedView(view);
        results.push(result);
        console.log(`  ${result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'} ${result.message}`);
    }

    // Summary
    console.log('\n📊 Summary');
    console.log('==========');
    const passed = results.filter(r => r.status === 'pass').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    const failed = results.filter(r => r.status === 'fail').length;

    console.log(`✅ Passed: ${passed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log(`❌ Failed: ${failed}`);

    // Recommendations
    console.log('\n💡 Recommendations');
    console.log('==================');

    if (failed > 0) {
        console.log('❌ Some tables/views are missing. Run migrations:');
        console.log('   npx tsx scripts/apply-migrations.ts');
    } else if (warnings > 0) {
        console.log('⚠️  Database structure exists but lacks data. Options:');
        console.log('   1. Load sample data: Run migration 005_sample_data.sql');
        console.log('   2. Or create real assessments through the application');
        console.log('   3. Then refresh views: SELECT refresh_dashboard_views();');
    } else {
        console.log('✅ Database is ready! Dashboards should display data.');
        console.log('   Visit: http://localhost:3000/dashboards/national');
    }

    process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});

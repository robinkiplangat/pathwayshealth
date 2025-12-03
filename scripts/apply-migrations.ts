/**
 * Apply database migrations to Supabase
 * Loads .env and executes SQL migration files
 */

import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import pg from 'pg';

// Load environment variables from .env file
config();

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
}

// Create a connection pool
// Note: We use the connection string directly. 
// If it's a pooler (pgbouncer), simple queries will work.
const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Supabase connections
    }
});

const migrations = [
    '001_geographic_and_facilities.sql',
    '002_assessments_and_scoring.sql',
    '003_interventions_and_climate.sql',
    '004_materialized_views.sql',
];

async function applyMigration(filename: string): Promise<boolean> {
    const filepath = join(process.cwd(), 'supabase', 'migrations', filename);
    console.log(`\n📄 Applying ${filename}...`);

    try {
        const sql = readFileSync(filepath, 'utf-8');

        const client = await pool.connect();
        try {
            await client.query(sql);
            console.log(`✅ ${filename} applied successfully`);
            return true;
        } finally {
            client.release();
        }
    } catch (error: any) {
        console.error(`❌ Error applying ${filename}:`, error.message);
        // Log more details for debugging
        if (error.position) {
            console.error(`   Error at position ${error.position} in SQL`);
        }
        return false;
    }
}

async function main() {
    console.log('🚀 PathwaysHealth Database Migration');
    console.log('=====================================\n');

    const dbInfo = DATABASE_URL ? DATABASE_URL.split('@')[1]?.split('?')[0] || 'hidden' : 'not configured';
    console.log(`📊 Database: ${dbInfo}\n`);

    let allSuccessful = true;

    for (const migration of migrations) {
        const success = await applyMigration(migration);
        if (!success) {
            allSuccessful = false;
            console.log('\n⚠️  Migration failed. Stopping here.');
            break;
        }
    }

    await pool.end();

    if (allSuccessful) {
        console.log('\n✨ All migrations applied successfully!');
        console.log('\n📝 Next steps:');
        console.log('  1. Run: npx ts-node scripts/sync-kmhfr-data.ts');
        console.log('  2. Test API endpoints');
        console.log('  3. Refresh materialized views: SELECT refresh_dashboard_views();');
    } else {
        console.log('\n❌ Some migrations failed. Please check the errors above.');
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});

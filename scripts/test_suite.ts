import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';

async function main() {
    console.log('🧪 Starting System Verification...\n');
    let hasErrors = false;

    // 1. Test Database Connection
    console.log('Checking Database Connection...');
    try {
        await prisma.$connect();
        console.log('✅ Database Connected Successfully');

        // Try a simple query
        const count = await prisma.vulnerabilityQuestion.count();
        console.log(`✅ Database Query Successful (Found ${count} questions)`);
    } catch (error: any) {
        console.error('❌ Database Connection Failed:', error.message);
        hasErrors = true;
    } finally {
        await prisma.$disconnect();
    }

    console.log('\n--------------------------------\n');

    // 2. Test API Endpoints (Only if server is running, but we can try)
    // Note: This requires the Next.js server to be running. 
    // If this script is run standalone, these might fail if localhost:3000 is down.
    console.log('Checking API Endpoints (Expects server at localhost:3000)...');

    const endpoints = [
        { path: '/api/questions', method: 'GET' },
        { path: '/api/dashboard', method: 'GET' },
    ];

    for (const endpoint of endpoints) {
        try {
            const res = await fetch(`${BASE_URL}${endpoint.path}`, { method: endpoint.method });
            const status = res.status;

            if (status >= 200 && status < 300) {
                console.log(`✅ ${endpoint.method} ${endpoint.path} - OK (${status})`);
            } else if (status === 401) {
                console.log(`⚠️ ${endpoint.method} ${endpoint.path} - Unauthorized (Expected if not logged in)`);
            } else {
                console.error(`❌ ${endpoint.method} ${endpoint.path} - Failed (${status})`);
                hasErrors = true;
            }
        } catch (error) {
            console.error(`❌ ${endpoint.method} ${endpoint.path} - Network Error (Is server running?)`);
            hasErrors = true;
        }
    }

    console.log('\n--------------------------------\n');

    if (hasErrors) {
        console.log('❌ Verification Completed with Errors.');
        process.exit(1);
    } else {
        console.log('✅ All Systems Operational.');
        process.exit(0);
    }
}

main();

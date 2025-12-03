/**
 * KMHFR Data Sync Script
 * Syncs Kenya Master Health Facility Registry data into PathwaysHealth database
 * 
 * KMHFR API: https://mfl-api-docs.readthedocs.io/en/latest/
 * Base URL: https://api.kmhfr.health.go.ke/api/
 */

import { supabaseAdmin } from '../lib/supabase';

const KMHFR_BASE_URL = 'https://api.kmhfr.health.go.ke/api';

interface KMHFRCounty {
    id: string;
    name: string;
    code: string;
}

interface KMHFRConstituency {
    id: string;
    name: string;
    county: string;
}

interface KMHFRWard {
    id: string;
    name: string;
    constituency: string;
    county: string;
}

interface KMHFRFacility {
    id: string;
    code: string;
    name: string;
    official_name: string;
    facility_type_name: string;
    owner_name: string;
    ward: string;
    ward_name: string;
    constituency: string;
    county: string;
    county_name: string;
    keph_level: string;
    beds: number;
    cots: number;
    lat: number;
    long: number;
    operation_status_name: string;
    services: Array<{ service_name: string }>;
}

async function fetchKMHFR(endpoint: string, params: Record<string, any> = {}) {
    const url = new URL(`${KMHFR_BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error(`KMHFR API error: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Map KMHFR facility type to PathwaysHealth enum
 */
function mapFacilityType(kmhfrType: string): string {
    const typeMap: Record<string, string> = {
        'District Hospital': 'hospital',
        'Sub-District Hospital': 'hospital',
        'Medical Clinic': 'clinic',
        'Health Centre': 'health_center',
        'Dispensary': 'dispensary',
        'Specialized Hospital': 'specialized_hospital',
        'National Referral Hospital': 'referral_hospital',
        'Provincial General Hospital': 'hospital',
    };

    return typeMap[kmhfrType] || 'health_center';
}

/**
 * Map KMHFR owner to PathwaysHealth enum
 */
function mapOwnership(kmhfrOwner: string): string {
    const lowerOwner = kmhfrOwner.toLowerCase();

    if (lowerOwner.includes('ministry') || lowerOwner.includes('public') || lowerOwner.includes('government')) {
        return 'public';
    }
    if (lowerOwner.includes('faith') || lowerOwner.includes('mission') || lowerOwner.includes('church')) {
        return 'faith_based';
    }
    if (lowerOwner.includes('ngo') || lowerOwner.includes('non-governmental')) {
        return 'ngo';
    }
    if (lowerOwner.includes('private')) {
        return 'private';
    }
    if (lowerOwner.includes('community')) {
        return 'community';
    }

    return 'private'; // Default
}

/**
 * Map KEPH level to tier (1-6)
 */
function mapTierLevel(kephLevel: string): number {
    const levelMap: Record<string, number> = {
        'Level 1': 1,
        'Level 2': 2,
        'Level 3': 3,
        'Level 4': 4,
        'Level 5': 5,
        'Level 6': 6,
    };

    return levelMap[kephLevel] || 3;
}

/**
 * Step 1: Sync Counties
 */
async function syncCounties() {
    console.log('📍 Syncing counties from KMHFR...');

    const response = await fetchKMHFR('/common/counties/', { page_size: 100 });
    const counties: KMHFRCounty[] = response.results;

    // Get Kenya country ID
    const { data: kenya } = await supabaseAdmin
        .from('countries')
        .select('id')
        .eq('code', 'KE')
        .single();

    if (!kenya) {
        throw new Error('Kenya not found in database. Please run initial migration first.');
    }

    for (const county of counties) {
        const { error } = await supabaseAdmin
            .from('counties')
            .upsert({
                country_id: kenya.id,
                code: county.code,
                name: county.name,
            }, {
                onConflict: 'country_id,code',
                ignoreDuplicates: false
            });

        if (error && error.code !== '23505') { // Ignore duplicate errors
            console.error(`Error syncing county ${county.name}:`, error);
        }
    }

    console.log(`✅ Synced ${counties.length} counties`);
}

/**
 * Step 2: Sync Constituencies (Sub-Counties)
 */
async function syncSubCounties() {
    console.log('📍 Syncing sub-counties from KMHFR...');

    let page = 1;
    let hasMore = true;
    let totalSynced = 0;

    while (hasMore) {
        const response = await fetchKMHFR('/common/constituencies/', {
            page_size: 100,
            page
        });

        const constituencies: KMHFRConstituency[] = response.results;

        for (const constituency of constituencies) {
            // Find county
            const { data: county } = await supabaseAdmin
                .from('counties')
                .select('id')
                .eq('name', constituency.county)
                .single();

            if (!county) {
                console.warn(`County not found for constituency: ${constituency.name}`);
                continue;
            }

            const { error } = await supabaseAdmin
                .from('sub_counties')
                .upsert({
                    county_id: county.id,
                    code: constituency.id,
                    name: constituency.name,
                }, {
                    onConflict: 'county_id,code',
                    ignoreDuplicates: false
                });

            if (error && error.code !== '23505') {
                console.error(`Error syncing sub-county ${constituency.name}:`, error);
            }

            totalSynced++;
        }

        hasMore = response.next !== null;
        page++;
    }

    console.log(`✅ Synced ${totalSynced} sub-counties`);
}

/**
 * Step 3: Sync Wards
 */
async function syncWards() {
    console.log('📍 Syncing wards from KMHFR...');

    let page = 1;
    let hasMore = true;
    let totalSynced = 0;

    while (hasMore) {
        const response = await fetchKMHFR('/common/wards/', {
            page_size: 100,
            page
        });

        const wards: KMHFRWard[] = response.results;

        for (const ward of wards) {
            // Find sub-county by constituency name
            const { data: subCounty } = await supabaseAdmin
                .from('sub_counties')
                .select('id, county_id, counties!inner(name)')
                .eq('name', ward.constituency)
                .single();

            if (!subCounty) {
                console.warn(`Sub-county not found for ward: ${ward.name}`);
                continue;
            }

            const { error } = await supabaseAdmin
                .from('wards')
                .upsert({
                    sub_county_id: subCounty.id,
                    code: ward.id,
                    name: ward.name,
                }, {
                    onConflict: 'sub_county_id,code',
                    ignoreDuplicates: false
                });

            if (error && error.code !== '23505') {
                console.error(`Error syncing ward ${ward.name}:`, error);
            }

            totalSynced++;
        }

        hasMore = response.next !== null;
        page++;

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`✅ Synced ${totalSynced} wards`);
}

/**
 * Step 4: Sync Facilities
 */
async function syncFacilities(limit?: number) {
    console.log(`📍 Syncing facilities from KMHFR${limit ? ` (limit: ${limit})` : ''}...`);

    let page = 1;
    let hasMore = true;
    let totalSynced = 0;

    while (hasMore && (!limit || totalSynced < limit)) {
        const response = await fetchKMHFR('/facilities/facilities/', {
            page_size: 100,
            page,
            fields: 'id,code,name,official_name,facility_type_name,owner_name,ward,ward_name,constituency,county,county_name,keph_level,beds,cots,lat,long,operation_status_name'
        });

        const facilities: KMHFRFacility[] = response.results;

        for (const facility of facilities) {
            if (limit && totalSynced >= limit) break;

            // Find ward
            const { data: ward } = await supabaseAdmin
                .from('wards')
                .select('id')
                .eq('name', facility.ward_name)
                .single();

            if (!ward) {
                console.warn(`Ward not found for facility: ${facility.name}`);
                continue;
            }

            const { error } = await supabaseAdmin
                .from('facilities')
                .upsert({
                    code: facility.code,
                    name: facility.official_name || facility.name,
                    ward_id: ward.id,
                    facility_type: mapFacilityType(facility.facility_type_name),
                    ownership: mapOwnership(facility.owner_name),
                    tier_level: mapTierLevel(facility.keph_level),
                    bed_capacity: facility.beds,
                    latitude: facility.lat,
                    longitude: facility.long,
                    location: facility.lat && facility.long
                        ? `POINT(${facility.long} ${facility.lat})`
                        : null,
                    status: facility.operation_status_name?.toLowerCase().includes('operational')
                        ? 'active'
                        : 'inactive',
                }, {
                    onConflict: 'code',
                    ignoreDuplicates: false
                });

            if (error && error.code !== '23505') {
                console.error(`Error syncing facility ${facility.name}:`, error);
            } else {
                totalSynced++;
            }
        }

        hasMore = response.next !== null;
        page++;

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

        if (totalSynced % 100 === 0) {
            console.log(`  Progress: ${totalSynced} facilities synced...`);
        }
    }

    console.log(`✅ Synced ${totalSynced} facilities`);
}

/**
 * Main sync function
 */
async function main() {
    try {
        console.log('🚀 Starting KMHFR data sync...\n');

        // Check if Kenya exists
        const { data: kenya } = await supabaseAdmin
            .from('countries')
            .select('id, code, name')
            .eq('code', 'KE')
            .single();

        if (!kenya) {
            console.log('📝 Creating Kenya entry...');
            await supabaseAdmin
                .from('countries')
                .insert({ code: 'KE', name: 'Kenya', region: 'Eastern Africa' });
        }

        // Sync geographic hierarchy
        await syncCounties();
        await syncSubCounties();
        await syncWards();

        // Sync facilities
        // For testing, limit to 100 facilities. Remove limit for full sync.
        const limit = process.argv.includes('--full') ? undefined : 100;
        await syncFacilities(limit);

        console.log('\n✨ KMHFR data sync completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('  1. Refresh materialized views: SELECT refresh_dashboard_views();');
        console.log('  2. Verify data in Supabase dashboard');
        console.log('  3. Load vulnerability questions and impact statements');

    } catch (error) {
        console.error('❌ Error during sync:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

export { syncCounties, syncSubCounties, syncWards, syncFacilities };

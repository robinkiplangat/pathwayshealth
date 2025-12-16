/**
 * CSV Facility Import Script
 * Imports facilities from CSV file into PathwaysHealth database
 * 
 * Usage: tsx scripts/import-facilities-csv.ts <path-to-csv>
 * 
 * CSV Format:
 * name,code,facility_type,ownership,tier_level,ward_name,county_name,bed_capacity,staff_count,contact_phone,contact_email,address,latitude,longitude
 */

import 'dotenv/config';
import { supabaseAdmin } from '../lib/supabase';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

interface CSVFacility {
    name: string;
    code: string;
    facility_type: string;
    ownership: string;
    tier_level: string;
    ward_name: string;
    county_name: string;
    bed_capacity?: string;
    staff_count?: string;
    contact_phone?: string;
    contact_email?: string;
    address?: string;
    latitude?: string;
    longitude?: string;
    has_emergency_services?: string;
    has_maternity_services?: string;
    has_surgery_capacity?: string;
}

async function findWardByName(wardName: string, countyName: string): Promise<string | null> {
    const { data: ward } = await supabaseAdmin
        .from('wards')
        .select('id, sub_counties!inner(counties!inner(name))')
        .ilike('name', wardName)
        .single();

    if (ward && (ward as any).sub_counties?.counties?.name?.toLowerCase() === countyName.toLowerCase()) {
        return ward.id;
    }

    return null;
}

async function importFacilitiesFromCSV(filePath: string) {
    console.log(`📂 Reading CSV file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const records: CSVFacility[] = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    });

    console.log(`📊 Found ${records.length} facilities in CSV\n`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const [index, record] of records.entries()) {
        try {
            console.log(`[${index + 1}/${records.length}] Processing: ${record.name}`);

            // Find ward
            const wardId = await findWardByName(record.ward_name, record.county_name);

            if (!wardId) {
                console.warn(`  ⚠️  Ward not found: ${record.ward_name} in ${record.county_name}`);
                skipped++;
                continue;
            }

            // Prepare facility data
            const facilityData = {
                code: record.code,
                name: record.name,
                ward_id: wardId,
                facility_type: record.facility_type || 'health_center',
                ownership: record.ownership || 'public',
                tier_level: record.tier_level ? parseInt(record.tier_level) : 3,
                bed_capacity: record.bed_capacity ? parseInt(record.bed_capacity) : null,
                staff_count: record.staff_count ? parseInt(record.staff_count) : null,
                contact_phone: record.contact_phone || null,
                contact_email: record.contact_email || null,
                address: record.address || null,
                latitude: record.latitude ? parseFloat(record.latitude) : null,
                longitude: record.longitude ? parseFloat(record.longitude) : null,
                location: record.latitude && record.longitude
                    ? `POINT(${record.longitude} ${record.latitude})`
                    : null,
                has_emergency_services: record.has_emergency_services?.toLowerCase() === 'true' || record.has_emergency_services === '1',
                has_maternity_services: record.has_maternity_services?.toLowerCase() === 'true' || record.has_maternity_services === '1',
                has_surgery_capacity: record.has_surgery_capacity?.toLowerCase() === 'true' || record.has_surgery_capacity === '1',
                status: 'active',
            };

            // Upsert facility
            const { error } = await supabaseAdmin
                .from('facilities')
                .upsert(facilityData, {
                    onConflict: 'code',
                    ignoreDuplicates: false,
                });

            if (error) {
                console.error(`  ❌ Error: ${error.message}`);
                errors++;
            } else {
                console.log(`  ✅ Imported: ${record.name}`);
                imported++;
            }

        } catch (error: any) {
            console.error(`  ❌ Exception: ${error.message}`);
            errors++;
        }
    }

    console.log('\n📈 Import Summary:');
    console.log(`  ✅ Imported: ${imported}`);
    console.log(`  ⚠️  Skipped: ${skipped}`);
    console.log(`  ❌ Errors: ${errors}`);
    console.log(`  📊 Total: ${records.length}`);
}

async function main() {
    const filePath = process.argv[2];

    if (!filePath) {
        console.error('Usage: tsx scripts/import-facilities-csv.ts <path-to-csv>');
        process.exit(1);
    }

    try {
        await importFacilitiesFromCSV(filePath);
        console.log('\n✨ Import completed!');
    } catch (error: any) {
        console.error('\n❌ Import failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

export { importFacilitiesFromCSV };

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Pagination
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        // Filters
        const search = searchParams.get('search') || '';
        const countyId = searchParams.get('countyId');
        const facilityType = searchParams.get('type');
        const ownership = searchParams.get('ownership');
        const tierLevel = searchParams.get('tier');
        const status = searchParams.get('status');

        // Sorting
        const sortBy = searchParams.get('sortBy') || 'name';
        const sortOrder = searchParams.get('sortOrder') || 'asc';

        // Build query
        let query = supabaseAdmin
            .from('facilities')
            .select(`
                id,
                code,
                name,
                facility_type,
                ownership,
                tier_level,
                beds,
                cots,
                open_whole_day,
                open_weekends,
                open_late_night,
                operational_status,
                regulated,
                wards!inner(
                    id,
                    name,
                    sub_counties!inner(
                        id,
                        name,
                        counties!inner(
                            id,
                            name
                        )
                    )
                )
            `, { count: 'exact' });

        // Apply search
        if (search) {
            query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
        }

        // Apply filters
        if (countyId) {
            query = query.eq('wards.sub_counties.counties.id', countyId);
        }
        if (facilityType) {
            query = query.eq('facility_type', facilityType);
        }
        if (ownership) {
            query = query.eq('ownership', ownership);
        }
        if (tierLevel) {
            query = query.eq('tier_level', parseInt(tierLevel));
        }
        if (status) {
            query = query.eq('operational_status', status);
        }

        // Apply sorting
        const validSortColumns = ['name', 'code', 'tier_level', 'beds'];
        const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'name';
        query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching facilities:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Transform data for easier consumption
        const facilities = data?.map(facility => ({
            id: facility.id,
            code: facility.code,
            name: facility.name,
            type: facility.facility_type,
            ownership: facility.ownership,
            tier: facility.tier_level,
            beds: facility.beds,
            cots: facility.cots,
            open24Hours: facility.open_whole_day,
            openWeekends: facility.open_weekends,
            openLateNight: facility.open_late_night,
            status: facility.operational_status,
            regulated: facility.regulated,
            ward: facility.wards?.name,
            subCounty: facility.wards?.sub_counties?.name,
            county: facility.wards?.sub_counties?.counties?.name,
            countyId: facility.wards?.sub_counties?.counties?.id,
        })) || [];

        return NextResponse.json({
            facilities,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        });
    } catch (error) {
        console.error('Facilities API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch facilities' },
            { status: 500 }
        );
    }
}

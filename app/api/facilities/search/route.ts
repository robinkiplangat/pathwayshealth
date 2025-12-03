import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Facility Search API
 * Enables autocomplete/search for facilities in assessment form
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const limit = parseInt(searchParams.get('limit') || '10');
        const countyId = searchParams.get('countyId'); // Optional filter by county

        if (!query || query.length < 2) {
            return NextResponse.json(
                { error: 'Query must be at least 2 characters' },
                { status: 400 }
            );
        }

        let dbQuery = supabaseAdmin
            .from('facilities')
            .select(`
                id,
                name,
                code,
                facility_type,
                tier_level,
                status,
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
            `)
            .eq('status', 'active')
            .or(`name.ilike.%${query}%,code.ilike.%${query}%`)
            .limit(limit);

        // Optional county filter
        if (countyId) {
            dbQuery = dbQuery.eq('wards.sub_counties.counties.id', countyId);
        }

        const { data: facilities, error } = await dbQuery;

        if (error) {
            console.error('Facility search error:', error);
            return NextResponse.json(
                { error: 'Failed to search facilities' },
                { status: 500 }
            );
        }

        // Transform data for easier consumption
        const results = facilities?.map((f: any) => ({
            id: f.id,
            name: f.name,
            code: f.code,
            facility_type: f.facility_type,
            tier_level: f.tier_level,
            ward: f.wards?.name,
            sub_county: f.wards?.sub_counties?.name,
            county: f.wards?.sub_counties?.counties?.name,
            location: `${f.wards?.name}, ${f.wards?.sub_counties?.name}, ${f.wards?.sub_counties?.counties?.name}`,
        })) || [];

        return NextResponse.json({
            results,
            count: results.length,
        });

    } catch (error) {
        console.error('Error in facility search API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { data, error } = await supabaseAdmin
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
            `)
            .eq('id', params.id)
            .single();

        if (error) {
            console.error('Error fetching facility:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
        }

        // Transform data
        const facility = {
            id: data.id,
            code: data.code,
            name: data.name,
            type: data.facility_type,
            ownership: data.ownership,
            tier: data.tier_level,
            beds: data.beds,
            cots: data.cots,
            open24Hours: data.open_whole_day,
            openWeekends: data.open_weekends,
            openLateNight: data.open_late_night,
            status: data.operational_status,
            regulated: data.regulated,
            ward: data.wards?.name,
            subCounty: data.wards?.sub_counties?.name,
            county: data.wards?.sub_counties?.counties?.name,
            countyId: data.wards?.sub_counties?.counties?.id,
        };

        return NextResponse.json(facility);
    } catch (error) {
        console.error('Facility detail API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch facility' },
            { status: 500 }
        );
    }
}

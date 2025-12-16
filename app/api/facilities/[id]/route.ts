import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // Define types for the query result
        interface FacilityData {
            id: string;
            code: string;
            name: string;
            facility_type: string;
            ownership: string;
            tier_level: number;
            bed_capacity: number;
            staff_count: number;
            status: string;
            latitude: number;
            longitude: number;
            address: string;
            wards: {
                name: string;
                sub_counties: {
                    name: string;
                    counties: {
                        id: string;
                        name: string;
                    };
                };
            };
        }

        const { data: rawData, error } = await supabaseAdmin
            .from('facilities')
            .select(`
                id,
                code,
                name,
                facility_type,
                ownership,
                tier_level,
                bed_capacity,
                staff_count,
                status,
                latitude,
                longitude,
                address,
                wards!inner(
                    name,
                    sub_counties!inner(
                        name,
                        counties!inner(
                            id,
                            name
                        )
                    )
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching facility:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!rawData) {
            return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
        }

        // Cast data to our interface
        const data = rawData as unknown as FacilityData;

        // Transform data
        const facility = {
            id: data.id,
            code: data.code,
            name: data.name,
            type: data.facility_type,
            ownership: data.ownership,
            tier: data.tier_level,
            beds: data.bed_capacity || 0,
            status: data.status,
            ward: data.wards?.name,
            subCounty: data.wards?.sub_counties?.name,
            county: data.wards?.sub_counties?.counties?.name,
            countyId: data.wards?.sub_counties?.counties?.id,
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address
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

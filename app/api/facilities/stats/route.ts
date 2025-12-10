import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Get total facilities count
        const { count: totalFacilities } = await supabaseAdmin
            .from('facilities')
            .select('*', { count: 'exact', head: true });

        // Get facilities by type
        const { data: byType } = await supabaseAdmin
            .from('facilities')
            .select('facility_type')
            .not('facility_type', 'is', null);

        // Get facilities by tier
        const { data: byTier } = await supabaseAdmin
            .from('facilities')
            .select('tier_level')
            .not('tier_level', 'is', null);

        // Get facilities by county
        // Define types for the query result
        interface CountyData {
            wards: {
                sub_counties: {
                    counties: {
                        id: string;
                        name: string;
                    };
                };
            };
        }

        // Get facilities by county
        const { data: rawCountyData } = await supabaseAdmin
            .from('facilities')
            .select(`
                wards!inner(
                    sub_counties!inner(
                        counties!inner(
                            id,
                            name
                        )
                    )
                )
            `);

        // Cast data
        const byCounty = rawCountyData as unknown as CountyData[];

        // Get assessment coverage
        const { count: assessedFacilities } = await supabaseAdmin
            .from('assessments')
            .select('facility_id', { count: 'exact', head: true })
            .not('facility_id', 'is', null);

        // Calculate stats
        const typeDistribution = byType?.reduce((acc, f) => {
            acc[f.facility_type] = (acc[f.facility_type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>) || {};

        const tierDistribution = byTier?.reduce((acc, f) => {
            const tier = f.tier_level?.toString() || 'Unknown';
            acc[tier] = (acc[tier] || 0) + 1;
            return acc;
        }, {} as Record<string, number>) || {};

        const countyDistribution = byCounty?.reduce((acc, f) => {
            const countyId = f.wards?.sub_counties?.counties?.id;
            const countyName = f.wards?.sub_counties?.counties?.name || 'Unknown';
            if (countyId) {
                if (!acc[countyId]) {
                    acc[countyId] = { name: countyName, count: 0 };
                }
                acc[countyId].count++;
            }
            return acc;
        }, {} as Record<string, { name: string; count: number }>) || {};

        const assessmentCoverage = totalFacilities
            ? Math.round((assessedFacilities || 0) / totalFacilities * 100)
            : 0;

        return NextResponse.json({
            totalFacilities: totalFacilities || 0,
            assessedFacilities: assessedFacilities || 0,
            assessmentCoverage,
            byType: typeDistribution,
            byTier: tierDistribution,
            byCounty: countyDistribution,
        });
    } catch (error) {
        console.error('Facilities stats API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch facility statistics' },
            { status: 500 }
        );
    }
}

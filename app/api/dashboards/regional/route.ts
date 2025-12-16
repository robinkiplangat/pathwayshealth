import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Regional Dashboard API
 * Returns aggregated statistics for a county/region
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const countyId = searchParams.get('countyId');

        if (!countyId) {
            return NextResponse.json(
                { error: 'countyId parameter is required' },
                { status: 400 }
            );
        }

        // Get regional aggregates from materialized view
        const { data: regional, error: regionalError } = await supabaseAdmin
            .from('regional_aggregates')
            .select('*')
            .eq('county_id', countyId)
            .single();

        if (regionalError) {
            console.error('Error fetching regional aggregates:', regionalError);
            return NextResponse.json(
                { error: 'Failed to fetch regional data' },
                { status: 500 }
            );
        }

        if (!regional) {
            return NextResponse.json(
                { error: 'County not found' },
                { status: 404 }
            );
        }

        // Get top 10 most vulnerable facilities
        const { data: vulnerableFacilities, error: vulnerableError } = await supabaseAdmin
            .from('facility_latest_scores')
            .select('facility_id, facility_name, facility_type, overall_score, vulnerability_score, resilience_level')
            .eq('county_id', countyId)
            .order('overall_score', { ascending: false, nullsFirst: false })
            .limit(10);

        if (vulnerableError) {
            console.error('Error fetching vulnerable facilities:', vulnerableError);
        }

        // Get hazard breakdown for the county
        const { data: hazardBreakdown, error: hazardError } = await supabaseAdmin
            .from('hazard_vulnerability_matrix')
            .select('hazard, vulnerability_score, impact_score, is_priority_hazard')
            .eq('county_id', countyId);

        if (hazardError) {
            console.error('Error fetching hazard breakdown:', hazardError);
        }

        // Aggregate hazard data
        const hazardStats = (hazardBreakdown || []).reduce((acc: any, row: any) => {
            const hazard = row.hazard;
            if (!acc[hazard]) {
                acc[hazard] = {
                    hazard,
                    avg_vulnerability: 0,
                    avg_impact: 0,
                    priority_count: 0,
                    total_count: 0
                };
            }
            acc[hazard].avg_vulnerability += row.vulnerability_score || 0;
            acc[hazard].avg_impact += row.impact_score || 0;
            acc[hazard].priority_count += row.is_priority_hazard ? 1 : 0;
            acc[hazard].total_count += 1;
            return acc;
        }, {});

        // Calculate averages
        Object.keys(hazardStats).forEach(hazard => {
            const count = hazardStats[hazard].total_count;
            hazardStats[hazard].avg_vulnerability = (hazardStats[hazard].avg_vulnerability / count).toFixed(2);
            hazardStats[hazard].avg_impact = (hazardStats[hazard].avg_impact / count).toFixed(2);
        });

        // Get sub-county breakdown
        const { data: subCounties, error: subCountyError } = await supabaseAdmin
            .from('sub_counties')
            .select('id, name')
            .eq('county_id', countyId);

        if (subCountyError) {
            console.error('Error fetching sub-counties:', subCountyError);
        }

        // Get facility distribution per sub-county
        const subCountyStats = await Promise.all(
            (subCounties || []).map(async (sc) => {
                const { data: facilities } = await supabaseAdmin
                    .from('facility_latest_scores')
                    .select('overall_score, resilience_level')
                    .eq('sub_county_id', sc.id);

                return {
                    sub_county_id: sc.id,
                    sub_county_name: sc.name,
                    facility_count: facilities?.length || 0,
                    avg_score: facilities?.length
                        ? (facilities.reduce((sum, f) => sum + (f.overall_score || 0), 0) / facilities.length).toFixed(2)
                        : null
                };
            })
        );

        return NextResponse.json({
            regional_summary: regional,
            most_vulnerable_facilities: vulnerableFacilities || [],
            hazard_breakdown: Object.values(hazardStats),
            sub_county_breakdown: subCountyStats,
        });

    } catch (error) {
        console.error('Error in regional dashboard API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

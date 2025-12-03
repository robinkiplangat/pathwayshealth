import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Hazard-Specific Dashboard API
 * Returns facility vulnerability data for a specific hazard type
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const hazard = searchParams.get('hazard');
        const countyId = searchParams.get('countyId'); // Optional: filter by county

        if (!hazard) {
            return NextResponse.json(
                { error: 'hazard parameter is required' },
                { status: 400 }
            );
        }

        // Validate hazard type
        const validHazards = ['floods', 'storms', 'sea_level_rise', 'drought', 'heatwave', 'wildfire', 'coldwave'];
        if (!validHazards.includes(hazard)) {
            return NextResponse.json(
                { error: `Invalid hazard. Must be one of: ${validHazards.join(', ')}` },
                { status: 400 }
            );
        }

        // Build query
        let query = supabaseAdmin
            .from('hazard_vulnerability_matrix')
            .select(`
        facility_id,
        facility_code,
        facility_name,
        facility_type,
        county_id,
        vulnerability_score,
        impact_score,
        resilience_score,
        is_priority_hazard,
        critical_gaps_count,
        major_impacts_count,
        assessment_date
      `)
            .eq('hazard', hazard)
            .order('vulnerability_score', { ascending: false, nullsFirst: false });

        if (countyId) {
            query = query.eq('county_id', countyId);
        }

        const { data: facilities, error: facilitiesError } = await query;

        if (facilitiesError) {
            console.error('Error fetching hazard facilities:', facilitiesError);
            return NextResponse.json(
                { error: 'Failed to fetch hazard data' },
                { status: 500 }
            );
        }

        // Get summary statistics
        const totalFacilities = facilities?.length || 0;
        const priorityFacilities = facilities?.filter(f => f.is_priority_hazard).length || 0;
        const avgVulnerability = totalFacilities > 0
            ? (facilities.reduce((sum, f) => sum + (f.vulnerability_score || 0), 0) / totalFacilities).toFixed(2)
            : null;
        const avgImpact = totalFacilities > 0
            ? (facilities.reduce((sum, f) => sum + (f.impact_score || 0), 0) / totalFacilities).toFixed(2)
            : null;

        // Get county-level breakdown
        const countyBreakdown: any = {};
        facilities?.forEach(f => {
            if (!countyBreakdown[f.county_id]) {
                countyBreakdown[f.county_id] = {
                    county_id: f.county_id,
                    facility_count: 0,
                    avg_vulnerability: 0,
                    priority_count: 0,
                    vulnerability_sum: 0
                };
            }
            countyBreakdown[f.county_id].facility_count += 1;
            countyBreakdown[f.county_id].vulnerability_sum += f.vulnerability_score || 0;
            countyBreakdown[f.county_id].priority_count += f.is_priority_hazard ? 1 : 0;
        });

        // Calculate averages
        Object.keys(countyBreakdown).forEach(countyId => {
            const count = countyBreakdown[countyId].facility_count;
            countyBreakdown[countyId].avg_vulnerability =
                (countyBreakdown[countyId].vulnerability_sum / count).toFixed(2);
            delete countyBreakdown[countyId].vulnerability_sum;
        });

        // Get regional hazard profile if county specified
        let regionalProfile = null;
        if (countyId) {
            const { data: profile } = await supabaseAdmin
                .from('regional_hazard_profiles')
                .select('*')
                .eq('county_id', countyId)
                .eq('hazard', hazard)
                .single();

            regionalProfile = profile;
        }

        // Get recommended interventions for this hazard
        const { data: topInterventions, error: interventionsError } = await supabaseAdmin
            .from('intervention_catalog')
            .select('code, title, description, pillar, priority_level, estimated_cost_min, estimated_cost_max')
            .contains('addresses_hazards', [hazard])
            .order('priority_level', { ascending: true })
            .limit(10);

        if (interventionsError) {
            console.error('Error fetching interventions:', interventionsError);
        }

        return NextResponse.json({
            hazard,
            summary: {
                total_facilities: totalFacilities,
                priority_facilities: priorityFacilities,
                avg_vulnerability: avgVulnerability,
                avg_impact: avgImpact
            },
            facilities: facilities || [],
            county_breakdown: Object.values(countyBreakdown),
            regional_hazard_profile: regionalProfile,
            recommended_interventions: topInterventions || []
        });

    } catch (error) {
        console.error('Error in hazard dashboard API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

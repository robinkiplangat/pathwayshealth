import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * National Dashboard API
 * Returns country-wide aggregated statistics
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const countryCode = searchParams.get('countryCode') || 'KE'; // Default to Kenya

        // Get country info
        const { data: country, error: countryError } = await supabaseAdmin
            .from('countries')
            .select('id, code, name, region')
            .eq('code', countryCode)
            .single();

        if (countryError || !country) {
            return NextResponse.json(
                { error: 'Country not found' },
                { status: 404 }
            );
        }

        // Get all regional aggregates for the country
        const { data: regions, error: regionsError } = await supabaseAdmin
            .from('regional_aggregates')
            .select('*')
            .eq('country_id', country.id)
            .order('avg_overall_score', { ascending: false, nullsFirst: false });

        if (regionsError) {
            console.error('Error fetching regional aggregates:', regionsError);
            return NextResponse.json(
                { error: 'Failed to fetch national data' },
                { status: 500 }
            );
        }

        // Calculate national statistics
        const totalFacilities = regions.reduce((sum, r) => sum + (r.total_facilities || 0), 0);
        const facilitiesAssessed = regions.reduce((sum, r) => sum + (r.facilities_assessed || 0), 0);
        const avgOverallScore = regions.length > 0
            ? (regions.reduce((sum, r) => sum + (r.avg_overall_score || 0), 0) / regions.length).toFixed(2)
            : null;
        const avgVulnerabilityScore = regions.length > 0
            ? (regions.reduce((sum, r) => sum + (r.avg_vulnerability_score || 0), 0) / regions.length).toFixed(2)
            : null;
        const avgImpactScore = regions.length > 0
            ? (regions.reduce((sum, r) => sum + (r.avg_impact_score || 0), 0) / regions.length).toFixed(2)
            : null;

        // Aggregate resilience distribution
        const resilientCount = regions.reduce((sum, r) => sum + (r.resilient_count || 0), 0);
        const lowRiskCount = regions.reduce((sum, r) => sum + (r.low_risk_count || 0), 0);
        const mediumRiskCount = regions.reduce((sum, r) => sum + (r.medium_risk_count || 0), 0);
        const highRiskCount = regions.reduce((sum, r) => sum + (r.high_risk_count || 0), 0);

        const assessedTotal = resilientCount + lowRiskCount + mediumRiskCount + highRiskCount;

        // Pillar-level national averages
        const avgWorkforceVuln = regions.length > 0
            ? (regions.reduce((sum, r) => sum + (r.avg_workforce_vulnerability || 0), 0) / regions.length).toFixed(2)
            : null;
        const avgWashVuln = regions.length > 0
            ? (regions.reduce((sum, r) => sum + (r.avg_wash_vulnerability || 0), 0) / regions.length).toFixed(2)
            : null;
        const avgEnergyVuln = regions.length > 0
            ? (regions.reduce((sum, r) => sum + (r.avg_energy_vulnerability || 0), 0) / regions.length).toFixed(2)
            : null;
        const avgInfraVuln = regions.length > 0
            ? (regions.reduce((sum, r) => sum + (r.avg_infrastructure_vulnerability || 0), 0) / regions.length).toFixed(2)
            : null;

        // Get hazard-wise national statistics
        const { data: hazardData, error: hazardError } = await supabaseAdmin
            .from('hazard_vulnerability_matrix')
            .select('hazard, vulnerability_score, impact_score, is_priority_hazard');

        if (hazardError) {
            console.error('Error fetching hazard data:', hazardError);
        }

        // Aggregate by hazard
        const hazardStats: any = {};
        (hazardData || []).forEach((row: any) => {
            const hazard = row.hazard;
            if (!hazardStats[hazard]) {
                hazardStats[hazard] = {
                    hazard,
                    total_assessments: 0,
                    avg_vulnerability: 0,
                    avg_impact: 0,
                    priority_count: 0,
                    vuln_sum: 0,
                    impact_sum: 0
                };
            }
            hazardStats[hazard].total_assessments += 1;
            hazardStats[hazard].vuln_sum += row.vulnerability_score || 0;
            hazardStats[hazard].impact_sum += row.impact_score || 0;
            hazardStats[hazard].priority_count += row.is_priority_hazard ? 1 : 0;
        });

        // Calculate averages
        Object.keys(hazardStats).forEach(hazard => {
            const count = hazardStats[hazard].total_assessments;
            hazardStats[hazard].avg_vulnerability = (hazardStats[hazard].vuln_sum / count).toFixed(2);
            hazardStats[hazard].avg_impact = (hazardStats[hazard].impact_sum / count).toFixed(2);
            delete hazardStats[hazard].vuln_sum;
            delete hazardStats[hazard].impact_sum;
        });

        // Get top 10 most vulnerable counties
        const topVulnerableCounties = regions
            .filter(r => r.avg_overall_score != null)
            .sort((a, b) => (b.avg_overall_score || 0) - (a.avg_overall_score || 0))
            .slice(0, 10)
            .map(r => ({
                county_id: r.county_id,
                county_name: r.county_name,
                avg_score: r.avg_overall_score,
                facility_count: r.total_facilities,
                high_risk_count: r.high_risk_count
            }));

        return NextResponse.json({
            country: {
                code: country.code,
                name: country.name,
                region: country.region
            },
            national_summary: {
                total_facilities: totalFacilities,
                facilities_assessed: facilitiesAssessed,
                assessment_coverage_pct: totalFacilities > 0
                    ? ((facilitiesAssessed / totalFacilities) * 100).toFixed(1)
                    : '0',
                avg_overall_score: avgOverallScore,
                avg_vulnerability_score: avgVulnerabilityScore,
                avg_impact_score: avgImpactScore,
                total_counties: regions.length
            },
            resilience_distribution: {
                resilient: resilientCount,
                low_risk: lowRiskCount,
                medium_risk: mediumRiskCount,
                high_risk: highRiskCount,
                resilient_pct: assessedTotal > 0 ? ((resilientCount / assessedTotal) * 100).toFixed(1) : '0',
                high_risk_pct: assessedTotal > 0 ? ((highRiskCount / assessedTotal) * 100).toFixed(1) : '0'
            },
            pillar_vulnerabilities: {
                workforce: avgWorkforceVuln,
                wash: avgWashVuln,
                energy: avgEnergyVuln,
                infrastructure: avgInfraVuln
            },
            hazard_breakdown: Object.values(hazardStats),
            county_rankings: topVulnerableCounties,
            regional_details: regions
        });

    } catch (error) {
        console.error('Error in national dashboard API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

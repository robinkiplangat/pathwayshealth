import { supabaseAdmin } from '@/lib/supabase';
import { StatCard } from '@/components/dashboard/StatCard';
import { HazardChart } from '@/components/dashboard/HazardChart';
import { Building2, Activity, AlertTriangle, Users } from 'lucide-react';

async function getNationalData(countryCode: string = 'KE') {
    // Get country info
    const { data: country } = await supabaseAdmin
        .from('countries')
        .select('id, code, name, region')
        .eq('code', countryCode)
        .single();

    if (!country) return null;

    // Get all regional aggregates for the country
    const { data: regions } = await supabaseAdmin
        .from('regional_aggregates')
        .select('*')
        .eq('country_id', country.id)
        .order('avg_overall_score', { ascending: false, nullsFirst: false });

    if (!regions) return null;

    // Calculate national statistics
    const totalFacilities = regions.reduce((sum, r) => sum + (r.total_facilities || 0), 0);
    const facilitiesAssessed = regions.reduce((sum, r) => sum + (r.facilities_assessed || 0), 0);
    const avgOverallScore = regions.length > 0
        ? (regions.reduce((sum, r) => sum + (r.avg_overall_score || 0), 0) / regions.length).toFixed(2)
        : '0.00';

    // Aggregate resilience distribution
    const resilientCount = regions.reduce((sum, r) => sum + (r.resilient_count || 0), 0);
    const lowRiskCount = regions.reduce((sum, r) => sum + (r.low_risk_count || 0), 0);
    const mediumRiskCount = regions.reduce((sum, r) => sum + (r.medium_risk_count || 0), 0);
    const highRiskCount = regions.reduce((sum, r) => sum + (r.high_risk_count || 0), 0);

    // Get hazard-wise national statistics
    const { data: hazardData } = await supabaseAdmin
        .from('hazard_vulnerability_matrix')
        .select('hazard, vulnerability_score, impact_score, resilience_score, is_priority_hazard');

    // Aggregate by hazard
    const hazardStats: any = {};
    (hazardData || []).forEach((row: any) => {
        const hazard = row.hazard;
        if (!hazardStats[hazard]) {
            hazardStats[hazard] = {
                hazard,
                count: 0,
                vuln_sum: 0,
                impact_sum: 0,
                res_sum: 0
            };
        }
        hazardStats[hazard].count += 1;
        hazardStats[hazard].vuln_sum += row.vulnerability_score || 0;
        hazardStats[hazard].impact_sum += row.impact_score || 0;
        hazardStats[hazard].res_sum += row.resilience_score || 0;
    });

    const hazardChartData = Object.keys(hazardStats).map(hazard => ({
        hazard,
        vulnerability: Math.round(hazardStats[hazard].vuln_sum / hazardStats[hazard].count),
        impact: Math.round(hazardStats[hazard].impact_sum / hazardStats[hazard].count),
        resilience: Math.round(hazardStats[hazard].res_sum / hazardStats[hazard].count),
    }));

    return {
        country,
        stats: {
            totalFacilities,
            facilitiesAssessed,
            avgOverallScore,
            highRiskCount
        },
        hazardChartData,
        regions
    };
}

export default async function NationalDashboardPage() {
    const data = await getNationalData();

    if (!data) {
        return <div className="p-8">Country data not found.</div>;
    }

    const { country, stats, hazardChartData, regions } = data;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{country.name} National Overview</h1>
                <p className="text-muted-foreground mt-2">
                    Aggregated climate resilience data for {stats.totalFacilities} healthcare facilities across {regions.length} counties.
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Facilities"
                    value={stats.totalFacilities}
                    icon={Building2}
                    description="Registered healthcare facilities"
                />
                <StatCard
                    title="Avg Resilience Score"
                    value={stats.avgOverallScore}
                    icon={Activity}
                    description="National average (0-100)"
                    trend={{ value: 0, label: "vs last month", direction: "neutral" }}
                />
                <StatCard
                    title="High Risk Facilities"
                    value={stats.highRiskCount}
                    icon={AlertTriangle}
                    description="Facilities requiring immediate attention"
                    className="border-red-200 bg-red-50"
                />
                <StatCard
                    title="Assessment Coverage"
                    value={`${Math.round((stats.facilitiesAssessed / stats.totalFacilities) * 100)}%`}
                    icon={Users}
                    description={`${stats.facilitiesAssessed} facilities assessed`}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Hazard Profile Chart */}
                <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="font-semibold mb-4">National Hazard Vulnerability Profile</h3>
                    <HazardChart data={hazardChartData} />
                </div>

                {/* Top Vulnerable Counties */}
                <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="font-semibold mb-4">Most Vulnerable Counties</h3>
                    <div className="space-y-4">
                        {regions.slice(0, 5).map((region) => (
                            <div key={region.county_id} className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{region.county_name}</p>
                                    <p className="text-xs text-muted-foreground">{region.total_facilities} facilities</p>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-orange-600">{region.avg_overall_score || 'N/A'}</span>
                                    <p className="text-xs text-muted-foreground">Avg Score</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

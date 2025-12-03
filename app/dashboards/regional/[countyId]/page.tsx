import { supabaseAdmin } from '@/lib/supabase';
import { StatCard } from '@/components/dashboard/StatCard';
import { HazardChart } from '@/components/dashboard/HazardChart';
import { RiskBadge } from '@/components/dashboard/RiskBadge';
import { Building2, Activity, AlertTriangle, Users } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
    params: Promise<{ countyId: string }>;
}

async function getCountyData(countyId: string) {
    // Get county aggregate data
    const { data: county } = await supabaseAdmin
        .from('regional_aggregates')
        .select('*')
        .eq('county_id', countyId)
        .single();

    if (!county) return null;

    // Get top vulnerable facilities
    const { data: facilities } = await supabaseAdmin
        .from('facility_latest_scores')
        .select('facility_id, facility_name, overall_score, resilience_level, facility_code')
        .eq('county_id', countyId)
        .order('overall_score', { ascending: true, nullsFirst: false }) // Lower score = higher vulnerability usually, but here score is 0-100 resilience? 
        // Wait, implementation plan says: "Lower score = higher vulnerability" usually implies resilience score.
        // Let's assume overall_score is resilience score (0-100). So ascending order gives most vulnerable.
        .limit(10);

    // Get hazard breakdown for this county
    const { data: hazardData } = await supabaseAdmin
        .from('hazard_vulnerability_matrix')
        .select('hazard, vulnerability_score, impact_score, resilience_score')
        .eq('county_id', countyId);

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
        county,
        facilities: facilities || [],
        hazardChartData
    };
}

export default async function RegionalDashboardPage({ params }: PageProps) {
    const { countyId } = await params;
    const data = await getCountyData(countyId);

    if (!data) {
        return <div className="p-8">County data not found.</div>;
    }

    const { county, facilities, hazardChartData } = data;

    return (
        <div className="space-y-8">
            <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Link href="/dashboards/national" className="hover:underline">National</Link>
                    <span>/</span>
                    <Link href="/dashboards/regional" className="hover:underline">Regional</Link>
                    <span>/</span>
                    <span>{county.county_name}</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">{county.county_name} County Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Climate resilience assessment for {county.total_facilities} facilities.
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Facilities"
                    value={county.total_facilities}
                    icon={Building2}
                />
                <StatCard
                    title="Avg Resilience Score"
                    value={county.avg_overall_score || 'N/A'}
                    icon={Activity}
                />
                <StatCard
                    title="High Risk Facilities"
                    value={county.high_risk_count}
                    icon={AlertTriangle}
                    className="border-red-200 bg-red-50"
                />
                <StatCard
                    title="Facilities Assessed"
                    value={county.facilities_assessed}
                    icon={Users}
                    description={`${Math.round((county.facilities_assessed / county.total_facilities) * 100)}% coverage`}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Hazard Profile Chart */}
                <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="font-semibold mb-4">County Hazard Profile</h3>
                    <HazardChart data={hazardChartData} />
                </div>

                {/* Most Vulnerable Facilities List */}
                <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="font-semibold mb-4">Most Vulnerable Facilities</h3>
                    <div className="space-y-4">
                        {facilities.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No assessments completed yet.</p>
                        ) : (
                            facilities.map((facility) => (
                                <Link
                                    key={facility.facility_id}
                                    href={`/dashboards/facility/${facility.facility_id}`}
                                    className="block p-3 rounded-lg hover:bg-accent transition-colors border border-transparent hover:border-border"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-sm truncate max-w-[180px]" title={facility.facility_name}>
                                            {facility.facility_name}
                                        </span>
                                        <RiskBadge level={facility.resilience_level} showLabel={false} className="h-2 w-2 p-0" />
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>{facility.facility_code}</span>
                                        <span className="font-mono">Score: {facility.overall_score}</span>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

import { supabaseAdmin } from '@/lib/supabase';
import { StatCard } from '@/components/dashboard/StatCard';
import { HazardChart } from '@/components/dashboard/HazardChart';
import { RiskBadge } from '@/components/dashboard/RiskBadge';
import { Building2, Activity, AlertTriangle, CheckCircle2, MapPin } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
    params: Promise<{ facilityId: string }>;
}

async function getFacilityData(facilityId: string) {
    // Get facility details and latest scores
    const { data: facility } = await supabaseAdmin
        .from('facility_latest_scores')
        .select('*')
        .eq('facility_id', facilityId)
        .single();

    if (!facility) {
        // Fallback if no assessment yet, get basic facility info
        const { data: basicFacility } = await supabaseAdmin
            .from('facilities')
            .select('*')
            .eq('id', facilityId)
            .single();

        return {
            facility: basicFacility,
            hasAssessment: false,
            hazardChartData: [],
            interventions: []
        };
    }

    // Parse JSONB scores for chart
    const hazardScores = facility.hazard_scores || {};
    const hazardChartData = Object.keys(hazardScores).map(hazard => ({
        hazard,
        vulnerability: hazardScores[hazard].vulnerability || 0,
        impact: hazardScores[hazard].impact || 0,
        resilience: hazardScores[hazard].resilience || 0,
    }));

    // Get recommended interventions (mock query for now as table might be empty)
    // In real implementation: query recommended_interventions table
    const interventions = [
        { id: 1, title: 'Install flood barriers', priority: 1, status: 'planned' },
        { id: 2, title: 'Backup generator maintenance', priority: 2, status: 'in_progress' },
        { id: 3, title: 'Staff emergency training', priority: 1, status: 'completed' },
    ];

    return {
        facility,
        hasAssessment: true,
        hazardChartData,
        interventions
    };
}

export default async function FacilityDashboardPage({ params }: PageProps) {
    const { facilityId } = await params;
    const data = await getFacilityData(facilityId);

    if (!data || !data.facility) {
        return <div className="p-8">Facility not found.</div>;
    }

    const { facility, hasAssessment, hazardChartData, interventions } = data;

    return (
        <div className="space-y-8">
            <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Link href="/dashboards/national" className="hover:underline">National</Link>
                    <span>/</span>
                    <Link href="/dashboards/regional" className="hover:underline">Regional</Link>
                    <span>/</span>
                    {hasAssessment && (
                        <>
                            <Link href={`/dashboards/regional/${facility.county_id}`} className="hover:underline">County</Link>
                            <span>/</span>
                        </>
                    )}
                    <span>{facility.facility_name || facility.name}</span>
                </div>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{facility.facility_name || facility.name}</h1>
                        <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{facility.facility_code || facility.code}</span>
                            <span>•</span>
                            <span className="capitalize">{facility.facility_type?.replace('_', ' ')}</span>
                        </div>
                    </div>
                    {hasAssessment && (
                        <RiskBadge level={facility.resilience_level} className="text-sm px-3 py-1" />
                    )}
                </div>
            </div>

            {!hasAssessment ? (
                <div className="rounded-xl border border-dashed p-8 text-center">
                    <h3 className="text-lg font-semibold">No Assessment Data Available</h3>
                    <p className="text-muted-foreground mt-2">This facility has not completed a climate resilience assessment yet.</p>
                    <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                        Start Assessment
                    </button>
                </div>
            ) : (
                <>
                    {/* Key Metrics */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Overall Resilience"
                            value={facility.overall_score || 'N/A'}
                            icon={Activity}
                            description="Score (0-100)"
                        />
                        <StatCard
                            title="Vulnerability Score"
                            value={facility.vulnerability_score || 'N/A'}
                            icon={AlertTriangle}
                            description="Lower is better"
                        />
                        <StatCard
                            title="Impact Score"
                            value={facility.impact_score || 'N/A'}
                            icon={Activity}
                            description="Potential impact severity"
                        />
                        <StatCard
                            title="Assessment Date"
                            value={new Date(facility.assessment_date).toLocaleDateString()}
                            icon={CheckCircle2}
                            description="Last updated"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        {/* Hazard Profile Chart */}
                        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                            <h3 className="font-semibold mb-4">Facility Hazard Profile</h3>
                            <HazardChart data={hazardChartData} />
                        </div>

                        {/* Interventions List */}
                        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                            <h3 className="font-semibold mb-4">Recommended Interventions</h3>
                            <div className="space-y-4">
                                {interventions.map((intervention) => (
                                    <div key={intervention.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                                        <div className={`mt-1 h-2 w-2 rounded-full ${intervention.priority === 1 ? 'bg-red-500' : 'bg-yellow-500'
                                            }`} />
                                        <div>
                                            <p className="font-medium text-sm">{intervention.title}</p>
                                            <span className="text-xs text-muted-foreground capitalize">{intervention.status.replace('_', ' ')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

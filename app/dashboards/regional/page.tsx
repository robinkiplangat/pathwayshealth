import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';
import { Map } from 'lucide-react';

async function getCounties() {
    const { data: counties } = await supabaseAdmin
        .from('regional_aggregates')
        .select('*')
        .order('county_name');

    return counties || [];
}

export default async function RegionalIndexPage() {
    const counties = await getCounties();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Regional Dashboards</h1>
                <p className="text-muted-foreground mt-2">
                    Select a county to view detailed climate resilience assessments.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {counties.map((county) => (
                    <Link
                        key={county.county_id}
                        href={`/dashboards/regional/${county.county_id}`}
                        className="block group"
                    >
                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 transition-colors hover:bg-accent hover:text-accent-foreground">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg">{county.county_name}</h3>
                                <Map className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex justify-between">
                                    <span>Facilities</span>
                                    <span className="font-medium text-foreground">{county.total_facilities}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Avg Score</span>
                                    <span className="font-medium text-foreground">{county.avg_overall_score || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

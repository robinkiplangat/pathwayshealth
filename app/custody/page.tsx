import { supabaseAdmin } from '@/lib/supabase';
import { StatCard } from '@/components/dashboard/StatCard';
import { Building2, Users, FileText, Settings } from 'lucide-react';
import Link from 'next/link';

async function getSystemStats() {
    const { count: facilityCount } = await supabaseAdmin.from('facilities').select('*', { count: 'exact', head: true });
    const { count: assessmentCount } = await supabaseAdmin.from('assessments').select('*', { count: 'exact', head: true });
    const { count: userCount } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true }); // Assuming users table exists or similar

    return {
        facilityCount: facilityCount || 0,
        assessmentCount: assessmentCount || 0,
        userCount: userCount || 0,
    };
}

export default async function AdminDashboardPage() {
    const stats = await getSystemStats();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
                <p className="text-muted-foreground mt-2">
                    Manage facilities, users, and system configurations.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Total Facilities"
                    value={stats.facilityCount}
                    icon={Building2}
                />
                <StatCard
                    title="Total Assessments"
                    value={stats.assessmentCount}
                    icon={FileText}
                />
                <StatCard
                    title="System Users"
                    value={stats.userCount} // Placeholder if no user table sync
                    icon={Users}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Link href="/custody/facilities" className="group">
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 hover:border-[var(--primary-teal)] transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-blue-50 text-blue-600 group-hover:bg-[var(--primary-teal)] group-hover:text-white transition-colors">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Manage Facilities</h3>
                                <p className="text-sm text-muted-foreground">Add, edit, or remove healthcare facilities.</p>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link href="/custody/query" className="group">
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 hover:border-[var(--primary-teal)] transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-purple-50 text-purple-600 group-hover:bg-[var(--primary-teal)] group-hover:text-white transition-colors">
                                <Settings className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Data Query</h3>
                                <p className="text-sm text-muted-foreground">Run custom queries and view raw stats.</p>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}

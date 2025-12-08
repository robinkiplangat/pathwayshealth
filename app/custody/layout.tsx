import { isAdmin } from '@/lib/admin';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const isUserAdmin = await isAdmin();

    if (!isUserAdmin) {
        redirect('/');
    }

    return (
        <DashboardLayout>
            <div className="border-l-4 border-[var(--primary-teal)] pl-4 mb-6">
                <h2 className="text-sm font-bold text-[var(--primary-teal)] uppercase tracking-wider">Admin Custody Area</h2>
            </div>
            {children}
        </DashboardLayout>
    );
}

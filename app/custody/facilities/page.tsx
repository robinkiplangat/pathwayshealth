import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';
import { Search, Edit, Plus } from 'lucide-react';
import { redirect } from 'next/navigation';

interface PageProps {
    searchParams: Promise<{ q?: string; page?: string }>;
}

async function getFacilities(query: string, page: number = 1) {
    const pageSize = 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let dbQuery = supabaseAdmin
        .from('facilities')
        .select('id, name, code, facility_type, county_name:wards(sub_counties(counties(name)))', { count: 'exact' });

    if (query) {
        dbQuery = dbQuery.ilike('name', `%${query}%`);
    }

    const { data, count, error } = await dbQuery
        .order('name')
        .range(from, to);

    if (error) {
        console.error(error);
        return { data: [], count: 0 };
    }

    // Flatten county name
    const flattenedData = data?.map((f: any) => ({
        ...f,
        county: f.county_name?.sub_counties?.counties?.name || 'Unknown'
    }));

    return { data: flattenedData, count: count || 0 };
}

export default async function FacilityManagementPage({ searchParams }: PageProps) {
    const { q, page } = await searchParams;
    const query = q || '';
    const currentPage = Number(page) || 1;

    const { data: facilities, count } = await getFacilities(query, currentPage);
    const totalPages = Math.ceil(count / 20);

    async function searchAction(formData: FormData) {
        "use server";
        const searchQuery = formData.get('q')?.toString();
        redirect(`/custody/facilities?q=${searchQuery || ''}`);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Facility Management</h1>
                    <p className="text-muted-foreground">
                        {count} facilities found
                    </p>
                </div>
                <Link
                    href="/custody/facilities/new"
                    className="flex items-center gap-2 bg-[var(--primary-teal)] text-white px-4 py-2 rounded-md hover:bg-[var(--primary-teal-dark)] transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add Facility
                </Link>
            </div>

            {/* Search Bar */}
            <form action={searchAction} className="flex gap-2">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        name="q"
                        defaultValue={query}
                        placeholder="Search facilities..."
                        className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-teal)]"
                    />
                </div>
                <button type="submit" className="px-4 py-2 border rounded-md hover:bg-gray-50">Search</button>
            </form>

            {/* Facility List */}
            <div className="border rounded-lg bg-white overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">County</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {facilities?.map((facility) => (
                            <tr key={facility.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{facility.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{facility.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 capitalize">{facility.facility_type?.replace(/_/g, ' ')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{facility.county}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <Link
                                        href={`/custody/facilities/${facility.id}`}
                                        className="text-[var(--primary-teal)] hover:text-[var(--primary-teal-dark)] inline-flex items-center gap-1"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2">
                {currentPage > 1 && (
                    <Link href={`/custody/facilities?q=${query}&page=${currentPage - 1}`} className="px-3 py-1 border rounded hover:bg-gray-50">Previous</Link>
                )}
                <span className="px-3 py-1 text-gray-500">Page {currentPage} of {totalPages}</span>
                {currentPage < totalPages && (
                    <Link href={`/custody/facilities?q=${query}&page=${currentPage + 1}`} className="px-3 py-1 border rounded hover:bg-gray-50">Next</Link>
                )}
            </div>
        </div>
    );
}

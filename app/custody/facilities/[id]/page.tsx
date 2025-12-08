import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getFacility(id: string) {
    const { data: facility } = await supabaseAdmin
        .from('facilities')
        .select('*')
        .eq('id', id)
        .single();

    return facility;
}

async function getWards() {
    const { data: wards } = await supabaseAdmin
        .from('wards')
        .select('id, name, sub_counties(name, counties(name))')
        .order('name');

    return wards || [];
}

export default async function FacilityEditPage({ params }: PageProps) {
    const { id } = await params;
    const facility = await getFacility(id);
    const wards = await getWards();

    if (!facility) {
        return <div className="p-8">Facility not found.</div>;
    }

    async function updateFacility(formData: FormData) {
        "use server";

        const updates = {
            name: formData.get('name')?.toString(),
            code: formData.get('code')?.toString(),
            facility_type: formData.get('facility_type')?.toString(),
            ownership: formData.get('ownership')?.toString(),
            tier_level: Number(formData.get('tier_level')),
            ward_id: formData.get('ward_id')?.toString(),
            bed_capacity: formData.get('bed_capacity') ? Number(formData.get('bed_capacity')) : null,
            staff_count: formData.get('staff_count') ? Number(formData.get('staff_count')) : null,
            has_emergency_services: formData.get('has_emergency_services') === 'on',
            has_maternity_services: formData.get('has_maternity_services') === 'on',
            has_surgery_capacity: formData.get('has_surgery_capacity') === 'on',
            contact_phone: formData.get('contact_phone')?.toString(),
            contact_email: formData.get('contact_email')?.toString(),
            address: formData.get('address')?.toString(),
            status: formData.get('status')?.toString(),
        };

        const { error } = await supabaseAdmin
            .from('facilities')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error updating facility:', error);
            return;
        }

        revalidatePath('/custody/facilities');
        revalidatePath(`/custody/facilities/${id}`);
        redirect('/custody/facilities');
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Edit Facility</h1>
                <p className="text-muted-foreground">Update facility information and services.</p>
            </div>

            <form action={updateFacility} className="space-y-6 bg-white rounded-lg border p-6">
                {/* Basic Information */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold border-b pb-2">Basic Information</h2>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-1">Facility Name *</label>
                            <input
                                name="name"
                                defaultValue={facility.name}
                                required
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-teal)]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Facility Code *</label>
                            <input
                                name="code"
                                defaultValue={facility.code}
                                required
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-teal)]"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-1">Facility Type *</label>
                            <select
                                name="facility_type"
                                defaultValue={facility.facility_type}
                                required
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-teal)]"
                            >
                                <option value="hospital">Hospital</option>
                                <option value="health_center">Health Center</option>
                                <option value="dispensary">Dispensary</option>
                                <option value="clinic">Clinic</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Ownership *</label>
                            <select
                                name="ownership"
                                defaultValue={facility.ownership}
                                required
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-teal)]"
                            >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                                <option value="faith_based">Faith-Based</option>
                                <option value="ngo">NGO</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-1">Tier Level</label>
                            <input
                                name="tier_level"
                                type="number"
                                min="1"
                                max="6"
                                defaultValue={facility.tier_level}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-teal)]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Ward *</label>
                            <select
                                name="ward_id"
                                defaultValue={facility.ward_id}
                                required
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-teal)]"
                            >
                                {wards.map((ward: any) => (
                                    <option key={ward.id} value={ward.id}>
                                        {ward.name} - {ward.sub_counties?.name} ({ward.sub_counties?.counties?.name})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                            name="status"
                            defaultValue={facility.status}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-teal)]"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="under_construction">Under Construction</option>
                        </select>
                    </div>
                </div>

                {/* Capacity */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold border-b pb-2">Capacity</h2>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-1">Bed Capacity</label>
                            <input
                                name="bed_capacity"
                                type="number"
                                min="0"
                                defaultValue={facility.bed_capacity || ''}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-teal)]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Staff Count</label>
                            <input
                                name="staff_count"
                                type="number"
                                min="0"
                                defaultValue={facility.staff_count || ''}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-teal)]"
                            />
                        </div>
                    </div>
                </div>

                {/* Services */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold border-b pb-2">Services</h2>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2">
                            <input
                                name="has_emergency_services"
                                type="checkbox"
                                defaultChecked={facility.has_emergency_services}
                                className="w-4 h-4 text-[var(--primary-teal)] focus:ring-[var(--primary-teal)]"
                            />
                            <span className="text-sm">Emergency Services</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                name="has_maternity_services"
                                type="checkbox"
                                defaultChecked={facility.has_maternity_services}
                                className="w-4 h-4 text-[var(--primary-teal)] focus:ring-[var(--primary-teal)]"
                            />
                            <span className="text-sm">Maternity Services</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                name="has_surgery_capacity"
                                type="checkbox"
                                defaultChecked={facility.has_surgery_capacity}
                                className="w-4 h-4 text-[var(--primary-teal)] focus:ring-[var(--primary-teal)]"
                            />
                            <span className="text-sm">Surgery Capacity</span>
                        </label>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold border-b pb-2">Contact Information</h2>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-1">Phone</label>
                            <input
                                name="contact_phone"
                                type="tel"
                                defaultValue={facility.contact_phone || ''}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-teal)]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                name="contact_email"
                                type="email"
                                defaultValue={facility.contact_email || ''}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-teal)]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Address</label>
                        <textarea
                            name="address"
                            rows={3}
                            defaultValue={facility.address || ''}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-teal)]"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-[var(--primary-teal)] text-white rounded-md hover:bg-[var(--primary-teal-dark)] transition-colors"
                    >
                        Save Changes
                    </button>
                    <a
                        href="/custody/facilities"
                        className="px-6 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </a>
                </div>
            </form>
        </div>
    );
}

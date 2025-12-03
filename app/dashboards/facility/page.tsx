"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Filter,
    Building2,
    MapPin,
    Bed,
    Users,
    Clock,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
} from "lucide-react";
import Link from "next/link";

interface Facility {
    id: string;
    code: string;
    name: string;
    type: string;
    ownership: string;
    tier: number;
    beds: number;
    cots: number;
    open24Hours: boolean;
    openWeekends: boolean;
    openLateNight: boolean;
    status: string;
    regulated: boolean;
    ward: string;
    subCounty: string;
    county: string;
    countyId: string;
}

interface FacilityStats {
    totalFacilities: number;
    assessedFacilities: number;
    assessmentCoverage: number;
    byType: Record<string, number>;
    byTier: Record<string, number>;
    byCounty: Record<string, number>;
}

export default function FacilitiesPage() {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [stats, setStats] = useState<FacilityStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchFacilities();
        fetchStats();
    }, [page, search]);

    const fetchFacilities = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(search && { search }),
            });

            const res = await fetch(`/api/facilities?${params}`);
            const data = await res.json();

            setFacilities(data.facilities || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Failed to fetch facilities:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/facilities/stats');
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    return (
        <DashboardLayout>
            <div className="p-4 md:p-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Facilities</h1>
                        <p className="text-gray-500 mt-1">Browse and manage healthcare facilities</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="mb-6 space-y-4">
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <Input
                                placeholder="Search facilities by name or code..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="gap-2"
                        >
                            <Filter size={16} />
                            Filters
                        </Button>
                    </div>

                    {showFilters && (
                        <Card>
                            <CardContent className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">County</label>
                                        <select className="w-full mt-1 rounded-md border-gray-300">
                                            <option>All Counties</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Type</label>
                                        <select className="w-full mt-1 rounded-md border-gray-300">
                                            <option>All Types</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Tier</label>
                                        <select className="w-full mt-1 rounded-md border-gray-300">
                                            <option>All Tiers</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Status</label>
                                        <select className="w-full mt-1 rounded-md border-gray-300">
                                            <option>All Status</option>
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Total Facilities</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalFacilities}</p>
                                    </div>
                                    <Building2 className="text-[var(--primary-teal)]" size={32} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Assessed</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.assessedFacilities}</p>
                                    </div>
                                    <CheckCircle2 className="text-green-600" size={32} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Coverage</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.assessmentCoverage}%</p>
                                    </div>
                                    <div className="w-16 h-16 rounded-full border-4 border-[var(--primary-teal)] flex items-center justify-center">
                                        <span className="text-sm font-bold text-[var(--primary-teal)]">{stats.assessmentCoverage}%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Counties</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{Object.keys(stats.byCounty).length}</p>
                                    </div>
                                    <MapPin className="text-blue-600" size={32} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Facilities List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-teal)]"></div>
                    </div>
                ) : facilities.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No facilities found</h3>
                            <p className="text-gray-500">Try adjusting your search or filters</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {facilities.map((facility) => (
                            <Card key={facility.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-[var(--primary-teal)]/10 flex items-center justify-center flex-shrink-0">
                                                    <Building2 className="text-[var(--primary-teal)]" size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-gray-900">{facility.name}</h3>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="text-sm text-gray-500">#{facility.code}</span>
                                                                <Badge variant="outline">KEPH Level {facility.tier}</Badge>
                                                                <Badge variant={facility.status === 'Operational' ? 'default' : 'secondary'}>
                                                                    {facility.status || 'Unknown'}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                                        <MapPin size={14} />
                                                        <span>{facility.ward}, {facility.subCounty}, {facility.county}</span>
                                                    </div>

                                                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                                                        {facility.beds > 0 && (
                                                            <div className="flex items-center gap-1">
                                                                <Bed size={14} />
                                                                <span>{facility.beds} beds</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-medium">{facility.type}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span>{facility.ownership}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        {facility.open24Hours && (
                                                            <div className="flex items-center gap-1 text-xs text-green-600">
                                                                <CheckCircle2 size={12} />
                                                                <span>24 Hours</span>
                                                            </div>
                                                        )}
                                                        {facility.openWeekends && (
                                                            <div className="flex items-center gap-1 text-xs text-green-600">
                                                                <CheckCircle2 size={12} />
                                                                <span>Weekends</span>
                                                            </div>
                                                        )}
                                                        {facility.regulated && (
                                                            <div className="flex items-center gap-1 text-xs text-green-600">
                                                                <CheckCircle2 size={12} />
                                                                <span>Regulated</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <Link href={`/dashboards/facility/${facility.id}`}>
                                            <Button variant="outline" className="gap-2">
                                                View Details
                                                <ChevronRight size={16} />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft size={16} />
                            Previous
                        </Button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <Button
                                        key={pageNum}
                                        variant={page === pageNum ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setPage(pageNum)}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                            {totalPages > 5 && <span className="px-2">...</span>}
                            {totalPages > 5 && (
                                <Button
                                    variant={page === totalPages ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setPage(totalPages)}
                                >
                                    {totalPages}
                                </Button>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Next
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

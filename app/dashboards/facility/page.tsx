"use client";

import { useState, useEffect } from "react";
// import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
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
    status: string;
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
    byCounty: Record<string, { name: string; count: number }>;
}

export default function FacilitiesPage() {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [stats, setStats] = useState<FacilityStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [selectedCounty, setSelectedCounty] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [selectedTier, setSelectedTier] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");

    useEffect(() => {
        fetchFacilities();
        fetchStats();
    }, [page, search, selectedCounty, selectedType, selectedTier, selectedStatus]);

    const fetchFacilities = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(search && { search }),
                ...(selectedCounty && { countyId: selectedCounty }),
                ...(selectedType && { type: selectedType }),
                ...(selectedTier && { tier: selectedTier }),
                ...(selectedStatus && { status: selectedStatus }),
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

    const handleFilterChange = () => {
        setPage(1); // Reset to first page when filters change
    };

    const resetFilters = () => {
        setSelectedCounty("");
        setSelectedType("");
        setSelectedTier("");
        setSelectedStatus("");
        setPage(1);
    };

    return (
        <>
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
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {/* County Filter */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 block mb-1">County</label>
                                            <select
                                                value={selectedCounty}
                                                onChange={(e) => setSelectedCounty(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-teal)] focus:border-transparent"
                                            >
                                                <option value="">All Counties</option>
                                                {stats && Object.entries(stats.byCounty || {}).map(([countyId, data]) => (
                                                    <option key={countyId} value={countyId}>
                                                        {data.name} ({data.count})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Type Filter */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 block mb-1">Type</label>
                                            <select
                                                value={selectedType}
                                                onChange={(e) => setSelectedType(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-teal)] focus:border-transparent"
                                            >
                                                <option value="">All Types</option>
                                                {stats && Object.keys(stats.byType || {}).map((type) => (
                                                    <option key={type} value={type}>
                                                        {type.charAt(0).toUpperCase() + type.slice(1)} ({stats.byType[type]})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Tier Filter */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 block mb-1">Tier</label>
                                            <select
                                                value={selectedTier}
                                                onChange={(e) => setSelectedTier(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-teal)] focus:border-transparent"
                                            >
                                                <option value="">All Tiers</option>
                                                {stats && Object.keys(stats.byTier || {}).sort().map((tier) => (
                                                    <option key={tier} value={tier}>
                                                        Level {tier} ({stats.byTier[tier]})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Status Filter */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 block mb-1">Status</label>
                                            <select
                                                value={selectedStatus}
                                                onChange={(e) => setSelectedStatus(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-teal)] focus:border-transparent"
                                            >
                                                <option value="">All Status</option>
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                                <option value="under_construction">Under Construction</option>
                                                <option value="temporarily_closed">Temporarily Closed</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Filter Actions */}
                                    <div className="flex justify-end gap-2 pt-2 border-t">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={resetFilters}
                                        >
                                            Clear Filters
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => { handleFilterChange(); setShowFilters(false); }}
                                        >
                                            Apply
                                        </Button>
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
        </>
    );
}

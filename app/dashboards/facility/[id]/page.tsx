"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Building2,
    MapPin,
    Phone,
    Mail,
    Globe,
    Bed,
    Users,
    CheckCircle2,
    Clock,
    Calendar,
    ChevronRight,
    Home,
} from "lucide-react";
import Link from "next/link";

type Tab = 'overview' | 'services' | 'assessments' | 'actions';

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
}

export default function FacilityDetailPage() {
    const params = useParams();
    const [facility, setFacility] = useState<Facility | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    useEffect(() => {
        fetchFacility();
    }, [params.id]);

    const fetchFacility = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/facilities/${params.id}`);
            const data = await res.json();
            setFacility(data);
        } catch (error) {
            console.error('Failed to fetch facility:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-teal)]"></div>
            </div>
        );
    }

    if (!facility) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Facility not found</h2>
                <Link href="/dashboards/facility">
                    <Button className="mt-4">Back to Facilities</Button>
                </Link>
            </div>
        );
    }

    const tabs = [
        { id: 'overview' as const, label: 'Overview' },
        { id: 'services' as const, label: 'Services' },
        { id: 'assessments' as const, label: 'Assessments' },
        { id: 'actions' as const, label: 'Action Plans' },
    ];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/" className="hover:text-[var(--primary-teal)]">
                    <Home size={16} />
                </Link>
                <ChevronRight size={14} />
                <Link href="/dashboards/facility" className="hover:text-[var(--primary-teal)]">
                    Facilities
                </Link>
                <ChevronRight size={14} />
                <span className="text-gray-900">{facility.name}</span>
            </div>

            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{facility.name}</h1>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-gray-600">#{facility.code}</span>
                            <Badge variant="outline">KEPH Level {facility.tier}</Badge>
                            <Badge variant={facility.status === 'Operational' ? 'default' : 'secondary'}>
                                {facility.status || 'Unknown'}
                            </Badge>
                        </div>
                        <p className="text-gray-600 mt-2">Regulatory Body: Ministry of Health</p>
                    </div>
                    <Button className="gap-2">
                        Start Assessment
                        <ChevronRight size={16} />
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex gap-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${activeTab === tab.id
                                ? 'border-[var(--primary-teal)] text-[var(--primary-teal)]'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'overview' && (
                        <>
                            {/* Basic Details */}
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-lg font-semibold mb-4">Basic Details</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Facility Type</p>
                                            <p className="font-medium">{facility.type}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">KEPH Level</p>
                                            <p className="font-medium">Level {facility.tier}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-sm text-gray-500 mb-2">Status</p>
                                            <div className="space-y-2">
                                                {facility.open24Hours && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <CheckCircle2 size={16} className="text-green-600" />
                                                        <span>Open 24 hours</span>
                                                    </div>
                                                )}
                                                {facility.openWeekends && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <CheckCircle2 size={16} className="text-green-600" />
                                                        <span>Open weekends</span>
                                                    </div>
                                                )}
                                                {facility.openLateNight && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <CheckCircle2 size={16} className="text-green-600" />
                                                        <span>Open late night</span>
                                                    </div>
                                                )}
                                                {facility.regulated && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <CheckCircle2 size={16} className="text-green-600" />
                                                        <span>Regulated</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Ownership */}
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-lg font-semibold mb-4">Ownership</h2>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500">Category</p>
                                            <p className="font-medium">{facility.ownership}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Owner</p>
                                            <p className="font-medium">Ministry of Health</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Location */}
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-lg font-semibold mb-4">Location</h2>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500">Ward</p>
                                            <p className="font-medium">{facility.ward}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Sub County</p>
                                            <p className="font-medium">{facility.subCounty}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">County</p>
                                            <p className="font-medium">{facility.county}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {activeTab === 'services' && (
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-semibold mb-4">Services Offered</h2>
                                <p className="text-gray-500">Service information coming soon...</p>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'assessments' && (
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-semibold mb-4">Assessment History</h2>
                                <p className="text-gray-500">No assessments recorded yet.</p>
                                <Button className="mt-4">Start First Assessment</Button>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'actions' && (
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-semibold mb-4">Climate Action Plans</h2>
                                <p className="text-gray-500">Complete an assessment to generate action plans.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column - Map & Capacity */}
                <div className="space-y-6">
                    {/* Map Placeholder */}
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Location Map</h2>
                            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                <MapPin className="text-gray-400" size={48} />
                            </div>
                            <p className="text-sm text-gray-500 mt-3">
                                {facility.ward}, {facility.subCounty}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Bed Capacity */}
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Bed Capacity</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Total Beds</span>
                                    <span className="font-semibold">{facility.beds || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Cots</span>
                                    <span className="font-semibold">{facility.cots || 'N/A'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone size={16} className="text-gray-400" />
                                    <span className="text-gray-600">Not available</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail size={16} className="text-gray-400" />
                                    <span className="text-gray-600">Not available</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Globe size={16} className="text-gray-400" />
                                    <span className="text-gray-600">Not available</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

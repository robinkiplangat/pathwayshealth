"use client";

import { useState } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Database, Download, Search } from 'lucide-react';

export default function DataQueryPage() {
    const [queryType, setQueryType] = useState<'regional' | 'national' | 'custom'>('national');
    const [selectedCounty, setSelectedCounty] = useState('');
    const [queryResult, setQueryResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    async function runQuery() {
        setLoading(true);
        try {
            let url = '';
            if (queryType === 'national') {
                url = '/api/dashboards/national?countryCode=KE';
            } else if (queryType === 'regional' && selectedCounty) {
                url = `/api/dashboards/regional?countyId=${selectedCounty}`;
            }

            if (url) {
                const response = await fetch(url);
                const data = await response.json();
                setQueryResult(data);
            }
        } catch (error) {
            console.error('Query error:', error);
        } finally {
            setLoading(false);
        }
    }

    function downloadJSON() {
        if (!queryResult) return;

        const dataStr = JSON.stringify(queryResult, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `query-${queryType}-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="space-y-6 max-w-6xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Data Query Interface</h1>
                <p className="text-muted-foreground">Run queries and export data for analysis.</p>
            </div>

            {/* Query Builder */}
            <div className="bg-white rounded-lg border p-6 space-y-4">
                <h2 className="text-lg font-semibold">Query Builder</h2>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium mb-1">Query Type</label>
                        <select
                            value={queryType}
                            onChange={(e) => setQueryType(e.target.value as any)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-teal)]"
                        >
                            <option value="national">National Statistics</option>
                            <option value="regional">Regional Statistics</option>
                            <option value="custom">Custom Query (Coming Soon)</option>
                        </select>
                    </div>

                    {queryType === 'regional' && (
                        <div>
                            <label className="block text-sm font-medium mb-1">County ID</label>
                            <input
                                type="text"
                                value={selectedCounty}
                                onChange={(e) => setSelectedCounty(e.target.value)}
                                placeholder="Enter county UUID"
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-teal)]"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Example: 9c5c2b40-28ad-4774-8868-19f7e532193e (Nairobi)
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={runQuery}
                        disabled={loading || (queryType === 'regional' && !selectedCounty) || queryType === 'custom'}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-teal)] text-white rounded-md hover:bg-[var(--primary-teal-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Search className="h-4 w-4" />
                        {loading ? 'Running...' : 'Run Query'}
                    </button>

                    {queryResult && (
                        <button
                            onClick={downloadJSON}
                            className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            Download JSON
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            {queryResult && queryType === 'national' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">National Summary</h2>
                    <div className="grid gap-4 md:grid-cols-4">
                        <StatCard
                            title="Total Facilities"
                            value={queryResult.national_summary?.total_facilities || 0}
                            icon={Database}
                        />
                        <StatCard
                            title="Assessed"
                            value={queryResult.national_summary?.facilities_assessed || 0}
                            icon={Database}
                        />
                        <StatCard
                            title="Avg Score"
                            value={queryResult.national_summary?.avg_overall_score || 'N/A'}
                            icon={Database}
                        />
                        <StatCard
                            title="Counties"
                            value={queryResult.national_summary?.total_counties || 0}
                            icon={Database}
                        />
                    </div>
                </div>
            )}

            {queryResult && queryType === 'regional' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Regional Summary</h2>
                    <div className="grid gap-4 md:grid-cols-4">
                        <StatCard
                            title="Total Facilities"
                            value={queryResult.regional_summary?.total_facilities || 0}
                            icon={Database}
                        />
                        <StatCard
                            title="Assessed"
                            value={queryResult.regional_summary?.facilities_assessed || 0}
                            icon={Database}
                        />
                        <StatCard
                            title="Avg Score"
                            value={queryResult.regional_summary?.avg_overall_score || 'N/A'}
                            icon={Database}
                        />
                        <StatCard
                            title="High Risk"
                            value={queryResult.regional_summary?.high_risk_count || 0}
                            icon={Database}
                        />
                    </div>
                </div>
            )}

            {/* Raw JSON */}
            {queryResult && (
                <div className="bg-white rounded-lg border p-6">
                    <h2 className="text-lg font-semibold mb-4">Raw JSON Response</h2>
                    <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96 text-xs">
                        {JSON.stringify(queryResult, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}

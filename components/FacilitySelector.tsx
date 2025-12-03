"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, Building2, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Facility {
    id: string;
    name: string;
    code: string;
    facility_type: string;
    tier_level: number;
    ward: string;
    sub_county: string;
    county: string;
    location: string;
}

interface FacilitySelectorProps {
    onSelect: (facility: Facility) => void;
    selectedFacility: Facility | null;
}

export function FacilitySelector({ onSelect, selectedFacility }: FacilitySelectorProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Facility[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/facilities/search?q=${encodeURIComponent(query)}&limit=10`);
                const data = await response.json();
                setResults(data.results || []);
                setShowDropdown(true);
            } catch (error) {
                console.error('Facility search error:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSelect = (facility: Facility) => {
        onSelect(facility);
        setQuery('');
        setShowDropdown(false);
    };

    const handleClear = () => {
        onSelect(null as any);
        setQuery('');
        setResults([]);
    };

    return (
        <div className="w-full max-w-2xl mx-auto" ref={wrapperRef}>
            {selectedFacility ? (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 animate-in fade-in zoom-in duration-300">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Building2 className="text-resilience-green" size={20} />
                                <h3 className="text-xl font-semibold text-white">{selectedFacility.name}</h3>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300 text-sm mb-1">
                                <MapPin size={14} />
                                <span>{selectedFacility.location}</span>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <span className="px-2 py-1 bg-white/10 rounded text-xs text-white">
                                    {selectedFacility.code}
                                </span>
                                <span className="px-2 py-1 bg-white/10 rounded text-xs text-white capitalize">
                                    {selectedFacility.facility_type.replace(/_/g, ' ')}
                                </span>
                                <span className="px-2 py-1 bg-white/10 rounded text-xs text-white">
                                    Tier {selectedFacility.tier_level}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleClear}
                            className="text-sm text-white/70 hover:text-white transition-colors underline"
                        >
                            Change
                        </button>
                    </div>
                </div>
            ) : (
                <div className="relative">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => results.length > 0 && setShowDropdown(true)}
                            placeholder="Search for your healthcare facility..."
                            className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-resilience-green focus:border-transparent transition-all"
                        />
                        {loading && (
                            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 animate-spin" size={20} />
                        )}
                    </div>

                    {showDropdown && results.length > 0 && (
                        <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                            {results.map((facility) => (
                                <button
                                    key={facility.id}
                                    onClick={() => handleSelect(facility)}
                                    className="w-full text-left px-4 py-3 hover:bg-resilience-green/10 transition-colors border-b border-gray-100 last:border-0 group"
                                >
                                    <div className="flex items-start gap-3">
                                        <Building2 className="text-resilience-green mt-1 group-hover:scale-110 transition-transform" size={18} />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-gray-900 group-hover:text-resilience-green transition-colors">
                                                {facility.name}
                                            </div>
                                            <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                                <MapPin size={12} />
                                                {facility.location}
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-700">
                                                    {facility.code}
                                                </span>
                                                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-700 capitalize">
                                                    {facility.facility_type.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {query.length >= 2 && !loading && results.length === 0 && (
                        <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-6 text-center">
                            <p className="text-gray-600">No facilities found matching "{query}"</p>
                            <p className="text-sm text-gray-500 mt-2">Try a different search term or facility code</p>
                        </div>
                    )}
                </div>
            )}

            {!selectedFacility && (
                <p className="text-sm text-white/70 mt-3 text-center">
                    Search by facility name, code, or location
                </p>
            )}
        </div>
    );
}

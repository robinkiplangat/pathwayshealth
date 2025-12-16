/**
 * Standardized API Response Types
 * Use these types across all API routes for consistency
 */

// Base response wrapper
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta?: ResponseMeta;
}

// Error structure
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
}

// Metadata for responses
export interface ResponseMeta {
    timestamp: string;
    requestId?: string;
    version?: string;
}

// Pagination metadata
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

// Paginated response
export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: PaginationMeta;
    error?: ApiError;
}

// Facility types
export interface Facility {
    id: string;
    code: string;
    name: string;
    type: string;
    ownership: string;
    tier: number;
    bedCapacity: number;
    staffCount: number;
    status: string;
    location: {
        ward?: string;
        subCounty?: string;
        county?: string;
        countyId?: string;
        latitude?: number;
        longitude?: number;
        address?: string;
    };
}

// Dashboard types
export interface NationalDashboardData {
    country: {
        id: number;
        name: string;
        code: string;
    };
    stats: {
        totalFacilities: number;
        facilitiesAssessed: number;
        avgOverallScore: number;
        highRiskCount: number;
    };
    resilienceDistribution: {
        resilient: number;
        lowRisk: number;
        mediumRisk: number;
        highRisk: number;
    };
    pillarVulnerabilities: {
        workforce: number;
        wash: number;
        energy: number;
        infrastructure: number;
    };
    hazardBreakdown: Array<{
        hazard: string;
        avgVulnerability: number;
        avgImpact: number;
        avgResilience: number;
        facilityCount: number;
    }>;
    countyRankings: Array<{
        countyId: string;
        countyName: string;
        totalFacilities: number;
        avgScore: number;
        highRiskCount: number;
    }>;
}

export interface RegionalDashboardData {
    county: {
        id: string;
        name: string;
        code: string;
        population?: number;
    };
    stats: {
        totalFacilities: number;
        facilitiesAssessed: number;
        avgOverallScore: number;
        avgVulnerabilityScore: number;
        avgImpactScore: number;
    };
    resilienceDistribution: {
        resilient: number;
        lowRisk: number;
        mediumRisk: number;
        highRisk: number;
    };
    vulnerableFacilities: Array<{
        id: string;
        name: string;
        type: string;
        overallScore: number;
        resilienceLevel: string;
    }>;
    hazardBreakdown: Array<{
        hazard: string;
        avgVulnerability: number;
        avgImpact: number;
        avgResilience: number;
    }>;
}

// Facility stats
export interface FacilityStats {
    totalFacilities: number;
    assessedFacilities: number;
    assessmentCoverage: number;
    byType: Record<string, number>;
    byTier: Record<string, number>;
    byCounty: Record<string, number>;
}

/**
 * API Utility Functions
 * Helper functions for consistent API responses
 */

import { NextResponse } from 'next/server';
import type { ApiResponse, ApiError, PaginatedResponse, PaginationMeta } from './types/api';

/**
 * Create a successful API response
 */
export function successResponse<T>(data: T, meta?: any): NextResponse {
    const response: ApiResponse<T> = {
        success: true,
        data,
        meta: {
            timestamp: new Date().toISOString(),
            ...meta
        }
    };
    return NextResponse.json(response);
}

/**
 * Create an error API response
 */
export function errorResponse(
    message: string,
    code: string = 'INTERNAL_ERROR',
    status: number = 500,
    details?: Record<string, any>
): NextResponse {
    const error: ApiError = {
        code,
        message,
        details
    };

    const response: ApiResponse<never> = {
        success: false,
        error,
        meta: {
            timestamp: new Date().toISOString()
        }
    };

    return NextResponse.json(response, { status });
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
): NextResponse {
    const totalPages = Math.ceil(total / limit);

    const pagination: PaginationMeta = {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
    };

    const response: PaginatedResponse<T> = {
        success: true,
        data,
        pagination
    };

    return NextResponse.json(response);
}

/**
 * Parse pagination parameters from URL
 */
export function getPaginationParams(searchParams: URLSearchParams) {
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const offset = (page - 1) * limit;

    return { page, limit, offset };
}

/**
 * Parse filter parameters from URL
 */
export function getFilterParams(searchParams: URLSearchParams) {
    return {
        search: searchParams.get('search') || undefined,
        countyId: searchParams.get('countyId') || undefined,
        type: searchParams.get('type') || undefined,
        ownership: searchParams.get('ownership') || undefined,
        tier: searchParams.get('tier') ? parseInt(searchParams.get('tier')!) : undefined,
        status: searchParams.get('status') || undefined,
    };
}

/**
 * Parse sort parameters from URL
 */
export function getSortParams(searchParams: URLSearchParams, validColumns: string[]) {
    const sortBy = searchParams.get('sortBy') || validColumns[0];
    const sortOrder = searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc';

    // Validate sort column
    const sortColumn = validColumns.includes(sortBy) ? sortBy : validColumns[0];

    return { sortBy: sortColumn, sortOrder };
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: any, context: string = 'API'): NextResponse {
    console.error(`${context} error:`, error);

    // Supabase errors
    if (error.code) {
        return errorResponse(
            error.message || 'Database error',
            `DB_${error.code}`,
            500,
            { context }
        );
    }

    // Generic errors
    return errorResponse(
        error.message || 'An unexpected error occurred',
        'INTERNAL_ERROR',
        500,
        { context }
    );
}

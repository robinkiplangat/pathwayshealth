import { NextResponse } from 'next/server';
import { getVulnerabilityQuestions } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const hazard = searchParams.get('hazard');

    try {
        const questions = await getVulnerabilityQuestions(hazard || undefined);
        return NextResponse.json(questions);
    } catch (error) {
        console.error("Failed to fetch questions:", error);
        // Return empty array to prevent frontend crash
        return NextResponse.json([]);
    }
}

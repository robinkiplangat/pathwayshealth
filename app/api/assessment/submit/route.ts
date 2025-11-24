import { NextResponse } from 'next/server';
import { createAssessmentWithResponses } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { responses, facilityName, location } = body;

        // Convert responses to the format expected by Supabase
        const formattedResponses = responses.map((r: any) => ({
            questionId: r.questionId,
            answer: r.score?.toString() || r.answer?.toString() || 'Unknown',
        }));

        // Create Assessment with responses using Supabase REST API
        const assessment = await createAssessmentWithResponses(
            facilityName,
            location,
            formattedResponses
        );

        return NextResponse.json(assessment);
    } catch (error) {
        console.error('Error submitting assessment:', error);
        return NextResponse.json(
            { error: 'Failed to submit assessment' },
            { status: 500 }
        );
    }
}

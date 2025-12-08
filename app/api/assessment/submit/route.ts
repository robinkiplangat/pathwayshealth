import { NextResponse } from 'next/server';
import { createAssessmentWithResponses } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { responses, facilityId, facilityName, location } = body;

        // Validate facility if ID provided
        if (facilityId) {
            const { data: facility } = await supabaseAdmin
                .from('facilities')
                .select('id, name')
                .eq('id', facilityId)
                .single();

            if (!facility) {
                return NextResponse.json(
                    { error: 'Invalid facility ID' },
                    { status: 400 }
                );
            }
        }

        // Convert responses to the format expected by Supabase
        const formattedResponses = responses.map((r: any) => ({
            questionId: r.questionId,
            answer: r.score?.toString() || r.answer?.toString() || 'Unknown',
        }));

        // Create Assessment with responses using Supabase REST API
        const assessment = await createAssessmentWithResponses(
            facilityId || null,
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

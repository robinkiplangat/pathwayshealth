import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch all assessments for the user
        const { data: assessments, error } = await supabase
            .from('Assessment')
            .select(`
                *,
                AssessmentResponse (
                    *,
                    VulnerabilityQuestion (*)
                ),
                ImpactResponse (
                    *,
                    ImpactStatement (*)
                )
            `)
            .eq('userId', userId)
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching assessments:', error);
            throw error;
        }

        if (!assessments || assessments.length === 0) {
            return NextResponse.json({ hasData: false, assessments: [] });
        }

        // Process each assessment to calculate scores
        const processedAssessments = assessments.map(assessment => {
            const pillars = ["WORKFORCE", "WASH", "ENERGY", "INFRASTRUCTURE"];
            const scores: Record<string, number> = {};
            let totalScore = 0;

            for (const pillar of pillars) {
                const pillarResponses = assessment.AssessmentResponse?.filter(
                    (r: any) => r.VulnerabilityQuestion?.pillar === pillar
                ) || [];

                if (pillarResponses.length === 0) {
                    scores[pillar] = 0;
                    continue;
                }

                let earned = 0;
                let max = 0;

                for (const r of pillarResponses) {
                    const weight = r.VulnerabilityQuestion?.weight || 1;
                    const answer = parseInt(r.answer) || 0; // 1, 2, 3
                    const maxAnswer = 3;

                    earned += answer * weight;
                    max += maxAnswer * weight;
                }

                const percentage = max > 0 ? Math.round((earned / max) * 100) : 0;
                scores[pillar] = percentage;
                totalScore += percentage;
            }

            const overallScore = Math.round(totalScore / pillars.length);

            return {
                id: assessment.id,
                date: assessment.date,
                facilityName: assessment.facilityName,
                location: assessment.location,
                overallScore,
                pillarScores: scores
            };
        });

        return NextResponse.json({
            hasData: true,
            assessments: processedAssessments
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
    }
}

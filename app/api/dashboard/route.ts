import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function GET() {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch recent assessment for the user (mocking user association for now as schema doesn't have userId yet)
        // In a real app, we'd filter by userId. For now, we'll fetch the latest assessment.
        const assessment = await prisma.assessment.findFirst({
            orderBy: { date: 'desc' },
            include: {
                vulnerabilityResponses: {
                    include: { question: true }
                },
                impactResponses: {
                    include: { statement: true }
                }
            }
        });

        if (!assessment) {
            return NextResponse.json({ hasData: false });
        }

        // Calculate Scores
        const pillars = ["WORKFORCE", "WASH", "ENERGY", "INFRASTRUCTURE"];
        const scores: Record<string, number> = {};
        let totalScore = 0;

        for (const pillar of pillars) {
            const pillarResponses = assessment.vulnerabilityResponses.filter(
                (r: any) => r.question.pillar === pillar
            );

            if (pillarResponses.length === 0) {
                scores[pillar] = 0;
                continue;
            }

            let earned = 0;
            let max = 0;

            for (const r of pillarResponses) {
                const weight = r.question.weight;
                const answer = parseInt(r.answer); // 1, 2, 3
                const maxAnswer = 3;

                earned += answer * weight;
                max += maxAnswer * weight;
            }

            const percentage = max > 0 ? Math.round((earned / max) * 100) : 0;
            scores[pillar] = percentage;
            totalScore += percentage;
        }

        const overallScore = Math.round(totalScore / pillars.length);

        return NextResponse.json({
            hasData: true,
            date: assessment.date,
            facilityName: assessment.facilityName,
            overallScore,
            pillarScores: scores
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
    }
}

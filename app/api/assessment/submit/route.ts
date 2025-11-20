import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { responses, facilityName, location } = body;

        // Create Assessment
        const assessment = await prisma.assessment.create({
            data: {
                date: new Date(),
                facilityName: facilityName || 'Unknown Facility',
                location: location || 'Unknown Location',
                vulnerabilityResponses: {
                    create: responses.map((r: any) => ({
                        questionId: r.questionId,
                        answer: r.score.toString(), // Schema expects String for answer, but frontend sends number. Need to map or change schema.
                    })),
                },
            },
        });

        return NextResponse.json(assessment);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to submit assessment' }, { status: 500 });
    }
}

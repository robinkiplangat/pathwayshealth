import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const hazard = searchParams.get('hazard');

    try {
        const where = hazard ? { hazard: hazard as string } : {};
        const questions = await prisma.vulnerabilityQuestion.findMany({
            where,
            orderBy: {
                pillar: 'asc',
            },
        });
        return NextResponse.json(questions);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }
}

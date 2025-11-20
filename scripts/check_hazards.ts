import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const questions = await prisma.vulnerabilityQuestion.findMany({
        select: { hazard: true },
        distinct: ['hazard'],
    });
    console.log('Available Hazards:', questions.map(q => q.hazard));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });

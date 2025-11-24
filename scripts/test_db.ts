import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing database connection...');
        const questions = await prisma.vulnerabilityQuestion.findMany({
            take: 5,
        });
        console.log('Successfully fetched questions:', questions);
    } catch (error) {
        console.error('Error fetching questions:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();

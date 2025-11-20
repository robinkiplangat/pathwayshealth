import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const questionCount = await prisma.vulnerabilityQuestion.count()
    const impactCount = await prisma.impactStatement.count()
    const criticalCount = await prisma.vulnerabilityQuestion.count({
        where: { isCritical: true }
    })

    console.log(`Total Questions: ${questionCount}`)
    console.log(`Total Impacts: ${impactCount}`)
    console.log(`Critical Questions: ${criticalCount}`)

    const sampleCritical = await prisma.vulnerabilityQuestion.findFirst({
        where: { isCritical: true }
    })
    console.log('Sample Critical Question:', sampleCritical)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })

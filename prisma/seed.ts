import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const prisma = new PrismaClient()

async function main() {
    const vulnerabilityQuestionsPath = path.join(__dirname, 'data', 'vulnerability_questions.json')
    const impactStatementsPath = path.join(__dirname, 'data', 'impact_statements.json')

    // Clean up existing data
    await prisma.assessmentResponse.deleteMany({})
    await prisma.impactResponse.deleteMany({})
    await prisma.vulnerabilityQuestion.deleteMany({})
    await prisma.impactStatement.deleteMany({})
    console.log('Cleaned up existing data')

    if (fs.existsSync(vulnerabilityQuestionsPath)) {
        const questions = JSON.parse(fs.readFileSync(vulnerabilityQuestionsPath, 'utf-8'))
        await prisma.vulnerabilityQuestion.createMany({
            data: questions.map((q: any) => ({
                id: crypto.randomUUID(),
                text: q.text,
                hazard: q.hazard,
                pillar: q.pillar,
                isCritical: q.isCritical,
                weight: q.weight
            })),
        })
        console.log('Seeded vulnerability questions')
    }

    if (fs.existsSync(impactStatementsPath)) {
        const statements = JSON.parse(fs.readFileSync(impactStatementsPath, 'utf-8'))
        await prisma.impactStatement.createMany({
            data: statements.map((s: any) => ({
                id: crypto.randomUUID(),
                ...s
            })),
        })
        console.log('Seeded impact statements')
    }
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

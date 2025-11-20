import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
    const vulnerabilityQuestionsPath = path.join(__dirname, 'data', 'vulnerability_questions.json')
    const impactStatementsPath = path.join(__dirname, 'data', 'impact_statements.json')

    if (fs.existsSync(vulnerabilityQuestionsPath)) {
        const questions = JSON.parse(fs.readFileSync(vulnerabilityQuestionsPath, 'utf-8'))
        for (const q of questions) {
            await prisma.vulnerabilityQuestion.create({
                data: q,
            })
        }
        console.log('Seeded vulnerability questions')
    }

    if (fs.existsSync(impactStatementsPath)) {
        const statements = JSON.parse(fs.readFileSync(impactStatementsPath, 'utf-8'))
        for (const s of statements) {
            await prisma.impactStatement.create({
                data: s,
            })
        }
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

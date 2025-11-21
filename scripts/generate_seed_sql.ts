import fs from 'fs';
import path from 'path';

const vulnerabilityQuestionsPath = path.join(__dirname, '../prisma/data/vulnerability_questions.json');
const impactStatementsPath = path.join(__dirname, '../prisma/data/impact_statements.json');
const outputPath = path.join(__dirname, '../prisma/seed.sql');

function escapeSql(str: string): string {
    return str.replace(/'/g, "''");
}

function main() {
    let sql = '';

    // Vulnerability Questions
    if (fs.existsSync(vulnerabilityQuestionsPath)) {
        const questions = JSON.parse(fs.readFileSync(vulnerabilityQuestionsPath, 'utf-8'));
        for (const q of questions) {
            sql += `INSERT INTO "VulnerabilityQuestion" ("id", "text", "hazard", "pillar", "isCritical", "weight") VALUES (gen_random_uuid(), '${escapeSql(q.text)}', '${q.hazard}', '${q.pillar}', ${q.isCritical}, ${q.weight});\n`;
        }
    }

    // Impact Statements
    if (fs.existsSync(impactStatementsPath)) {
        const statements = JSON.parse(fs.readFileSync(impactStatementsPath, 'utf-8'));
        for (const s of statements) {
            sql += `INSERT INTO "ImpactStatement" ("id", "text", "hazard", "pillar") VALUES (gen_random_uuid(), '${escapeSql(s.text)}', '${s.hazard}', '${s.pillar}');\n`;
        }
    }

    fs.writeFileSync(outputPath, sql);
    console.log(`Generated SQL to ${outputPath}`);
}

main();

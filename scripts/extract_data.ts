import fs from 'fs';
import path from 'path';

const docsDir = path.join(__dirname, '../../docs');
const assessmentsDir = path.join(docsDir, 'Assessments');
const impactsDir = path.join(docsDir, 'Impacts');
const outputDir = path.join(__dirname, '../prisma/data');

// Mappings
const HAZARD_MAP: Record<string, string> = {
    'Floods': 'FLOOD',
    'Storms': 'STORM',
    'Sea-Level Rise': 'SEA_LEVEL_RISE',
    'Drought': 'DROUGHT',
    'Heatwave': 'HEATWAVE',
    'Wildfire': 'WILDFIRE',
    'Cold Wave': 'COLD_WAVE'
};

const PILLAR_MAP: Record<string, string> = {
    'Health Workforce': 'WORKFORCE',
    'WASH and Health Care Waste': 'WASH',
    'Energy Services': 'ENERGY',
    'Infrastructure, Technologies, Products and Processes': 'INFRASTRUCTURE'
};

interface VulnerabilityQuestion {
    text: string;
    hazard: string;
    pillar: string;
    isCritical: boolean;
    weight: number;
}

interface ImpactStatement {
    text: string;
    hazard: string;
    pillar: string;
}

function parseVulnerabilityDocs() {
    const questions: VulnerabilityQuestion[] = [];
    const files = fs.readdirSync(assessmentsDir).filter(f => f.endsWith('.md'));

    for (const file of files) {
        const content = fs.readFileSync(path.join(assessmentsDir, file), 'utf-8');
        const hazardMatch = content.match(/A\.\d+ (.*?) - Vulnerability/);
        if (!hazardMatch) continue;

        const hazardName = hazardMatch[1].trim();
        const hazard = HAZARD_MAP[hazardName];
        if (!hazard) {
            console.warn(`Unknown hazard: ${hazardName} in file ${file}`);
            continue;
        }

        const lines = content.split('\n');
        let currentPillar = '';

        for (const line of lines) {
            const pillarMatch = line.match(/## .*? Pillar \d+: (.*)/);
            if (pillarMatch) {
                const pillarName = pillarMatch[1].trim();
                // Handle slight variations in pillar names if necessary, or use fuzzy matching
                // For now, direct map lookup
                currentPillar = PILLAR_MAP[pillarName] || '';
                if (!currentPillar) {
                    // Try partial match
                    for (const key in PILLAR_MAP) {
                        if (pillarName.includes(key) || key.includes(pillarName)) {
                            currentPillar = PILLAR_MAP[key];
                            break;
                        }
                    }
                }
                if (!currentPillar) console.warn(`Unknown pillar: ${pillarName} in file ${file}`);
                continue;
            }

            if (line.trim().startsWith('- [ ]')) {
                let text = line.replace('- [ ]', '').trim();
                const isCritical = text.endsWith('*');
                if (isCritical) {
                    text = text.slice(0, -1).trim();
                }

                if (currentPillar) {
                    questions.push({
                        text,
                        hazard,
                        pillar: currentPillar,
                        isCritical,
                        weight: isCritical ? 2 : 1
                    });
                }
            }
        }
    }
    return questions;
}

function parseImpactDocs() {
    const statements: ImpactStatement[] = [];
    const files = fs.readdirSync(impactsDir).filter(f => f.endsWith('.md'));

    for (const file of files) {
        const content = fs.readFileSync(path.join(impactsDir, file), 'utf-8');
        const hazardMatch = content.match(/B\.\d+ (.*?) - Impacts/);
        if (!hazardMatch) continue;

        const hazardName = hazardMatch[1].trim();
        const hazard = HAZARD_MAP[hazardName];
        if (!hazard) {
            console.warn(`Unknown hazard: ${hazardName} in file ${file}`);
            continue;
        }

        const lines = content.split('\n');
        let currentPillar = '';

        for (const line of lines) {
            // Impact docs headers are slightly different: "## 👥 Health Workforce Impacts"
            const pillarMatch = line.match(/## .*? (.*?) Impacts/);
            if (pillarMatch) {
                const pillarName = pillarMatch[1].trim();
                currentPillar = PILLAR_MAP[pillarName] || '';
                if (!currentPillar) {
                    // Try partial match
                    for (const key in PILLAR_MAP) {
                        if (pillarName.includes(key) || key.includes(pillarName)) {
                            currentPillar = PILLAR_MAP[key];
                            break;
                        }
                    }
                }
                if (!currentPillar) console.warn(`Unknown pillar: ${pillarName} in file ${file}`);
                continue;
            }

            // Impact statements are in tables: "| Statement | ... |"
            if (line.trim().startsWith('|') && !line.includes('Impact Statement') && !line.includes('---')) {
                const parts = line.split('|');
                if (parts.length > 2) {
                    const text = parts[1].trim();
                    if (text && currentPillar) {
                        statements.push({
                            text,
                            hazard,
                            pillar: currentPillar
                        });
                    }
                }
            }
        }
    }
    return statements;
}

function main() {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const questions = parseVulnerabilityDocs();
    fs.writeFileSync(path.join(outputDir, 'vulnerability_questions.json'), JSON.stringify(questions, null, 2));
    console.log(`Extracted ${questions.length} vulnerability questions.`);

    const statements = parseImpactDocs();
    fs.writeFileSync(path.join(outputDir, 'impact_statements.json'), JSON.stringify(statements, null, 2));
    console.log(`Extracted ${statements.length} impact statements.`);
}

main();

/**
 * Generate sample assessment data for dashboard testing
 * Creates realistic completed assessments for a subset of facilities
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Hazard types
const hazards = ['floods', 'storms', 'heatwave', 'drought', 'sea_level_rise', 'wildfire', 'coldwave'];
const pillars = ['workforce', 'wash', 'energy', 'infrastructure'];
const resilienceLevels = ['resilient', 'low_risk', 'medium_risk', 'high_risk'];

function getRandomScore(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getResilienceLevel(score: number): string {
    if (score >= 75) return 'resilient';
    if (score >= 60) return 'low_risk';
    if (score >= 40) return 'medium_risk';
    return 'high_risk';
}

async function createSampleAssessment(facilityId: string, facilityName: string, countyName: string) {
    try {
        // Generate realistic scores based on county hazard profiles
        const baseScore = countyName.includes('Mombasa') || countyName.includes('Kwale') || countyName.includes('Kilifi')
            ? getRandomScore(35, 65) // Coastal areas more vulnerable
            : countyName.includes('Kajiado') || countyName.includes('Makueni')
                ? getRandomScore(30, 60) // Arid areas more vulnerable
                : getRandomScore(45, 75); // Other areas

        const vulnerabilityScore = 100 - baseScore + getRandomScore(-10, 10);
        const impactScore = vulnerabilityScore + getRandomScore(-5, 5);
        const overallScore = baseScore;
        const resilienceLevel = getResilienceLevel(overallScore);

        // Create assessment
        const { data: assessment, error: assessmentError } = await supabase
            .from('assessments')
            .insert({
                facility_id: facilityId,
                assessment_date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(), // Random date in last 90 days
                status: 'completed',
                completed_at: new Date().toISOString(),
                overall_score: overallScore,
                vulnerability_score: Math.max(0, Math.min(100, vulnerabilityScore)),
                impact_score: Math.max(0, Math.min(100, impactScore)),
                resilience_level: resilienceLevel
            })
            .select()
            .single();

        if (assessmentError) {
            console.error(`  ❌ Error creating assessment for ${facilityName}:`, assessmentError.message);
            return false;
        }

        // Create hazard scores (3-5 hazards per facility) - declare first
        const numHazards = getRandomScore(3, 5);
        const selectedHazards = hazards.sort(() => 0.5 - Math.random()).slice(0, numHazards);

        // Create pillar scores (for each hazard-pillar combination)
        const pillarScoresData = [];
        for (const hazard of selectedHazards) {
            for (const pillar of pillars) {
                const pillarBase = baseScore + getRandomScore(-15, 15);
                const pillarVuln = 100 - pillarBase;
                pillarScoresData.push({
                    assessment_id: assessment.id,
                    hazard,
                    pillar,
                    vulnerability_score: Math.max(0, Math.min(100, pillarVuln)),
                    impact_score: Math.max(0, Math.min(100, pillarVuln + getRandomScore(-5, 5))),
                    resilience_score: Math.max(0, Math.min(100, pillarBase)),
                    critical_gaps_count: pillarBase < 50 ? getRandomScore(2, 5) : getRandomScore(0, 2),
                    major_impacts_count: pillarBase < 50 ? getRandomScore(1, 4) : getRandomScore(0, 1)
                });
            }
        }

        const { error: pillarError } = await supabase
            .from('pillar_scores')
            .insert(pillarScoresData);

        if (pillarError) {
            console.error(`  ❌ Error creating pillar scores:`, pillarError.message);
            return false;
        }

        // Create hazard scores using the same selectedHazards
        const hazardScores = selectedHazards.map(hazard => {
            const hazardBase = baseScore + getRandomScore(-20, 20);
            const hazardVuln = 100 - hazardBase;
            const isPriority = hazardVuln > 60;

            return {
                assessment_id: assessment.id,
                hazard,
                vulnerability_score: Math.max(0, Math.min(100, hazardVuln)),
                impact_score: Math.max(0, Math.min(100, hazardVuln + getRandomScore(-5, 5))),
                resilience_score: Math.max(0, Math.min(100, hazardBase)),
                is_priority_hazard: isPriority,
                critical_gaps_count: isPriority ? getRandomScore(2, 6) : getRandomScore(0, 2),
                major_impacts_count: isPriority ? getRandomScore(1, 5) : getRandomScore(0, 2)
            };
        });

        const { error: hazardError } = await supabase
            .from('hazard_scores')
            .insert(hazardScores);

        if (hazardError) {
            console.error(`  ❌ Error creating hazard scores:`, hazardError.message);
            return false;
        }

        console.log(`  ✅ Created assessment for ${facilityName} (Score: ${overallScore}, Level: ${resilienceLevel})`);
        return true;
    } catch (error: any) {
        console.error(`  ❌ Error:`, error.message);
        return false;
    }
}

async function main() {
    console.log('🏥 Generating Sample Assessment Data');
    console.log('====================================\n');

    // Get facilities to assess (30 facilities across different counties)
    const { data: facilities, error: facilitiesError } = await supabase
        .from('facilities')
        .select(`
            id,
            name,
            wards!inner(
                sub_counties!inner(
                    counties!inner(name)
                )
            )
        `)
        .eq('status', 'active')
        .limit(30);

    if (facilitiesError || !facilities) {
        console.error('❌ Error fetching facilities:', facilitiesError?.message);
        process.exit(1);
    }

    console.log(`📊 Creating assessments for ${facilities.length} facilities...\n`);

    let successCount = 0;
    for (const facility of facilities) {
        const countyName = (facility.wards as any).sub_counties.counties.name;
        const success = await createSampleAssessment(facility.id, facility.name, countyName);
        if (success) successCount++;
    }

    console.log(`\n✨ Summary`);
    console.log(`==========`);
    console.log(`✅ Successfully created ${successCount} assessments`);
    console.log(`❌ Failed: ${facilities.length - successCount}`);

    // Refresh materialized views
    console.log(`\n🔄 Refreshing dashboard views...`);
    const { error: refreshError } = await supabase.rpc('refresh_dashboard_views');

    if (refreshError) {
        console.error('❌ Error refreshing views:', refreshError.message);
        console.log('\n💡 You can manually refresh views in Supabase SQL Editor:');
        console.log('   SELECT refresh_dashboard_views();');
    } else {
        console.log('✅ Dashboard views refreshed successfully!');
    }

    console.log(`\n🎉 Done! Visit your dashboards:`);
    console.log(`   National: http://localhost:3000/dashboards/national`);
    console.log(`   Regional: http://localhost:3000/dashboards/regional`);
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});

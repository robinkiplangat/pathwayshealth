import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Centre-Level Dashboard API
 * Returns comprehensive assessment data for a specific facility
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const facilityId = searchParams.get('facilityId');

        if (!facilityId) {
            return NextResponse.json(
                { error: 'facilityId parameter is required' },
                { status: 400 }
            );
        }

        // Get facility with latest scores from materialized view
        const { data: facility, error: facilityError } = await supabaseAdmin
            .from('facility_latest_scores')
            .select('*')
            .eq('facility_id', facilityId)
            .single();

        if (facilityError) {
            console.error('Error fetching facility:', facilityError);
            return NextResponse.json(
                { error: 'Failed to fetch facility data' },
                { status: 500 }
            );
        }

        if (!facility) {
            return NextResponse.json(
                { error: 'Facility not found' },
                { status: 404 }
            );
        }

        // Get recommended interventions
        const { data: interventions, error: interventionsError } = await supabaseAdmin
            .from('recommended_interventions')
            .select(`
        *,
        intervention:intervention_catalog (
          code,
          title,
          description,
          pillar,
          intervention_type,
          priority_level,
          estimated_cost_min,
          estimated_cost_max,
          estimated_duration_days
        )
      `)
            .eq('assessment_id', facility.assessment_id)
            .order('priority_rank', { ascending: true })
            .limit(10);

        if (interventionsError) {
            console.error('Error fetching interventions:', interventionsError);
        }

        // Get intervention implementation status
        const { data: interventionPlans, error: plansError } = await supabaseAdmin
            .from('intervention_plans')
            .select('*, intervention:intervention_catalog(code, title)')
            .eq('facility_id', facilityId)
            .order('created_at', { ascending: false });

        if (plansError) {
            console.error('Error fetching intervention plans:', plansError);
        }

        // Get assessment history
        const { data: assessmentHistory, error: historyError } = await supabaseAdmin
            .from('assessments')
            .select('id, assessment_date, overall_score, vulnerability_score, impact_score, resilience_level')
            .eq('facility_id', facilityId)
            .eq('status', 'completed')
            .order('assessment_date', { ascending: false })
            .limit(10);

        if (historyError) {
            console.error('Error fetching assessment history:', historyError);
        }

        return NextResponse.json({
            facility,
            recommended_interventions: interventions || [],
            intervention_plans: interventionPlans || [],
            assessment_history: assessmentHistory || [],
        });

    } catch (error) {
        console.error('Error in centre dashboard API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

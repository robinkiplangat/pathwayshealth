import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (uses anon key for public operations)
export const supabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Database types
export interface VulnerabilityQuestion {
    id: string;
    text: string;
    hazard: string;
    pillar: string;
    isCritical: boolean;
    weight: number;
}

export interface ImpactStatement {
    id: string;
    text: string;
    hazard: string;
    pillar: string;
}

export interface Assessment {
    id: string;
    userId: string;
    hazards: string[];
    responses: Record<string, any>;
    score: number;
    createdAt: string;
    reportUrl?: string;
}

// Helper functions for common queries
export async function getVulnerabilityQuestions(hazard?: string) {
    let query = supabase
        .from('VulnerabilityQuestion')
        .select('*')
        .order('pillar', { ascending: true });

    if (hazard) {
        query = query.eq('hazard', hazard);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching questions:', error);
        throw error;
    }

    return data as VulnerabilityQuestion[];
}

export async function getImpactStatements(hazard?: string) {
    let query = supabase
        .from('ImpactStatement')
        .select('*')
        .order('pillar', { ascending: true });

    if (hazard) {
        query = query.eq('hazard', hazard);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching impact statements:', error);
        throw error;
    }

    return data as ImpactStatement[];
}

export async function createAssessment(assessment: Omit<Assessment, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
        .from('Assessment')
        .insert([assessment])
        .select()
        .single();

    if (error) {
        console.error('Error creating assessment:', error);
        throw error;
    }

    return data as Assessment;
}

export async function getAssessment(id: string) {
    const { data, error } = await supabase
        .from('Assessment')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching assessment:', error);
        throw error;
    }

    return data as Assessment;
}

export async function updateAssessment(id: string, updates: Partial<Assessment>) {
    const { data, error } = await supabase
        .from('Assessment')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating assessment:', error);
        throw error;
    }

    return data as Assessment;
}

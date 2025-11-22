import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        // Require authentication
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { assessmentId, facilityName } = body;

        if (!assessmentId) {
            return NextResponse.json(
                { error: 'Assessment ID is required' },
                { status: 400 }
            );
        }

        // Update the assessment to link it to the user
        const updateData: any = {
            userId: userId,
            isAnonymous: false,
            claimedAt: new Date().toISOString(),
        };

        if (facilityName) {
            updateData.facilityName = facilityName;
        }

        const { data, error } = await supabase
            .from('Assessment')
            .update(updateData)
            .eq('id', assessmentId)
            .is('userId', null) // Only allow claiming if currently anonymous
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Assessment not found or already claimed' },
                    { status: 404 }
                );
            }
            console.error('Error saving assessment:', error);
            return NextResponse.json(
                { error: 'Failed to save assessment' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            assessment: data,
        });
    } catch (error) {
        console.error('Error in save assessment:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

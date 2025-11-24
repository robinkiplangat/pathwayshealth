import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabase as adminSupabase } from '@/lib/supabase';
import { sendAssessmentSummaryEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        // Require authentication
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Use admin Supabase client since auth is already handled by Clerk middleware
        // We don't need RLS here as we're explicitly filtering by userId
        const supabase = adminSupabase;

        const body = await request.json();
        console.log('API /assessment/save received:', body);
        const { assessmentId, facilityName } = body;

        if (!assessmentId) {
            console.error('API /assessment/save: Missing assessmentId');
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

        console.log('API /assessment/save: Attempting update with data:', updateData);
        console.log('API /assessment/save: Looking for assessment:', assessmentId);

        const { data, error } = await supabase
            .from('Assessment')
            .update(updateData)
            .eq('id', assessmentId)
            .is('userId', null) // Only allow claiming if currently anonymous
            .select()
            .single();

        if (error) {
            console.error('API /assessment/save: Supabase error:', error);
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Assessment not found or already claimed' },
                    { status: 404 }
                );
            }
            console.error('Error saving assessment:', error);
            return NextResponse.json(
                { error: 'Failed to save assessment', details: error.message },
                { status: 500 }
            );
        }

        console.log('API /assessment/save: Update successful:', data);

        // Send email notification
        const userEmail = user.emailAddresses[0]?.emailAddress;
        if (userEmail) {
            const reportUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;

            // Fire and forget email sending to avoid blocking response
            // We pass undefined for score as we don't want to fetch it here for performance
            sendAssessmentSummaryEmail(
                userEmail,
                data.facilityName,
                undefined as any, // Cast to any if strict types complain, or update type in lib
                reportUrl
            ).catch(err => console.error('Failed to send email:', err));
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

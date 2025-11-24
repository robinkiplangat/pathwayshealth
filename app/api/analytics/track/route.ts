import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        const body = await request.json();
        const { event_name, session_id, metadata } = body;

        if (!event_name) {
            return NextResponse.json({ error: 'Event name required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('AnalyticsEvent')
            .insert({
                event_name,
                session_id,
                user_id: userId || null,
                metadata,
            });

        if (error) {
            console.error('Error tracking event:', error);
            return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

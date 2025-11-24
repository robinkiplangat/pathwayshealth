import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Webhook event types
interface WebhookEvent {
    type: 'INSERT' | 'UPDATE' | 'DELETE';
    table: string;
    schema: string;
    record: any;
    old_record?: any;
}

// Verify webhook signature (if configured in Supabase)
function verifyWebhookSignature(
    payload: string,
    signature: string | null,
    secret: string
): boolean {
    if (!signature || !secret) {
        // If no signature verification is set up, allow the request
        // In production, you should always verify signatures
        return true;
    }

    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(payload).digest('hex');
    return signature === digest;
}

export async function POST(request: Request) {
    try {
        const payload = await request.text();
        const signature = request.headers.get('x-supabase-signature');
        const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET || '';

        // Verify signature
        if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
            console.error('Invalid webhook signature');
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            );
        }

        const event: WebhookEvent = JSON.parse(payload);
        console.log('Received webhook event:', event.type, event.table);

        // Handle different event types
        switch (event.table) {
            case 'Assessment':
                if (event.type === 'INSERT') {
                    await handleNewAssessment(event.record);
                }
                break;

            default:
                console.log('Unhandled table:', event.table);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Handler for new assessment submissions
async function handleNewAssessment(assessment: any) {
    console.log('New assessment created:', assessment.id);

    // TODO: Implement report generation
    // This will be triggered automatically when a new assessment is created
    // For now, we'll just log it

    try {
        // Future: Generate PDF report
        // Future: Upload to Google Cloud Storage
        // Future: Update assessment with report URL
        // Future: Send notification email

        console.log('Assessment webhook processed successfully');
    } catch (error) {
        console.error('Error processing assessment webhook:', error);
        throw error;
    }
}

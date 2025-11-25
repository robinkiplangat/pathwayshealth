import { Resend } from 'resend';
import { AssessmentSummaryEmail } from '@/components/emails/AssessmentSummaryEmail';
import { PitchDeckEmail } from '@/components/emails/PitchDeckEmail';

export async function sendAssessmentSummaryEmail(
    to: string,
    facilityName: string,
    score: number | undefined,
    reportUrl: string
) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.warn('RESEND_API_KEY is not set. Email sending skipped.');
        return { success: false, error: 'Missing API Key' };
    }

    const resend = new Resend(apiKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'info@fourbic.com';

    try {
        const { data, error } = await resend.emails.send({
            from: `Pathways Health <${fromEmail}>`,
            to: [to],
            subject: `Assessment Report: ${facilityName}`,
            react: AssessmentSummaryEmail({ facilityName, score, reportUrl }),
        });

        if (error) {
            console.error('Error sending email:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Exception sending email:', error);
        return { success: false, error };
    }
}

export async function sendPitchDeckEmail(
    to: string,
    name?: string
) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.warn('RESEND_API_KEY is not set. Email sending skipped.');
        return { success: false, error: 'Missing API Key' };
    }

    const resend = new Resend(apiKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'info@fourbic.com';

    try {
        const { data, error } = await resend.emails.send({
            from: `Pathways Health <${fromEmail}>`,
            to: [to],
            subject: `Pathways Health Investment Pitch Deck`,
            react: PitchDeckEmail({ name }),
        });

        if (error) {
            console.error('Error sending email:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Exception sending email:', error);
        return { success: false, error };
    }
}

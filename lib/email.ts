import { Resend } from 'resend';
import { AssessmentSummaryEmail } from '@/components/emails/AssessmentSummaryEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAssessmentSummaryEmail(
    to: string,
    facilityName: string,
    score: number,
    reportUrl: string
) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Email sending skipped.');
        return { success: false, error: 'Missing API Key' };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Pathways Health <onboarding@resend.dev>', // Update this with your verified domain later
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

// Client-side session storage for anonymous assessments
// Stores assessment data temporarily until user signs in

export interface AssessmentSession {
    assessmentId: string;
    facilityName: string;
    location: string;
    responses: Array<{
        questionId: string;
        answer: string;
        score: number;
    }>;
    completedAt: string;
    expiresAt: string;
}

const STORAGE_KEY = 'pathways_assessment_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function saveAssessmentSession(data: Omit<AssessmentSession, 'completedAt' | 'expiresAt'>): void {
    if (typeof window === 'undefined') return;

    const session: AssessmentSession = {
        ...data,
        completedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + SESSION_DURATION).toISOString(),
    };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
        console.error('Failed to save assessment session:', error);
    }
}

export function getAssessmentSession(): AssessmentSession | null {
    if (typeof window === 'undefined') return null;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;

        const session: AssessmentSession = JSON.parse(stored);

        // Check if session has expired
        if (new Date(session.expiresAt) < new Date()) {
            clearAssessmentSession();
            return null;
        }

        return session;
    } catch (error) {
        console.error('Failed to get assessment session:', error);
        return null;
    }
}

export function clearAssessmentSession(): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear assessment session:', error);
    }
}

export function hasActiveSession(): boolean {
    return getAssessmentSession() !== null;
}

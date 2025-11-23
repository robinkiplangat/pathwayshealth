import { v4 as uuidv4 } from 'uuid';

const SESSION_STORAGE_KEY = 'pathways_analytics_session_id';

function getSessionId() {
    if (typeof window === 'undefined') return null;

    let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionId) {
        sessionId = uuidv4();
        sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }
    return sessionId;
}

export async function trackEvent(eventName: string, metadata: Record<string, any> = {}) {
    try {
        const sessionId = getSessionId();

        await fetch('/api/analytics/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event_name: eventName,
                session_id: sessionId,
                metadata,
            }),
        });
    } catch (error) {
        // Silently fail to avoid disrupting user experience
        console.error('Analytics error:', error);
    }
}

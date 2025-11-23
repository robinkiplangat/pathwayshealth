'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

interface AnalyticsTrackerProps {
    eventName: string;
    metadata?: Record<string, any>;
}

export default function AnalyticsTracker({ eventName, metadata }: AnalyticsTrackerProps) {
    useEffect(() => {
        trackEvent(eventName, metadata);
    }, [eventName, metadata]);

    return null;
}

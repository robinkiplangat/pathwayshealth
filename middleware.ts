import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Create next-intl middleware
const intlMiddleware = createIntlMiddleware(routing);

// Define public routes explicitly - everything else is protected by default
const isPublicRoute = createRouteMatcher([
    "/",
    "/:locale",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/:locale/sign-in(.*)",
    "/:locale/sign-up(.*)",
    "/assessment(.*)",
    "/:locale/assessment(.*)",
    "/methodology(.*)",
    "/:locale/methodology(.*)",
    "/api/partner",
    "/api/questions",
    "/api/assessment/submit",
    "/api/download-pitch",
    "/api/analytics/track",
    "/api/webhooks(.*)",
    "/terms-of-service",
    "/:locale/terms-of-service",
    "/privacy-policy",
    "/:locale/privacy-policy",
]);

export default clerkMiddleware(async (auth, req) => {
    // Apply internationalization
    const intlResponse = intlMiddleware(req);

    if (!isPublicRoute(req)) {
        await auth.protect();
    }

    return intlResponse;
});

export const config = {
    matcher: [
        // Skip Next.js internals, Sentry monitoring, and all static files
        "/((?!_next|monitoring|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};

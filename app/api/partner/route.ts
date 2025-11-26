import { Client } from '@notionhq/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendPitchDeckEmail } from '@/lib/email';

const partnerSchema = z.object({
    organisationName: z.string().min(1, "Organisation name is required"),
    partnerType: z.string().min(1, "Partner type is required"),
    geographicFocus: z.array(z.string()).optional().default([]),
    countryRegion: z.string().optional(),
    interestAreas: z.array(z.string()).optional().default([]),
    contactPerson: z.string().min(1, "Contact person is required"),
    workEmail: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    website: z.string().url("Invalid website URL").optional().or(z.literal('')),
    referralSource: z.string().optional(),
    explorationGoal: z.string().optional(),
    downloadPitch: z.boolean().optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate request body
        const validationResult = partnerSchema.safeParse(body);

        if (!validationResult.success) {
            console.error('Validation failed:', validationResult.error.format());
            return NextResponse.json(
                { error: 'Validation failed', details: validationResult.error.format() },
                { status: 400 }
            );
        }

        const {
            organisationName,
            partnerType,
            geographicFocus,
            countryRegion,
            interestAreas,
            contactPerson,
            workEmail,
            phone,
            website,
            referralSource,
            explorationGoal,
            downloadPitch
        } = validationResult.data;

        // Initialize Notion client
        const notion = new Client({
            auth: process.env.NOTION_API_KEY,
        });

        // Extract Database ID (handle both raw ID and full URL)
        // Matches a 32-character hex string (Notion UUID format)
        const databaseIdMatch = process.env.NOTION_DATABASE_ID?.match(/([a-f0-9]{32})/i);
        const databaseId = databaseIdMatch ? databaseIdMatch[1] : undefined;

        if (!process.env.NOTION_API_KEY || !databaseId) {
            console.error('Notion Config Error: Missing Key or Invalid Database ID');
            return NextResponse.json(
                { error: 'Notion configuration missing or invalid' },
                { status: 500 }
            );
        }

        await notion.pages.create({
            parent: {
                database_id: databaseId,
            },
            properties: {
                "Organisation Name": {
                    title: [
                        {
                            text: {
                                content: organisationName,
                            },
                        },
                    ],
                },
                "Partner Type": {
                    select: {
                        name: partnerType,
                    },
                },
                "Geographic Focus": {
                    multi_select: geographicFocus.map((geo) => ({ name: geo })),
                },
                "Country / Region Details": {
                    rich_text: [
                        {
                            text: {
                                content: countryRegion || '',
                            },
                        },
                    ],
                },
                "Interest Areas": {
                    multi_select: interestAreas.map((area) => ({ name: area })),
                },
                "Contact Person": {
                    rich_text: [
                        {
                            text: {
                                content: contactPerson,
                            },
                        },
                    ],
                },
                "Work Email": {
                    email: workEmail,
                },
                "WhatsApp / Phone": {
                    phone_number: phone || null,
                },
                "Website": {
                    url: website || null,
                },
                "How did you hear about Pathways Health?": {
                    rich_text: [
                        {
                            text: {
                                content: referralSource || '',
                            },
                        },
                    ],
                },
                "What would you like to explore with us?": {
                    rich_text: [
                        {
                            text: {
                                content: (explorationGoal || '') + (downloadPitch ? "\n\n[Pitch Deck Requested]" : ""),
                            },
                        },
                    ],
                },
                "Partner Stage": {
                    status: {
                        name: "New inbound",
                    },
                },
            },
        });

        // Send Pitch Deck Email if requested
        if (downloadPitch) {
            // We don't await this to avoid blocking the response, or we can await it if we want to ensure it sends.
            // Given it's a serverless function, we SHOULD await it or use `waitUntil` if available, 
            // but Next.js App Router handlers should generally await side effects.
            const emailResult = await sendPitchDeckEmail(workEmail, contactPerson);
            if (!emailResult.success) {
                console.error('Failed to send pitch deck email. Error:', emailResult.error);
                // We don't fail the request, just log it.
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Notion API Error:', error);
        return NextResponse.json(
            { error: 'Failed to submit to Notion' },
            { status: 500 }
        );
    }
}

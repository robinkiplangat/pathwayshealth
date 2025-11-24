import { Client } from '@notionhq/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const partnerSchema = z.object({
    organisationName: z.string().min(1, "Organisation name is required"),
    partnerType: z.string().min(1, "Partner type is required"),
    geographicFocus: z.array(z.string()).min(1, "At least one geographic focus is required"),
    countryRegion: z.string().optional(),
    interestAreas: z.array(z.string()).min(1, "At least one interest area is required"),
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

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Notion API Error:', error);
        return NextResponse.json(
            { error: 'Failed to submit to Notion' },
            { status: 500 }
        );
    }
}
